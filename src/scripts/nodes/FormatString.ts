import { LGraphNode, LiteGraph, type IWidget, type SerializedLGraphNode } from "litegraph.js";

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


// 这个节点的功能就是根据输入的 string 和一个 format 字符串，输出格式化后的字符串
// 例如：输入 "Hello {name}, you are {age} years old." 后 将会为自己生成两个输入节点，分别是 name 和 age
// 输出格式化后的字符串
class FormatString extends LGraphNode {
    static title = "Format String";
    static desc = "Format a string with given format and inputs";
    static pixels_threshold = 10;
    static markers_color = "#666";

    formatStringWidget?: IWidget; // 定义 widget 属性

    constructor() {
        super(FormatString.title);
        this.formatStringWidget = this.addWidget("text", "Format String", "", this.onFormatString.bind(this)); // 添加文本框
        this.addOutput("Formatted String", "string");
        this.addProperty("format", "", "string"); // 添加属性
        this.size = [240, 60];
    }

    onConfigure(o: SerializedLGraphNode): void {
        //如果没有设置属性值，则设置为默认值
        if (!o.properties.format) {
            o.properties.format = ""; // 初始化属性值
        } else {
            this.onFormatString(o.properties.format); // 如果有默认值，直接读取文件
        }
    }

    onFormatString(format: string) {
        console.log("触发格式化字符串", format);
        this.properties.format = format; // 更新属性值
        this.formatStringWidget!.value = format; // 更新 widget 的值

        // 解析格式化字符串，获取所有的变量名
        const regex = /\{(\w+)\}/g;
        const matches = format.match(regex);
        if (matches) {
            const variableNames = matches.map((match) => match.replace(/\{|\}/g, ""));
            console.log("变量名：", variableNames);
            // 为每个变量名添加输入节点
            // variableNames.forEach((name) => {
            //     this.addInput(name, "string");
            // });
            // 检查，如果当前的 this.inputs 中有这个变量名，则不添加
            // 如果新的变量中不包括，但是 properties.variables 中有，则删除这个输入节点
            this.inputs = this.inputs.filter((input) => {
                return variableNames.includes(input.name);
            });
            variableNames.forEach((name) => {
                if (!this.inputs.some((input) => input.name === name)) {
                    this.addInput(name, "string");
                }
            });
        } else {
            console.error("没有找到变量名！");
        }
    }

    onExecute() {
        const format = this.properties.format; // 获取格式化字符串
        const inputs: Record<string, string> = {}; // 存储输入的变量名和对应的值
        this.inputs.forEach((input) => {
            inputs[input.name] = this.getInputData(this.inputs.indexOf(input)) as string; // 获取输入的值
        });

        // 格式化字符串
        let formattedString = format;
        for (const key in inputs) {
            formattedString = formattedString.replace(`{${key}}`, inputs[key]);
        }
        this.setOutputData(0, formattedString); // 设置输出数据为格式化后的字符串
    }
}

LiteGraph.registerNodeType("卡片制作/Format String", FormatString);