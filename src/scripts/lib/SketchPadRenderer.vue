<!-- -一个提供绘图支持的组件 -->
<template>
  <div class="sketch-pad" :style="{ width: _width + 'px', height: _height + 'px' }">
    <div ref="htmlSketch" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
    </div>
    <canvas ref="canvasSketch" :width="_width" :height="_height"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, computed, watch, nextTick } from 'vue';
import { toPng } from 'html-to-image';
import { applyEffect } from '../afterEffect/imageEffects.ts';
import DragableElement from '../../components/DragableElement.vue';
import { loadImageFromLink } from './cardLibs.ts';
import { loadImage } from './libs.ts';


const props = defineProps({
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
});

const _width = ref(props.width);
const _height = ref(props.height);

// element ref
const htmlSketch = ref<HTMLElement | null>(null);
const canvasSketch = ref<HTMLCanvasElement | null>(null);

// clear
function clear() {
  if (canvasSketch.value) {
    const ctx = canvasSketch.value.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, _width.value, _height.value);
    }
  }
  if (htmlSketch.value) {
    htmlSketch.value.innerHTML = '';
  }
}

// export img
async function composeHtmlAndCanvas() {
  if (!htmlSketch.value || !canvasSketch.value) {
    console.warn("htmlSketch or canvasSketch is null");
    return;
  }

  const htmlPNG = await toPng(htmlSketch.value);
  const ctx = canvasSketch.value.getContext('2d');
  if (!ctx) {
    console.warn("canvas context is null");
    return;
  }

  // console.log("htmlPNG", htmlPNG);
  // 如果没有图片链接，
  if (!htmlPNG || htmlPNG === 'data:,') {
    console.warn("htmlPNG is null");
  }else{
    // 处理图片
    const img = await loadImageFromLink(htmlPNG);
    ctx.drawImage(img, 0, 0, _width.value, _height.value);
  }

  // clear htmlSketch
  htmlSketch.value.innerHTML = '';
}

async function exportPNG() {
  await composeHtmlAndCanvas();
  if (!canvasSketch.value) {
    console.warn("canvasSketch is null");
    return;
  }

  await nextTick(); // Ensure DOM updates are complete before accessing toDataURL

  const link = document.createElement('a');
  link.download = 'card.png';
  link.href = canvasSketch.value.toDataURL('image/png');
  link.click();
}




defineExpose({
  setWidth(width: number) {
    _width.value = width;
  },
  setHeight(height: number) {
    _height.value = height;
  },
  htmlSketch,
  canvasSketch,
  getCtx() {
    return canvasSketch.value?.getContext('2d');
  },
  composeHtmlAndCanvas,
  clear,
  exportPNG,
});
</script>
