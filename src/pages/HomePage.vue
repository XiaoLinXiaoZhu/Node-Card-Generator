<template>
    <div class="home-page" data-theme="dark">
        <h1>欢迎来到 Node Editor</h1>
        <p>这是一个基于 Vue 3 和 TypeScript 的 LiteGraph.js 编辑器，用于快速组织节点以绘制卡面。</p>
        <p>请点击下面的按钮开始编辑：</p>
        <router-link to="/node-editor" class="start-button">开始编辑</router-link>
        <router-link to="/file-editor" class="start-button">文件编辑器</router-link>
        <router-link to="/card-editor" class="start-button">卡片编辑器</router-link>
    </div>
</template>

<style scoped lang="scss">
// @import '@/assets/styles/global.scss';

.home-page {
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

    p {
        font-size: 1.2rem;
        margin-bottom: 1rem;
    }

    .start-button {
        padding: 0.5rem 1rem;
        background-color: var(--primary-color);
        color: var(--text-color);
        text-decoration: none;
        border-radius: 5px;
        font-size: 1.2rem;
        transition: background-color 0.2s ease;

        &:hover {
            background-color: var(--primary-color-hover);
        }
    }
}
</style>