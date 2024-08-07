<template>
  <table>
    <tr>

      <td>
        <p><b>Controls</b></p>
        <br>
        <p>TBA...</p>
        <br><br>

        <b>Game</b>
        <br><br>
        <p>TBA...</p>
        <br><br>

        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <br>
        <button @click="isRunning = !isRunning">START / STOP</button>
      </td>

      <td>
        <h1>Platforms</h1>
        <canvas v-bind:id="canvasName" width="400" height="300"></canvas>
      </td>

    </tr>
  </table>
  <div>
  </div>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";

const canvasName = 'platformCanvas';
let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById(canvasName);
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  groundLevelY.value = canvas.height * 0.9;

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function draw() {
  frameCount.value++;

  clear();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function isAppActive() {
  return document.getElementById(canvasName) !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// game

const groundLevelY = ref(100);

</script>

<style scoped>
canvas {
  background: skyblue;
}
</style>