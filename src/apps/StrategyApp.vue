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
        <h1>Strategy 101</h1>
        <canvas v-bind:id="canvasName" width="400" height="300"></canvas>
      </td>

    </tr>
  </table>
  <div>
  </div>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";

const canvasName = 'strategyCanvas';
let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById(canvasName);
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  zeroX = canvas.width / 2;
  zeroY = canvas.height / 2;

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) {
    prevDrawTimestamp = Date.now();
    draw();
  }
})

function isAppActive() {
  return document.getElementById(canvasName) !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

let prevDrawTimestamp = Date.now();

function draw() {
  frameCount.value++;

  clear();

  const currTimestamp = Date.now();
  // eslint-disable-next-line no-unused-vars
  const differenceMs = currTimestamp - prevDrawTimestamp;
  // TODO use time difference for animation
  prevDrawTimestamp = currTimestamp;

  // TODO add drawings

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

// game

let zeroX = 0;
let zeroY = 0;

console.log(zeroX + ', ' + zeroY);

</script>

<style scoped>
canvas {
  background: lightgray;
}
</style>