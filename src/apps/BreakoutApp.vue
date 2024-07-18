<template>
  <head>
    <meta charset="utf-8" />
    <title>Gamedev Canvas Workshop</title>
  </head>
  <body>
  <canvas id="breakoutCanvas" width="820" height="500" @click="canvasClicked"></canvas>
  <div>
    <br>
    <p>
      <b>Controls</b>
    </p>
    <p>
      Mouse: Mouse to move the paddle, Click to release ball
    </p>
    <p>
      Keyboard: 'Left Arrow' & 'Right Arrow' or 'A' & 'D', <br>'Space' / 'Enter' to release ball
    </p>
    <p>
      'P' to pause, 'R' to reset
    </p>

    <br>
    <b>Game</b><br>
    <p>lives: {{ lives }}</p>
    <p>score: {{ score }} / {{ brickRowCount * brickColumnCount }}</p>
    <p>speed: {{ speedPercent }} %</p>
    <button @click="resetClicked">RESET</button>
    <br><br>

    <b>Animation</b><br>
    <p>frame: {{ frameCount }}</p>
    <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
    <p>ball x: {{ Math.floor(ballX) }}, ball y: {{ Math.floor(ballY) }}</p>
    <button @click="isRunning = !isRunning">START / STOP</button>
  </div>
  </body>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";

// GAME

const frameCount = ref(1);
const score = ref(0);
const lives = ref(3);
const isRunning = ref(true);
//let animationInterval = null;

const ballColor = 'white';
const paddleColor = 'grey';
const brickColors = [ 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'turquoise'];
const scoreColor = 'white';

let canvas = null;
let ctx = null;
let ballX = 0;
let ballY = 0;

onMounted(() => {
  canvas = document.getElementById("breakoutCanvas");
  ctx = canvas.getContext("2d");

  ballX = canvas.width / 2;
  ballY = canvas.height - 100;
  paddleX = (canvas.width - paddleWidth) / 2;

  paddleMoveIncrement = canvas.width / 100; // feel-good magic number
  ballDefaultSpeed = canvas.height / 300; // feel-good magic number
  dx = getRandomResetX();
  dy = -ballDefaultSpeed / 100 * speedPercent.value;

  draw();
  //animationInterval = setInterval(draw, 10)
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function draw() {
  frameCount.value++;

  clear();
  checkBounceAndLimits();
  brickCollisionDetection();

  if (isBallMoving) {
    ballX += dx;
    ballY += dy;
  }

  drawBall();
  drawPaddle();
  drawBricks();
  drawScoreAndLives();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function stopReload() {
  resetClicked();
  //document.location.reload(); // refresh page
  //clearInterval(animationInterval); // stop animation
}

function gameOver() {
  if (lives.value > 0) {
    lives.value--;
    alert("Breakout: You lost a life, keep trying!");
    resetBall();
  } else {
    alert("Breakout: GAME OVER!");
    stopReload();
  }
}

function win() {
  alert("Breakout: YOU WIN, CONGRATULATIONS!");
  stopReload();
}

function resetClicked() {
  resetBricks();
  resetValues();
  resetBall();
  isRunning.value = true;
}

function resetValues() {
  lives.value = 3;
  score.value = 0;
}

function canvasClicked() {
  if (isRunning.value) {
    isBallMoving = !isBallMoving;
  } else {
    isRunning.value = true;
    isBallMoving = true;
  }
}

function drawScoreAndLives() {
  ctx.font = "16px Arial";

  ctx.fillStyle = scoreColor;
  ctx.fillText('Score: ' + score.value, 20, 30);

  ctx.fillStyle = scoreColor;
  ctx.fillText('Lives: ' + lives.value, canvas.width - 75, 30);
}

// BALL

const ballRadius = 12;
const paddleGrace = 10;
const speedPercent = ref(100);
const incrementPercent = 10;
let ballDefaultSpeed = 1.5;
let isBallMoving = false;
let dx = getRandomResetX();
let dy = -ballDefaultSpeed / 100 * speedPercent.value;

function resetBall() {
  speedPercent.value = 100;
  dx = getRandomResetX();
  dy = -ballDefaultSpeed / 100 * speedPercent.value;

  ballX = canvas.width / 2;
  ballY = canvas.height - 100;
  paddleX = (canvas.width - paddleWidth) / 2;

  isBallMoving = false;
}

function getRandomResetX() {
  const random = Math.random() - 0.5;
  return ballDefaultSpeed / 100 * speedPercent.value * (random < 0 ? -1 : 1);
}

function checkBounceAndLimits() {
  if (ballX + dx - ballRadius < 0 || ballX + dx + ballRadius > canvas.width) dx = -dx;
  if (ballY + dy - ballRadius < 0) dy = -dy;

  if (ballY + dy + ballRadius > canvas.height) gameOver();

  const bottomX = ballX + dx + ballRadius;
  // if hitting paddle & heading down
  if (bottomX <= paddleX + paddleWidth + paddleGrace && bottomX >= paddleX - paddleGrace
      && ballY + dy + ballRadius >= canvas.height - 20 - paddleHeightHalf
      && dy > 0) {
    increaseBallSpeed();
    dy = -dy;
  }
}

function increaseBallSpeed() {
  speedPercent.value += incrementPercent;

  let increment = ballDefaultSpeed / 100 * incrementPercent;
  dx += dx < 0 ? -increment : increment;
  dy += dy < 0 ? -increment : increment;
}

const drawBall = () => {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

// PADDLE

let paddleMoveIncrement = 7;

function drawPaddle() {
  if (rightPressed) {
    paddleX = Math.min(paddleX + paddleMoveIncrement, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - paddleMoveIncrement, 0);
  }

  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);
  ctx.fillStyle = paddleColor;
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
document.addEventListener("mousemove", mouseMoveHandler, false);

function isAppActive() {
  return document.getElementById("breakoutCanvas") !== null;
}

function keyDownHandler(e) {
  if (!isAppActive()) return;

  if (e.key === "Right" || e.key === "ArrowRight" || e.key === 'd') {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = true;
  } else if (e.key === 'p') {
    isRunning.value = !isRunning.value;
  } else if (e.key === 'r') {
    resetClicked();
  } else if ((e.key === ' ' || e.key === 'Enter')) {
    canvasClicked();
  }
}

function keyUpHandler(e) {
  if (!isAppActive()) return;

  if (e.key === "Right" || e.key === "ArrowRight" || e.key === 'd') {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a") {
    leftPressed = false;
  }
}

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
}

// BRICKS

const brickRowCount = 4;
const brickColumnCount = 6;
const brickWidth = 100;
const brickHeight = 20;
const brickPadding = 30;
const brickOffsetTop = 50;
const brickOffsetLeft = 30;

const bricks = [];
resetBricks();

function resetBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;

        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColors[c];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

const brickGrace = ballRadius / 2;

function brickCollisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];

      let changed = false;
      if (b.status === 1) {
        // hitting sides of the brick
        if (ballX > b.x - brickGrace && ballX < b.x + brickWidth + brickGrace
            && ballY > b.y && ballY < b.y + brickHeight) {
          dx = -dx;
          changed = true;
        }

        // hitting under/upper sides of the brick
        if (ballX > b.x && ballX < b.x + brickWidth
            && ballY > b.y - brickGrace && ballY < b.y + brickHeight + brickGrace) {
          dy = -dy;
          changed = true;
        }

        if (changed) {
          b.status = 0;
          score.value++;

          if (score.value === brickRowCount * brickColumnCount) {
            win(); // all bricks have been destroyed
          }
        }
      }
    }
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
  background: black;
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
</style>