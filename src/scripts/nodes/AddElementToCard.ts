import { LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget,type SerializedLGraphNode } from "litegraph.js";
import CardInstance from "./CardInstance.vue";
import {createApp} from "vue";
import { addCardElement, createCardElement, drawCardLinkOnNode, loadImageFromLink, removeCardElementByAdder } from "./cardLibs";
import { type CardElement } from "./cardLibs";

// 将元素添加到 CardInstance 组件上
class AddCardElementToCard extends LGraphNode {
    static title = "Add Card Element to Card";
    static desc = "Add a card element to the card instance";
    static pixels_threshold = 10;
    static markers_color = "#666";

    properties = {
        content: "Hello World", // 文本内容
        type: "text", // 类型
        style: {
            width: "100px",
            height: "100px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: "16px",
            textAlign: "center",
            lineHeight: "100px",
        }, // 样式
    };

    cardInstance: InstanceType<typeof CardInstance> | null = null; // 卡片实例
    cardElement: CardElement; // 卡片元素
    oldCardLink: string | null = null; // 上一个 cardLink 属性值
    needGetCardInstance = true; // 是否需要获取 app 属性值



    constructor() {
        super(AddCardElementToCard.title);
        this.addInput("Card Instance", "CardInstance"); // 添加输入
        this.size = [400, 800]; // 设置节点大小

        this.cardElement = { // 初始化卡片元素
            uid: "",
            type: "text",
            style: {
                width: "100px",
                height: "100px",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                textAlign: "center",
                lineHeight: "100px",
            },
            content: "Hello World",
        };

        // this.addReactiveWidget("content", "Hello World"); // 添加文本内容输入框
        // this.addReactiveWidget("type", "text"); // 添加类型输入框
        // this.addReactiveWidget("style_count", 1); // 添加样式数量输入框

        
        // this.addReactiveWidget("style", `
        // {
        //     "width": "100px",
        //     "height": "100px",
        //     "backgroundColor": "#ffffff",
        //     "color": "#FFFFFF",
        //     "fontSize": "16px",
        //     "textAlign": "center",
        //     "lineHeight": "100px"
        // }`); // 添加样式输入框

        //this.addWidget("text","Surname","", { property: "surname"}); //this will modify the node.properties
        this.addWidget("text", "content", "Hello World", (v) => { this.cardElement.content = v; this.reAdd(); },{property: "content"}); // 添加文本内容输入框
        this.addWidget("text", "type", "text", (v) => { this.cardElement.type = v; this.reAdd(); },{property: "type"}); // 添加类型输入框

        this.reAdd(); // 重新添加卡片元素
    }
    reAddStyleWidget(style: string): void {
        // 删除多余的样式输入框
        const styleCount = Object.keys(this.properties.style).length; // 获取样式数量
        for (let i = 0; i < styleCount; i++) {
        }
        // 对于当前样式的每个属性，添加一个输入框。并且最后添加一个新的空白的样式输入框。
        const addStyleWidget= (style:string) => {
            // 获取样式的名称
            const styleName = style.split(":")[0].trim(); // 获取样式名称
            this.addWidget("text", styleName, style, (v) => { (this.properties.style as any)[styleName] = v; this.reAdd(); }); // 添加样式输入框
        }

        // 将样式字符串转换为对象
        const styleObj = JSON.parse(style); // 将样式字符串转换为对象
        // 遍历样式对象的每个属性
        for (const key in styleObj) {
            if (styleObj.hasOwnProperty(key)) {
                const singleStyle = `${key}: ${styleObj[key]}`; // 获取单个样式
                addStyleWidget(singleStyle); // 添加样式输入框
            }
        }
    }

    reAdd(): void {
        if (!this.cardInstance) {
            return; // 如果没有卡片实例，则返回
        }
        const cardConfig : CardElement = {
            uid: "",
            content: this.properties.content,
            type: this.properties.type,
            style: this.properties.style,
        }
        const el = createCardElement(cardConfig,this); // 创建卡片元素
        // 更新卡片元素
        this.cardElement = el;
        addCardElement(this.cardInstance as InstanceType<typeof CardInstance>, el); // 添加卡片元素
    }

    remove(): void {
        if (this.cardInstance) {
            removeCardElementByAdder(this.cardInstance as InstanceType<typeof CardInstance>, this); // 移除卡片元素
        }
    }

    onConnectionsChange(type: number, slotIndex: number, isConnected: boolean, link: LLink, ioSlot: (INodeOutputSlot | INodeInputSlot)): void {
        //debug
        console.log("连接变化", type, slotIndex, isConnected, link, ioSlot);
        // 如果是断开连接，则清空 app
        if (type === LiteGraph.INPUT && !isConnected && ioSlot.type === "CardInstance" && ioSlot.name === "Card Instance") {
            //debug
            console.log("断开连接", type, slotIndex, isConnected, link, ioSlot);
            this.remove(); // 移除卡片元素
            this.cardInstance = null; // 清空 app
        }

        // 如果是连接，则获取 app
        if (type === LiteGraph.INPUT && isConnected && ioSlot.type === "CardInstance" && ioSlot.name === "Card Instance") {
            //debug
            console.log("连接成功", type, slotIndex, isConnected, link, ioSlot);
            this.cardInstance = this.getInputData(0); // 获取输入数据
            if (this.cardInstance) {
                this.needGetCardInstance = false; // 设置标志位为 false
                this.reAdd(); // 重新添加卡片元素
                //debug
                console.log("add card element to card", this.cardInstance, this.cardElement);
            }
        }
    }

    onExecute(): void {
        if (this.needGetCardInstance) {
            this.cardInstance = this.getInputData(0); // 获取输入数据
            if (this.cardInstance) {
                this.needGetCardInstance = false; // 设置标志位为 false
                this.reAdd(); // 重新添加卡片元素
                //debug
                console.log("add card element to card", this.cardInstance, this.cardElement);
            }
        }
    }
}
LiteGraph.registerNodeType("卡片制作/AddCardElementToCard", AddCardElementToCard); // 注册节点类型