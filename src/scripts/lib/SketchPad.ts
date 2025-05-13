import { createApp, type App } from "vue";
import type { CardEffect, CardElement, PixelEffect } from "./cardLibs";
import { FunctionChain, type FnCall } from "./FunctionChain";
import SketchPadRenderer from "./SketchPadRenderer.vue";

export interface SketchPadFn extends FnCall {
    type: "Element" | "CardEffect" | "PixelEffect"
    fn: (env: SketchPadOptions) => void | Promise<void>;
}

// 这个是到时候传递给 run 的参数
export interface SketchPadOptions {
    width: number,
    height: number,
    renderer: InstanceType<typeof SketchPadRenderer>,
    htmlSketch: HTMLElement | null,
    canvasSketch: HTMLCanvasElement | null,
}

export class SketchPad extends FunctionChain<SketchPadFn> {
    env: SketchPadOptions | null = null;
    app: App<Element> | null = null;
    appDiv: HTMLDivElement | null = null;
    debugMode: boolean = false;

    addElement(el: CardElement) {
        this.then((env: SketchPadOptions) => {
            // 这里是添加元素的逻辑
            if (this.debugMode) {
                console.log("添加元素", el);
            }

            const div = document.createElement("div");
            div.id = el.uid;
            Object.entries(el.style).forEach(([key, value]) => {
                (div.style as any)[key] = value;
            });
            div.innerHTML = el.content || "";
            // 叠加在上面
            env.htmlSketch?.appendChild(div);
        });
    }

    addCardEffect(cardEffect: CardEffect) {
        // 这种cardEffect 本质上是一个父元素，将所有的子元素都添加到这个父元素上
        this.then((env: SketchPadOptions) => {
            // 这里是添加元素的逻辑
            if (this.debugMode) {
                console.log("添加卡片特效", cardEffect);
            }

            // 使用div的特殊效果提供特效。
            const div = document.createElement("div");
            div.id = cardEffect.uid;
            div.style = cardEffect.value;
            // 还要给div添加属性： width, height, position
            div.style.width = `${env.width}px`;
            div.style.height = `${env.height}px`;
            div.style.position = "absolute";
            div.style.top = "0px";
            div.style.left = "0px";

            // 将 htmlSketch 的子元素添加到 div 中
            const children = env.htmlSketch?.children;
            if (children) {
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    if (child.id !== cardEffect.uid) {
                        div.appendChild(child);
                    }
                }
            }
            // 清空 htmlSketch
            // env.htmlSketch!.innerHTML = "";
            // 将 div 添加到 htmlSketch 中
            env.htmlSketch?.appendChild(div);
        });
    }

    addPixelEffect(pixelEffect: PixelEffect) {
        // 这种cardEffect 本质上是一个父元素，将所有的子元素都添加到这个父元素上
        this.then((env: SketchPadOptions) => {
            // 这里是添加元素的逻辑
            if (this.debugMode) {
                console.log("添加像素特效", pixelEffect);
            }

            // 使用canvas的特殊效果提供特效。
            // 首先需要拼合htmlSketch的内容到canvas上
            env.renderer.composeHtmlAndCanvas();

            // 然后将canvas的内容添加到canvasSketch中
            const canvas = env.canvasSketch;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    // 这里是添加像素特效的逻辑
                    pixelEffect.fn(ctx, pixelEffect.args);
                }
            }
        });
    }

    addSketchPad(sp: SketchPad) {
        this.then(async (env: SketchPadOptions) => {
            // 因为实际上无法正常添加，所以说这里将其转化为图片之后直接写入到ctx上
            //debug
            if (this.debugMode) {
                console.log("添加子SketchPad", sp);
            }
            const spEnv = await sp.render();
            await spEnv.renderer.composeHtmlAndCanvas();
            const spCtx = spEnv.renderer.getCtx();
            const ctx = env.renderer.getCtx();
            if (ctx && spCtx) {
                ctx.drawImage(spCtx.canvas, 0, 0);
                //debug
                if (this.debugMode) {
                    console.log("添加子SketchPad完成", spCtx.canvas, ctx.canvas);
                }
            }
        });
    }

    async render(width: number = 800, height: number = 600) {
        // 初始化env
        const div = document.createElement("div");
        div.id = "sketch-pad-app";
        div.style.width = `${width}px`;
        div.style.height = `${height}px`;
        div.style.position = "relative"; // 设置为相对定位
        // 设置边框便于定位
        div.style.border = "1px solid #000"; // 设置边框
        // div.style.top = "0";
        // div.style.left = "0";

        // 将 div 添加到 body 中
        document.body.appendChild(div); // 将 div 添加到 body 中

        // 创建 VUE 组件实例
        const sketchPadApp = createApp(SketchPadRenderer, {
            width: width,
            height: height,
        });
        const sketchPadRenderer = sketchPadApp.mount(div) as InstanceType<typeof SketchPadRenderer>

        const env: SketchPadOptions = {
            width: width,
            height: height,
            renderer: sketchPadRenderer,
            htmlSketch: sketchPadRenderer.htmlSketch,
            canvasSketch: sketchPadRenderer.canvasSketch
        };
        this.env = env;
        this.app = sketchPadApp;
        this.appDiv = div;

        await this.run(env);

        // debug
        console.log("Render完成", env);
        return env;
    }

    clear() {
        super.clear();
        if (this.env) {
            this.env.renderer.clear();
            this.env = null;
        }
        if (this.app) {
            this.app.unmount();
            this.app = null;
        }
        if (this.appDiv) {
            this.appDiv.remove();
            this.appDiv = null;
        }
        return this;
    }
}
