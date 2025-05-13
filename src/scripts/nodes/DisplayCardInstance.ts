import { LGraph, LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";
import { loadImageFromLink,drawCardLinkOnNode, drawCardCanvasOnNode } from "../lib/cardLibs";
import CardInstance from "./CardInstance.vue";

// 这个节点能够 将传入的 CardInstance 组件渲染到节点上。

class DisplayCardInstance extends LGraphNode {
    static title = "Display Card Instance";
    static desc = "Display a card instance with given width and height";
    static pixels_threshold = 10;
    static markers_color = "#666";

    cardInstance: InstanceType<typeof CardInstance> | null = null; // 卡片实例
    needGetCardInstance = true; // 是否需要获取 CardInstance 属性值

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
        }
    }

    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (!this.cardInstance) return; // 如果没有 app，则不绘制
        const cardCanvas = this.cardInstance.getCanvas(); // 获取卡片画布

        const draw = () => {
            if (!cardCanvas) return; // 如果没有卡片画布，则不绘制
            // 直接绘制卡片画布效率更高
            drawCardCanvasOnNode(ctx, cardCanvas, {
                autoGetCardSize: true, // 自动获取卡片大小
                // autoGetCtxSize: true, // 自动获取节点大小
                ctxSize: this.size, // 设置节点大小
                scaleMode: "contain", // 设置缩放模式
                // debugMode: true, // 设置调试模式
            });
        }

        draw(); // 绘制卡片
    }

    onExecute(): void {
        if (this.needGetCardInstance) {
            this.cardInstance = this.getInputData(0); // 获取输入数据
            this.needGetCardInstance = false; // 重置标志位
        }
    }
}

LiteGraph.registerNodeType("卡片制作/Display Card Instance", DisplayCardInstance);