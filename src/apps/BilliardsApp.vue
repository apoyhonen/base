<template>
  <table>
    <tr>

      <td>
        <p><b>Controls</b></p>
        <br>
        <p>Click, drag and release cue stick to launch ball.</p>
        <p>Longer drag results in sharper hit.</p>
        <br><br>

        <b>Game</b>
        <br><br>
        <p>Balls left: 0</p>
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

import { onMounted, ref, watch } from "vue";
import {
  angleBetweenPointsRadian, circleCollisionTwoMoving,
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

  tableWidth = canvas.width / 2;
  tableHeight = tableWidth / 2;
  tableBorderSize = tableWidth / 30;
  tablePocketRadius = tableBorderSize * 0.75;
  tableStartX = canvas.width / 2 - tableWidth / 2;
  tableStartY = canvas.height / 2 - tableHeight / 2;

  createRails();
  createPockets();

  cueBallCoords.x = canvas.width / 2;
  cueBallCoords.y = canvas.height / 2;
  ballRadius = tablePocketRadius * 0.7;
  ballSpeedPerSec = tableWidth / 2.5;
  ballDampeningPerSec = tableWidth / 1500;

  createBalls();

  cueStickLength = tableWidth * 0.8;
  cueStickWidth = cueStickLength * 0.02;
  cueStickMaxDrawingDistance = cueStickLength * 0.3;

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
  drawHintLine();

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
  clearArray(balls);

  cueBallCoords.x = canvas.width / 2;
  cueBallCoords.y = canvas.height / 2;
  createBalls();
}

function checkCollisions(differenceMs) {
  const ballsToRemove = [];
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    if (isPocketsCollision(ball.x, ball.y, ballRadius)) {
      ballsToRemove.push(ball);
      ball.isMoving = false;

      if (ball.value === 0) {
        cueBall = null;

        cueBallCoords.x = canvas.width / 2;
        cueBallCoords.y = canvas.height / 2;
      }
    }

    if (isRailsCollision(ball.x, ball.y, ballRadius)) {
      if (!isRailsCollision(ball.x - 5, ball.y, ballRadius) || !isRailsCollision(ball.x + 5, ball.y, ballRadius)) {
        ball.speedPerSecX *= -1;
        ball.x += ball.speedPerSecX / 1000 * differenceMs * 2;
      } else if (!isRailsCollision(ball.x, ball.y - 5, ballRadius) || !isRailsCollision(ball.x, ball.y + 5, ballRadius)) {
        ball.speedPerSecY *= -1;
        ball.y += ball.speedPerSecY / 1000 * differenceMs * 2;
      }
    }

    const ballCollidedWith = getAnyBallCollidedWith(ball.x, ball.y, ballRadius, ball.ballId);
    if (ballCollidedWith) {
      if (!ball.isColliding) { // if not already colliding
        if (ballCollidedWith.isMoving && ball.isMoving) {
          const collisionInfo = circleCollisionTwoMoving(ball.speedPerSecX, ball.speedPerSecY, ballCollidedWith.speedPerSecX, ballCollidedWith.speedPerSecY);

          ball.speedPerSecX = collisionInfo.firstDx;
          ball.speedPerSecX = collisionInfo.firstDy;

          ballCollidedWith.speedPerSecX = collisionInfo.secondDx;
          ballCollidedWith.speedPerSecX = collisionInfo.secondDy;

        } else if (ballCollidedWith.isMoving || ball.isMoving) {
          // TODO Two-dimensional collision with one moving and one stationary object
          //const movingBall = ball.isMoving ? ball : ballCollidedWith;
          //const stationaryBall = ball.isMoving ? ballCollidedWith : ball;

          const collisionInfo = circleCollisionTwoMoving(ball.speedPerSecX, ball.speedPerSecY, ballCollidedWith.speedPerSecX, ballCollidedWith.speedPerSecY);

          ball.speedPerSecX = collisionInfo.firstDx;
          ball.speedPerSecX = collisionInfo.firstDy;

          ballCollidedWith.speedPerSecX = collisionInfo.secondDx;
          ballCollidedWith.speedPerSecX = collisionInfo.secondDy;

        } else {
          console.log("Something went wrong: non-moving balls collision " + ball + " " + ballCollidedWith);
        }
      }
    } else if (ball.isColliding) {
      ball.isColliding = false; // not colliding anymore
    }

    if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) ballsToRemove.push(ball);
  }

  for (let i = 0; i < ballsToRemove.length; i++) {
    const ball = ballsToRemove[i];
    removeBall(ball);
  }
}

// table

let tableWidth = 100;
let tableHeight = 100;
let tableBorderSize = 10;
let tablePocketRadius = 5;
let tableStartX = 0;
let tableStartY = 0;

const tableRails = [];
const tablePockets = [];

function drawTable() {
  c.fillStyle = tableColor;
  c.fillRect(tableStartX, tableStartY, tableWidth, tableHeight);

  drawTableRails();
  drawTablePockets();
}

function createRails() {
  tableRails.push({ x: tableStartX, y: tableStartY, width: tableWidth, height: tableBorderSize })
  tableRails.push({ x: tableStartX, y: tableStartY, width: tableBorderSize, height: tableHeight })
  tableRails.push({ x: tableStartX, y: tableStartY + tableHeight - tableBorderSize, width: tableWidth, height: tableBorderSize })
  tableRails.push({ x: tableStartX + tableWidth - tableBorderSize, y: tableStartY, width: tableBorderSize, height: tableHeight })
}

function isRailsCollision(x, y, radius) {
  let isCollision = false;
  for (let i = 0; i < tableRails.length; i++) {
    const rail = tableRails[i];
    if (isRailCollision(rail, x, y, radius)) isCollision = true;
  }
  return isCollision;
}

function isRailCollision(rail, x, y, radius) {
  return isRectCircleCollision(rail.x, rail.y, rail.width, rail.height, x, y, radius);
}

function drawTableRails() {
  c.fillStyle = tableRailColor;

  c.fillRect(tableStartX, tableStartY, tableWidth, tableBorderSize);
  c.fillRect(tableStartX, tableStartY, tableBorderSize, tableHeight);
  c.fillRect(tableStartX, tableStartY + tableHeight - tableBorderSize, tableWidth, tableBorderSize);
  c.fillRect(tableStartX + tableWidth - tableBorderSize, tableStartY, tableBorderSize, tableHeight);
}

function createPockets() {
  tablePockets.push({ x: tableStartX + tableBorderSize, y: tableStartY + tableBorderSize })
  tablePockets.push({ x: tableStartX + tableBorderSize, y: tableStartY + tableHeight - tableBorderSize })
  tablePockets.push({ x: tableStartX + tableWidth / 2, y: tableStartY + tableBorderSize })
  tablePockets.push({ x: tableStartX + tableWidth / 2, y: tableStartY + tableHeight - tableBorderSize })
  tablePockets.push({ x: tableStartX + tableWidth - tableBorderSize, y: tableStartY + tableBorderSize })
  tablePockets.push({ x: tableStartX + tableWidth - tableBorderSize, y: tableStartY + tableHeight - tableBorderSize })
}

function isPocketsCollision(x, y, radius) {
  let isCollision = false;
  for (let i = 0; i < tablePockets.length; i++) {
    const pocket = tablePockets[i];
    if (distanceBetweenPoints(x, y, pocket.x, pocket.y) <= radius + tablePocketRadius) isCollision = true;
  }
  return isCollision;
}

function drawTablePockets() {
  c.fillStyle = tablePocketColor;

  for (let i = 0; i < tablePockets.length; i++) {
    const pocket = tablePockets[i];
    c.beginPath();
    c.arc(pocket.x, pocket.y, tablePocketRadius, 0, 2*Math.PI);
    c.fill();
  }
}

// balls (cue-ball & numbers 1-9)

let ballRadius = 7;
let ballSpeedPerSec = 10;
let ballDampeningPerSec = 1;
const cueBallCoords = { x: 0, y: 0 };

let ballId = 0;
let cueBall = null;
const balls = [];

function createBalls() {
  createCueBall();

  const radius = ballRadius;

  for (let i = 1; i < 10; i++) {
    let randomX = randomBetween(tableStartX, tableStartX + tableWidth);
    let randomY = randomBetween(tableStartY, tableStartY + tableHeight);
    while (
        isRailsCollision(randomX, randomY, radius)
        || getAnyBallCollidedWith(randomX, randomY, radius)
        || isPocketsCollision(randomX, randomY, radius)
        || isCloseToMid(randomX, randomY, radius)
        ) {
      // randomize new coords
      randomX = randomBetween(tableStartX, tableStartX + tableWidth);
      randomY = randomBetween(tableStartY, tableStartY + tableHeight);
    }
    balls.push({ ballId: ballId++, x: randomX, y: randomY, value: i, color: randomColor(),
      isMoving: false, isColliding: false, speedPerSecX: 0, speedPerSecY: 0 })
  }
}

function createCueBall() {
  cueBall = { ballId: ballId++, x: cueBallCoords.x, y: cueBallCoords.y, value: 0, color: cueBallColor,
    isMoving: false, speedPerSecX: 0, speedPerSecY: 0 };
  balls.push(cueBall);
}

function isCloseToMid(x, y, radius) {
  return isCircleCollision(x, y, radius, cueBallCoords.x, cueBallCoords.y, radius * 9);
}

const ballMinMoveSpeedPx = 2;

function moveBalls(differenceMs) {
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.isMoving || ball.isColliding) {
      if (ball.speedPerSecX !== 0) {
        ball.x += ball.speedPerSecX / 1000 * differenceMs;
        ball.speedPerSecX += getBallSpeedDampening(differenceMs, ball.speedPerSecX);
        if (Math.abs(ball.speedPerSecX) < ballMinMoveSpeedPx) {
          ball.speedPerSecX = 0;
        }
      }

      if (ball.speedPerSecY !== 0) {
        ball.y += ball.speedPerSecY / 1000 * differenceMs;
        ball.speedPerSecY += getBallSpeedDampening(differenceMs, ball.speedPerSecY);
        if (Math.abs(ball.speedPerSecY) < ballMinMoveSpeedPx) {
          ball.speedPerSecY = 0;
        }
      }

      if (ball.speedPerSecX === 0 && ball.speedPerSecY === 0) ball.isMoving = false;
    }
  }

  if (!isAnyBallMoving() && !cueBall) {
    createCueBall();
  }
}

function getBallSpeedDampening(differenceMs, number) {
  return number * -1 * ballDampeningPerSec / 1000 * differenceMs;
}

function isAnyBallMoving() {
  let anyBallMoving = false;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.isMoving) anyBallMoving = true;
  }
  return anyBallMoving;
}

function removeBall(ball) {
  removeItem(balls, ball);
}

function getAnyBallCollidedWith(x, y, radius, ballId = -1) {
  let ballCollidedWith = null;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ballId === ball.ballId) continue;
    if (isCircleCollision(x, y, radius, ball.x, ball.y)) ballCollidedWith = ball;
  }
  return ballCollidedWith;
}

function drawBalls() {
  c.strokeStyle = 'white';
  c.lineWidth = 1;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    c.fillStyle = ball.color;

    c.beginPath();
    c.arc(ball.x, ball.y, ballRadius, 0, 2*Math.PI);
    c.fill();
    c.stroke();

    c.fillStyle = 'white';
    c.font = '' + ballRadius * 1.5 + 'px Arial'; // emoji size with font
    c.fillText(ball.value, ball.x - ballRadius / 2 + 1, ball.y + ballRadius / 2);
  }
}

// cue-stick

let cueStickLength = 70;
let cueStickWidth = 5;
let cueAngleRadian = 0;
let cueStickMaxDrawingDistance = 20;

function drawCueStick() {
  c.lineCap = 'round';
  c.lineWidth = cueStickWidth;

  let cueCenteringPos;
  if (mousePressedPos) {
    const mousePressToBallDistance = distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePressedPos.x, mousePressedPos.y);
    const distance = Math.max(0, Math.min(
        cueStickMaxDrawingDistance,
        distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePos.value.x, mousePos.value.y) - mousePressToBallDistance));
    cueCenteringPos = projectPoint(cueBallCoords.x, cueBallCoords.y, distance, cueAngleRadian);
  } else {
    cueCenteringPos = cueBallCoords;
  }

  c.strokeStyle = cueStickMainColor;
  let lineStartPoint = projectPoint(cueCenteringPos.x, cueCenteringPos.y, ballRadius * 2, cueAngleRadian);
  let lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 0.7, cueAngleRadian);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();

  c.strokeStyle = cueStickHandleColor;
  lineStartPoint = lineEndPoint;
  lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 0.3, cueAngleRadian);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();
}

const isDrawHintLine = true;

function drawHintLine() {
  if (isDrawHintLine && mousePressedPos) {
    const cueBallAngleRadian = angleBetweenPointsRadian(mousePressedPos.x, mousePressedPos.y, cueBallCoords.x, cueBallCoords.y);

    c.lineCap = 'round';
    c.lineWidth = 1;
    c.strokeStyle = 'grey';

    let lineStartPoint = projectPoint(cueBallCoords.x, cueBallCoords.y, ballRadius * 2, cueBallAngleRadian);
    let lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 2, cueBallAngleRadian);

    c.beginPath();
    c.moveTo(lineStartPoint.x, lineStartPoint.y);
    c.lineTo(lineEndPoint.x, lineEndPoint.y);
    c.stroke();
  }
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
  cueAngleRadian = angleBetweenPointsRadian(cueBallCoords.x, cueBallCoords.y, mousePos.value.x, mousePos.value.y);

  if (mousePressedPos) {
    const oldDistance = distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePressedPos.x, mousePressedPos.y);
    const newDistance = distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePos.value.x, mousePos.value.y);
    if (oldDistance > newDistance) mousePressedPos = mousePos.value; // more natural cue-stick grabbing
  }
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mousePressed.value = true;
  mousePressedPos = mousePos.value;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  if (cueBall && !isAnyBallMoving() && mousePressedPos) {
    const mousePressedDistance = distanceBetweenPoints(cueBallCoords.x, cueBallCoords.y, mousePressedPos.x, mousePressedPos.y);
    const angledMousePressedPoint = projectPoint(cueBallCoords.x, cueBallCoords.y, mousePressedDistance, cueAngleRadian);
    const drawDistance = distanceBetweenPoints(angledMousePressedPoint.x, angledMousePressedPoint.y, mousePos.value.x, mousePos.value.y);
    if (drawDistance > 3) {
      // launch cue-ball
      const speedDrawFactor = 0.3 + drawDistance / cueStickMaxDrawingDistance * 0.7;
      cueBall.speedPerSecX = Math.cos(cueAngleRadian + Math.PI) * ballSpeedPerSec * speedDrawFactor;
      cueBall.speedPerSecY = Math.sin(cueAngleRadian + Math.PI) * ballSpeedPerSec * speedDrawFactor;
      cueBall.isMoving = true;
      //balls.forEach(ball => ball.isMoving = true);
    }
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