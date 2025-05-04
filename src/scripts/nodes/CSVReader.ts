import { LGraphNode, LiteGraph } from "litegraph.js";

// //name to show
// MyAddNode.title = "Sum";
// //function to call when the node is executed
// MyAddNode.prototype.onExecute = function()
// {
//   var A = this.getInputData(0);
//   if( A === undefined )
//     A = 0;
//   var B = this.getInputData(1);
//   if( B === undefined )
//     B = 0;
//   this.setOutputData( 0, A + B );
// }
// //register in the system
// LiteGraph.registerNodeType("basic/sum", MyAddNode );
// Define the CustomIWidget interface extending IWidget
class CSVReader extends LGraphNode {
    static title = "CSV Reader";
    static desc = "Read CSV file and output data";
    static pixels_threshold = 10;
    static markers_color = "#666";


    constructor() {
        super(CSVReader.title);
        this.addWidget("button", "Import CSV", "", this.triggerGetFile.bind(this)); // 添加按钮
        this.addProperty("cvsData", "", "string"); // 添加属性
        this.addOutput("CSVData", "CSV");
        this.size = [180, 60];
        if (!this.properties.cvsData) {
            this.properties.cvsData = ""; // 初始化属性值
        }
    }

    triggerGetFile() {
        // 创建文件输入元素，模拟点击，触发文件选择对话框
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv"; // 只接受 CSV 文件
        fileInput.style.display = "none"; // 隐藏文件输入元素

        document.body.appendChild(fileInput); // 将其添加到文档中


        // 添加文件选择事件处理
        fileInput.addEventListener("change", (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target?.result as string;
                    console.log("CSV 文件内容：", contents);
                    // 你可以在这里解析 CSV 并更新节点数据
                    this.properties.cvsData = contents; // 更新 widget 的值
                    this.setProperty("cvsData", contents); // 设置节点的属性值
                    this.setOutputData(0, contents); // 设置节点的输出数据
                };
                reader.onloadend = () => {
                    // 清理文件输入元素
                    document.body.removeChild(fileInput);
                };
                reader.readAsText(file);
            }
        });

        fileInput.click(); // 模拟点击
    }
}
LiteGraph.registerNodeType("卡片制作/CSV Reader", CSVReader);
