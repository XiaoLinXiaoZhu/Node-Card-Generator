import { LGraph, LGraphCanvas } from "litegraph.js"

// 假设这些常量和类已经在别处定义
enum LGraphStatus {
    STATUS_STOPPED = 0,
    STATUS_RUNNING = 1
}

interface EditorOptions {
    skip_livemode?: boolean;
    skip_maximize?: boolean;
    miniwindow?: boolean;
}

class Editor {
    // DOM 元素引用
    root!: HTMLElement;
    tools!: HTMLElement;
    content!: HTMLElement;
    footer!: HTMLElement;
    canvas!: HTMLCanvasElement;

    // Graph 引用
    graph!: LGraph;
    graphcanvas!: LGraphCanvas;
    miniwindow_graphcanvas?: LGraphCanvas;
    graphcanvas2?: LGraphCanvas;

    // 其他属性
    assetsRootPath = ""; // 假设这是图片的根路径


    constructor(private containerId: string, private options: EditorOptions = {}) {
        this.init();
    }

    private init() {
        const html = `
            <div class='header'>
                <div class='tools tools-left'></div>
                <div class='tools tools-right'></div>
            </div>
            <div class='content'>
                <div class='editor-area'>
                    <canvas class='graphcanvas' width='1000' height='500' tabindex=10></canvas>
                </div>
            </div>
            <div class='footer'>
                <div class='tools tools-left'></div>
                <div class='tools tools-right'></div>
            </div>`;

        const root = document.createElement("div");
        root.className = "litegraph litegraph-editor";
        root.innerHTML = html;

        this.root = root;

        this.tools = root.querySelector(".tools")!;
        this.content = root.querySelector(".content")!;
        this.footer = root.querySelector(".footer")!;

        const canvas = root.querySelector(".graphcanvas") as HTMLCanvasElement;
        this.canvas = canvas;

        // 创建 graph 和 graphcanvas
        this.graph = new LGraph();
        this.graphcanvas = new LGraphCanvas(canvas, this.graph);
        // this.graphcanvas.background_image = "imgs/grid.png";
        this.graphcanvas.background_image = this.assetsRootPath + "imgs/grid.png";

        this.graph.onAfterExecute = () => {
            this.graphcanvas.draw(true);
        };

        this.graphcanvas.onDropItem = this.onDropItem.bind(this);

        // 添加控件按钮
        this.addLoadCounter();

        this.addToolsButton(
            "playnode_button",
            "Play",
            "imgs/icon-play.png",
            this.onPlayButton.bind(this),
            ".tools-right"
        );

        this.addToolsButton(
            "playstepnode_button",
            "Step",
            "imgs/icon-playstep.png",
            this.onPlayStepButton.bind(this),
            ".tools-right"
        );

        if (!this.options.skip_livemode) {
            this.addToolsButton(
                "livemode_button",
                "Live",
                "imgs/icon-record.png",
                this.onLiveButton.bind(this),
                ".tools-right"
            );
        }

        if (!this.options.skip_maximize) {
            this.addToolsButton(
                "maximize_button",
                "",
                "imgs/icon-maximize.png",
                this.onFullscreenButton.bind(this),
                ".tools-right"
            );
        }

        if (this.options.miniwindow) {
            this.addMiniWindow(300, 200);
        }

        // 插入到容器中
        const parent = document.getElementById(this.containerId);
        if (parent) {
            parent.appendChild(root);
        }

        this.graphcanvas.resize();
    }

    addLoadCounter() {
        const meter = document.createElement("div");
        meter.className = "headerpanel loadmeter toolbar-widget";

        let html =
            "<div class='cpuload'><strong>CPU</strong> <div class='bgload'><div class='fgload'></div></div></div>";
        html +=
            "<div class='gpuload'><strong>GFX</strong> <div class='bgload'><div class='fgload'></div></div></div>";

        meter.innerHTML = html;

        const toolsLeft = this.root.querySelector(".header .tools-left");
        if (toolsLeft) {
            toolsLeft.appendChild(meter);
        }

        setInterval(() => {
            const cpuBar = meter.querySelector(".cpuload .fgload") as HTMLElement;
            const gpuBar = meter.querySelector(".gpuload .fgload") as HTMLElement;

            if (cpuBar) {
                cpuBar.style.width = 2 * this.graph.execution_time * 90 + "px";
            }

            if (gpuBar) {
                if (this.graph.status === LGraphStatus.STATUS_RUNNING) {
                    gpuBar.style.width = this.graphcanvas.render_time * 10 * 90 + "px";
                } else {
                    gpuBar.style.width = "4px";
                }
            }
        }, 200);
    }

    addToolsButton(id: string, name: string, iconUrl: string, callback: () => void, containerSelector = ".tools") {
        const button = this.createButton(name, iconUrl, callback);
        button.id = id;

        const container = this.root.querySelector(containerSelector);
        if (container) {
            container.appendChild(button);
        }
    }

    createButton(name: string, iconUrl: string, callback: () => void): HTMLButtonElement {
        const button = document.createElement("button");
        if (iconUrl) {
            button.innerHTML = `<img src="${this.assetsRootPath + iconUrl}" /> `;
        }
        button.classList.add("btn");
        button.innerHTML += name;
        if (callback) {
            button.addEventListener("click", callback);
        }
        return button;
    }

    onLoadButton() {
        const panel = this.graphcanvas.createPanel?.("Load session", { closable: true });
        if (panel && this.root) {
            this.root.appendChild(panel);
        }
    }

    onSaveButton() {
        // TO DO
    }

    onPlayButton() {
        const graph = this.graph;
        const button = this.root.querySelector("#playnode_button") as HTMLButtonElement;

        if (graph.status === LGraph.STATUS_STOPPED) {
            button.innerHTML = "<img src='imgs/icon-stop.png'/> Stop";
            graph.start();
        } else {
            button.innerHTML = "<img src='imgs/icon-play.png'/> Play";
            graph.stop();
        }
    }

    onPlayStepButton() {
        this.graph.runStep(1);
        this.graphcanvas.draw(true, true);
    }

    onLiveButton() {
        const isLiveMode = !this.graphcanvas.live_mode;
        this.graphcanvas.switchLiveMode(true);
        this.graphcanvas.draw();

        const url = this.graphcanvas.live_mode ? "imgs/gauss_bg_medium.jpg" : "imgs/gauss_bg.jpg";
        const button = this.root.querySelector("#livemode_button");

        if (button) {
            button.innerHTML = isLiveMode
                ? "<img src='imgs/icon-gear.png'/> Edit"
                : "<img src='imgs/icon-record.png'/> Live";
        }
    }

    onDropItem(e: DragEvent) {
        for (let i = 0; e.dataTransfer && i < e.dataTransfer.files.length; ++i) {
            const file = e.dataTransfer.files[i];
            const ext = LGraphCanvas.getFileExtension(file.name);
            const reader = new FileReader();

            if (ext === "json") {
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target!.result as string);
                        this.graph.configure(data);
                    } catch (err) {
                        console.error("Failed to parse JSON file:", err);
                    }
                };
                reader.readAsText(file);
            }
        }
    }

    goFullscreen() {
        const elem = this.root;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
            (elem as any).mozRequestFullScreen();
        } else if ((elem as any).webkitRequestFullscreen) {
            (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).msRequestFullscreen) {
            (elem as any).msRequestFullscreen();
        } else {
            console.error("Fullscreen not supported");
            return;
        }

        setTimeout(() => {
            this.graphcanvas.resize();
        }, 100);
    }

    onFullscreenButton() {
        this.goFullscreen();
    }

    addMiniWindow(w: number, h: number) {
        const miniwindow = document.createElement("div");
        miniwindow.className = "litegraph miniwindow";
        miniwindow.innerHTML = `<canvas class='graphcanvas' width='${w}' height='${h}' tabindex=10></canvas>`;
        const canvas = miniwindow.querySelector("canvas") as HTMLCanvasElement;

        const graphcanvas = new (window as any).LGraphCanvas(canvas, this.graph);
        graphcanvas.show_info = false;
        graphcanvas.background_image = "imgs/grid.png";
        graphcanvas.scale = 0.25;
        graphcanvas.allow_dragnodes = false;
        graphcanvas.allow_interaction = false;
        graphcanvas.render_shadows = false;
        graphcanvas.max_zoom = 0.25;
        this.miniwindow_graphcanvas = graphcanvas;

        graphcanvas.onClear = () => {
            graphcanvas.scale = 0.25;
            graphcanvas.allow_dragnodes = false;
            graphcanvas.allow_interaction = false;
        };

        graphcanvas.onRenderBackground = (canvas, ctx) => {
            ctx.strokeStyle = "#567";
            const tl = this.graphcanvas.convertOffsetToCanvas([0, 0]);
            const br = this.graphcanvas.convertOffsetToCanvas([
                this.graphcanvas.canvas.width,
                this.graphcanvas.canvas.height
            ]);
            const convertedTl = graphcanvas.convertCanvasToOffset(tl);
            const convertedBr = graphcanvas.convertCanvasToOffset(br);

            ctx.lineWidth = 1;
            ctx.strokeRect(
                Math.floor(convertedTl[0]) + 0.5,
                Math.floor(convertedTl[1]) + 0.5,
                Math.floor(convertedBr[0] - convertedTl[0]),
                Math.floor(convertedBr[1] - convertedTl[1])
            );
        };

        miniwindow.style.position = "absolute";
        miniwindow.style.top = "4px";
        miniwindow.style.right = "4px";

        const close_button = document.createElement("div");
        close_button.className = "corner-button";
        close_button.innerHTML = "&#10060;";
        close_button.addEventListener("click", () => {
            graphcanvas.setGraph(null);
            miniwindow.parentNode?.removeChild(miniwindow);
        });

        miniwindow.appendChild(close_button);
        this.root.querySelector(".content")?.appendChild(miniwindow);
    }

    addMultiview() {
        const canvas = this.canvas;
        this.graphcanvas.ctx.fillStyle = "black";
        this.graphcanvas.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.graphcanvas.viewport = [0, 0, canvas.width * 0.5 - 2, canvas.height];

        const graphcanvas = new (window as any).LGraphCanvas(canvas, this.graph);
        graphcanvas.background_image = "imgs/grid.png";
        this.graphcanvas2 = graphcanvas;
        graphcanvas.viewport = [canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height];
    }
}

// 将 Editor 注册为 LiteGraph 的静态属性（兼容原有写法）
// (window as any).LiteGraph = (window as any).LiteGraph || {};
// (window as any).LiteGraph.Editor = Editor;

export default Editor;