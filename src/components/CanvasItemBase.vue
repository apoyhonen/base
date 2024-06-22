<template><div></div></template>

<script setup>
import {inject, defineProps, watch, computed} from 'vue'

const canvas = inject('provider');

const props = defineProps({
  x1: {
    type: Number,
    default: 0,
  },
  y1: {
    type: Number,
    default: 0,
  },
  x2: {
    type: Number,
    default: 0,
  },
  y2: {
    type: Number,
    default: 0,
  },
  value: {
    type: Number,
    default: 0,
  },
  color: {
    type: String,
    default: '#F00',
  },
})

const itemColor = computed(() => props.color);
const itemValue = computed(() => props.value);

const percentWidthToPix = (percent, ctx) => Math.floor((ctx.canvas.width / 100) * percent);
const percentHeightToPix = (percent, ctx) => Math.floor((ctx.canvas.height / 100) * percent);

function calculatedBox() {
  const ctx = canvas.context;

  return {
    x: percentWidthToPix(props.x1, ctx),
    y: percentHeightToPix(props.y1, ctx),
    w: percentWidthToPix(props.x2 - props.x1, ctx),
    h: percentHeightToPix(props.y2 - props.y1, ctx),
  };
}

function render() {
  const ctx = canvas.context;
  if (!ctx) return;

  const newBox = calculatedBox();

  ctx.beginPath();
  ctx.clearRect(newBox.x, percentHeightToPix(0, ctx), newBox.w, percentHeightToPix(100, ctx));

  ctx.rect(newBox.x, newBox.y, newBox.w, newBox.h);
  ctx.fillStyle = itemColor.value;
  ctx.fill();

  ctx.fillStyle = '#000';
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
      Math.floor(itemValue.value),
      newBox.x + newBox.w / 2,
      newBox.y - 14
  );
}

watch(itemColor, render);
watch(itemValue, render, { immediate: true });

</script>