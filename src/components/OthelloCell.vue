<template>
  <td>
    <canvas
        v-bind:id="canvasId"
        class="othello-cell-canvas"
        @click="leftClick"
        oncontextmenu="return false"
    />
  </td>
</template>

<script setup>

import { computed, defineProps, watch, defineEmits, onMounted } from "vue";

const props = defineProps({
  col: Number,
  row: Number,
  value: Number,
  size: Number,
  animationDurationMs: Number,
})

const canvasSize = computed(() => props.size);
watch(canvasSize, () => {
  sizeChanged();
  reDraw();
})

let canvas = null;
let c = null;

// base drawing

let midX = 0;
let midY = 0;
let circleRadius = 1;
const borderWidth = 2;

onMounted(() => {
  canvas = document.getElementById(canvasId.value);
  c = canvas.getContext("2d");

  sizeChanged();
  reDraw();
})

function sizeChanged() {
  if (!canvas) return;

  canvas.width = canvasSize.value;
  canvas.height = canvasSize.value;

  midX = canvas.width / 2;
  midY = canvas.height / 2;
  const calculatedRadius = Math.min(canvas.width / 2, canvas.height / 2) - 5;
  circleRadius = Math.max(calculatedRadius, 1); // at least 1px
}

const canvasId = computed(() => props.col + '-' + props.row + '-canvas');
watch(canvasId, () => {
  canvas = document.getElementById(canvasId.value);
  c = canvas.getContext("2d");

  sizeChanged();
  reDraw();
})

const cellValue = computed(() => props.value);
let prevValue = null;

let animationTimestamp = null;
let animatingPrevValue = null;

watch(cellValue, () => {
  if (cellValue.value > 0) {
    animationTimestamp = Date.now();
    animatingPrevValue = prevValue;
    prevValue = cellValue.value;
  } else {
    prevValue = null; // cell reset
  }

  reDraw();
});

function reDraw() {
  if (!canvas) return;

  clear();

  if (animationTimestamp) {
    const animationRatio = (Date.now() - animationTimestamp) / props.animationDurationMs;

    if (animationRatio >= 0.5 || animatingPrevValue) {
      const valueToAnimate = animationRatio < 0.5 ? animatingPrevValue : cellValue.value;
      let radius;

      if (animationRatio < 0.5) {
        // animate removing old value, if present
        radius = circleRadius * (1 - animationRatio / 0.5);
      } else {
        // animate new value
        radius = circleRadius * ((Math.min(animationRatio, 1) - 0.5) / 0.5);
      }

      // border circle
      c.fillStyle = valueToAnimate === 1 ? 'black' : 'white';
      c.beginPath();
      c.ellipse(midX, midY, radius + borderWidth, circleRadius + borderWidth, 0, 0, 2 * Math.PI);
      c.fill();

      // main piece circle
      c.fillStyle = valueToAnimate === 1 ? 'white' : 'black';
      c.beginPath();
      c.ellipse(midX, midY, radius, circleRadius, 0, 0, 2 * Math.PI);
      c.fill();
    }

    if (animationRatio < 1) {
      requestAnimationFrame(reDraw); // continue animating
    } else {
      animatingPrevValue = cellValue.value;
      animationTimestamp = null;
    }
  } else {
    if (cellValue.value > 0) {
      // border circle
      c.fillStyle = cellValue.value === 1 ? 'black' : 'white';
      c.beginPath();
      c.arc(midX, midY, circleRadius + borderWidth, 0, 2*Math.PI);
      c.fill();

      // main piece circle
      c.fillStyle = cellValue.value === 1 ? 'white' : 'black';
      c.beginPath();
      c.arc(midX, midY, circleRadius, 0, 2*Math.PI);
      c.fill();
    } else if (cellValue.value < 0) {
      // indicate possible move
      c.fillStyle = 'lightgrey';
      c.beginPath();
      c.arc(midX, midY, 5, 0, 2*Math.PI);
      c.fill();
    }
  }
}

function clear() {
  c.clearRect(0, 0, canvasSize.value, canvasSize.value);
}

const emit = defineEmits([ 'leftClick' ]);

function leftClick() {
  emit('leftClick', props.col, props.row);
}

</script>

<style scoped>
td {
  padding: 0;
  line-height:0; /* eliminate td specially reserved line for text */
}
.othello-cell-canvas {
  background-color: forestgreen;
  border: 2px solid black;
}
</style>