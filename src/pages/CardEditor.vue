<template>
    <div data-theme="dark" class="card-editor" id="main" style='width:100%; height:100%'>
        <h1>卡片编辑器</h1>
        <!-- <canvas class="editor" id='mycanvas' width='1024' height='720' style='border: 1px solid'></canvas> -->
        <CardInstance :elements="elements" :effects="effects" ref="cardInstance" @rerender="handleRerender">        </CardInstance>

        <img :src="cardLink" alt="Card Image" ref="cardImage" />
    </div>
</template>

<script setup lang="ts">
import CardInstance from '../scripts/nodes/CardInstance.vue';
import { ref, onMounted, watchEffect, computed, watch, useTemplateRef } from 'vue';
import type { CardElement } from '../scripts/nodes/cardLibs';
import { addCardElementToCard } from '../scripts/nodes/cardLibs';

const elements = ref<CardElement[]>([
    { uid: '123', content: "123", type: 'text', style: { color: 'red', fontSize: '20px' } },
    { uid: '456', content: "456", type: 'image', src: 'https://pica.zhimg.com/v2-c9448217a66ff6f04bd2d56ac89a1de2_r.jpg', style: { width: '100px', height: '100px' } },
]);

const effects = ref([
    { name: 'blur', value: '0px' },
    { name: 'hue', value: '120' }
]);

const cardLink = ref("");

const handleRerender = (link: string) => {
    cardLink.value = link;
    console.log("Card Link updated:", cardLink.value);
};

const cardInstance = ref<InstanceType<typeof CardInstance> | null>(null);
// const cardInstance = useTemplateRef('cardInstance');

function addEl(){
    const element1:CardElement = {
        uid: '845',
        content: "4562",
        type: 'text',
        style: { color: 'red', fontSize: '50px' }
    }
    if (!cardInstance.value) {
        console.error("cardInstance is null");
        return;
    }
    addCardElementToCard(cardInstance.value, element1)
    //debug
    console.log("addEl", cardInstance.value, element1)
}

onMounted(()=>{
    //debug
    console.log("CardInstance", cardInstance.value,typeof cardInstance.value, cardInstance.value?.$el)
    addEl()
})

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