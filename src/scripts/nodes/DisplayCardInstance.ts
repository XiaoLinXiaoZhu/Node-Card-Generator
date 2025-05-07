import { LGraph, LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";
import { loadImageFromLink,drawCardOnNode } from "./cardLibs";
import CardInstance from "./CardInstance.vue";

// 这个节点能够 将传入的 CardInstance 组件渲染到节点上。

class DisplayCardInstance extends LGraphNode {
    static title = "Display Card Instance";
    static desc = "Display a card instance with given width and height";
    static pixels_threshold = 10;
    static markers_color = "#666";

    properties = {
        cardWidth: 200,
        cardHeight: 300,
        cardLink: "",
    }


    cardInstance: InstanceType<typeof CardInstance> | null = null; // 卡片实例
    oldCardLink: string | null = null; // 上一个 cardLink 属性值
    needGetCardInstance = true; // 是否需要获取 app 属性值

    constructor() {
        super(DisplayCardInstance.title);
        this.addInput("Card Instance", "CardInstance"); // 添加输入
        this.size = [400, 800]; // 设置节点大小
    }

    onConfigure(o: SerializedLGraphNode): void {
        // 如果没有设置属性值，则设置为默认值
        if (!o.properties.cardWidth) {
            o.properties.cardWidth = 200; // 初始化宽度属性值
        }
        if (!o.properties.cardHeight) {
            o.properties.cardHeight = 300; // 初始化高度属性值
        }

        this.properties.cardWidth = o.properties.cardWidth; // 更新宽度属性值
        this.properties.cardHeight = o.properties.cardHeight; // 更新高度属性值

        // link
        if (this.getInputData(0)) {
            this.cardInstance = this.getInputData(0); // 获取输入数据
            //debug
            console.log("获取输入数据", this.cardInstance);
        }
        console.log("获取输入数据", this.getInputData(0));
    }

    onConnectInput(inputIndex: number, outputType: INodeOutputSlot["type"], outputSlot: INodeOutputSlot, outputNode: LGraphNode, outputIndex: number): boolean {
        this.needGetCardInstance = true; // 设置标志位为 true
        return true; // 连接成功
    }

    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void {
        //debug
        console.log("连接变化", type, slotIndex, isConnected, link, ioSlot);
        // 如果是断开连接，则清空 app
        if (type === LiteGraph.INPUT && !isConnected && ioSlot.type === "CardInstance" && ioSlot.name === "Card Instance") {
            //debug
            console.log("断开连接", type, slotIndex, isConnected, link, ioSlot);
            this.cardInstance = null; // 清空 app
            this.oldCardLink = null; // 清空 oldCardLink
        }
    }

    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (!this.cardInstance) return; // 如果没有 app，则不绘制
        const cardLink = this.cardInstance.getCardLink(); // 获取卡片链接
        if (this.oldCardLink !== cardLink) {
            this.oldCardLink = cardLink; // 更新 oldCardLink 属性值
            loadImageFromLink(cardLink).then((img) => { // 加载图片
                // 获取图片的宽高
                const cardWidth = img.width; // 获取图片宽度
                const cardHeight = img.height; // 获取图片高度

                this.properties.cardWidth = cardWidth; // 更新卡片宽度
                this.properties.cardHeight = cardHeight; // 更新卡片高度
            });
            drawCardOnNode(ctx, cardLink,{
                cardSize: [this.properties.cardWidth, this.properties.cardHeight], // 设置卡片大小
                ctxSize: [this.size[0], this.size[1]], // 设置节点大小
                scaleMode: "contain", // 设置缩放模式
            });
        } else {
            drawCardOnNode(ctx, cardLink,{
                cardSize: [this.properties.cardWidth, this.properties.cardHeight], // 设置卡片大小
                ctxSize: [this.size[0], this.size[1]], // 设置节点大小
                scaleMode: "contain", // 设置缩放模式
                // debugMode: true, // 设置调试模式
            });
        }
    }

    onExecute(): void {
        if (this.needGetCardInstance) {
            this.cardInstance = this.getInputData(0); // 获取输入数据
            this.oldCardLink = null; // 清空 oldCardLink 属性值
            this.needGetCardInstance = false; // 重置标志位
        }
    }
}

LiteGraph.registerNodeType("卡片制作/Display Card Instance", DisplayCardInstance);