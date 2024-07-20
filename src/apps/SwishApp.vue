<template>
  <h2>Swish</h2>
  <canvas id="swishCanvas" width="400" height="300" @auxclick.prevent="canvasClicked" oncontextmenu="return false"></canvas>
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
          <p>Angle (degrees): {{ Math.floor(angleInDegrees) }}</p>
          <label for="angleAmount">Degrees:</label>
          <input id="angleAmount" type="number" class="controls-input" v-model="angleInDegrees" />
          <br>
          <button @click="angleInDegrees -= 45">- 45</button>
          <button @click="angleInDegrees += 45">+ 45</button>
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

import { computed, onMounted, ref, watch } from "vue";
import { angleBetweenPointsDegreesPositive, degreesToRadian, projectedPoint } from "@/util/MathUtil";

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
  drawChar();
  drawLine();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function isAppActive() {
  return document.getElementById("swishCanvas") !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// game

const charColor = 'red';
const lineColor = 'green';

let middlePoint = { x: 0, y: 0 };
const defaultAngle = 270;
const angleInDegrees = ref(defaultAngle);
const angleInRadians = computed(() => degreesToRadian(angleInDegrees.value))
watch(angleInDegrees, () => {
  if (angleInDegrees.value < 0) angleInDegrees.value = 360 + angleInDegrees.value;
  if (angleInDegrees.value > 359) angleInDegrees.value = 0 + angleInDegrees.value - 360;
})

function canvasClicked(e) {
  pointLineToEvent(e.clientX, e.clientY);
}

function pointLineToEvent(clientX, clientY) {
  const eventX = clientX - canvas.offsetLeft;
  const eventY = clientY - canvas.offsetTop;
  angleInDegrees.value = angleBetweenPointsDegreesPositive(middlePoint.x, middlePoint.y, eventX, eventY);
}

// key and mouse handlers

const mouseDown = ref(false);
const mouseDownPos = ref({ x: 0, y: 0 });

document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler() {
  if (!isAppActive()) return;

  // TODO delete later if unnecessary
  //pointLineToEvent(e.clientX, e.clientY);
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mouseDown.value = true;
  mouseDownPos.value.x = e.clientX - canvas.offsetLeft;
  mouseDownPos.value.y = e.clientY - canvas.offsetTop;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  const relativeX = e.clientX - canvas.offsetLeft;
  const deltaX = relativeX - mouseDownPos.value.x;
  const relativeY = e.clientY - canvas.offsetTop;
  const deltaY = relativeY - mouseDownPos.value.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // sideways move
    if (deltaX > 0) {
      // right swing
      angleInDegrees.value += 90;
    } else {
      // left swing
      angleInDegrees.value -= 90;
    }
  } else {
    // upwards move
    if (deltaY < 0) {
      // forwards pierce
    } else {
      // backwards swing
      angleInDegrees.value += 180;
    }
  }

  mouseDown.value = false;
  mouseDownPos.value.x = middlePoint.x;
  mouseDownPos.value.y = middlePoint.y;
}

// character

const charRadius = ref(20);

function drawChar() {
  c.fillStyle = charColor;
  c.beginPath();
  c.arc(middlePoint.x, middlePoint.y, charRadius.value, 0, Math.PI * 2);
  c.fill();
}

// line

const lineLength = ref(100);

function drawLine() {
  let x = middlePoint.x;
  let y = middlePoint.y;

  c.strokeStyle = lineColor;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y);
  const linePoint = projectedPoint(x, y, lineLength.value, angleInRadians.value);
  c.lineTo(linePoint.x, linePoint.y);
  c.stroke();
}

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
.controls-input {
  margin: 1px 10px;
  width: 40px;
}
</style>