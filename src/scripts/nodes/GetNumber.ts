import { LGraphNode, LiteGraph } from "litegraph.js";
import { clamp } from "./libs";

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
