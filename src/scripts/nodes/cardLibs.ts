import CardInstance from "./CardInstance.vue";
import { loadImage } from "./libs";
import { UidManager } from "./uidGenerator";
export interface CardElement {
    uid: string;
    adder?: string;
    type: string;
    style: Record<string, string>;
    content?: string;
    src?: string;
}

export interface CardEffect {
    uid: string;
    name: string;
    value: string;
}

export enum CardElementType {
    Text = "text",
    Image = "image",
    Html = "html",
}
export const CardElementTypes = [
    CardElementType.Text,
    CardElementType.Image,
    CardElementType.Html,
] as const;


// const cardElementUidMap: Record<string, CardElement> = {}; // 用于存储 uid 和 cardElement 的映射关系
// const adderUidMap: Record<string, Object> = {}; // 用于存储 adder 和 cardElement 的映射关系
const cardElementUid : UidManager<CardElement> = new UidManager<CardElement>("cardElementUid_"); // 用于存储 uid 和 cardElement 的映射关系
const adderUidMap : UidManager<Object> = new UidManager<Object>("adderUid_"); // 用于存储 adder 和 cardElement 的映射关系

export function createCardElement(el : CardElement,adder?: Object|string): CardElement {
    // 为 element 其生成一个 uid
    // 不论如何，既然是调用create ，就认为是新建一个元素

    if (!el.uid || el.uid === "") {
        el.uid = cardElementUid.add(el); // 生成 uid
    } else {
        if (cardElementUid.has(el.uid)) {
            // 将旧的 销毁
            const oldEl = cardElementUid.getObj(el.uid); // 获取旧的元素
            if (oldEl) {
                cardElementUid.remove(oldEl.uid); // 删除旧的元素
            }
        }
        el.uid = cardElementUid.add(el); // 生成 uid
    }


    // 但是adder 不会认为是新建的，如果它已经有了，则不再添加
    if (adder && adder !== "") {
        // 如果 adder 是 object，则将其转换为字符串
        if (typeof adder === "object") {
            el.adder = adderUidMap.getUid(adder); // 生成 uid
        } else {
            el.adder = adder; // 直接赋值
        }
    }

    return {
        uid: el.uid,
        adder: el.adder,
        type: el.type,
        style: el.style,
        content: el.content,
        src: el.src,
    };
}

export function addCardElement(card: InstanceType<typeof CardInstance>, element: CardElement): InstanceType<typeof CardInstance> {
    let elements = card.elements as CardElement[];

    // 每个 CardElement 都有一个独立的uid
    // 若出现uid重复的，则不添加：
    if (elements.some((e)=>e.uid === element.uid)){
        console.error("uid 已存在", element.uid); // uid 已存在
        return card;
    }
    // 每个 添加者最多只能添加一个Element
    if (element.adder && element.adder !== ""){
        // 从element中找到 之前的，并删除
        elements = elements.filter((e)=> e.adder !== element.adder); // 删除之前的元素
        console.log("删除之前的元素", element.adder, elements); // 删除之前的元素
    }

    // 如果 element 的类型为 "image"，则需要加载图片
    // if (element.type === CardElementType.Image && !element.src) {
    //     // debug
    //     console.log("添加图片元素", element, element.content);
    //     loadImage(element.content).then((img) => {
    //         element.src = img; // 将图片的 src 设置为 img 的 src
    //         addCardElement(card, element); // 递归调用 addCardElement
    //     });
    //     return card; // 返回 card
    // }

    elements.push(element);

    card.setElements(elements); // 更新元素列表
    //debug
    console.log("添加元素", element, elements,card.elements);

    return card;
}

export function removeCardElement(card: InstanceType<typeof CardInstance>, element: CardElement): InstanceType<typeof CardInstance> {
    let elements = card.elements as CardElement[];
    elements = elements.filter((e) => e.uid !== element.uid); // 删除元素
    card.setElements(elements); // 更新元素列表
    return card;
}

export function removeCardElementByAdder(card: InstanceType<typeof CardInstance>, adder: Object | string): InstanceType<typeof CardInstance> {
    let elements = card.elements as CardElement[];
    if (!adder || adder === "") {
        return card; // 如果没有 adder，则不删除
    }
    if (typeof adder === "object") {
        adder = adderUidMap.getUid(adder); // 生成 uid
    }
    //debug
    console.log("删除元素", adder, elements);
    const deletedElements: CardElement[] = []; // 用于存储删除的元素
    elements.forEach((e) => {
        //debug
        // console.log("比较元素", e, e.adder, adder, "\ntypeof adder",  typeof e.adder,typeof adder,"\n", e.adder === adder);
        if (e.adder == adder) {
            deletedElements.push(e); // 找到要删除的元素
        }
    });
    console.log("删除的元素", deletedElements);

    elements = elements.filter((e) => e.adder !== adder); // 删除元素
    card.setElements(elements); // 更新元素列表
    return card;
}

export function loadImageFromLink(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
    });
}

const imageCache: Record<string, HTMLImageElement> = {}; // 用于缓存图片
const maxCacheSize = 20; // 最大缓存大小4
export function loadImageFromLinkSync(src: string): HTMLImageElement {
    if (imageCache[src]) {
        return imageCache[src]; // 如果缓存中有图片，则直接返回
    }
    const img = new Image();
    img.src = src;
    img.onload = () => {
        imageCache[src] = img; // 将图片缓存到对象中
    }
    img.onerror = (err) => {
        console.error("图片加载失败", err); // 图片加载失败
    };
    if (Object.keys(imageCache).length > maxCacheSize) {
        const firstKey = Object.keys(imageCache)[0]; // 获取第一个键
        delete imageCache[firstKey]; // 删除第一个键对应的图片
    }
    return img; // 返回图片
}


export type DrawCardOnCtxOptions = {
    cardSize?: [number, number]; // [width, height]
    autoGetCardSize?: boolean; // default false
    ctxSize?: [number, number]; // [width, height]
    autoGetCtxSize?: boolean; // default false
    padding?: number; // default 20
    remainHeight?: number; // default 70
    scaleMode?: "contain" | "cover" | "none"; // default "contain"
    textColor?: string; // default "#666"
    textAlign?: CanvasTextAlign; // default "end"
    borderColor?: string; // default "#000"
    borderWidth?: number; // default 2
    debugMode?: boolean; // default false
};
export function drawCardLinkOnNode(ctx: CanvasRenderingContext2D, cardLink: string, options: DrawCardOnCtxOptions): void {
    if (!cardLink) return; // 如果没有 cardLink，则不绘制
    const {
        cardSize = [200, 300],
        autoGetCardSize = false,
        ctxSize: nodeSize = [200, 300],
        autoGetCtxSize = false,
        padding = 20,
        remainHeight = 20,
        scaleMode = "contain",
        textColor = "#666",
        textAlign = "end",
        borderColor = "#000",
        borderWidth = 2,
        debugMode = false,
    } = options;

    if (debugMode) {
        console.log("绘制卡片实例", options);
    }

    let finalCardSize = cardSize;
    let finalNodeSize = nodeSize;

    // 自动获取卡片大小
    if (autoGetCardSize) {
        const img = new Image();
        img.src = cardLink;
        img.onload = () => {
            finalCardSize = [img.width, img.height];
            if (debugMode) {
                console.log("自动获取卡片大小", finalCardSize);
            }
        };
    }

    // 自动获取节点大小
    if (autoGetCtxSize) {
        finalNodeSize = [ctx.canvas.width, ctx.canvas.height];
        if (debugMode) {
            console.log("自动获取节点大小", finalNodeSize);
        }
    }

    // 获取图片的宽高
    const cardWidth = finalCardSize[0];
    const cardHeight = finalCardSize[1];

    // 获取节点的宽高
    const nodeWidth = finalNodeSize[0];
    const nodeHeight = finalNodeSize[1];

    if (debugMode) {
        console.log("绘制卡片实例", cardLink, ctx);
        console.log(`在 ${nodeWidth}*${nodeHeight} 的节点大小上绘制 ${cardWidth}*${cardHeight} 的图片`);
    }

    ctx.textAlign = textAlign;
    ctx.fillStyle = textColor;

    // 计算缩放比
    let scale: number;
    if (scaleMode === "contain") {
        scale = Math.min(
            (nodeWidth - 2 * padding) / cardWidth,
            (nodeHeight - 2 * padding - remainHeight) / cardHeight
        );
    } else if (scaleMode === "cover") {
        scale = Math.max(
            (nodeWidth - 2 * padding) / cardWidth,
            (nodeHeight - 2 * padding - remainHeight) / cardHeight
        );
    } else {
        scale = 1; // 默认不缩放
    }

    if (debugMode) {
        console.log("缩放比", scale);
    }

    const rectWidth = cardWidth * scale;
    const rectHeight = cardHeight * scale;

    const rectX = padding;
    const rectY = nodeHeight - rectHeight - padding;

    // 绘制矩形
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    if (debugMode) {
        console.log("绘制矩形", rectX, rectY, rectWidth, rectHeight);
    }

    // 绘制文本
    ctx.fillStyle = textColor;
    ctx.fillText("CardInstance " + cardLink, nodeWidth - padding, nodeHeight - 30);
    ctx.fillText("Width: " + cardWidth, nodeWidth - padding, nodeHeight - 50);
    ctx.fillText("Height: " + cardHeight, nodeWidth - padding, nodeHeight - 70);

    // 绘制边框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // 绘制图片
    const img = loadImageFromLinkSync(cardLink); // 同步加载图片
    ctx.drawImage(img, rectX, rectY, rectWidth, rectHeight); // 绘制图片
}


export function drawCardCanvasOnNode(ctx: CanvasRenderingContext2D, canvas:HTMLCanvasElement, options: DrawCardOnCtxOptions): void {
    if (!canvas) return; // 如果没有 cardLink，则不绘制
    const {
        cardSize = [200, 300],
        autoGetCardSize = false,
        ctxSize: nodeSize = [200, 300],
        autoGetCtxSize = false,
        padding = 20,
        remainHeight = 20,
        scaleMode = "contain",
        textColor = "#666",
        textAlign = "end",
        borderColor = "#000",
        borderWidth = 2,
        debugMode = false,
    } = options;

    if (debugMode) {
        console.log("绘制卡片实例", options);
    }

    let finalCardSize = cardSize;
    let finalNodeSize = nodeSize;

    const sourceCanvas = canvas as HTMLCanvasElement;
    const sourceCtx = sourceCanvas.getContext("2d");

    // 自动获取卡片画布的大小
    if (autoGetCardSize) {
        if (sourceCtx) {
            finalCardSize = [sourceCanvas.width, sourceCanvas.height];
            if (debugMode) {
                console.log("自动获取卡片画布大小", finalCardSize);
            }
        } else {
            console.error("无法获取源画布的上下文");
        }
    }

    // 自动获取节点大小
    if (autoGetCtxSize) {
        finalNodeSize = [ctx.canvas.width, ctx.canvas.height];
        if (debugMode) {
            console.log("自动获取节点大小", finalNodeSize);
        }
    }

    // 获取图片的宽高
    const cardWidth = finalCardSize[0];
    const cardHeight = finalCardSize[1];

    // 获取节点的宽高
    const nodeWidth = finalNodeSize[0];
    const nodeHeight = finalNodeSize[1];

    if (debugMode) {
        console.log("绘制卡片实例", sourceCanvas, ctx);
        console.log(`在 ${nodeWidth}*${nodeHeight} 的节点大小上绘制 ${cardWidth}*${cardHeight} 的图片`);
    }

    ctx.textAlign = textAlign;
    ctx.fillStyle = textColor;

    // 计算缩放比
    let scale: number;
    if (scaleMode === "contain") {
        scale = Math.min(
            (nodeWidth - 2 * padding) / cardWidth,
            (nodeHeight - 2 * padding - remainHeight) / cardHeight
        );
    } else if (scaleMode === "cover") {
        scale = Math.max(
            (nodeWidth - 2 * padding) / cardWidth,
            (nodeHeight - 2 * padding - remainHeight) / cardHeight
        );
    } else {
        scale = 1; // 默认不缩放
    }

    if (debugMode) {
        console.log("缩放比", scale);
    }

    const rectWidth = cardWidth * scale;
    const rectHeight = cardHeight * scale;

    const rectX = padding;
    const rectY = nodeHeight - rectHeight - padding;

    // 绘制矩形
    ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
    if (debugMode) {
        console.log("绘制矩形", rectX, rectY, rectWidth, rectHeight);
    }

    // 绘制文本
    ctx.fillStyle = textColor;
    ctx.fillText("CardInstance " + sourceCanvas, nodeWidth - padding, nodeHeight - 30);
    ctx.fillText("Width: " + cardWidth, nodeWidth - padding, nodeHeight - 50);
    ctx.fillText("Height: " + cardHeight, nodeWidth - padding, nodeHeight - 70);

    // 绘制边框
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.strokeRect(rectX, rectY, rectWidth, rectHeight);

    // 绘制图片,直接将 sourceCanvas 绘制到 ctx 上
    ctx.drawImage(sourceCanvas, rectX, rectY, rectWidth, rectHeight); // 绘制图片
}
