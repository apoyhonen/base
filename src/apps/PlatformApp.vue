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
        <label for="groundLevelPercent">Ground level (%):</label>
        <input id="groundLevelPercent" type="number" class="controls-input" v-model="groundLevelPercent" />
        <br>
        <label for="cloudSizePercent">Clouds size (%):</label>
        <input id="cloudSizePercent" type="number" class="controls-input" v-model="cloudSizePercent" />
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

import { computed, onMounted, ref, watch } from "vue";
import { randomBetween } from "@/util/MathUtil";

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

  groundLevelPercent.value = groundLevelPercentDefault;
  cloudHigherY.value = canvas.height * 0.1;
  cloudLowerY.value = canvas.height * 0.2;
  createClouds();

  charWidth.value = canvas.width / 30;
  charHeight.value = charWidth.value * 3;
  charBottomY.value = groundLevelY.value;

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function isAppActive() {
  return document.getElementById(canvasName) !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
  frameCount.value++;

  clear();

  drawGround();
  drawClouds();
  drawChar();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

// game


// char

const charColor = 'seagreen';

const charWidth = ref(100);
const charHeight = ref(400);
const charStartX = computed(() => canvas.width / 2 - charWidth.value / 2);
const charBottomY = ref(100);

function drawChar() {
  c.fillStyle = charColor;
  c.strokeStyle = charColor;
  c.lineWidth = charWidth.value / 4;

  c.beginPath();
  c.rect(charStartX.value, groundLevelY.value - charHeight.value, charWidth.value, charHeight.value * 0.75);
  c.fill();

  c.beginPath();
  c.moveTo(charStartX.value + charWidth.value / 8, groundLevelY.value - charHeight.value * 0.25);
  c.lineTo(charStartX.value + charWidth.value / 8, groundLevelY.value);
  c.moveTo(charStartX.value + charWidth.value - charWidth.value / 8, groundLevelY.value - charHeight.value * 0.25);
  c.lineTo(charStartX.value + charWidth.value - charWidth.value / 8, groundLevelY.value);
  c.stroke();
}


// environment

const groundLevelColor = 'sandybrown';
const groundColor = 'saddlebrown'

const groundLevelPercentDefault = 10;
const groundLevelPercent = ref(9);
watch(groundLevelPercent, () => groundLevelY.value = canvas.height / 100 * (100 - groundLevelPercent.value));
const groundLevelY = ref(100);
watch(groundLevelY, () => charBottomY.value = groundLevelY.value);

function drawGround() {
  c.fillStyle = groundLevelColor;
  c.strokeStyle = groundColor;
  c.lineWidth = 3;

  c.beginPath();
  c.rect(0, groundLevelY.value + 3, canvas.width, canvas.height - groundLevelY.value - 3);
  c.fill();

  c.beginPath();
  c.moveTo(0, groundLevelY.value + 2);
  c.lineTo(canvas.width, groundLevelY.value + 2);
  c.stroke();
}

const clouds = [];
const cloudSizePercentDefault = 60;
const cloudSizePercent = ref(cloudSizePercentDefault);
const cloudHigherY = ref(20);
const cloudLowerY = ref(40);

function createClouds() {
  clouds.push({ x: randomBetween(0, canvas.width), y: cloudHigherY.value });
  clouds.push({ x: randomBetween(0, canvas.width), y: cloudLowerY.value });
}

function drawClouds() {
  c.strokeStyle = '#797874';
  c.stroke();
  c.fillStyle = 'white';

  const cloudSizeFactor = 1 / 100 * cloudSizePercent.value;

  let x = 0;
  let y = 0;
  clouds.forEach(cloud => {
    x = cloud.x;
    y = cloud.y;

    c.beginPath();
    c.arc(x, y, 60 * cloudSizeFactor, Math.PI * 0.5, Math.PI * 1.5);
    c.arc(x + 70 * cloudSizeFactor, y - 60 * cloudSizeFactor, 70 * cloudSizeFactor, Math.PI, Math.PI * 1.85);
    c.arc(x + 152 * cloudSizeFactor, y - 45 * cloudSizeFactor, 50 * cloudSizeFactor, Math.PI * 1.37, Math.PI * 1.91);
    c.arc(x + 200 * cloudSizeFactor, y, 60 * cloudSizeFactor, Math.PI * 1.5, Math.PI * 0.5);
    c.moveTo(x + 200 * cloudSizeFactor, y + 60 * cloudSizeFactor);
    c.lineTo(x, y + 60 * cloudSizeFactor);
    c.fill()
  })
}

</script>

<style scoped>
canvas {
  background: skyblue;
  color: saddlebrown;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 60px;
}
</style>