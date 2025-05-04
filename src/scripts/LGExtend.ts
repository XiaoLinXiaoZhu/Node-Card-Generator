import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";

function updateEditorHiPPICanvas(editor: LGraphCanvas) {
    const ratio = window.devicePixelRatio;
    if (ratio == 1) { return }

    const parentElement = editor?.canvas?.parentNode as HTMLElement;
    if (!parentElement) { return; }
    const rect = parentElement.getBoundingClientRect();
    const { width, height } = rect;
    editor.canvas.width = width * ratio;
    editor.canvas.height = height * ratio;

    editor.canvas.style.width = width + "px";
    editor.canvas.style.height = height + "px";

    const context = editor.canvas.getContext("2d");
    if (context) {
        context.scale(ratio, ratio);
    }

    editor.resize();
    return editor.canvas;
}

function addResizeEventListener(editor: LGraphCanvas) {
    // var canvas = editor.canvas;
    // var graph = editor.graph;

    window.addEventListener("resize", function () {
        updateEditorHiPPICanvas(editor);
    });
}

function enableBackup(canvas: LGraphCanvas) {
    window.onbeforeunload = function () {
        var data = JSON.stringify(graph.serialize());
        localStorage.setItem("litegraphg demo backup", data);
    }
    
    var graph = canvas.graph;
    if (!graph) {
        console.error("graph not found");
        return;
    }

    var data = localStorage.getItem("litegraphg demo backup");
    if (!data)  return;
    var graph_data = JSON.parse(data);
    graph.configure(graph_data);

    
}


function loadGLFromUrl(canvas: LGraphCanvas, url: string|undefined, callback: Function) {
    var graph = canvas.graph;
    if (url) {
        graph.load(url);
    }
    else if (callback) {
        callback();
    }
    else {
        graph.clear();
    }
}

interface GLBackup {
    name: string;
    data: string;
}

const g_GLBackup: GLBackup = {
    name:"graphdemo_save",
    
    get data() : string {
        return localStorage.getItem(this.name) || "{}";
    },
    set data(data: string) {
        localStorage.setItem(this.name, data);
    }, 
}


function saveBackUpGL(canvas: LGraphCanvas, data:GLBackup) {
    var graph = canvas.graph;
    data.data = JSON.stringify(graph.serialize());
    console.log("saved");
}

function loadBackUpGL(canvas: LGraphCanvas, data:GLBackup) {
    var _data = data.data;
    if (_data) {
        var graph_data = JSON.parse(_data);
        canvas.graph.configure(graph_data);
    }
    console.log("loaded");
}

function downloadBackUpGL(canvas: LGraphCanvas, data:GLBackup) {
    var _data = data.data;
    if (_data) {
        var file = new Blob([_data]);
        var url = URL.createObjectURL(file);
        var element = document.createElement("a");
        element.setAttribute('href', url);
        element.setAttribute('download', "graph.JSON");
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000 * 60); //wait one minute to revoke url	
    }
}


function extendLG(LGEditorCanvas: LGraphCanvas) {
    var canvas = LGEditorCanvas;
    var graph = canvas.graph;
    const editor = canvas;
    const parentElement = editor?.canvas?.parentNode as HTMLElement;

    updateEditorHiPPICanvas(canvas);
    addResizeEventListener(canvas);


    //window.addEventListener("keydown", editor.graphcanvas.processKey.bind(editor.graphcanvas) );
    enableBackup(canvas);

    //create scene selector
    var elem = document.createElement("span");
    elem.id = "LGEditorTopBarSelector";
    elem.className = "selector";
    elem.innerHTML = "";
    elem.innerHTML += "Demo <select><option>Empty</option></select> <button class='btn' id='save'>Save</button><button class='btn' id='load'>Load</button><button class='btn' id='download'>Download</button> | <button class='btn' id='webgl'>WebGL</button> <button class='btn' id='multiview'>Multiview</button>";
    parentElement.appendChild(elem);
    var select = elem.querySelector("select");
    // select.addEventListener("change", function (e) {
    //     var option = this.options[this.selectedIndex];
    //     var url = option.dataset["url"];

    //     loadGLFromUrl(canvas, url, (option as any).callback || null);
    // });

    // elem.querySelector("#save").addEventListener("click", function () {
    //     saveBackUpGL(canvas, g_GLBackup);
    // });

    // elem.querySelector("#load").addEventListener("click", function () {
    //     loadBackUpGL(canvas, g_GLBackup);
    // });

    // elem.querySelector("#download").addEventListener("click", function () {
    //     saveBackUpGL(canvas, g_GLBackup);
    //     downloadBackUpGL(canvas, g_GLBackup);
    // });

    // elem.querySelector("#webgl")?.addEventListener("click", enableWebGL);
    // elem.querySelector("#multiview")?.addEventListener("click", function () { editor.addMultiview() });


    // function addDemo(name, url) {
    //     var option = document.createElement("option");
    //     if (url.constructor === String)
    //         option.dataset["url"] = url;
    //     else
    //         option.callback = url;
    //     option.innerHTML = name;
    //     select.appendChild(option);
    // }

    //some examples
    // addDemo("Features", "examples/features.json");
    // addDemo("Benchmark", "examples/benchmark.json");
    // addDemo("Subgraph", "examples/subgraph.json");
    // addDemo("Audio", "examples/audio.json");
    // addDemo("Audio Delay", "examples/audio_delay.json");
    // addDemo("Audio Reverb", "examples/audio_reverb.json");
    // addDemo("MIDI Generation", "examples/midi_generation.json");
    // addDemo("Copy Paste", "examples/copypaste.json");
    // addDemo("autobackup", function () {
    //     var data = localStorage.getItem("litegraphg demo backup");
    //     if (!data)
    //         return;
    //     var graph_data = JSON.parse(data);
    //     graph.configure(graph_data);
    // });
}


export default extendLG;