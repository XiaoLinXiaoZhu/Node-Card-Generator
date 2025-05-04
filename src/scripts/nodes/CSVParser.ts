import { LGraphNode, LiteGraph, type INodeOutputSlot } from "litegraph.js";

class CSVParser extends LGraphNode {
    constructor() {
        super("CSV Parser");
        this.addInput("CSVData", "CSV");
        this.addWidget("button", "Refresh", "", this.refreshOutput.bind(this)); // 添加刷新按钮
        this.addOutput("Column Count", "number"); // 默认输出列数
        this.properties = { delimiter: ",", output: [], inited: false };
        this.onExecute = this.onExecute.bind(this);
    }
    refreshOutput() {
        this.properties.inited = true;

        // 直接从 this.outputs 中获取输出口名称
        const outputNames = this.outputs.map(output => output.name);
        const csvData = this.getInputData(0);
        if (csvData) {
            const rows = csvData.split("\n").map(row => row.split(this.properties.delimiter));
            const columnCount = rows[0]?.length || 0;
            const newOutputNames = ["Column Count", ...rows[0].map((columnName, i) => `[${i}] ${columnName}`)];
            console.log("输出口名称", outputNames, newOutputNames);

            // 如果新旧输出口不一样,则删除旧的输出口
            if (JSON.stringify(outputNames) !== JSON.stringify(newOutputNames)) {
                for (let i = 1; i < outputNames.length; i++) {
                    this.removeOutput(1); // 从第 1 个输出口开始删除
                }
                // 添加新的输出口
                for (let i = 1; i < newOutputNames.length; i++) {
                    this.addOutput(newOutputNames[i], "array");
                }
            }

            // 设置第 0 个输出口的值为列数
            this.setOutputData(0, columnCount);
        }
    }

    onConnectInput(inputIndex: number, outputType: INodeOutputSlot["type"], outputSlot: INodeOutputSlot, outputNode: LGraphNode, outputIndex: number): boolean {
        // 连接输入口时,刷新输出口
        if (inputIndex === 0) {
            this.refreshOutput();
        }
        return true;
    }

    onExecute() {
        // 它会动态增加自己的输出口
        if (!this.properties.inited) {
            return; // 如果没有初始化,则不执行
        }

        const csvData = this.getInputData(0);
        if (csvData) {
            const rows = csvData.split("\n").map(row => row.split(this.properties.delimiter));
            for (let i = 0; i < rows[0]?.length; i++) {
                const columnValues = rows.map(row => row[i]).slice(1); // 获取每列的值（跳过表头）


                // this.setOutputData(i + 1, columnValues.join(", ")); // 设置输出为逗号分隔的列值
                // 设置输出为数组
                this.setOutputData(i + 1, columnValues); // 设置输出为数组
            }
            this.setOutputData(0, rows[0]?.length || 0); // 设置第 0 个输出口的值为列数
        } else {
            this.setOutputData(0, 0); // 如果没有输入数据，设置输出为 null
        }
    }
}
LiteGraph.registerNodeType("卡片制作/CSVParser", CSVParser);
