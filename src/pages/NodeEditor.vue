<template>
    <div id="main" style='width:100%; height:100%' data-theme="dark">
        <!-- <canvas class="editor" id='mycanvas' width='1024' height='720' style='border: 1px solid'></canvas> -->
    </div>

    <!-- <div class="litegraph litegraph-editor">
        <div class='header'>
            <div class='tools tools-left'></div>
            <div class='tools tools-right'></div>
        </div>
        <div class='content'>
            <div class='editor-area'>
                <canvas class='graphcanvas' width='1000' height='500' tabindex=10>

                </canvas>
            </div>
        </div>
        <div class='footer'>
            <div class='tools tools-left'></div>
            <div class='tools tools-right'></div>
        </div>
    </div> -->
</template>

<script lang="ts" setup>
// import { LGraph, LGraphCanvas, LiteGraph } from 'litegraph.js';
import { onMounted, useTemplateRef } from 'vue';

import "litegraph.js/css/litegraph.css";
import "../assets/styles/litegraph-editor.css";
import initLG from '../scripts/initLiteGraph';
initLG();
import extendLG from '../scripts/LGExtend';
import Editor from '../scripts/LGEditor';


onMounted(() => {
    // var graph = new LGraph();

    // var canvas = new LGraphCanvas(".editor", graph);
    // canvas.ds.scale = 1; // Set default scale to prevent incorrect scaling
    // canvas.resize(); // Ensure canvas resizes correctly
    const editor = new Editor('main', {});
    const graph = editor.graph;
    const graphcanvas = editor.graphcanvas;


    extendLG(graphcanvas);
    
    //debug
    console.log(graphcanvas);

    // var node_const = LiteGraph.createNode("basic/const");
    // node_const.addOutput("value", "number");
    // node_const.properties.value = 4.5;
    // graph.add(node_const);
    // ///@ts-ignore
    // node_const.setValue(4.5);

    // var node_watch = LiteGraph.createNode("basic/watch");
    // node_watch.pos = [700, 200];
    // graph.add(node_watch);

    // node_const.connect(0, node_watch, 0);

    graph.start()
});

// 窗口大小改变时，重新设置canvas的大小
window.addEventListener('resize', () => {
    const canvas = document.getElementById('mycanvas') as HTMLCanvasElement;
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

</script>

<style scoped lang="scss">
.editor {
    width: 100%;
    height: 100vh;
    position: relative;
}
</style>