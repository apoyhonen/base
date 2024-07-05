<template>
  <head>
    <meta charset="utf-8" />
    <title>Gamedev Canvas Workshop</title>
  </head>
  <body>
  <canvas id="myCanvas" width="820" height="500"></canvas>
  <div>
    <p>frame: {{ frameCount }}</p>
    <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
    <p>x: {{ Math.floor(x) }}, y: {{ Math.floor(y) }}</p>
    <p>ball speed: {{ speed / 100 }}</p>
    <br>
    <p>lives: {{ lives }}</p>
    <p>score: {{ score }}</p>
    <p>bricks remaining: {{ brickRowCount * brickColumnCount }}</p>
    <br>
    Animation <button @click="isRunning = !isRunning">START / STOP</button>
  </div>
  </body>
</template>

<script setup>

import { onMounted, ref } from "vue";

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
let x = 0;
let y = 0;

onMounted(() => {
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  x = canvas.width / 2;
  y = canvas.height - 100;
  paddleX = (canvas.width - paddleWidth) / 2;

  draw();
  //animationInterval = setInterval(draw, 10)
});

function draw() {
  if (!isRunning.value) return;
  frameCount.value++;

  clear();
  checkBounceAndLimits();
  brickCollisionDetection();

  x += dx;
  y += dy;

  drawBall();
  drawPaddle();
  drawBricks();
  drawScoreAndLives();

  requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function stopReload() {
  document.location.reload(); // refresh page
  //clearInterval(animationInterval); // stop animation
}

function gameOver() {
  if (lives.value >= 1) {
    lives.value--;
    alert("You lost a life, keep trying!");
    resetBall();
  } else {
    alert("GAME OVER!");
    stopReload();
  }
}

function win() {
  alert("YOU WIN, CONGRATULATIONS!");
  stopReload();
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
const speed = ref(150);
let dx = getRandomResetX();
let dy = -speed.value / 100;

function resetBall() {
  speed.value = 150;
  dx = getRandomResetX();
  dy = -speed.value / 100;

  x = canvas.width / 2;
  y = canvas.height - 100;
  paddleX = (canvas.width - paddleWidth) / 2;
}

function getRandomResetX() {
  const random = Math.random() - 0.5;
  return speed.value / 100 * (random < 0 ? -1 : 1);
}

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

function increaseBallSpeed() {
  speed.value += 5;

  if (dx < 0) dx -= 0.2;
  else dx += 0.2;

  if (dy < 0) dy -= 0.2;
  else dy += 0.2;
}

const drawBall = () => {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

// PADDLE

function drawPaddle() {
  if (rightPressed) {
    paddleX = Math.min(paddleX + 7, canvas.width - paddleWidth);
  } else if (leftPressed) {
    paddleX = Math.max(paddleX - 7, 0);
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

function mouseMoveHandler(e) {
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
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
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
        if (x > b.x - brickGrace && x < b.x + brickWidth + brickGrace
            && y > b.y && y < b.y + brickHeight) {
          dx = -dx;
          changed = true;
        }

        // hitting under/upper sides of the brick
        if (x > b.x && x < b.x + brickWidth
            && y > b.y - brickGrace && y < b.y + brickHeight + brickGrace) {
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
  cursor: none;
}
</style>