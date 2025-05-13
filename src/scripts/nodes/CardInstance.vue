<template>
  <div class="card-container" ref="cardContainer">
    <!-- HTML 渲染部分 -->
    <div ref="htmlCard" class="card" :style="cardStyle">
      <div v-for="(el, index) in _elements" style="height: 100%;width: 100%;position: absolute;top: 0;left: 0;">
        <DragableElement v-if="el.type === 'image'" :key="index" :class="el.type" :style="el.style" @moved="renderCard">
          <img :src="el.src" :style="el.style" @load="renderCard" />
        </DragableElement>
        <DragableElement v-if="el.type === 'html'" :key="index" v-html="el.content" :class="el.type" :style="el.style"
          @moved="renderCard">
        </DragableElement>
        <DragableElement v-if="el.type === 'text'" :key="index" :class="el.type" :style="el.style" @moved="renderCard">
          {{ el.content }}
        </DragableElement>
      </div>


      <!-- <DragableElement v-for="(el, index) in _elements" :key="index" :class="el.type" :style="el.style"
        @moved="renderCard">
        <img v-if="el.type === 'image'" :src="el.src" :style="el.style" @load="renderCard" />
        <div v-if="el.type === 'html'" v-html="el.content"></div>
        <div v-if="el.type === 'text'">{{ el.content }}</div>
      </DragableElement> -->
    </div>

    <!-- <div ref="htmlCard" class="card" :style="cardStyle" v-for="(el, index) in _elements" :key="index">
      <DragableElement v-if="el.type === 'image'" :class="el.type" :style="el.style" @moved="renderCard">
        <img :src="el.src" :style="el.style" @load="renderCard" />
      </DragableElement>
      <DragableElement v-html="el.content" v-if="el.type === 'html'" :class="el.type" :style="el.style" @moved="renderCard">
      </DragableElement>
      <DragableElement v-if="el.type === 'text'" :class="el.type" :style="el.style" @moved="renderCard">
        {{ el.content }}
      </DragableElement>
    </div> -->

    <!-- Canvas 后处理层 -->
    <canvas ref="canvas" :width="_width" :height="_height"></canvas>
  </div>
  <button @click="exportPNG" class="export-btn">导出PNG</button>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch, nextTick } from 'vue';
import { toPng } from 'html-to-image';
import { applyEffect } from '../afterEffect/imageEffects.ts';
import DragableElement from '../../components/DragableElement.vue';
import { type CardElement, type CardEffect, loadImageFromLink } from '../lib/cardLibs.ts';
import { loadImage } from '../lib/libs.ts';
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
const _elements = ref<CardElement[]>([...props.elements]);
const _effects = ref<CardEffect[]>([...props.effects]);
const _width = ref<number>(props.width);
const _height = ref<number>(props.height);

const cardContainer = ref<HTMLElement | null>(null);
const htmlCard = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);


const cardLink = ref("");

const cardStyle = computed(() => {
  const blur = _effects.value.find(e => e.name === 'blur')?.value || '0';
  return {
    filter: `blur(${blur})`,
    width: `${_width.value}px`,
    height: `${_height.value}px`
  };
});

async function getAllImages() {
  const images = _elements.value.filter(el => el.type === 'image');
  const imagePromises = images.map(async (el) => {
    if (!el.src) {
      const img = await loadImage(el.content);
      el.src = img;
    }
  });
  return Promise.all(imagePromises);
}

let latestRenderId = 0;
async function renderCard() {
  // 等待所有图片加载完成
  await getAllImages();
  const currentRenderId = ++latestRenderId;
  const startTime = Date.now();
  console.log("Rendering card with ID:", currentRenderId, new Error());

  if (!htmlCard.value) {
    throw new Error("htmlCard is not initialized");
  }
  // 调整 htmlCard 的大小
  htmlCard.value.style.width = `${_width.value}px`;
  htmlCard.value.style.height = `${_height.value}px`;

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
  if (currentRenderId < latestRenderId) {
    console.log("Render cancelled, ID mismatch:", currentRenderId, latestRenderId);
    return;
  }
  ctx.clearRect(0, 0, _width.value, _height.value);
  ctx.drawImage(img, 0, 0);

  for (const effect of _effects.value) {
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
    Elements: ${_elements.value.length},
    Effects: ${_effects.value.length},
    `
  )

  emit('rerender', url);

  return cardLink.value;
}

watch(
  () => [_elements.value, _effects.value, _width.value, _height.value],
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

function destroy() {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, _width.value, _height.value);
    }
  }
  URL.revokeObjectURL(cardLink.value);

  // 直接将自己删除
  const parent = cardContainer.value?.parentNode;
  if (parent) {
    parent.removeChild(cardContainer.value as Node);
  } else {
    console.error("Parent node not found for cardContainer");
  }
}

onMounted(async () => {
  await nextTick();
  renderCard().catch(error => {
    console.error("Error during initial render:", error);
  });
});

// 对外暴露的接口
defineExpose({
  exportPNG,
  cardLink,
  getCardLink: () => cardLink.value,
  getCanvas: () => canvas.value,
  elements: _elements,
  setElements: (e: CardElement[]) => {
    _elements.value = e;
  },
  effects: _effects,
  width: _width,
  setWidth: (w: number) => _width.value = w,
  height: _height,
  setHeight: (h: number) => _height.value = h,
  destroy,
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
