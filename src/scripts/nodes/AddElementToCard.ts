import { LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";
import CardInstance from "./CardInstance.vue";
import { addCardElement, createCardElement, removeCardElementByAdder } from "./cardLibs";
import { type CardElement, CardElementTypes } from "./cardLibs";
import { ExLGraphNode } from "./ExLGraphNode";

// 将元素添加到 CardInstance 组件上
class AddCardElementToCard extends ExLGraphNode {
    static title = "添加卡片元素";
    static desc = "Add a card element to the card instance";
    static pixels_threshold = 10;
    static markers_color = "#666";

    properties = {
        content: "Hello World", // 文本内容
        type: "text", // 类型
        style: {
            width: "100px",
            height: "100px",
            backgroundColor: "#ffffff",
            color: "#000000",
            fontSize: "16px",
            textAlign: "center",
            lineHeight: "100px",
        }, // 样式
    };

    cardInstance: InstanceType<typeof CardInstance> | null = null; // 卡片实例
    cardElement: CardElement; // 卡片元素
    needGetCardInstance = true; // 是否需要获取 app 属性值
    widgets: IWidget[] = []; // 添加 widgets 属性
    hasExternalContent = false; // 是否使用外部内容

    size: [number, number] = [800, 800]; // 节点大小

    constructor() {
        super(AddCardElementToCard.title);
        this.addInput("Card Instance", "CardInstance"); // 添加输入
        this.addInput("Content", "string"); // 添加内容输入
        this.addOutput("Card Instance", "CardInstance"); // 添加输出

        this.cardElement = { // 初始化卡片元素
            uid: "",
            type: "text",
            style: {
                width: "100px",
                height: "100px",
                backgroundColor: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                textAlign: "center",
                lineHeight: "100px",
            },
            content: "Hello World",
        };

        this.hasExternalContent = false; // 是否使用外部内容

        // 保存当前节点宽度
        const currentWidth = this.size[0];


        // 添加文本内容输入框
        this.addBindedWidget(
            "text",
            "content",
            "Hello World",
            (v) => {
                //debug
                console.log("content", this.hasExternalContent);
                if (!this.hasExternalContent) {
                    this.reAdd();
                    return true;
                } else {
                    // 如果有外部内容输入，则忽略该输入框的值
                    return false;
                }
            }
        );

        // 添加类型输入框
        this.addBindedWidget(
            "combo",
            "type",
            CardElementTypes[0],
            (v) => {
                this.reAdd();
            },
            { values: CardElementTypes }
        ); 


        // 添加新增样式的输入框
        this.addWidget(
            "text",
            "add_style",
            "添加新样式 (格式: 属性名:属性值)",
            (v: string) => {
                const [newKey, newValue] = v.split(":").map((s: string) => s.trim());
                if (newKey && newValue) {
                    // 添加新的样式属性
                    (this.properties.style as any)[newKey] = newValue;
                    // 清空输入框
                    const addStyleWidget = this.widgets.find(w => w.name === "add_style");
                    if (addStyleWidget) {
                        addStyleWidget.value = "添加新样式 (格式: 属性名:属性值)";
                    }
                    // 重新初始化样式输入框
                    this.initStyleWidgets();
                    // 重新添加卡片元素
                    this.reAdd();
                }
            }
        );

        // 恢复节点宽度
        this.size[0] = currentWidth;

        // 初始化样式输入框
        this.initStyleWidgets();

        // 初始化连接变化
        this.initConnectionChangeListeners();
    }

    // 初始化样式输入框
    initStyleWidgets(): void {
        // 保存当前节点宽度
        const currentWidth = this.size[0];

        // 清除现有的样式输入框，但保留 content、type 和 add_style 输入框
        this.widgets = this.widgets.filter((w: IWidget) => {
            if (!w.name) return true;
            // 保留非样式相关的输入框
            if (w.name === "content" || w.name === "type" || w.name === "add_style") return true;
            // 清除样式相关的输入框
            return !w.name.startsWith("style_");
        });

        // 为每个样式属性创建输入框
        // debug
        console.log("initStyleWidgets", this.properties.style);
        for (const [key, value] of Object.entries(this.properties.style)) {
            this.addWidget(
                "text",
                `style_${key}`,
                `${key}:${value}`,
                (v: string) => {
                    // 如果为空，则将该样式从 properties.style 中删除，并且移除该样式输入框，且重新添加卡片元素
                    if (v === "") {
                        delete (this.properties.style as any)[key];
                        this.widgets = this.widgets.filter((w: IWidget) => w.name !== `style_${key}`);
                        this.reAdd();
                        return;
                    }
                    const [newKey, newValue] = v.split(":").map((s: string) => s.trim());
                    if (newKey && newValue) {
                        (this.properties.style as any)[newKey] = newValue;
                        this.reAdd();
                    }
                },
                { property: `style_${key}` }
            );
        }

        // 恢复节点宽度
        this.size[0] = currentWidth;
    }

    onConfigure(o: SerializedLGraphNode): void {
        if (super.onConfigure) {
            super.onConfigure(o);
        }
        // 恢复保存的样式属性
        if (o.properties && o.properties.style) {
            this.properties.style = o.properties.style;
        }
        // 重新初始化样式输入框
        this.initStyleWidgets();
    }

    reAdd(): void {
        if (!this.cardInstance) {
            return; // 如果没有卡片实例，则返回
        }
        const cardConfig: CardElement = {
            uid: "",
            content: this.properties.content,
            type: this.properties.type,
            style: this.properties.style,
        }
        const el = createCardElement(cardConfig, this); // 创建卡片元素
        // 更新卡片元素
        this.cardElement = el;
        addCardElement(this.cardInstance as InstanceType<typeof CardInstance>, el); // 添加卡片元素
    }

    remove(): void {
        if (this.cardInstance) {
            removeCardElementByAdder(this.cardInstance as InstanceType<typeof CardInstance>, this); // 移除卡片元素
        }
    }

    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        // 如果 有外部内容输入，则将背景设置为绿色
    }

    initConnectionChangeListeners(): void {
        // 如果是断开连接，则清空 app
        this.onInputDisconnected(0, (v) => {
            console.log(`在节点 ${this.title} 上断开 0 号输入连接`, v.ioSlot, v.link);
            this.remove(); // 移除卡片元素
            this.cardInstance = null; // 清空 app
            // 设置输出数据
            this.setOutputData(0, null);
        });

        // 如果是连接，则获取 app
        this.onInputConnected(0, (v) => {
            console.log(`在节点 ${this.title} 上连接 0 号输入`, v.ioSlot, v.link);
            this.cardInstance = this.getInputData(0); // 获取输入数据
            if (this.cardInstance) {
                // 设置输出数据
                this.setOutputData(0, this.cardInstance);
                this.needGetCardInstance = false; // 设置标志位为 false
                this.reAdd(); // 重新添加卡片元素
                //debug
                console.log("add card element to card", this.cardInstance, this.cardElement);
            }
        });

        // 如果是连接，且为输出，那么设置输出数据
        this.onOutputConnected(0, (v) => {
            console.log(`在节点 ${this.title} 上连接 0 号输出`, v.ioSlot, v.link);
            this.cardInstance = this.getInputData(0); // 获取输入数据
            if (this.cardInstance) {
                // 设置输出数据
                this.setOutputData(0, this.cardInstance);
            }
        });

        // 处理内容输入连接
        this.onInputConnected(1, (v) => {
            console.log(`在节点 ${this.title} 上连接 1 号输入`, v.ioSlot, v.link);
            this.hasExternalContent = true;
            const content = this.getInputData(1);
            if (content !== undefined) {
                // this.properties.content = content;
                this.setProperty("content", content);
                this.cardElement.content = content;
                this.reAdd();
            }
        });

        // 处理内容输入断开连接
        this.onInputDisconnected(1, (v) => {
            console.log(`在节点 ${this.title} 上断开 1 号输入连接`, v.ioSlot, v.link);
            this.hasExternalContent = false;
            this.setProperty("content", "");
        });
    }

    onExecute(): void {
        const newCardInstance = this.getInputData(0); // 获取输入数据
        if (!newCardInstance) {
            this.remove(); // 移除卡片元素
            this.cardInstance = null; // 清空 app
            // 设置输出数据
            this.setOutputData(0, null);
        } else if (newCardInstance !== this.cardInstance) {
            this.cardInstance = newCardInstance;
            this.needGetCardInstance = false; // 设置标志位为 false
            this.setOutputData(0, this.cardInstance);
            this.reAdd(); // 重新添加卡片元素
        }

        // 检查外部内容输入
        if (this.hasExternalContent) {
            this.bgcolor = "#135313"; // 设置背景颜色为绿色
            const content = this.getInputData(1);
            if (content !== undefined && content !== this.properties.content) {
                this.properties.content = content;
                this.cardElement.content = content;
                this.reAdd();
            }
        } else {
            this.bgcolor = "#353535"; // 设置背景颜色为灰色
        }
    }
}
LiteGraph.registerNodeType("卡片制作/AddCardElementToCard", AddCardElementToCard); // 注册节点类型