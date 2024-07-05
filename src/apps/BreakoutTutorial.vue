<template>
  <head>
    <meta charset="utf-8" />
    <title>Gamedev Canvas Workshop</title>
  </head>
  <body>
  <canvas id="myCanvas" width="800" height="500"></canvas>
  <div>
    <p>frame: {{ count }}</p>
    <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
    <p>x: {{ x }}, y: {{ y }}</p>
    <br>
    Animation <button @click="isRunning = !isRunning">START / STOP</button>
  </div>
  </body>
</template>

<script setup>

import { onMounted, ref } from "vue";

const count = ref(1);
const isRunning = ref(true);
let animationInterval = null;

let canvas = null;
let ctx = null;
let x = 0;
let y = 0;

onMounted(() => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  x = canvas.width / 2;
  y = canvas.height - 100;
  paddleX = (canvas.width - paddleWidth) / 2;

  animationInterval = setInterval(draw, 10)
});

const ballRadius = 12;
let dx = 3;
let dy = -3;

function draw() {
  if (!isRunning.value) return;
  count.value++;

  clear();
  checkBounceAndLimits();

  drawBall();
  drawPaddle();

  x += dx;
  y += dy;
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const paddleGrace = 10;

function checkBounceAndLimits() {
  if (x + dx - ballRadius < 0 || x + dx + ballRadius > canvas.width) dx = -dx;
  if (y + dy - ballRadius < 0) dy = -dy;

  if (y + dy + ballRadius > canvas.height) gameOver();

  const bottomX = x + dx + ballRadius;
  // if hitting paddle & heading down
  if (bottomX <= paddleX + paddleWidth + paddleGrace && bottomX >= paddleX - paddleGrace
      && y + dy + ballRadius >= canvas.height - 20 - paddleHeightHalf
      && dy > 0) {
    increaseBallSpeed();
    dy = -dy;
  }
}

function gameOver() {
  alert("GAME OVER!");
  document.location.reload(); // refresh page
  clearInterval(animationInterval); // stop animation
}

function increaseBallSpeed() {
  if (dx < 0) dx -= 0.2;
  else dx += 0.2;

  if (dy < 0) dy -= 0.2;
  else dy += 0.2;
}

const drawBall = () => {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  if (rightPressed) {
    paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - 7, 0);
  }

  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

const paddleHeight = 10;
const paddleHeightHalf = paddleHeight / 2;
const paddleWidth = 120;
let paddleX = 0;

let rightPressed = false;
let leftPressed = false;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === 'd') {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight" || e.key === 'd') {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = false;
  }
}

</script>

<style scoped>
* {
  padding: 0;
  margin: 0;
  text-align: center;
}
div {
  margin: 10px;
}
canvas {
  background: #eee;
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
</style>