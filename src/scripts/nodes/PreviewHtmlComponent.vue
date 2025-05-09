<template>
  <div class="preview-container" :style="containerStyle">
    <div ref="htmlPreview" class="preview-content" v-html="processedHtml"></div>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
  </div>
  <button @click="exportPNG" class="export-btn">导出PNG</button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { toPng } from 'html-to-image';
import { loadImage } from './libs';

const props = defineProps({
  htmlContent: {
    type: String,
    default: '',
  },
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
  style: {
    type: Object,
    default: () => ({}),
  }
});

const emit = defineEmits(['rerender']);

// 使用 ref 管理内部状态
const internalHtmlContent = ref(props.htmlContent);
const internalWidth = ref(props.width);
const internalHeight = ref(props.height);
const internalStyle = ref({...props.style});

// 监听 props 变化
watch(() => props.htmlContent, (newValue) => {
  internalHtmlContent.value = newValue;
});

watch(() => props.width, (newValue) => {
  internalWidth.value = newValue;
});

watch(() => props.height, (newValue) => {
  internalHeight.value = newValue;
});

watch(() => props.style, (newValue) => {
  internalStyle.value = {...newValue};
}, { deep: true });

const containerStyle = computed(() => ({
  width: `${internalWidth.value}px`,
  height: `${internalHeight.value}px`,
  ...internalStyle.value
}));

// 处理 HTML 内容，添加图片错误处理
const processedHtml = computed(() => {
  if (!internalHtmlContent.value) return '';
  
  // 创建一个临时的 div 元素来解析 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = internalHtmlContent.value;
  
  // 为所有图片添加错误处理和加载逻辑
  const images = tempDiv.getElementsByTagName('img');
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    // 保存原始 alt 文本
    const originalAlt = img.alt || '';
    
    // 处理图片路径
    const src = img.src;
    if (src && !src.startsWith('data:') && !src.startsWith('http')) {
      // 如果是相对路径，使用 loadImage 加载
      const imgPath = src.replace(/^\.\//, ''); // 移除开头的 ./
      loadImage(imgPath).then(url => {
        img.src = url;
      }).catch(error => {
        console.error('Failed to load image:', error);
        // 当图片加载失败时，替换为文本
        const textNode = document.createTextNode(originalAlt || '[图片]');
        img.parentNode?.replaceChild(textNode, img);
      });
    }
    
    // 添加错误处理
    img.onerror = function() {
      // 当图片加载失败时，替换为文本
      const textNode = document.createTextNode(originalAlt || '[图片]');
      img.parentNode?.replaceChild(textNode, img);
    };
  }
  
  return tempDiv.innerHTML;
});

// 监听 HTML 内容变化
watch(() => internalHtmlContent.value, (newContent) => {
  if (newContent) {
    // 等待 DOM 更新后处理图片
    setTimeout(async () => {
      const images = document.querySelectorAll('.preview-content img');
      images.forEach(async img => {
        const imgElement = img as HTMLImageElement;
        if (!imgElement.complete) {
          const src = imgElement.src;
          if (src && !src.startsWith('data:') && !src.startsWith('http')) {
            try {
              // 如果是相对路径，使用 loadImage 加载
              const imgPath = src.replace(/^\.\//, ''); // 移除开头的 ./
              const url = await loadImage(imgPath);
              imgElement.src = url;
            } catch (error) {
              console.error('Failed to load image:', error);
              // 当图片加载失败时，替换为文本
              const textNode = document.createTextNode(imgElement.alt || '[图片]');
              img.parentNode?.replaceChild(textNode, img);
            }
          }
        }
      });
    }, 0);
  }
});

const htmlPreview = ref<HTMLElement | null>(null);
const canvas = ref<HTMLCanvasElement | null>(null);

const htmlPngLink = ref("");
const htmlPngCanvas = ref<HTMLCanvasElement | null>(null);

const previewStyle = computed(() => {
  return { 
    width: `${internalWidth.value}px`,
    height: `${internalHeight.value}px`,
    ...internalStyle.value
  };
});

let latestRenderId = 0;
async function renderPreview() {
  const currentRenderId = ++latestRenderId;
  const startTime = Date.now();
  console.log("Rendering preview with ID:", currentRenderId);

  // 等待 DOM 更新
  await nextTick();

  if (!htmlPreview.value) {
    console.warn("htmlPreview is not initialized, waiting for next tick...");
    await nextTick();
    if (!htmlPreview.value) {
      throw new Error("htmlPreview is not initialized after waiting");
    }
  }

  const htmlPNG = await toPng(htmlPreview.value as HTMLElement);

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
  ctx.clearRect(0, 0, internalWidth.value, internalHeight.value);
  ctx.drawImage(img, 0, 0);

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
  URL.revokeObjectURL(htmlPngLink.value);
  htmlPngLink.value = url;
  htmlPngCanvas.value = _canvas;

  const endTime = Date.now();
  console.log(
    `Preview rendered in: ${endTime - startTime} ms, 
    ID: ${currentRenderId}, 
    Link: ${htmlPngLink.value}
    `
  );

  emit('rerender', url);

  return htmlPngLink.value;
}

async function exportPNG() {
  if (!htmlPngLink.value) {
    try {
      await renderPreview();
    } catch (error) {
      console.error("Error rendering preview:", error);
      return;
    }
  }

  const link = document.createElement('a');
  link.download = 'preview.png';
  link.href = htmlPngLink.value;
  link.click();
}

// 加载图片
function loadImageFromLink(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
  });
}

watch(
  () => [internalHtmlContent.value, internalWidth.value, internalHeight.value, internalStyle.value],
  async () => {
    try {
      await renderPreview();
    } catch (error) {
      console.error("Error re-rendering preview:", error);
    }
  },
  { deep: true }
);

onMounted(async () => {
  // 等待 DOM 更新
  await nextTick();
  
  // 确保 canvas 已创建
  if (!canvas.value) {
    canvas.value = document.createElement('canvas');
    canvas.value.width = internalWidth.value;
    canvas.value.height = internalHeight.value;
  }

  try {
    await renderPreview();
  } catch (error) {
    console.error("Error during initial render:", error);
  }
});

// 监听尺寸变化，更新 canvas 尺寸
watch([internalWidth, internalHeight], ([newWidth, newHeight]) => {
  if (canvas.value) {
    canvas.value.width = newWidth;
    canvas.value.height = newHeight;
  }
});

// 对外暴露的接口
defineExpose({
  exportPNG,
  htmlPngLink,
  htmlPngCanvas,
  getHtmlPngLink: () => htmlPngLink.value,
  getCanvas: () => canvas.value,
  htmlContent: internalHtmlContent,
  setHtmlContent: (content: string) => {
    internalHtmlContent.value = content;
  },
  width: internalWidth,
  setWidth: (w: number) => {
    internalWidth.value = w;
  },
  height: internalHeight,
  setHeight: (h: number) => {
    internalHeight.value = h;
  },
  style: internalStyle,
  setStyle: (s: Record<string, any>) => {
    internalStyle.value = s;
  }
});
</script>

<style scoped lang="scss">
.preview-container {
  position: relative;
  overflow: hidden;
  background: white;
}

.preview-content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.preview-content :deep(img) {
  vertical-align: middle;
  margin: 0 2px;
}

.preview-content :deep(.emphasis-3) {
  background-color: #1a237e;
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
}

.preview-content :deep(.special-4) {
  font-weight: bold;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.preview-content :deep(.special-icon-4) {
  width: 16px;
  height: 16px;
}

.export-btn {
  margin-top: 20px;
  padding: 10px 20px;
  background: #2196F3;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;

  &:hover {
    background: #1976D2;
  }
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0;
}
</style> 