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
        <p>Balls left: {{ balls.length - 1 }}</p>
        <br><br>
        <button class="controls-button" @click="resetGame">RESET</button>
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
import {
  angleBetweenPointsRadian,
  distanceBetweenPoints,
  isCircleCollision, isRectCircleCollision,
  projectPoint,
  randomBetween
} from "@/util/MathUtil";
import { getCanvasMouseEventOffsetPos } from "@/util/LayoutUtil";
import { randomColor } from "@/util/ColorUtil";
import { clearArray, removeItem } from "@/util/ArrayUtil";

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
  tableStartX = canvas.width / 2 - tableWidth.value / 2;
  tableStartY = canvas.height / 2 - tableHeight.value / 2;

  createRails();
  createPockets();

  cueBallCoords.x = canvas.width / 2;
  cueBallCoords.y = canvas.height / 2;
  ballSpeedPerSec.value = tableWidth.value / 3;

  createBalls();

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
  moveBalls(differenceMs);
  prevDrawTimestamp = currTimestamp;

  drawTable();
  drawBalls();
  if (cueBall && !isAnyBallMoving()) drawCueStick();

  checkCollisions(differenceMs);

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

// game

const tableColor = 'seagreen';
const tableRailColor = 'brown';
const tablePocketColor = 'black';
const cueBallColor = 'white';
const cueStickHandleColor = 'brown';
const cueStickMainColor = 'burlywood';

function resetGame() {
  clearArray(balls.value);

  cueBallCoords.x = canvas.width / 2;
  cueBallCoords.y = canvas.height / 2;
  createBalls();
}

function checkCollisions(differenceMs) {
  const ballsToRemove = [];
  balls.value.forEach(ball => {
    if (isPocketsCollision(ball.x, ball.y, ballRadius.value)) {
      ballsToRemove.push(ball);
      ball.isMoving = false;

      if (ball.value === 0) {
        cueBall = null;

        cueBallCoords.x = canvas.width / 2;
        cueBallCoords.y = canvas.height / 2;
      }
    }

    if (isRailsCollision(ball.x, ball.y, ballRadius.value)) {
      if (!isRailsCollision(ball.x - 5, ball.y, ballRadius.value) || !isRailsCollision(ball.x + 5, ball.y, ballRadius.value)) {
        ball.speedPerSecX *= -1;
        ball.x += ball.speedPerSecX / 1000 * differenceMs * 2;
      } else if (!isRailsCollision(ball.x, ball.y - 5, ballRadius.value) || !isRailsCollision(ball.x, ball.y + 5, ballRadius.value)) {
        ball.speedPerSecY *= -1;
        ball.y += ball.speedPerSecY / 1000 * differenceMs * 2;
      }
    }

    // TODO if collides with other balls

    if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) ballsToRemove.push(ball);
  })

  ballsToRemove.forEach(ball => removeBall(ball));
}

// table

const tableWidth = ref(100);
const tableHeight = ref(100);
const tableBorderWidth = ref(10);
const tablePocketRadius = ref(5);
let tableStartX = 0;
let tableStartY = 0;

const tableRails = [];
const tablePockets = [];

function drawTable() {
  c.fillStyle = tableColor;
  c.fillRect(tableStartX, tableStartY, tableWidth.value, tableHeight.value);

  drawTableRails();
  drawTablePockets();
}

function createRails() {
  tableRails.push({ x: tableStartX, y: tableStartY, width: tableWidth.value, height: tableBorderWidth.value })
  tableRails.push({ x: tableStartX, y: tableStartY, width: tableBorderWidth.value, height: tableHeight.value })
  tableRails.push({ x: tableStartX, y: tableStartY + tableHeight.value - tableBorderWidth.value, width: tableWidth.value, height: tableBorderWidth.value })
  tableRails.push({ x: tableStartX + tableWidth.value - tableBorderWidth.value, y: tableStartY, width: tableBorderWidth.value, height: tableHeight.value })
}

function isRailsCollision(x, y, radius) {
  let isCollision = false;
  tableRails.forEach(rail => {
    if (isRailCollision(rail, x, y, radius)) isCollision = true;
  })
  return isCollision;
}

function isRailCollision(rail, x, y, radius) {
  return isRectCircleCollision(rail.x, rail.y, rail.width, rail.height, x, y, radius);
}

function drawTableRails() {
  c.fillStyle = tableRailColor;

  c.fillRect(tableStartX, tableStartY, tableWidth.value, tableBorderWidth.value);
  c.fillRect(tableStartX, tableStartY, tableBorderWidth.value, tableHeight.value);
  c.fillRect(tableStartX, tableStartY + tableHeight.value - tableBorderWidth.value, tableWidth.value, tableBorderWidth.value);
  c.fillRect(tableStartX + tableWidth.value - tableBorderWidth.value, tableStartY, tableBorderWidth.value, tableHeight.value);
}

function createPockets() {
  tablePockets.push({ x: tableStartX + tableBorderWidth.value, y: tableStartY + tableBorderWidth.value })
  tablePockets.push({ x: tableStartX + tableBorderWidth.value, y: tableStartY + tableHeight.value - tableBorderWidth.value })
  tablePockets.push({ x: tableStartX + tableWidth.value / 2, y: tableStartY + tableBorderWidth.value })
  tablePockets.push({ x: tableStartX + tableWidth.value / 2, y: tableStartY + tableHeight.value - tableBorderWidth.value })
  tablePockets.push({ x: tableStartX + tableWidth.value - tableBorderWidth.value, y: tableStartY + tableBorderWidth.value })
  tablePockets.push({ x: tableStartX + tableWidth.value - tableBorderWidth.value, y: tableStartY + tableHeight.value - tableBorderWidth.value })
}

function isPocketsCollision(x, y, radius) {
  let isCollision = false;
  tablePockets.forEach(pocket => {
    if (distanceBetweenPoints(x, y, pocket.x, pocket.y) <= radius + tablePocketRadius.value) isCollision = true;
  })
  return isCollision;
}

function drawTablePockets() {
  c.fillStyle = tablePocketColor;

  tablePockets.forEach(pocket => {
    c.beginPath();
    c.arc(pocket.x, pocket.y, tablePocketRadius.value, 0, 2*Math.PI);
    c.fill();
  })
}

// balls (cue-ball & numbers 1-9)

const ballRadius = computed(() => tablePocketRadius.value * 0.7);
const ballSpeedPerSec = ref(10);
const cueBallCoords = { x: 0, y: 0 };

let cueBall = null;
const balls = ref([]);

function createBalls() {
  createCueBall();

  const radius = ballRadius.value;

  for (let i = 1; i < 10; i++) {
    let randomX = randomBetween(tableStartX, tableStartX + tableWidth.value);
    let randomY = randomBetween(tableStartY, tableStartY + tableHeight.value);
    while (
        isRailsCollision(randomX, randomY, radius)
        || isBallsCollision(randomX, randomY, radius)
        || isPocketsCollision(randomX, randomY, radius)
        || isCloseToMid(randomX, randomY, radius)
        ) {
      // randomize new coords
      randomX = randomBetween(tableStartX, tableStartX + tableWidth.value);
      randomY = randomBetween(tableStartY, tableStartY + tableHeight.value);
    }
    balls.value.push({ x: randomX, y: randomY, value: i, color: randomColor(),
      isMoving: false, speedPerSecX: randomBallSpeed(), speedPerSecY: randomBallSpeed() })
  }
}

function createCueBall() {
  cueBall = { x: cueBallCoords.x, y: cueBallCoords.y, value: 0, color: cueBallColor,
    isMoving: false, speedPerSecX: randomBallSpeed(), speedPerSecY: randomBallSpeed() };
  balls.value.push(cueBall);
}

function randomBallSpeed() {
  return randomBetween(ballSpeedPerSec.value * 0.5, ballSpeedPerSec.value) * randomNegPos();
}

function randomNegPos() {
  return (randomBetween(0, 1) - 0.5 <= 0) ? -1 : 1;
}

function isBallsCollision(x, y, radius) {
  let isCollision = false;
  balls.value.forEach(ball => {
    if (isCircleCollision(x, y, radius, ball.x, ball.y)) isCollision = true;
  })
  return isCollision;
}

function isCloseToMid(x, y, radius) {
  return isCircleCollision(x, y, radius, cueBallCoords.x, cueBallCoords.y, radius * 9);
}

function moveBalls(differenceMs) {
  balls.value.forEach(ball => {
    if (ball.isMoving) {
      const moveDeltaX = ball.speedPerSecX / 1000 * differenceMs;
      ball.x += moveDeltaX;
      const moveDeltaY = ball.speedPerSecY / 1000 * differenceMs;
      ball.y += moveDeltaY;
    }
  })

  if (!isAnyBallMoving() && !cueBall) {
    createCueBall();
  }
}

function isAnyBallMoving() {
  let anyBallMoving = false;
  balls.value.forEach(ball => {
    if (ball.isMoving) anyBallMoving = true;
  })
  return anyBallMoving;
}

function removeBall(ball) {
  removeItem(balls.value, ball);
}

function drawBalls() {
  c.strokeStyle = 'white';
  c.lineWidth = 1;
  balls.value.forEach(ball => {
    c.fillStyle = ball.color;

    c.beginPath();
    c.arc(ball.x, ball.y, ballRadius.value, 0, 2*Math.PI);
    c.fill();
    c.stroke();

    c.fillStyle = 'white';
    c.font = '' + ballRadius.value * 1.5 + 'px Arial'; // emoji size with font
    c.fillText(ball.value, ball.x - ballRadius.value / 2 + 1, ball.y + ballRadius.value / 2);
  })
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
    const mousePressToBallDistance = distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePressedPos.x, mousePressedPos.y);
    const distance = Math.max(0, Math.min(
        cueStickMaxDrawingDistance.value,
        distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePos.value.x, mousePos.value.y) - mousePressToBallDistance));
    cueCenteringPos = projectPoint(cueBallCoords.x, cueBallCoords.y, distance, cueAngleRadian.value);
  } else {
    cueCenteringPos = cueBallCoords;
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
  cueAngleRadian.value = angleBetweenPointsRadian(cueBallCoords.x, cueBallCoords.y, mousePos.value.x, mousePos.value.y);
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mousePressed.value = true;
  mousePressedPos = mousePos.value;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  if (cueBall && !isAnyBallMoving() && mousePressedPos
      && distanceBetweenPoints(mousePressedPos.x, mousePressedPos.y, mousePos.value.x, mousePos.value.y) > 3) {
    // launch cue-ball
    cueBall.isMoving = true;
    balls.value.forEach(ball => ball.isMoving = true);
  }

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

.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 60px;
}
</style>