<template>
    <div
        class="dragable-element"
        ref="dragableElement"
        :style="style"
        :class="{ dragging: isDragging }"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineEmits } from "vue";

const dragableElement = ref<HTMLElement | null>(null);
const style = ref({
    left: "",
    top: "",
});
const isDragging = ref(false); // 用于标记是否正在拖拽

// 位置发生变化时，激活事件 moved
const emit = defineEmits(['moved']);

onMounted(() => {
    if (!dragableElement.value) return;
    dragableElement.value.style.position = 'absolute';
    dragableElement.value.style.zIndex = '1';
    dragableElement.value.style.cursor = 'move';
    dragableElement.value.style.userSelect = 'none'; // Prevent text selection during drag

    style.value.left = `${dragableElement.value.offsetLeft}px`;
    style.value.top = `${dragableElement.value.offsetTop}px`;

    dragableElement.value.addEventListener('mousedown', onMouseDown);

    // 禁用默认拖动行为
    dragableElement.value.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });
});

const onMouseDown = (event: MouseEvent) => {
    if (!dragableElement.value) return;
    const parentRect = (dragableElement.value.offsetParent as HTMLElement).getBoundingClientRect();
    const rect = dragableElement.value.getBoundingClientRect();
    const offsetX = event.clientX - rect.left + parentRect.left;
    const offsetY = event.clientY - rect.top + parentRect.top;

    // 记录初始位置
    const oldLeft = style.value.left;
    const oldTop = style.value.top;
    let newLeft = parseInt(oldLeft, 10);
    let newTop = parseInt(oldTop, 10);

    isDragging.value = true; // 开始拖拽时设置为 true

    const onMouseMove = (event: MouseEvent) => {
        newLeft = event.clientX - offsetX;
        newTop = event.clientY - offsetY;
        style.value.left = `${newLeft}px`;
        style.value.top = `${newTop}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        isDragging.value = false; // 停止拖拽时设置为 false
        // Emit the new position when dragging ends
        if (newLeft !== parseInt(oldLeft, 10) || newTop !== parseInt(oldTop, 10)) {
            emit('moved', { left: newLeft, top: newTop });
        }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};
</script>

<style scoped>
.dragable-element {
    transition: border 0.2s ease;
}

.dragable-element.dragging {
    border: 2px solid red; /* 拖拽时增加红色边框 */
    /* 设置大小参考忽略边框 */
    box-sizing: border-box;
}
</style>