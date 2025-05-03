// //node constructor class
// function MyAddNode()
// {
//   this.addInput("A","number");
//   this.addInput("B","number");
//   this.addOutput("A+B","number");
//   this.properties = { precision: 1 };
// }

import { LiteGraph,LGraphNode, type IWidget,type WidgetCallback } from "litegraph.js";
//@ts-ignore
import path from "path";
//@ts-ignore
import fs from "fs";


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
interface CustomIWidget extends IWidget {
    id?: string; // 添加可选的 id 属性
}

const customFileWidget: CustomIWidget = {
    name: "CSV File Input",
    value: undefined,
    property: "",
    id: "", // 添加 id 属性
    draw: function (
        ctx: CanvasRenderingContext2D,
        node: LGraphNode,
        width: number,
        posY: number,
        height: number
    ) {
        if (!this.id || this.id === "") {
            this.id = "csv-file-input" + Math.random().toString(36).substring(2, 15); // 生成随机字符串作为唯一标识符
        }
        if (document.getElementById(this.id)) {
            return;
        }
        // debug
        console.log("draw", node, width, posY, height);

        // 创建文件输入元素
        const fileInput = document.createElement("input");
        fileInput.id = this.id; // 设置唯一的 id
        fileInput.type = "file";
        fileInput.accept = ".csv"; // 只接受 CSV 文件
        fileInput.style.margin = "5px"; // 添加一些样式

        // 添加点击事件处理
        fileInput.addEventListener("change", (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target?.result as string;
                    console.log("CSV 文件内容：", contents);
                    // 你可以在这里解析 CSV 并更新节点数据
                    this.value = contents; // 更新 widget 的值
                    LGraphNode.prototype.setOutputData.call(node, 0, contents); // 设置节点的输出数据
                };
                reader.readAsText(file);
            }

            // 清空值以便下次也能触发 change
            fileInput.value = "";
        });

        // 将 input 添加到 class="tools tools-left" 的 div 中
        const toolsContainer = document.querySelector(".tools.tools-left");
        if (toolsContainer) {
            toolsContainer.appendChild(fileInput);
        } else {
            console.warn("未找到 class='tools tools-left' 的容器");
        }

        // 保存引用，便于后续清理
        (node as any)._fileInput = fileInput;

        // 可选：绘制一个可见的矩形作为“按钮”样式（canvas 上绘图）
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(width - 100, posY, 100, 20);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.fillText("Import CSV", width - 95, posY + 14);
    },
};


class CSVReader extends LGraphNode {
	constructor() {
		super("CSV Reader");
        // add a widget to the node, add <input type="file" /> to the node 
		this.addCustomWidget(customFileWidget);
		this.addOutput("CSVData", "CSV");
        this.onExecute = this.onExecute.bind(this);
	}
    onExecute() {

    }
}

LiteGraph.registerNodeType("卡片制作/卡片", CSVReader);

class NewCSVReader extends LGraphNode {
    static title = "New CSV Reader";
    static desc = "Read CSV file and output data";
    static pixels_threshold = 10;
    static markers_color = "#666";


    constructor() {
        super(NewCSVReader.title);
        this.addWidget("button", "Import CSV", "", this.triggerGetFile.bind(this)); // 添加按钮
        this.addProperty("cvsData", "","string"); // 添加属性
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
                }
                reader.readAsText(file);
            }
        });

        fileInput.click(); // 模拟点击
    }
}

LiteGraph.registerNodeType("卡片制作/NewCSVReader", NewCSVReader);

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


// 从Array中获取某一个的值
class ArrayGet extends LGraphNode {
    constructor() {
        super("Array Get");
        this.addInput("Array", "array");
        this.addInput("Index", "number");
        this.addOutput("Value", "any");
        this.properties = { index: 0 };
        this.onExecute = this.onExecute.bind(this);
    }
    onExecute() {
        const array = this.getInputData(0);
        const index = this.getInputData(1);
        if (array && index !== undefined) {
            this.setOutputData(0, array[index]);
        } else {
            this.setOutputData(0, null); // 如果没有输入数据，设置输出为 null
        }
    }
}

LiteGraph.registerNodeType("卡片制作/ArrayGet", ArrayGet);

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

// 获取 数字 范围内的值
class GetNumber extends LGraphNode {
    properties: {
        min: number;
        max: number;
        value: number;
        step: number;
    };
    old_y: number;
    _remainder: number;
    _precision: number;
    mouse_captured: boolean;

    static title = "Number";
    static desc = "Widget to select number value";
    static pixels_threshold = 10;
    static markers_color = "#666";

    constructor() {
        super(GetNumber.title);
        this.addOutput("", "number");
        this.size = [80, 60];
        this.properties = {
            min: -1000,
            max: 1000,
            value: 1,
            step: 1
        };
        this.old_y = -1;
        this._remainder = 0;
        this._precision = 0;
        this.mouse_captured = false;

        // 设置精度
        const t = (this.properties.step + "").split(".");
        this._precision = t.length > 1 ? t[1].length : 0;
    }

    onDrawForeground(ctx: CanvasRenderingContext2D): void {
        const x = this.size[0] * 0.5;
        const h = this.size[1];

        ctx.textAlign = "center";

        if (h > 30) {
            ctx.fillStyle = GetNumber.markers_color;
            ctx.beginPath();
            ctx.moveTo(x, h * 0.1);
            ctx.lineTo(x + h * 0.1, h * 0.2);
            ctx.lineTo(x + h * -0.1, h * 0.2);
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x, h * 0.9);
            ctx.lineTo(x + h * 0.1, h * 0.8);
            ctx.lineTo(x + h * -0.1, h * 0.8);
            ctx.fill();

            ctx.font = (h * 0.7).toFixed(1) + "px Arial";
        } else {
            ctx.font = (h * 0.8).toFixed(1) + "px Arial";
        }

        ctx.fillStyle = "#EEE";
        ctx.fillText(
            this.properties.value.toFixed(this._precision),
            x,
            h * 0.75
        );
    }

    onExecute(): void {
        this.setOutputData(0, this.properties.value);
    }

    onPropertyChanged(name: string, value: any): void {
        const t = (this.properties.step + "").split(".");
        this._precision = t.length > 1 ? t[1].length : 0;
    }

    onMouseDown(e: MouseEvent, pos: number[]): boolean {
        if (pos[1] < 0) {
            return false;
        }

        this.old_y = e["canvasY"];
        this.captureInput(true);
        this.mouse_captured = true;

        return true;
    }

    onMouseMove(e: MouseEvent): void {
        if (!this.mouse_captured) return;

        let delta = this.old_y - e["canvasY"];
        if (e.shiftKey) {
            delta *= 10;
        }
        if (e.metaKey || e.altKey) {
            delta *= 0.1;
        }
        this.old_y = e["canvasY"];

        const steps = this._remainder + delta / GetNumber.pixels_threshold;
        this._remainder = steps % 1;
        const intSteps = Math.floor(steps);

        const v = clamp(
            this.properties.value + intSteps * this.properties.step,
            this.properties.min,
            this.properties.max
        );

        this.properties.value = v;
        this.graph._version++;
        this.setDirtyCanvas(true);
    }

    onMouseUp(e: MouseEvent, pos: number[]): void {
        if (e["click_time"] < 200) {
            const steps = pos[1] > this.size[1] * 0.5 ? -1 : 1;
            this.properties.value = clamp(
                this.properties.value + steps * this.properties.step,
                this.properties.min,
                this.properties.max
            );
            this.graph._version++;
            this.setDirtyCanvas(true);
        }

        if (this.mouse_captured) {
            this.mouse_captured = false;
            this.captureInput(false);
        }
    }
}

// 注册节点类型
LiteGraph.registerNodeType("卡片制作/GetNumber", GetNumber);

// card 本质上是一个 html 元素，在最后被渲染为图片
class AddElementOnCard extends LGraphNode {
    constructor() {
        super("Add Element On Card");
        this.addInput("Card", "card"); // 输入卡片数据
        this.addWidget("number", "Width", 200, "width", { min: 0, max: 1000, step: 1 }); // 添加宽度输入框
        this.addWidget("number", "Height", 300, "height", { min: 0, max: 1000, step: 1 }); // 添加高度输入框
        this.addWidget("button", "X", 0 , "width", { min: 0, max: 1000, step: 1 }); // 添加 元素坐标
        this.addWidget("button", "Y", 0 , "height", { min: 0, max: 1000, step: 1 }); // 添加 元素坐标
        this.addInput("Element", "element"); // 输入元素数据
        this.addOutput("Card", "card"); // 输出增加元素后的卡片数据 
        this.properties = { width: 200, height: 300 };
        this.onExecute = this.onExecute.bind(this);
    }

    onExecute() {
        const cardData = this.getInputData(0) as HTMLElement; // 获取输入的卡片数据
        const element = this.getInputData(1) as HTMLElement // 获取输入的元素数据
        if (cardData && element) {
            // 在卡片上添加元素
            cardData.appendChild(element); // 将元素添加到卡片上

            this.setOutputData(0, card); // 输出增加元素后的卡片数据
        }
    }
}

LiteGraph.registerNodeType("卡片制作/AddElementOnCard", AddElementOnCard);


// 