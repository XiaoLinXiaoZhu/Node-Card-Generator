<template>
  <div class="card-container">
    <!-- HTML 渲染部分 -->
    <div ref="htmlCard" class="card" :style="cardStyle">
      <DragableElement v-for="(el, index) in elements" :key="index" :class="el.type" :style="el.style" @moved="renderCard">
        {{ el.content }}
        <img v-if="el.type === 'image'" :src="el.src">
      </DragableElement>
    </div>

    <!-- Canvas 后处理层 -->
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
  <button @click="exportPNG" class="export-btn">导出PNG</button>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed,watch } from 'vue';
import { toPng } from 'html-to-image';
import { applyEffect } from '../afterEffect/imageEffects.ts';
import DragableElement from '../../components/DragableElement.vue';
import { type CardElement, type CardEffect } from './cardLibs.js';


const props = defineProps({
  elements: {
    type: Array as () => CardElement[],
    default: () => [],
  },
  effects: {
    type: Array as () => CardEffect[],
    default: () => [],
  }
});

// 自动绑定的 templateRef
const htmlCard = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

const width = ref(800);
const height = ref(600);

const cardLink = ref("");

const cardStyle = computed(() => {
  const blur = props.effects.find(e => e.name === 'blur')?.value || '0';
  return { filter: `blur(${blur})` };
});

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

let latestRenderId = 0;
async function renderCard() {
  const currentRenderId = ++latestRenderId;
  //debug
  console.log("Rendering card with ID:", currentRenderId);

  // 1. 将HTML转为图片
  if (!htmlCard.value) {
    throw new Error("htmlCard is not initialized");
  }
  const htmlPNG = await toPng(htmlCard.value as HTMLElement);

  if (!htmlPNG) {
    throw new Error("Failed to convert HTML to PNG");
  }

  if (!canvas.value) {
    throw new Error("Canvas is not initialized");
  }

  const _canvas = canvas.value as HTMLCanvasElement;
  if (!_canvas) {
    throw new Error("Canvas is not initialized");
  }
  // 2. 绘制到Canvas进行后处理
  if (currentRenderId !== latestRenderId) return; // 如果有新的渲染请求，则跳过当前渲染
  const ctx = _canvas.getContext('2d',{willReadFrequently: true, alpha: true});
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  if (currentRenderId !== latestRenderId) return;
  const img = await loadImage(htmlPNG); // 等待图片加载完成
  if (currentRenderId !== latestRenderId) return;
  ctx.clearRect(0, 0, width.value, height.value);
  if (currentRenderId !== latestRenderId) return;
  ctx.drawImage(img, 0, 0);

  // 3. 应用附加特效
  if (currentRenderId !== latestRenderId) return;
  // applyEffects(ctx, props.effects);
  for (const effect of props.effects) {
    if (currentRenderId !== latestRenderId) return;
    await applyEffect(ctx, effect);
  }
  if (currentRenderId !== latestRenderId) return;

  // 4. 最终导出
  cardLink.value = _canvas.toDataURL('image/png');

  return cardLink.value;
};

// 当 props.elements 或 props.effects 变化时，重新渲染。
// 这里需要深度监听，因为可能会有嵌套对象的变化
watch(
  () => [props.elements, props.effects],
  async () => {
    try {
      await renderCard();
    } catch (error) {
      console.error("Error re-rendering card:", error);
    }
  },
  { deep: true }
);

// 导出PNG
async function exportPNG(){
  if (!cardLink.value) {
    try {
      await renderCard();
    } catch (error) {
      console.error("Error rendering card:", error);
      return;
    }
  }

  if (!cardLink.value) {
    console.error("Failed to generate card link");
    return;
  }

  const link = document.createElement('a');
  link.download = 'card.png';
  link.href = cardLink.value;
  link.click();
};

// 初始化Canvas尺寸
onMounted(() => {
  watchEffect(() => {
    if (htmlCard.value) {
      width.value = htmlCard.value.offsetWidth;
      height.value = htmlCard.value.offsetHeight;
    }
  });
});

//对外的方法
defineExpose({
  exportPNG,
  cardLink,
  elements: props.elements,
  effects: props.effects,
});

</script>

<style scoped lang="scss">
.card-container {
  position: relative;
  width: fit-content;
  height: fit-content;
}

.card {
  width: 840px;
  min-height: 640px;
  background: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
}

.export-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  cursor: pointer;
}
</style>