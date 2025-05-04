import { LGraphNode, LiteGraph } from "litegraph.js";

// 从Array中获取某一个的值
class ArrayGet extends LGraphNode {
    constructor() {
        super("Array Get");
        this.addInput("Array", "array");
        this.addInput("Index", "number");
        this.addOutput("Value", "string");
        this.properties = { index: 0 };
        this.onExecute = this.onExecute.bind(this);
    }
    onExecute() {
        const array = this.getInputData(0);
        const index = this.getInputData(1);
        if (array && index !== undefined) {
            this.setOutputData(0, array[index] as string);
        } else {
            this.setOutputData(0, null); // 如果没有输入数据，设置输出为 null
        }
    }
}
LiteGraph.registerNodeType("卡片制作/ArrayGet", ArrayGet);
