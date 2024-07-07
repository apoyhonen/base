<template>
  <h3>Pong</h3>
  <canvas id="myCanvas" width="820" height="500" @click="canvasClicked"></canvas>
  <div>
    <br>
    <b>Game</b><br>
    <p>{{ leftScore }} : {{ rightScore }}</p>
    <button @click="resetClicked">RESET</button>
    <br><br>
    <b>Animation</b><br>
    <p>frame: {{ frameCount }}</p>
    <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
    <p>ball x: {{ Math.floor(ballX) }}, ball y: {{ Math.floor(ballY) }}</p>
    <button @click="isRunning = !isRunning">START / STOP</button>
  </div>
</template>

<script setup>

// GAME

import { computed, onMounted, ref, watch } from "vue";

const ballColor = 'white';
const paddleColor = 'white';
const scoreColor = 'white';

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("myCanvas");
  c = canvas.getContext("2d");

  ballX = canvas.width / 2;
  ballY = canvas.height - 100;
  leftPaddleY = canvas.height - paddleHeight / 2;
  rightPaddleY = canvas.height - paddleHeight / 2;

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function draw() {
  frameCount.value++;

  clear();
  checkBounceAndLimits();

  if (isBallMoving) {
    ballX += ballDeltaX;
    ballY += ballDeltaY;
  }

  drawBall();
  drawPaddles();
  drawScores();

  if (isRunning.value) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

function resetClicked() {
  resetBall();
  resetPaddles();
  resetScores();
  isRunning.value = true;
}

const leftScore = ref(0);
const rightScore = ref(0);

function resetScores() {
  leftScore.value = 0;
  rightScore.value = 0;
}

function drawScores() {
  c.font = "42px Arial";
  c.fillStyle = scoreColor;

  c.fillText('' + leftScore.value, 40, 50);
  c.fillText(':', canvas.width / 2 - 5, 45);
  c.fillText('' + rightScore.value, canvas.width - 45, 50);
}

// BALL

const ballRadius = 12;
//const paddleGrace = 10;
const speedPercent = ref(100);
const speed = computed(() => 1.5 / 100 * speedPercent.value);
let isBallMoving = false;
let ballX = 0;
let ballY = 0;
let ballDeltaX = randomDirectionSpeed();
let ballDeltaY = randomDirectionSpeed();

const drawBall = () => {
  c.beginPath();
  c.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  c.fillStyle = ballColor;
  c.fill();
  c.closePath();
}

function resetBall() {
  speedPercent.value = 100;
  ballDeltaX = randomDirectionSpeed();
  ballDeltaY = randomDirectionSpeed();

  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  isBallMoving = false;
}

function randomDirectionSpeed() {
  const random = Math.random() - 0.5;
  return speed.value * (random < 0 ? -1 : 1);
}

function checkBounceAndLimits() {
  if (ballX + ballDeltaX - ballRadius < 0 || ballX + ballDeltaX + ballRadius > canvas.width) ballDeltaX = -ballDeltaX;
  if (ballY + ballDeltaY - ballRadius < 0 || ballY + ballDeltaY + ballRadius > canvas.height) ballDeltaY = -ballDeltaY;
/*
  const bottomX = ballX + ballDeltaX + ballRadius;
  // if hitting paddle & heading down
  if (bottomX <= paddleX + paddleWidth + paddleGrace && bottomX >= paddleX - paddleGrace
      && ballY + ballDeltaY + ballRadius >= canvas.height - 20 - paddleHeightHalf
      && ballDeltaY > 0) {
    increaseBallSpeed();
    ballDeltaY = -ballDeltaY;
  }*/
}
/*
function increaseBallSpeed() {
  speedPercent.value += 5;

  if (ballDeltaX < 0) ballDeltaX -= 0.2;
  else ballDeltaX += 0.2;

  if (ballDeltaY < 0) ballDeltaY -= 0.2;
  else ballDeltaY += 0.2;
}*/

// PADDLE

const paddleHeight = 80;
const paddleWidth = 10;
let leftPaddleY = 0;
let rightPaddleY = 0;

let leftUpPressed = false;
let leftDownPressed = false;
let rightUpPressed = false;
let rightDownPressed = false;

function drawPaddles() {
  if (leftUpPressed) {
    leftPaddleY = Math.min(leftPaddleY - 7, 0);
  } else if (leftDownPressed) {
    leftPaddleY = Math.max(leftPaddleY + 7, canvas.height - paddleHeight);
  }

  if (rightUpPressed) {
    rightPaddleY = Math.min(rightPaddleY - 7, 0);
  } else if (rightDownPressed) {
    rightPaddleY = Math.max(rightPaddleY + 7, canvas.height - paddleHeight);
  }

  c.fillStyle = paddleColor;
  c.fillRect(30 - paddleWidth, leftPaddleY, paddleWidth, paddleHeight); // left paddle
  c.fillRect(canvas.width - 30, rightPaddleY, paddleWidth, paddleHeight); // right paddle
}

function resetPaddles() {
  rightPaddleY = leftPaddleY = (canvas.height - paddleHeight) / 2; // both paddles to mid
}

// key and mouse listeners

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function keyDownHandler(e) {
  // left paddle keys
  if (e.key === 'w') {
    leftUpPressed = true;
  } else if (e.key === "s") {
    leftDownPressed = true;
  }

  // right paddle keys
  if (e.key === "Up" || e.key === "ArrowUp") {
    rightUpPressed = true;
  } else if (e.key === "Down" || e.key === "ArrowDown") {
    rightDownPressed = true;
  }

  // reset & pause
  if (e.key === 'p' && canvas.parentElement) {
    isRunning.value = !isRunning.value;
  } else if (e.key === 'r' && canvas.parentElement) {
    resetClicked();
  }
}

function keyUpHandler(e) {
  // left paddle keys
  if (e.key === 'w') {
    leftUpPressed = false;
  } else if (e.key === "s") {
    leftDownPressed = false;
  }

  // right paddle keys
  if (e.key === "Up" || e.key === "ArrowUp") {
    rightUpPressed = false;
  } else if (e.key === "Down" || e.key === "ArrowDown") {
    rightDownPressed = false;
  }
}

function mouseMoveHandler(e) {
  const relativeY = e.clientY - canvas.offsetTop;
  if (relativeY > 0 && relativeY < canvas.height) {
    leftPaddleY = relativeY - paddleHeight / 2;
  }
}

function canvasClicked() {
  if (isRunning.value) {
    isBallMoving = !isBallMoving;
  } else {
    isRunning.value = true;
    isBallMoving = true;
  }
}

</script>

<style scoped>
p {
  margin: 0;
}
canvas {
  background: black;
  display: block;
  margin: 0 auto;
  border: none;
}
</style>