import { LGraph, LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";
import { type App } from "vue";
import { loadImageFromLink,drawCardOnNode } from "./cardLibs";

// Example: 通过 CSV 的路径读取 CSV 文件
// class CSVReaderLocal extends LGraphNode {
//     static title = "CSV Reader Local";
//     static desc = "Read CSV file from local and output data";
//     static pixels_threshold = 10;
//     static markers_color = "#666";

//     csvPathWidget?: IWidget; // 定义 widget 属性

//     constructor() {
//         super(CSVReaderLocal.title);
//         // this.addWidget("button", "Import CSV", "", this.triggerGetFile.bind(this)); // 添加按钮
//         this.csvPathWidget = this.addWidget("text","CSV File Path","",this.triggerGetFile.bind(this)); // 添加文本框
//         this.addProperty("cvsPath", "", "string"); // 添加属性
//         this.addOutput("CSVData", "CSV");
//         this.size = [180, 60];
//     }

//     onConfigure(o: SerializedLGraphNode): void {
//         //如果没有设置属性值，则设置为默认值
//         if (!o.properties.cvsPath) {
//             o.properties.cvsPath = ""; // 初始化属性值
//         }
//         else{
//             this.triggerGetFile(o.properties.cvsPath); // 如果有默认值，直接读取文件
//         }
//     }

//     triggerGetFile(fileName: string) {
//         console.log("触发获取文件", fileName);
//         this.properties.cvsPath = fileName; // 更新属性值
//         this.csvPathWidget!.value = fileName; // 更新 widget 的值
//         // 直接从后端获取数据
//         // const fileName = this.getInputData(0) as string;
//         // 从 wiget 中获取文件名
//         if (fileName) {
//             loadFile(fileName).then((data) => {
//                 console.log("CSV 文件内容：", data);
//                 this.setOutputData(0, data); // 设置节点的输出数据
//             });
//         } else {
//             console.error("文件名不能为空！");
//         }
//     }
// }
// LiteGraph.registerNodeType("卡片制作/CSV Reader", CSVReaderLocal);


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

    app: App | null = null; // Vue 应用实例
    oldCardLink: string | null = null; // 上一个 cardLink 属性值
    needGetApp = true; // 是否需要获取 app 属性值

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
            this.app = this.getInputData(0); // 获取输入数据
            //debug
            console.log("获取输入数据", this.app);
        }
        console.log("获取输入数据", this.getInputData(0));
    }

    onConnectInput(inputIndex: number, outputType: INodeOutputSlot["type"], outputSlot: INodeOutputSlot, outputNode: LGraphNode, outputIndex: number): boolean {
        // console.log("连接输入", inputIndex, outputType, outputSlot, outputNode, outputIndex);
        // if (outputType !== "CardInstance") return false; // 只接受 CardInstance 类型的输入

        // this.app = outputNode.getOutputData(outputIndex); // 获取输出数据
        // this.oldCardLink = null; // 清空 oldCardLink 属性值

        this.needGetApp = true; // 设置标志位为 true

        return true; // 连接成功
    }

    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void {
        //debug
        console.log("连接变化", type, slotIndex, isConnected, link, ioSlot);
        // 如果是断开连接，则清空 app
        if (type === LiteGraph.INPUT && !isConnected && ioSlot.type === "CardInstance" && ioSlot.name === "Card Instance") {
            //debug
            console.log("断开连接", type, slotIndex, isConnected, link, ioSlot);
            this.app = null; // 清空 app
            this.oldCardLink = null; // 清空 oldCardLink
        }
    }

    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (!this.app) return; // 如果没有 app，则不绘制
        const cardLink = this.app._instance?.exposed?.getCardLink?.(); // 获取 cardLink 属性值
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
                debugMode: true, // 设置调试模式
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
        if (this.needGetApp) {
            this.app = this.getInputData(0); // 获取输入数据
            this.oldCardLink = null; // 清空 oldCardLink 属性值
            this.needGetApp = false; // 重置标志位
        }
    }
}

LiteGraph.registerNodeType("卡片制作/Display Card Instance", DisplayCardInstance);