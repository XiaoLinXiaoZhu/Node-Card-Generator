import { LGraphNode, LiteGraph } from "litegraph.js";

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

        // 从 properties 中获取原来的输出
        const oldOutput = this.properties.output;
        // 计算新的输出口,认为csvData的第一行是表头,将其名称作为输出口名称
        const csvData = this.getInputData(0);
        if (csvData) {
            const rows = csvData.split("\n").map(row => row.split(this.properties.delimiter));
            const columnCount = rows[0]?.length || 0;
            const newOutput = ["Column Count", ...rows[0].map((columnName, i) => `[${i}] ${columnName}`)];

            // 如果新旧输出口不一样,则删除旧的输出口
            if (JSON.stringify(oldOutput) !== JSON.stringify(newOutput)) {
                for (let i = 1; i < oldOutput.length; i++) {
                    this.removeOutput(1); // 从第 1 个输出口开始删除
                }
                // 添加新的输出口
                for (let i = 1; i < newOutput.length; i++) {
                    this.addOutput(newOutput[i], "array");
                }

                this.properties.output = newOutput;
            }

            // 设置第 0 个输出口的值为列数
            this.setOutputData(0, columnCount);
        }
        console.log("refreshOutput", this.properties.output, this.outputs);
    }

    onExecute() {
        // 它会动态增加自己的输出口
        if (!this.properties.inited) {
            this.refreshOutput();
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
