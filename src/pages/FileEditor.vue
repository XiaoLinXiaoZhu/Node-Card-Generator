<script setup lang="ts">
import { ref } from "vue";

const fileContent = ref("");
const fileName = ref("");

// 从后端加载文件
async function loadFile() {
    const res = await fetch("/api/file");
    fileContent.value = await res.text();
    fileName.value = "example.txt"; // 可动态传参
}

// 保存文件到后端
async function saveFile() {
    await fetch("/api/file/" + fileName.value, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: fileContent.value,
    });
    // alert("文件已保存！");
}

// 加载图片/保存图片
async function loadImage() {
    const res = await fetch("/api/image/test.png");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const img = document.getElementById("myimg") as HTMLImageElement;
    img.src = url;
}

async function randomDraw() {
    const canvas = document.getElementById("mycanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 随机绘制一个矩形
    ctx.fillStyle = "red";
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 50, 50);

    // 随机绘制一个圆形
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 25, 0, Math.PI * 2);
    ctx.fill();

    // 随机绘制一条线
    ctx.strokeStyle = "green";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
    ctx.stroke();

    // 随机绘制一段文字
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Hello, World!", Math.random() * canvas.width, Math.random() * canvas.height);

}

async function saveImage() {
    const canvas = document.getElementById("mycanvas") as HTMLCanvasElement;
    const dataURL = canvas.toDataURL("image/png");
    const blob = await fetch(dataURL).then((res) => res.blob());
    if (!blob) return;

    await fetch("/api/image/test.png", {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
    });
    // alert("图片已保存！");
}


</script>

<template>
    <div data-theme="dark" class="file-editor">
        <h1>文件编辑器</h1>
        <div>
            <div class="horizontalButtons">
                <button @click="loadFile">加载文件</button>
                <button @click="saveFile">保存文件</button>
            </div>
            <textarea v-model="fileContent" rows="10" cols="50"></textarea>
            <p>当前文件: {{ fileName }}</p>
        </div>
        <div>
            <div class="horizontalButtons">
                <button @click="loadImage">加载图片</button>
                <button @click="randomDraw">随机绘制</button>
                <button @click="saveImage">保存图片</button>
            </div>
            <canvas id="mycanvas" width="500" height="500"></canvas>
            <img id="myimg" src="" alt="Loaded Image"/>
            <p>当前图片: example.png</p>
        </div>

    </div>
</template>

<style scoped lang="scss">
.file-editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: var(--background-color);
    color: #ffffff;

    >div{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        width: 100%;
        height: fit-content;
        background-color: var(--background-color);
    }

    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    button {
        margin: 0.5rem;
        padding: 0.5rem 1rem;
        // background-color: #61dafb;
        // color: #282c34;
        border: none;
        border-radius: 5px;
        font-size: 1.2rem;
        transition: background-color 0.5s ease;

        &:hover {
            background-color: #21a1f1;
        }
    }

    .horizontalButtons {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    textarea {
        margin-top: 1rem;
        width: 80%;
        height: 50%;
        font-size: 1rem;
        padding: 0.5rem;
        border-radius: 5px;
        border: none;
        background-color: #282c34;
        color: #ffffff;

        &:focus {
            outline: none;
            border-color: #61dafb;
            box-shadow: inset 0px 0px 5px rgba(97, 218, 251, 0.5);
        }
    }

    canvas {
        margin-top: 1rem;
        border: 1px solid #61dafb;
        background-color: #282c34;
    }
}
</style>