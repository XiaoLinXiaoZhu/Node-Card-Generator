<template>
  <div class="card-container">
    <!-- HTML 渲染部分 -->
    <div ref="htmlCard" class="card" :style="cardStyle">
      <DragableElement v-for="(el, index) in elements" :key="index" :class="el.type" :style="el.style" @moved="renderCard">
        {{ typeof console.log("Renderer element",el) || el.content }}
        <img v-if="el.type === 'image'" :src="el.src">
      </DragableElement>
    </div>

    <!-- Canvas 后处理层 -->
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
  <button @click="exportPNG" class="export-btn">导出PNG</button>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch } from 'vue';
import { toPng } from 'html-to-image';
import { applyEffect } from '../afterEffect/imageEffects.ts';
import DragableElement from '../../components/DragableElement.vue';
import { type CardElement, type CardEffect, loadImageFromLink } from './cardLibs.js';

const props = defineProps({
  elements: {
    type: Array as () => CardElement[],
    default: () => [],
  },
  effects: {
    type: Array as () => CardEffect[],
    default: () => [],
  },
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
});

const emit = defineEmits(['rerender']);

// 将 props 初始化到 ref 中
const elements = ref<CardElement[]>([...props.elements]);
const effects = ref<CardEffect[]>([...props.effects]);
const width = ref<number>(props.width);
const height = ref<number>(props.height);

const htmlCard = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

const cardLink = ref("");

const cardStyle = computed(() => {
  const blur = effects.value.find(e => e.name === 'blur')?.value || '0';
  return { 
    filter: `blur(${blur})`,
    width: `${width.value}px`,
    height: `${height.value}px`
  };
});

let latestRenderId = 0;
async function renderCard() {
  const currentRenderId = ++latestRenderId;
  const startTime = Date.now();
  console.log("Rendering card with ID:", currentRenderId);

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
  const ctx = _canvas.getContext('2d', { willReadFrequently: true, alpha: true });
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  const img = await loadImageFromLink(htmlPNG);
  ctx.clearRect(0, 0, width.value, height.value);
  ctx.drawImage(img, 0, 0);

  for (const effect of effects.value) {
    await applyEffect(ctx, effect);
  }

  const blob = await new Promise<Blob>((resolve) => {
    _canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error("Failed to convert canvas to Blob");
      }
    }, 'image/png');
  });

  const url = URL.createObjectURL(blob);
  URL.revokeObjectURL(cardLink.value);
  cardLink.value = url;

  const endTime = Date.now();
  // console.log("Card rendered in:", endTime - startTime, "ms", "ID:", currentRenderId, "Link:", cardLink.value);
  console.log(
    `Card rendered in: ${endTime - startTime} ms, 
    ID: ${currentRenderId}, 
    Link: ${cardLink.value}
    Elements: ${elements.value.length},
    Effects: ${effects.value.length},
    `
  )

  emit('rerender', url);

  return cardLink.value;
}

watch(
  () => [elements.value, effects.value, width.value, height.value],
  async () => {
    try {
      await renderCard();
    } catch (error) {
      console.error("Error re-rendering card:", error);
    }
  },
  { deep: true }
);

async function exportPNG() {
  if (!cardLink.value) {
    try {
      await renderCard();
    } catch (error) {
      console.error("Error rendering card:", error);
      return;
    }
  }

  const link = document.createElement('a');
  link.download = 'card.png';
  link.href = cardLink.value;
  link.click();
}

onMounted(() => {
  renderCard().catch(error => {
    console.error("Error during initial render:", error);
  });
});

// 对外暴露的接口
defineExpose({
  exportPNG,
  cardLink,
  getCardLink: () => cardLink.value,
  elements,
  setElements: (e:CardElement[]) => {
    elements.value = e;
  },
  effects,
  width,
  setWidth: (w: number) => width.value = w,
  height,
  setHeight: (h: number) => height.value = h,
});

</script>

<style scoped lang="scss">
.card-container {
  position: relative;
  width: fit-content;
  height: fit-content;
}

.card {
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
