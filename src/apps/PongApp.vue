<template>
  <h1>Pong</h1>
  <div>
    :
    <span class="left-aligned">Right Player: {{ rightScore }}</span>
    <span class="right-aligned">Left Player: {{ leftScore }}</span>
  </div>
  <canvas id="pongCanvas" width="400" height="300" @click="canvasClicked"></canvas>
  <br>

  <table>
    <tr>

      <td>
        <p>
          <b>Controls</b>
        </p>
        <p>
          Left player: 'W' (up), 'S' (down) OR Mouse movement
        </p>
        <p>
          Right player: 'Up arrow' (up), 'Down arrow' (down)
        </p>
        <p>
          'P' to pause, 'R' to reset, 'Space' / 'Enter' / 'Mouse Click' to launch ball
        </p>
        <br>
        Mouse control:
        <button @click="mouseControlsBoth = true">Both</button>
        vs
        <button @click="mouseControlsBoth = false">Left</button>
      </td>

      <td>
        <b>Game</b><br>
        <p>{{ leftScore }} : {{ rightScore }}</p>
        <p>speed: {{ speedPercent }} %</p>
        <br>
        <button @click="resetClicked">RESET</button>
      </td>

      <td>
        <b>Animation</b><br>
        <p>frame: {{ frameCount }}</p>
        <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
        <p>ball x: {{ Math.floor(ballX) }}, ball y: {{ Math.floor(ballY) }}</p>
        <button @click="isRunning = !isRunning">START / STOP</button>
      </td>

    </tr>
  </table>
</template>

<script setup>

// GAME

import { onMounted, ref, watch } from "vue";

const ballColor = 'white';
const paddleColor = 'white';

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("pongCanvas");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballRadius = canvas.height / 60;

  paddleHeight = canvas.height / 9;
  paddleWidth = paddleHeight / 8;
  leftPaddleX = 40 - paddleWidth;
  paddleGrace = paddleWidth;
  leftPaddleY = (canvas.height - paddleHeight) / 2;
  rightPaddleY = leftPaddleY;
  rightPaddleX = canvas.width - 40;

  paddleMoveIncrement = canvas.height / 120; // feel-good magic number
  ballDefaultSpeed = canvas.height / 300; // feel-good magic number
  ballDeltaX = randomDirectionSpeed();
  ballDeltaY = randomDirectionSpeed();

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

  drawFieldLines();
  drawBall();
  drawPaddles();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

function drawFieldLines() {
  c.strokeOpacity = 0.5;
  c.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  c.strokeRect(canvas.width / 2, 0, 1, canvas.height);
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

// BALL

const speedPercent = ref(100);
const incrementPercent = 10;
let ballRadius = 12;
let ballDefaultSpeed = 1.5;
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
  return ballDefaultSpeed / 100 * speedPercent.value * (random < 0 ? -1 : 1);
}

function increaseBallSpeed() {
  speedPercent.value += incrementPercent;

  let increment = ballDefaultSpeed / 100 * incrementPercent;
  ballDeltaX += ballDeltaX < 0 ? -increment : increment;
  ballDeltaY += ballDeltaY < 0 ? -increment : increment;
}

// PADDLE

let paddleHeight = 80;
let paddleWidth = 10;
let leftPaddleX = 40 - paddleWidth;
let paddleGrace = 10;
let rightPaddleX = 0;
let leftPaddleY = 0;
let rightPaddleY = 0;
let paddleMoveIncrement = 7;

let leftUpPressed = false;
let leftDownPressed = false;
let rightUpPressed = false;
let rightDownPressed = false;

function drawPaddles() {
  if (leftUpPressed) {
    leftPaddleY = Math.max(leftPaddleY - paddleMoveIncrement, 0);
  } else if (leftDownPressed) {
    leftPaddleY = Math.min(leftPaddleY + paddleMoveIncrement, canvas.height - paddleHeight);
  }

  if (rightUpPressed) {
    rightPaddleY = Math.max(rightPaddleY - paddleMoveIncrement, 0);
  } else if (rightDownPressed) {
    rightPaddleY = Math.min(rightPaddleY + paddleMoveIncrement, canvas.height - paddleHeight);
  }

  c.fillStyle = paddleColor;
  c.fillRect(leftPaddleX, leftPaddleY, paddleWidth, paddleHeight); // left paddle
  c.fillRect(rightPaddleX, rightPaddleY, paddleWidth, paddleHeight); // right paddle
}

function resetPaddles() {
  rightPaddleY = leftPaddleY = (canvas.height - paddleHeight) / 2; // both paddles to mid
}

// Collisions and game states

function checkBounceAndLimits() {
  // hitting top/bottom
  const futureBallY = ballY + ballDeltaY
  if (futureBallY - ballRadius < 0 || futureBallY + ballRadius > canvas.height) ballDeltaY = -ballDeltaY;

  // hitting sides, score to opposing player!
  const futureBallX = ballX + ballDeltaX;
  if (futureBallX - ballRadius < 0) {
    rightScore.value++;
    resetBall();
  } else if (futureBallX + ballRadius > canvas.width) {
    leftScore.value++;
    resetBall();
  }

  // hitting either paddle
  const hittingLeftPaddle = futureBallY <= leftPaddleY + paddleHeight + paddleGrace && futureBallY >= leftPaddleY - paddleGrace
      && futureBallX - ballRadius <= leftPaddleX + paddleWidth && ballDeltaX < 0;
  const hittingRightPaddle = futureBallY <= rightPaddleY + paddleHeight + paddleGrace && futureBallY >= rightPaddleY - paddleGrace
      && futureBallX + ballRadius >= rightPaddleX && ballDeltaX > 0;
  if (hittingLeftPaddle || hittingRightPaddle) {
    increaseBallSpeed();
    ballDeltaX = -ballDeltaX;
  }
}

// key and mouse listeners

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function isAppActive() {
  return document.getElementById("pongCanvas") !== null;
}

function keyDownHandler(e) {
  if (!isAppActive()) return;

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

  // launch ball with Space / Enter
  if ((e.key === ' ' || e.key === 'Enter')) {
    canvasClicked();
  }

  // reset & pause
  if (e.key === 'p') {
    isRunning.value = !isRunning.value;
  } else if (e.key === 'r') {
    resetClicked();
  }
}

function keyUpHandler(e) {
  if (!isAppActive()) return;

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

const mouseControlsBoth = ref(false);
function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  const relativeY = e.clientY - canvas.offsetTop;
  if (relativeY > 0 && relativeY < canvas.height) {
    leftPaddleY = relativeY - paddleHeight / 2; // always move left paddle
    if (mouseControlsBoth.value) rightPaddleY = relativeY - paddleHeight / 2; // only move right paddle, if toggled
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
canvas {
  background: black;
}
.left-aligned,
.right-aligned {
  position: relative;
  font-size: 42px;
  margin: 0 0 10px 10px;
}
.left-aligned {
  left: 23%;
}
.right-aligned {
  right: 25%;
}
</style>