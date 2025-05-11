import { LGraphNode, LiteGraph, type IWidget, type SerializedLGraphNode } from "litegraph.js";

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
            console.warn("没有找到变量名！");
        }
    }

    // 处理转义字符
    private processEscapes(str: string): string {
        return str
            .replace(/\\n/g, '\n')           // 处理换行符
            .replace(/\\t/g, '\t')           // 处理制表符
            .replace(/\\r/g, '\r')           // 处理回车符
            .replace(/\\{/g, '{')            // 处理左大括号
            .replace(/\\}/g, '}')            // 处理右大括号
            .replace(/\\\\/g, '\\');         // 处理反斜杠
    }

    onExecute() {
        const format = this.properties.format; // 获取格式化字符串
        const inputs: Record<string, string> = {}; // 存储输入的变量名和对应的值
        this.inputs.forEach((input) => {
            inputs[input.name] = this.getInputData(this.inputs.indexOf(input)) as string; // 获取输入的值
        });

        // 先处理转义字符
        let formattedString = this.processEscapes(format);

        // 格式化字符串
        for (const key in inputs) {
            formattedString = formattedString.replace(`{${key}}`, inputs[key]);
        }
        this.setOutputData(0, formattedString); // 设置输出数据为格式化后的字符串
    }
}

LiteGraph.registerNodeType("卡片制作/Format String", FormatString);