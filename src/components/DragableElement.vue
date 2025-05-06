<template>
    <div class="dragable-element" ref="dragableElement" :style="style">
        <slot>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted,defineEmits } from "vue";

const dragableElement = ref<HTMLElement | null>(null);
const style = ref({
    left: "",
    top: "",
});

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

    const onMouseMove = (event: MouseEvent) => {
        newLeft = event.clientX - offsetX;
        newTop = event.clientY - offsetY;
        style.value.left = `${newLeft}px`;
        style.value.top = `${newTop}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        // Emit the new position when dragging ends
        // 如果坐标发生变化，触发事件
        if (newLeft !== parseInt(oldLeft, 10) || newTop !== parseInt(oldTop, 10)) {
            emit('moved', { left: newLeft, top: newTop });
        }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};


</script>