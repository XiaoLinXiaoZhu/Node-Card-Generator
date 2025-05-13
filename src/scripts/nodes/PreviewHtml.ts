// 用于预览html
import { LGraphNode, LiteGraph, LLink, type INodeInputSlot, type INodeOutputSlot, type IWidget, type SerializedLGraphNode } from "litegraph.js";
import { drawCardCanvasOnNode } from "../lib/cardLibs";
import PreviewHtmlComponent from "./PreviewHtmlComponent.vue";
import { createApp } from "vue";
import { ExLGraphNode } from "./ExLGraphNode";

class PreviewHtml extends ExLGraphNode {
    static title = "Preview HTML";
    static desc = "Display HTML content on node";
    static pixels_threshold = 10;
    static markers_color = "#666";

    properties = {
        width: 800,
        height: 600
    };

    previewComponent: InstanceType<typeof PreviewHtmlComponent> | null = null;
    needGetHtmlContent = true;

    constructor() {
        super(PreviewHtml.title);
        this.addInput("HTML内容", "string");
        this.size = [400, 800];

        // 初始化 PreviewHtmlComponent
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        const app = createApp(PreviewHtmlComponent, {
            width: this.properties.width,
            height: this.properties.height
        });

        this.previewComponent = app.mount(container) as InstanceType<typeof PreviewHtmlComponent>;

        // 添加宽度和高度输入框
        this.addWidget("number", "width", this.properties.width, (v) => {
            this.properties.width = v;
            if (this.previewComponent) {
                this.previewComponent.setWidth(v);
            }
        });

        this.addWidget("number", "height", this.properties.height, (v) => {
            this.properties.height = v;
            if (this.previewComponent) {
                this.previewComponent.setHeight(v);
            }
        });

        this.initConnectionListeners();
    }

    onConfigure(o: SerializedLGraphNode): void {
        if (super.onConfigure) {
            super.onConfigure(o);
        }
        // 恢复保存的属性
        if (o.properties) {
            this.properties = {
                ...this.properties,
                ...o.properties
            };
        }
    }

    initConnectionListeners() {
        this.onInputConnected(0, (v) => {
            // debug
            console.log("PreviewHtml 连接成功", v);
            const content = this.getInputData(0);
            if (content !== undefined && this.previewComponent) {
                this.previewComponent.setHtmlContent(content);
            } else {
                this.needGetHtmlContent = true;
            }
        });

        this.onInputDisconnected(0, () => {
            // debug
            console.log("PreviewHtml 断开连接");
            if (this.previewComponent) {
                this.previewComponent.setHtmlContent("");
            }
            this.needGetHtmlContent = false;
        });
    }


    onDrawForeground(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
        if (!this.previewComponent) return;

        const previewCanvas = this.previewComponent.getCanvas();
        if (!previewCanvas) return;

        // 使用 cardLibs 中的函数绘制预览内容
        drawCardCanvasOnNode(ctx, previewCanvas, {
            autoGetCardSize: true,
            ctxSize: this.size,
            scaleMode: "contain",
            padding: 20,
            remainHeight: 70
        });
    }

    onExecute(): void {
        if (this.needGetHtmlContent) {
            const content = this.getInputData(0);
            if (content !== undefined && this.previewComponent) {
                this.previewComponent.setHtmlContent(content);
                // this.needGetHtmlContent = false;
            }
        }

    }

    onRemoved(): void {
        if (this.previewComponent) {
            // 获取组件实例的根元素
            const container = this.previewComponent.$el.parentElement;
            if (container) {
                // 卸载 Vue 应用
                const app = (this.previewComponent as any).__vue_app__;
                if (app) {
                    app.unmount();
                }
                // 移除容器元素
                container.remove();
            }
            this.previewComponent = null;
        }
    }
}

LiteGraph.registerNodeType("卡片制作/Preview HTML", PreviewHtml);



