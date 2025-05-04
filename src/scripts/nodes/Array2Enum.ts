import { LGraphNode, LiteGraph } from "litegraph.js";

// example: 从Array中获取某一个的值
// class ArrayGet extends LGraphNode {
//     constructor() {
//         super("Array Get");
//         this.addInput("Array", "array");
//         this.addInput("Index", "number");
//         this.addOutput("Value", "any");
//         this.properties = { index: 0 };
//         this.onExecute = this.onExecute.bind(this);
//     }
//     onExecute() {
//         const array = this.getInputData(0);
//         const index = this.getInputData(1);
//         if (array && index !== undefined) {
//             this.setOutputData(0, array[index]);
//         } else {
//             this.setOutputData(0, null); // 如果没有输入数据，设置输出为 null
//         }
//     }
// }
// LiteGraph.registerNodeType("卡片制作/ArrayGet", ArrayGet);


// 从Array中获取所有的类型，不重复的值
class Array2Enum extends LGraphNode {
    constructor() {
        super("Array2Enum");
        this.addInput("Array", "array");
        this.addOutput("Enum", "array");
        this.addOutput("EnumObj", "enumObj");
        this.addOutput("Count", "number");
        this.properties = { index: 0 };
        this.onExecute = this.onExecute.bind(this);
    }
    onExecute() {
        const array = this.getInputData(0);
        if (array) {
            // 使用 Set 来获取不重复的值
            const uniqueValues = new Set(array);
            // 将 Set 转换为数组
            const uniqueArray = Array.from(uniqueValues);
            this.setOutputData(0, uniqueArray); // 设置输出数据为不重复的值
            this.setOutputData(2, uniqueArray.length); // 设置输出数据为不重复的值的数量

            // 将数组转换为对象，键为数组的值，值为 出现的次数
            const enumObj = uniqueArray.reduce((acc: Record<string, number>, value) => {
                acc[value as string] = array.filter((item: typeof value) => item === value).length;
                return acc;
            }, {} as Record<string, number>);
            this.setOutputData(1, enumObj); // 设置输出数据为不重复的值的数量
        } else {
            this.setOutputData(0, null); // 如果没有输入数据，设置输出为 null
            this.setOutputData(1, 0); // 如果没有输入数据，设置输出为 null
            this.setOutputData(2, null); // 如果没有输入数据，设置输出为 null
        }
    }
}

LiteGraph.registerNodeType("卡片制作/Array2Enum", Array2Enum);
