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
        <h1>Pool</h1>
        <canvas v-bind:id="canvasName" width="400" height="300"></canvas>
      </td>

    </tr>
  </table>
  <br>
  <p>Mouse position: x: {{ mousePos.x }}, y: {{ mousePos.y }}</p>
  <p v-if="mousePressed" style="color: red; font-size: 30px;">Mouse pressed!</p>
  <div>
  </div>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { angleBetweenPointsRadian, distanceBetweenPoints, projectPoint } from "@/util/MathUtil";
import { getCanvasMouseEventOffsetPos } from "@/util/LayoutUtil";

const canvasName = 'poolCanvas';
let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById(canvasName);
  canvas.width = (window.innerWidth - 200) * 0.7;
  canvas.height = window.innerHeight * 0.7;
  c = canvas.getContext("2d");

  tableWidth.value = canvas.width / 2;
  tableHeight.value = tableWidth.value / 2;
  tableBorderWidth.value = tableWidth.value / 30;
  tablePocketRadius.value = tableBorderWidth.value * 0.75;

  ballCoords.x = canvas.width / 2;
  ballCoords.y = canvas.height / 2;

  cueStickLength.value = tableWidth.value * 0.8;
  cueStickWidth.value = cueStickLength.value * 0.02;
  cueStickMaxDrawingDistance.value = cueStickLength.value * 0.3;

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
  drawTable();
  drawBalls();
  drawCueStick();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

// game

const tableColor = 'seagreen';
const tableBorderColor = 'brown';
const tablePocketColor = 'black';
const cueBallColor = 'white';
const cueStickHandleColor = 'brown';
const cueStickMainColor = 'burlywood';

// table

const tableWidth = ref(100);
const tableHeight = ref(100);
const tableBorderWidth = ref(10);
const tablePocketRadius = ref(5);

function drawTable() {

  const tableStartX = canvas.width / 2 - tableWidth.value / 2;
  const tableStartY = canvas.height / 2 - tableHeight.value / 2;

  // table
  c.fillStyle = tableColor;
  c.fillRect(tableStartX, tableStartY, tableWidth.value, tableHeight.value);

  drawTableBorders(tableStartX, tableStartY);
  drawTablePockets(tableStartX, tableStartY);
}

function drawTableBorders(tableStartX, tableStartY) {
  c.fillStyle = tableBorderColor;

  c.fillRect(tableStartX, tableStartY, tableWidth.value, tableBorderWidth.value);
  c.fillRect(tableStartX, tableStartY, tableBorderWidth.value, tableHeight.value);
  c.fillRect(tableStartX, tableStartY + tableHeight.value - tableBorderWidth.value, tableWidth.value, tableBorderWidth.value);
  c.fillRect(tableStartX + tableWidth.value - tableBorderWidth.value, tableStartY, tableBorderWidth.value, tableHeight.value);
}

function drawTablePockets(tableStartX, tableStartY) {
  c.fillStyle = tablePocketColor;

  c.beginPath();
  c.arc(tableStartX + tableBorderWidth.value, tableStartY + tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + tableWidth.value - tableBorderWidth.value, tableStartY + tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + tableWidth.value / 2, tableStartY + tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + tableWidth.value / 2, tableStartY + tableHeight.value - tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + tableBorderWidth.value, tableStartY + tableHeight.value - tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + tableWidth.value - tableBorderWidth.value, tableStartY + tableHeight.value - tableBorderWidth.value, tablePocketRadius.value, 0, 2*Math.PI);
  c.fill();
}

// balls (cue-ball & numbers)

const ballRadius = computed(() => tablePocketRadius.value * 0.7);
const ballCoords = { x: 0, y: 0 };

function drawBalls() {

  // cue-ball
  c.fillStyle = cueBallColor;

  c.beginPath();
  c.arc(ballCoords.x, ballCoords.y, ballRadius.value, 0, 2*Math.PI);
  c.fill();

  // numbered balls
  // TODO implement
}

// cue-stick

const cueStickLength = ref(70);
const cueStickWidth = ref(5);
const cueAngleRadian = ref(0);
const cueStickMaxDrawingDistance = ref(20);

function drawCueStick() {
  c.lineCap = 'round';
  c.lineWidth = cueStickWidth.value;

  let cueCenteringPos;
  if (mousePressedPos) {
    const mousePressToBallDistance = distanceBetweenPoints(ballCoords.x, ballCoords.y, mousePressedPos.x, mousePressedPos.y);
    const distance = Math.max(0, Math.min(
        cueStickMaxDrawingDistance.value,
        distanceBetweenPoints(ballCoords.x, ballCoords.y, mousePos.value.x, mousePos.value.y) - mousePressToBallDistance));
    cueCenteringPos = projectPoint(ballCoords.x, ballCoords.y, distance, cueAngleRadian.value);
  } else {
    cueCenteringPos = ballCoords;
  }

  c.strokeStyle = cueStickMainColor;
  let lineStartPoint = projectPoint(cueCenteringPos.x, cueCenteringPos.y, ballRadius.value * 2, cueAngleRadian.value);
  let lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength.value * 0.7, cueAngleRadian.value);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();

  c.strokeStyle = cueStickHandleColor;
  lineStartPoint = lineEndPoint;
  lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength.value * 0.3, cueAngleRadian.value);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();
}

// mouse handlers

const mousePos = ref({ x: 0, y: 0 })
let mousePressed = ref(false);
let mousePressedPos = null;

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  mousePos.value = getCanvasMouseEventOffsetPos(e, canvas, true);
  cueAngleRadian.value = angleBetweenPointsRadian(ballCoords.x, ballCoords.y, mousePos.value.x, mousePos.value.y);
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mousePressed.value = true;
  mousePressedPos = mousePos.value;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mousePressed.value = false;
  mousePressedPos = null;
}

</script>

<style scoped>
canvas {
  background: lavender;
}

/* disable text selection, causes trouble with mouse controls */
p,
table,
table *,
table * * {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
</style>