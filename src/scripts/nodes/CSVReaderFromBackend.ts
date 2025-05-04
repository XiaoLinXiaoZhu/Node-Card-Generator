import { LGraphNode, LiteGraph, type SerializedLGraphNode,type IWidget } from "litegraph.js";
import {loadFile} from "./libs";
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
class CSVReaderLocal extends LGraphNode {
    static title = "CSV Reader Local";
    static desc = "Read CSV file from local and output data";
    static pixels_threshold = 10;
    static markers_color = "#666";

    csvPathWidget?: IWidget; // 定义 widget 属性

    constructor() {
        super(CSVReaderLocal.title);
        // this.addWidget("button", "Import CSV", "", this.triggerGetFile.bind(this)); // 添加按钮
        this.csvPathWidget = this.addWidget("text","CSV File Path","",this.triggerGetFile.bind(this)); // 添加文本框
        this.addProperty("cvsPath", "", "string"); // 添加属性
        this.addOutput("CSVData", "CSV");
        this.size = [180, 60];
    }

    onConfigure(o: SerializedLGraphNode): void {
        //如果没有设置属性值，则设置为默认值
        if (!o.properties.cvsPath) {
            o.properties.cvsPath = ""; // 初始化属性值
        }
        else{
            this.triggerGetFile(o.properties.cvsPath); // 如果有默认值，直接读取文件
        }
    }

    triggerGetFile(fileName: string) {
        console.log("触发获取文件", fileName);
        this.properties.cvsPath = fileName; // 更新属性值
        this.csvPathWidget!.value = fileName; // 更新 widget 的值
        // 直接从后端获取数据
        // const fileName = this.getInputData(0) as string;
        // 从 wiget 中获取文件名
        if (fileName) {
            loadFile(fileName).then((data) => {
                console.log("CSV 文件内容：", data);
                this.setOutputData(0, data); // 设置节点的输出数据
            });
        } else {
            console.error("文件名不能为空！");
        }
    }
}
LiteGraph.registerNodeType("卡片制作/CSV Reader Local", CSVReaderLocal);
