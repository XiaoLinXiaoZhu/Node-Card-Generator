<script setup>
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
  await fetch("/api/file", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: fileContent.value,
  });
  alert("文件已保存！");
}
</script>

<template>
  <div data-theme="dark" class="file-editor">
    <h1>文件编辑器</h1>
    <button @click="loadFile">加载文件</button>
    <button @click="saveFile">保存文件</button>
    <textarea v-model="fileContent" rows="10" cols="50"></textarea>
    <p>当前文件: {{ fileName }}</p>
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
}

</style>