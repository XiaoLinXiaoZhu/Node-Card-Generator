import { LGraphNode, LiteGraph, type IWidget,type SerializedLGraphNode } from "litegraph.js";

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


// 这个节点能够创建一个卡片元素，定义它的 长宽。
// 卡片元素本质上是一个 VUE 组件，里面包括 使用 HTML 作为渲染的部分，也包括使用 Canvas 作为添加特效的部分。

import CardInstance from "./CardInstance.vue";
import {createApp} from "vue";

class CreateCardInstance extends LGraphNode {
    static title = "Create Card Instance";
    static desc = "Create a card instance with given width and height";
    static pixels_threshold = 10;
    static markers_color = "#666";

    widthWidget?: IWidget; // 定义 widget 属性
    heightWidget?: IWidget; // 定义 widget 属性

    constructor() {
        super(CreateCardInstance.title);
        this.widthWidget = this.addWidget("number", "Width", 180, this.onWidthChange.bind(this)); // 添加宽度输入框
        this.heightWidget = this.addWidget("number", "Height", 60, this.onHeightChange.bind(this)); // 添加高度输入框
        this.addProperty("width", 180, "number"); // 添加宽度属性
        this.addProperty("height", 60, "number"); // 添加高度属性
        this.addOutput("CardInstance", "CardInstance"); // 添加输出
        this.size = [240, 60];

        // 创建一个 隐藏的 div 元素，用于渲染 VUE 组件
        const div = document.createElement("div");
        // div.style.display = "none"; // 隐藏 div
        div.id = "card-instance"; // 设置 id
        document.body.appendChild(div); // 将 div 添加到 body 中

        // 创建 VUE 组件实例
        const app = createApp(CardInstance, {
            width: this.properties.width,
            height: this.properties.height,
        });
        app.mount(div); // 挂载 VUE 组件到 div 上

        // 设置 输出为 CardInstance 组件的实例
        this.setOutputData(0, app); // 设置节点的输出数据
    }

    onConfigure(o: SerializedLGraphNode): void {
        //如果没有设置属性值，则设置为默认值
        if (!o.properties.width) {
            o.properties.width = 180; // 初始化宽度属性值
        }
        if (!o.properties.height) {
            o.properties.height = 60; // 初始化高度属性值
        }
    }

    onWidthChange(value: number) {
        this.properties.width = value; // 更新宽度属性值
        this.widthWidget!.value = value; // 更新 widget 的值
    }

    onHeightChange(value: number) {
        this.properties.height = value; // 更新高度属性值
        this.heightWidget!.value = value; // 更新 widget 的值
    }

    onExecute() {
        // 在这里可以执行一些操作，例如根据宽度和高度创建一个卡片实例
        // const width = this.properties.width;
        // const height = this.properties.height;
        // console.log("创建卡片实例，宽度：", width, "高度：", height);
        // 这里可以添加更多的逻辑来处理卡片实例的创建
    }
}

LiteGraph.registerNodeType("卡片制作/CreateCardInstance", CreateCardInstance);
