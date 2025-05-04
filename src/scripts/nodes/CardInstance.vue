<template>
    <div class="card-container">
      <!-- HTML 渲染部分 -->
      <div ref="htmlCard" class="card" :style="cardStyle">
        <DragableElement 
          v-for="(el, index) in elements" 
          :key="index"
          :class="el.type"
          :style="el.style"
        >
          {{ el.content }}
          <img v-if="el.type === 'image'" :src="el.src">
        </DragableElement>
      </div>
  
      <!-- Canvas 后处理层 -->
      <canvas ref="canvas" :width="width" :height="height"></canvas>
    </div>
    <button @click="exportPNG" class="export-btn">导出PNG</button>
  </template>
  
  <script setup>
  import { ref, onMounted, watchEffect,computed } from 'vue';
  import { toPng } from 'html-to-image';
  import { applyEffects} from '../afterEffect/imageEffects.js';
  import DragableElement from '../../components/DragableElement.vue';
  const props = defineProps({
    elements: {
        type: Array,
        default: () => [],
    },
    effects: {
        type: Array,
        default: () => [],
    }
  });
  
  const htmlCard = ref(null);
  const canvas = ref(null);
  const width = ref(800);
  const height = ref(600);
  
  const cardStyle = computed(() => {
    const blur = props.effects.find(e => e.name === 'blur')?.value || '0';
    return { filter: `blur(${blur})` };
  });
  
  // 导出PNG
  const exportPNG = async () => {
    // 1. 将HTML转为图片
    const htmlPNG = await toPng(htmlCard.value);
    
    // 2. 绘制到Canvas进行后处理
    const ctx = canvas.value.getContext('2d');
    const img = new Image();
    img.src = htmlPNG;
    img.onload = () => {
      ctx.clearRect(0, 0, width.value, height.value);
      ctx.drawImage(img, 0, 0);
      
      // 3. 应用附加特效
      applyEffects(ctx, props.effects);
      
      // 4. 最终导出
      const link = document.createElement('a');
      link.download = 'card.png';
      link.href = canvas.value.toDataURL('image/png');
      link.click();
    };
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
    elements : props.elements,
    effects : props.effects,
  });

  </script>
  
  <style>
  .card-container {
    position: relative;
    width: fit-content;
    height: fit-content;
  }
  .card {
    width: 840px;
    min-height: 640px;
    background: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
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