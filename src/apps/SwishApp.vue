<template>
  <h2>Swish</h2>
  <canvas id="swishCanvas" width="400" height="300"></canvas>
  <br>
  <div>
    <table>
      <tr>

        <td>
          <p><b>Controls</b></p>
          <br>
          <p>TBA...</p>
          <br><br>
        </td>

        <td>
          <b>Game</b>
          <br><br>
          <p>Angle: {{ targetAngle }}</p>
          <label for="angleAmount">Angle:</label>
          <input id="angleAmount" type="number" class="controls-input" v-model="targetAngle" />
          <br>
        </td>

        <td>
          <b>Animation</b>
          <br><br>
          <p>frame: {{ frameCount }}</p>
          <br>
          <button @click="isRunning = !isRunning">START / STOP</button>
        </td>

      </tr>
    </table>
  </div>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("swishCanvas");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  middlePoint.x = canvas.width / 2;
  middlePoint.y = canvas.height / 2;

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
  return document.getElementById("swishCanvas") !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// game

let middlePoint = { x: 0, y: 0 };
const targetAngle = ref(0);
watch(targetAngle, () => {
  if (targetAngle.value < 0) targetAngle.value = 360 + targetAngle.value;
  if (targetAngle.value > 359) targetAngle.value = 0 + targetAngle.value - 360;
})

</script>

<style scoped>
p {
  margin: 0;
}
canvas {
  background: lightgray;
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
table {
  margin: 0 auto;
}
td {
  padding: 0 20px;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 40px;
}
</style>