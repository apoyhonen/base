<template>
  <td>
    <canvas v-bind:id="canvasId" class="othello-cell-canvas" @click="leftClick" oncontextmenu="return false"></canvas>
  </td>
</template>

<script setup>

import { computed, defineProps, watch, defineEmits, onMounted } from "vue";

const props = defineProps({
  col: Number,
  row: Number,
  value: Number,
  size: Number,
})

const canvasSize = computed(() => props.size);
watch(canvasSize, () => {
  sizeChanged();
  reDraw();
})

let canvas = null;
let c = null;

let midX = 0;
let midY = 0;
let circleRadius = 1;

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
  circleRadius = Math.min(canvas.width / 2, canvas.height / 2) - 3;
}

const canvasId = computed(() => props.col + '-' + props.row + '-canvas');
watch(canvasId, () => {
  canvas = document.getElementById(canvasId.value);
  c = canvas.getContext("2d");

  sizeChanged();
  reDraw();
})

const cellValue = computed(() => props.value);
watch(cellValue, () => reDraw());

function reDraw() {
  if (!canvas) return;

  clear();

  if (cellValue.value > 0) {
    c.fillStyle = cellValue.value === 1 ? 'white' : 'black';
    c.strokeStyle = cellValue.value === 1 ? 'black' : 'white';

    c.beginPath();
    c.arc(midX, midY, Math.max(circleRadius, 1), 0, 2*Math.PI, false);
    c.fill();
    c.stroke();
  }
}

function clear() {
  c.clearRect(0, 0, canvasSize.value, canvasSize.value);
}

const emit = defineEmits([ 'leftClick' ]);

function leftClick() {
  if (cellValue.value <= 0) { // only transmit clicks on open cells
    emit('leftClick', props.col, props.row);
  }
}

</script>

<style scoped>
.othello-cell-canvas {
  background-color: darkgreen;
  border: 2px solid forestgreen;
  width: 50px;
  height: 50px;
}
</style>