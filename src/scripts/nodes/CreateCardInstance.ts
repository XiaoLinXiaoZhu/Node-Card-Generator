import { LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget,type SerializedLGraphNode } from "litegraph.js";
import CardInstance from "./CardInstance.vue";
import {createApp} from "vue";
import { drawCardCanvasOnNode, drawCardLinkOnNode, loadImageFromLink } from "./cardLibs";
import { ExLGraphNode } from "./ExLGraphNode";

// 这个节点能够创建一个卡片元素，定义它的 长宽。
// 卡片元素本质上是一个 VUE 组件，里面包括 使用 HTML 作为渲染的部分，也包括使用 Canvas 作为添加特效的部分。

class CreateCardInstance extends ExLGraphNode {
    static title = "Create Card Instance";
    static desc = "Create a card instance with given width and height";
    static pixels_threshold = 10;
    static markers_color = "#666";

    widthWidget?: IWidget; // 定义 widget 属性
    heightWidget?: IWidget; // 定义 widget 属性
    static defaultCanvasSize = [300, 400]; // 定义默认画布大小
    static defaultNodeSize = [240, 400]; // 定义默认大小
    properties:{
        width: number;
        height: number;
    } = {
        width: CreateCardInstance.defaultCanvasSize[0], // 定义默认宽度
        height: CreateCardInstance.defaultCanvasSize[1], // 定义默认高度
    }; // 定义默认属性值

    cardInstance: InstanceType<typeof CardInstance> | null = null; // 定义卡片实例
    

    constructor() {
        super(CreateCardInstance.title);
        this.widthWidget = this.addBindedWidget("number", "width", CreateCardInstance.defaultCanvasSize[0], this.onWidthChange.bind(this)); // 添加宽度输入框
        this.heightWidget = this.addBindedWidget("number", "height", CreateCardInstance.defaultCanvasSize[1], this.onHeightChange.bind(this)); // 添加高度输入框

        this.addOutput("CardInstance", "CardInstance"); // 添加输出

        this.size = [CreateCardInstance.defaultNodeSize[0], CreateCardInstance.defaultNodeSize[1]]; // 设置节点大小


        // 创建一个 隐藏的 div 元素，用于渲染 VUE 组件
        const div = document.createElement("div");
        // div.style.display = "none"; // 隐藏 div
        div.id = "card-instance"; // 设置 id
        document.body.appendChild(div); // 将 div 添加到 body 中

        // 创建 VUE 组件实例
        const app = createApp(CardInstance, {
            width: this.properties.width,
            height: this.properties.height,
        });

        app.provide("app", app); // 提供 app 实例
        
        const cardInstance = app.mount(div); // 挂载 VUE 组件到 div 上
        this.cardInstance = cardInstance as InstanceType<typeof CardInstance>; // 设置卡片实例

        // 设置 输出为 CardInstance 组件的实例
        this.setOutputData(0, cardInstance); // 设置节点的输出数据
    }

    onConfigure(o: SerializedLGraphNode): void {
        if (!this.cardInstance) return;
        this.cardInstance.width = o.properties.width; // 更新 VUE 组件的宽度
        this.cardInstance.height = o.properties.height; // 更新 VUE 组件的高度
    }

    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (!this.cardInstance) return; // 如果没有 app，则不绘制
        const cardCanvas = this.cardInstance.getCanvas(); // 获取卡片画布
        const draw = () => {
            if (!cardCanvas) return; // 如果没有卡片画布，则不绘制
            drawCardCanvasOnNode(ctx, cardCanvas, {
                cardSize: [this.properties.width, this.properties.height], // 设置卡片大小
                ctxSize: this.size, // 设置节点大小
                padding: 20, // 设置内边距
                remainHeight: 70, // 设置额外预留的高度
                scaleMode: "contain", // 设置缩放模式
                textColor: "#666", // 设置文本颜色
                textAlign: "end", // 设置文本对齐方式
                borderColor: "#000", // 设置边框颜色
                borderWidth: 2, // 设置边框宽度
            });
        }
        draw(); // 绘制卡片画布
    }

    onWidthChange(value: number) {
        if (this.cardInstance) {
            this.cardInstance.setWidth(value); // 更新 VUE 组件的宽度
        }
    }

    onHeightChange(value: number) {
        if (this.cardInstance) {
            this.cardInstance.setHeight(value); // 更新 VUE 组件的高度
        }
    }
    
    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void {
        this.setOutputData(0, this.cardInstance);
    }

    onExecute() {
    }

    onRemoved(): void {
        if (this.cardInstance) {
            this.cardInstance.destroy(); // 销毁 VUE 组件实例
            this.cardInstance = null; // 清空卡片实例
        }
        const div = document.getElementById("card-instance"); // 获取 div 元素
        if (div) {
            document.body.removeChild(div); // 移除 div 元素
        }
    }
}

LiteGraph.registerNodeType("卡片制作/CreateCardInstance", CreateCardInstance);
