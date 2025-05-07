import type { App, ComponentInternalInstance } from "vue";

export interface CardElement {
    uid: string;
    adder?: Object;
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

export function addCardElementToCard(card: App|ComponentInternalInstance, element: CardElement): App {
    // 给 App 的props.elements 添加一个元素
    // const elements = card.$props.elements as CardElement[];
    //debug
    // console.log("添加元素到卡片", card,card._instance, element);

    // if (!card || !card._instance) return card;

    // 如果card 的类型是 App，则使用 card._instance
    // 否则使用 card
    card = (card as App)._instance || card as ComponentInternalInstance;

    let elements = card?.exposed?.elements as CardElement[];

    // 每个 CardElement 都有一个独立的uid
    // 若出现uid重复的，则不添加：
    if (elements.some((e)=>e.uid === element.uid)){
        return card;
    }
    // 每个 添加者最多只能添加一个Element
    if (element.adder && element.adder !== ""){
        // 从element中找到
        elements = elements.filter((e)=> e.adder !== element.adder);
    }

    elements.push(element);

    card._instance.exposed?.setElements(elements);

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
export function drawCardOnNode(ctx: CanvasRenderingContext2D, cardLink: string, options: DrawCardOnCtxOptions): void {
    if (!cardLink) return; // 如果没有 cardLink，则不绘制
    const {
        cardSize = [200, 300],
        autoGetCardSize = false,
        ctxSize: nodeSize = [200, 300],
        autoGetCtxSize = false,
        padding = 20,
        remainHeight = 70,
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
}

