<template>
  <h1>Breakout</h1>
  <canvas id="breakoutCanvas" width="820" height="500" @click="canvasClicked"></canvas>
  <br>
  <table>
    <tr>

      <td>
        <p>
          <b>Controls</b>
        </p>
        <br>
        <p>
          Mouse: Mouse to move the paddle, Click to release ball
        </p>
        <p>
          Keyboard: 'Left Arrow' & 'Right Arrow' or 'A' & 'D', <br>'Space' / 'Enter' to release ball
        </p>
        <p>
          'P' to pause, 'R' to reset
        </p>
      </td>

      <td>
        <b>Game</b><br>
        <table>
          <tr>

            <td>
              <p>lives: {{ lives }}</p>
              <p>score: {{ score }} / {{ brickRowCount * brickColumnCount }}</p>
              <p>speed: {{ speedPercent }} %</p>
              <br>
              <button @click="resetClicked">RESET GAME</button>
            </td>

            <td>
              <label for="colsAmount">columns:</label>
              <input id="colsAmount" type="number" class="controls-input" v-model="brickColumnCount" />
              <br>
              <label for="rowsAmount">rows:</label>
              <input id="rowsAmount" type="number" class="controls-input" v-model="brickRowCount" />
              <br><br>
              <button class="controls-button"  @click="resetValues">
                RESET SIZE
              </button>
            </td>

          </tr>
        </table>
      </td>

      <td>
        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
        <p>ball x: {{ Math.floor(ballX) }}, ball y: {{ Math.floor(ballY) }}</p>
        <button @click="isRunning = !isRunning">START / STOP</button>
      </td>

    </tr>
  </table>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";
import { initKeyListeners, isLeftPressed, isRightPressed } from "@/util/KeysUtil";

// GAME

const frameCount = ref(1);
const score = ref(0);
const lives = ref(3);
const isRunning = ref(true);
//let animationInterval = null;

const ballColor = 'white';
const paddleColor = 'grey';
const brickColors = [ 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'turquoise', 'white' ];
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
  ballRadius = canvas.height / 50;
  paddleGrace = ballRadius;

  paddleHeight = ballRadius;
  paddleHeightHalf = paddleHeight / 2;
  paddleWidth = canvas.width / 8;
  paddleX = (canvas.width - paddleWidth) / 2;

  paddleMoveIncrement = canvas.width / 100; // feel-good magic number
  ballDefaultSpeed = canvas.height / 300; // feel-good magic number
  dx = getRandomResetX();
  dy = -ballDefaultSpeed / 100 * speedPercent.value;

  brickOffsetTop = 50;
  brickOffsetLeft = 30;
  brickGrace = ballRadius / 2;
  brickHeight = (canvas.height - brickOffsetTop) * 0.45 / (brickRowCount.value * 1.6 - 0.6);
  brickHeightPadding = brickHeight * 0.6;
  brickWidth = (canvas.width - brickOffsetLeft * 2) / (brickColumnCount.value * 1.2 - 0.2);
  brickWidthPadding = brickWidth * 0.2;

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

function resetValues() {
  brickColumnCount.value = defaultColumns;
  brickRowCount.value = defaultRows;
  resetClicked();
}

function resetClicked() {
  resetBricks();
  resetScore();
  resetBall();
  isRunning.value = true;
}

function resetScore() {
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

const speedPercent = ref(100);
const incrementPercent = 10;
let ballRadius = 12;
let paddleGrace = 10;
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
let paddleHeight = 10;
let paddleHeightHalf = paddleHeight / 2;
let paddleWidth = 120;
let paddleX = 0;

function drawPaddle() {
  if (isRightPressed()) {
    paddleX = Math.min(paddleX + paddleMoveIncrement, canvas.width - paddleWidth);
  } else if (isLeftPressed()) {
    paddleX = Math.max(paddleX - paddleMoveIncrement, 0);
  }

  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight - 20, paddleWidth, paddleHeight);
  ctx.fillStyle = paddleColor;
  ctx.fill();
  ctx.closePath();
}

// key handlers

initKeyListeners(document, 'breakoutCanvas'); // generic key listeners

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function isAppActive() {
  return document.getElementById("breakoutCanvas") !== null;
}

function keyDownHandler(e) {
  if (!isAppActive()) return;

  if (e.key === 'p') {
    isRunning.value = !isRunning.value;
  } else if (e.key === 'r') {
    resetClicked();
  } else if ((e.key === ' ' || e.key === 'Enter')) {
    canvasClicked();
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

const defaultColumns = 6;
const defaultRows = 4;
const brickColumnCount = ref(defaultColumns);
const brickRowCount = ref(defaultRows);
let brickWidth = 100;
let brickHeight = 20;
let brickWidthPadding = 30;
let brickHeightPadding = 30;
let brickOffsetTop = 50;
let brickOffsetLeft = 30;
let brickGrace = ballRadius / 2;

const bricks = [];
resetBricks();

watch(brickColumnCount, () => {
  brickWidth = (canvas.width - brickOffsetLeft * 2) / (brickColumnCount.value * 1.2 - 0.2);
  brickWidthPadding = brickWidth * 0.2;
  resetClicked();
});
watch(brickRowCount, () => {
  brickHeight = (canvas.height - brickOffsetTop) * 0.45 / (brickRowCount.value * 1.6 - 0.6);
  brickHeightPadding = brickHeight * 0.6;
  resetClicked();
});

function resetBricks() {
  for (let c = 0; c < brickColumnCount.value; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount.value; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }
}

function drawBricks() {
  const colorsAmount = brickColors.length;
  let colColorFactor = 0;
  for (let col = 0; col < brickColumnCount.value; col++) {

    // loop brick colors
    if (col > 0 && col % colorsAmount === 0) {
      colColorFactor++;
    }

    for (let row = 0; row < brickRowCount.value; row++) {
      if (bricks[col][row].status === 1) {
        const brickX = col * (brickWidth + brickWidthPadding) + brickOffsetLeft;
        const brickY = row * (brickHeight + brickHeightPadding) + brickOffsetTop;

        bricks[col][row].x = brickX;
        bricks[col][row].y = brickY;

        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = brickColors[col - colColorFactor * colorsAmount];
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function brickCollisionDetection() {
  for (let c = 0; c < brickColumnCount.value; c++) {
    for (let r = 0; r < brickRowCount.value; r++) {
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

          if (score.value === brickRowCount.value * brickColumnCount.value) {
            win(); // all bricks have been destroyed
          }
        }
      }
    }
  }
}

</script>

<style scoped>
canvas {
  background: black;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 40px;
}
</style>