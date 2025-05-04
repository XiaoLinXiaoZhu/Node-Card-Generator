import { LGraphNode, LiteGraph } from "litegraph.js";

// card 本质上是一个 html 元素，在最后被渲染为图片
class AddElementOnCard extends LGraphNode {
    constructor() {
        super("Add Element On Card");
        this.addInput("Card", "card"); // 输入卡片数据
        this.addWidget("number", "Width", 200, "width", { min: 0, max: 1000, step: 1 }); // 添加宽度输入框
        this.addWidget("number", "Height", 300, "height", { min: 0, max: 1000, step: 1 }); // 添加高度输入框
        this.addWidget("button", "X", 0, "width", { min: 0, max: 1000, step: 1 }); // 添加 元素坐标
        this.addWidget("button", "Y", 0, "height", { min: 0, max: 1000, step: 1 }); // 添加 元素坐标
        this.addInput("Element", "element"); // 输入元素数据
        this.addOutput("Card", "card"); // 输出增加元素后的卡片数据 
        this.properties = { width: 200, height: 300 };
        this.onExecute = this.onExecute.bind(this);
    }

    onExecute() {
        const cardData = this.getInputData(0) as HTMLElement; // 获取输入的卡片数据
        const element = this.getInputData(1) as HTMLElement; // 获取输入的元素数据
        if (cardData && element) {
            // 在卡片上添加元素
            cardData.appendChild(element); // 将元素添加到卡片上

            this.setOutputData(0, card); // 输出增加元素后的卡片数据
        }
    }
}
LiteGraph.registerNodeType("卡片制作/AddElementOnCard", AddElementOnCard);
