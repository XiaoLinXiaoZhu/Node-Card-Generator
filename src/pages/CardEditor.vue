<template>
    <div data-theme="dark" class="card-editor" id="main" style='width:100%; height:100%'>
        <h1>卡片编辑器</h1>
        <!-- <canvas class="editor" id='mycanvas' width='1024' height='720' style='border: 1px solid'></canvas> -->
        <CardInstance :elements="elements" :effects="effects" ref="cardInstance">
        </CardInstance>
    </div>
</template>

<script setup lang="ts">
import CardInstance from '../scripts/nodes/CardInstance.vue';
import { ref, onMounted, watchEffect, computed } from 'vue';
const elements = ref([
    { type: 'image', src: 'https://pica.zhimg.com/v2-c9448217a66ff6f04bd2d56ac89a1de2_r.jpg', style: { width: '100px', height: '100px' } },
    { type: 'text', content: 'Hello World', style: { color: 'red', fontSize: '20px' } },
]);
const effects = ref([
    { name: 'blur', value: '0px' },
    { name: 'hue', value: '120' }
]);



</script>

<style scoped lang="scss">
.card-editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background-color: var(--background-color);
    color: var(--text-color);


    h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
}
</style>