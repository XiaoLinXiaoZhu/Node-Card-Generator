<template>
    <div class="dragable-element" ref="dragableElement" :style="style">
        <slot>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTemplateRef } from "vue";

const element = useTemplateRef("dragableElement");
const style = ref({
    left: "",
    top: "",
});

onMounted(() => {
    if (!element.value) return;
    element.value.style.position = 'absolute';
    element.value.style.zIndex = '1';
    element.value.style.cursor = 'move';
    element.value.style.userSelect = 'none'; // Prevent text selection during drag

    style.value.left = `${element.value.offsetLeft}px`;
    style.value.top = `${element.value.offsetTop}px`;

    element.value.addEventListener('mousedown', onMouseDown);

    // 禁用默认拖动行为
    element.value.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });
});

const onMouseDown = (event: MouseEvent) => {
    if (!element.value) return;
    const parentRect = (element.value.offsetParent as HTMLElement).getBoundingClientRect();
    const rect = element.value.getBoundingClientRect();
    const offsetX = event.clientX - rect.left + parentRect.left;
    const offsetY = event.clientY - rect.top + parentRect.top;

    const onMouseMove = (event: MouseEvent) => {
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;
        style.value.left = `${newLeft}px`;
        style.value.top = `${newTop}px`;
    };

    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};
</script>