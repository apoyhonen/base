<template>
  <h2>Snake</h2>
  <canvas id="snakeCanvas" :class="isWrapBorders ? 'green-border' : 'red-border'" width="400" height="300"></canvas>
  <br>
  <div>

    <b>Game</b>
    <br>
    <table>
      <tr>

        <td style="text-align: left;">
          <p><b>length:</b> {{ snakeLength }} <span style="display: inline-block; width: 50px;"></span></p>
          <p><b>direction:</b> {{ snakeDirection }}</p>
        </td>

        <td>
          Borders:
          <button @click="isWrapBorders = true">Wrap</button>
          <button @click="isWrapBorders = false">Walls</button>
          <br>
          Shape:
          <button @click="isCircleSnake = true;">Circle</button>
          <button @click="isCircleSnake = false;">Square</button>
        </td>

        <td>
          <label for="colsAmount">columns:</label>
          <input id="colsAmount" type="number" class="controls-input" v-model="gridCols" />
          <br>
          <label for="rowsAmount">rows:</label>
          <input id="rowsAmount" type="number" class="controls-input" v-model="gridRows" />
        </td>

        <td>
          <button class="controls-button"  @click="resetValues">RESET SIZE</button>
          <br>
          <button @click="resetGame">RESET GAME</button>
        </td>

      </tr>
    </table>
    <br>

    <table>
      <tr>

        <td>
          <p>
            <b>Controls</b>
          </p>
          <br>
          <p>
            Movement: Arrow Keys or WASD
          </p>
          <p>
            'R' to reset
          </p>
        </td>

        <td>
          <b>Animation</b><br>
          <table>
            <tr>

              <td>
                <p>frame: {{ frameCount }}</p>
                <p>width: {{ canvas ? canvas.width : 0 }}, height: {{ canvas ? canvas.height : 0 }}</p>
                <p>snake x: {{ snakeCol }}, snake y: {{ snakeRow }}</p>
              </td>

              <td>
                <p>speed: {{ animationSpeedDisplay }} %</p>
                Speed:
                <button @click="animationSpeedPercent += 10">Slower</button>
                <button @click="animationSpeedPercent = Math.max(10, animationSpeedPercent - 10)">Faster</button>
                <br>
                <button @click="isRunning = !isRunning">START / STOP</button>
                <span style="display: inline-block; width: 10px;"></span>
                <button @click="animationSpeedPercent = 100">RESET SPEED</button>
              </td>

            </tr>
          </table>
        </td>

      </tr>
    </table>
  </div>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);
const animationSpeedPercent = ref(100);
const animationSpeedDisplay = computed(() => Math.floor(100 * 100 / animationSpeedPercent.value));
const defaultAnimationMs = 200;
const animationSpeedMS = computed(() => defaultAnimationMs / 100 * animationSpeedPercent.value);
let animationInterval = null;

onMounted(() => {
  canvas = document.getElementById("snakeCanvas");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  resetGame();
  startAnimation();
});

function startAnimation() {
  animationInterval = setInterval(draw, animationSpeedMS.value);
}

function stopAnimation() {
  clearInterval(animationInterval);
}

watch(isRunning, () => {
  if (isRunning.value) startAnimation();
  else stopAnimation();
})

watch(animationSpeedMS, () => {
  stopAnimation();
  startAnimation();
})

// game

const defaultCols = 33;
const defaultRows = 19;
const gridCols = ref(defaultCols);
const gridRows = ref(defaultRows);
let isWrapBorders = true;

function draw() {
  if (!isAppActive()) {
    stopAnimation();
    return;
  }

  frameCount.value++;

  clear();
  checkLimits();

  if (isSnakeMoving) {
    if (isHorizontal) snakeCol += horizontalDirection;
    else snakeRow += verticalDirection;

    if (isWrapBorders) wrapSnake();

    addSnakeTile(snakeCol, snakeRow);
  }

  drawFieldLines();
  drawSnake();

  if (checkScore()) addGoalTile();
  drawGoals();
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

function checkLimits() {
  let newCol = snakeCol + (isHorizontal ? horizontalDirection : 0);
  let newRow = snakeRow + (!isHorizontal ? verticalDirection : 0);

  if (isSnakeTile(newCol, newRow) || (!isWrapBorders && isOutOfBounds(newCol, newRow)))
    gameOver();
}

function isOutOfBounds(col, row) {
  return col < 1 || col > gridCols.value || row < 1 || row > gridRows.value;
}

function drawFieldLines() {
  c.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  c.lineWidth = 1;

  const rectWidth = canvas.width / gridCols.value;
  const rectHeight = canvas.height / gridRows.value;

  let x = 0;
  let y = 0;
  for (let col = 0; col < gridCols.value; col++) {
    for (let row = 0; row < gridRows.value; row++) {
      c.strokeRect(x, y, rectWidth, rectHeight);

      y += rectHeight;
    }

    x += rectWidth;
    y = 0;
  }
}

function checkScore() {
  if (removeGoal(snakeCol, snakeRow)) {
    snakeLength++;
    addGoalTile();
  }
  return false;
}

function resetValues() {
  gridCols.value = defaultCols;
  gridRows.value = defaultRows;
  resetGame();
}

function resetGame() {
  resetSnake();
  resetGoals();
  isRunning.value = true;
}

function gameOver() {
  resetGame();
  alert("Snake: Game over!")
}

// snake

let snakeCol = 0;
let snakeRow = 0;
let horizontalDirection = 1;
let verticalDirection = 1;
const defaultSnakeLength = 3;
let snakeLength = defaultSnakeLength;
let isSnakeMoving = false;
let isHorizontal = true;
let isCircleSnake = true;

let snakeDirection = 'up';

const rectWidth = computed(() => canvas.width / gridCols.value);
const rectHeight = computed(() => canvas.height / gridRows.value);
const largeSizeFactor = 0.8;
const smallSizeFactor = 0.3;

const snakeTiles = [];

function drawSnake() {
  const totalTiles = snakeTiles.length;

  c.fillStyle = 'green';
  for (let i = 1; i <= totalTiles; i++) {
    const tile = snakeTiles[i - 1];
    const widthReduction = (rectWidth.value * (1 - largeSizeFactor)) + (rectWidth.value * (largeSizeFactor - smallSizeFactor) / totalTiles * (totalTiles - i));
    const heightReduction = (rectHeight.value * (1 - largeSizeFactor)) + (rectHeight.value * (largeSizeFactor - smallSizeFactor) / totalTiles * (totalTiles - i));
    let x = (tile.col - 1) * rectWidth.value + widthReduction / 2;
    let y = (tile.row - 1) * rectHeight.value + heightReduction / 2;

    if (isCircleSnake) {
      const circleRadius = Math.min(rectWidth.value - widthReduction, rectHeight.value - heightReduction) / 2;
      x += (rectWidth.value - widthReduction) / 2;
      y += (rectHeight.value - heightReduction) / 2;

      if (i === 1) {
        c.moveTo(x, y);
      }

      c.beginPath();
      c.arc(x, y, circleRadius, 0, 2 * Math.PI);
      c.fill();
    } else {
      c.fillRect(x, y, rectWidth.value - widthReduction, rectHeight.value - heightReduction);
    }
  }
}

function resetSnake() {
  snakeCol = Math.ceil(gridCols.value / 2);
  snakeRow = Math.ceil(gridRows.value / 2);
  horizontalDirection = 1;
  verticalDirection = 1;
  isHorizontal = true;
  snakeLength = defaultSnakeLength;
  isSnakeMoving = false;

  emptySnakeTiles();
  addSnakeTile(snakeCol, snakeRow);
}

function emptySnakeTiles() {
  while (snakeTiles.length > 0) snakeTiles.pop();
}

function addSnakeTile(col, row) {
  snakeTiles.push({ col: col, row: row });
  if (snakeTiles.length > snakeLength) snakeTiles.splice(0, 1);
}

function isSnakeTile(targetCol, targetRow) {
  return snakeTiles.filter(snakeTile => snakeTile.col === targetCol && snakeTile.row === targetRow).length > 0;
}

function wrapSnake() {
  if (snakeCol < 1) snakeCol = gridCols.value;
  if (snakeCol > gridCols.value) snakeCol = 1;
  if (snakeRow < 1) snakeRow = gridRows.value;
  if (snakeRow > gridRows.value) snakeRow = 1;
}

// goals

const goalTiles = [];
const goalWidthFactor = 0.6;
const goalRadius = computed(() => Math.min(rectWidth.value, rectHeight.value) * goalWidthFactor / 2);

function drawGoals() {
  c.fillStyle = 'red';
  c.strokeStyle = 'green';
  c.lineWidth = 5;
  goalTiles.forEach(goalTile => {
    let x = (goalTile.col - 1) * rectWidth.value + rectWidth.value / 2;
    let y = (goalTile.row - 1) * rectHeight.value + rectHeight.value / 2;
    c.beginPath();
    c.arc(x, y, goalRadius.value, 0, 2 * Math.PI);
    c.fill();

    c.beginPath();
    c.moveTo(x, y - goalRadius.value / 2);
    c.lineTo(x, y - rectHeight.value / 2 + rectHeight.value * (1 - goalWidthFactor) / 4);
    c.stroke();
  })


  c.fillStyle = 'green';

  const totalTiles = snakeTiles.length;
  for (let i = 1; i <= totalTiles; i++) {
    const tile = snakeTiles[i - 1];
    const widthReduction = (rectWidth.value * (1 - largeSizeFactor)) + (rectWidth.value * (largeSizeFactor - smallSizeFactor) / totalTiles * (totalTiles - i));
    const heightReduction = (rectHeight.value * (1 - largeSizeFactor)) + (rectHeight.value * (largeSizeFactor - smallSizeFactor) / totalTiles * (totalTiles - i));
    let x = (tile.col - 1) * rectWidth.value + widthReduction / 2;
    let y = (tile.row - 1) * rectHeight.value + heightReduction / 2;

    if (isCircleSnake) {
      const circleRadius = Math.min(rectWidth.value - widthReduction, rectHeight.value - heightReduction) / 2;
      x += (rectWidth.value - widthReduction) / 2;
      y += (rectHeight.value - heightReduction) / 2;
      c.beginPath();
      c.arc(x, y, circleRadius, 0, 2 * Math.PI);
      c.fill();
    } else {
      c.fillRect(x, y, rectWidth.value - widthReduction, rectHeight.value - heightReduction);
    }
  }
}

function isGoalTile(targetCol, targetRow) {
  return goalTiles.filter(goalTile => goalTile.col === targetCol && goalTile.row === targetRow).length > 0;
}

function resetGoals() {
  emptyGoals();

  // init with two goals
  const initialGoals = 5;
  for (let i = 0; i < initialGoals; i++) {
    addGoalTile();
  }
}

function removeGoal(targetCol, targetRow) {
  if (isGoalTile(targetCol, targetRow)) {
    const goalTile = goalTiles.filter(goalTile => goalTile.col === targetCol && goalTile.row === targetRow)[0];
    goalTiles.splice(goalTiles.indexOf(goalTile), 1);
    return true;
  }
  false;
}

function emptyGoals() {
  while (goalTiles.length > 0) goalTiles.pop();
}

function addGoalTile() {
  let goalTile = null;
  let i = 0;

  while (++i < 500) {
    const tile = randomTile();
    if (!isSnakeTile(tile.col, tile.row) && !isGoalTile(tile.col, tile.row)) {
      goalTile = tile;
      break;
    }
  }

  if (goalTile) goalTiles.push(goalTile);
}

function randomTile() {
  return {
    col: randomNumber(1, gridCols.value + 1),
    row: randomNumber(1, gridRows.value + 1),
  }
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// key & mouse listeners

document.addEventListener("keydown", keyDownHandler, false);

function isAppActive() {
  return document.getElementById("snakeCanvas") !== null;
}

function keyDownHandler(e) {
  if (!isAppActive()) return;

  // direction keys
  if (e.key === "Up" || e.key === "ArrowUp" || e.key === 'w') {
    setVerticalDirection(false);
  } else if (e.key === "Down" || e.key === "ArrowDown" || e.key === 's') {
    setVerticalDirection(true);
  } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === 'a') {
    setHorizontalDirection(false);
  } else if (e.key === "Right" || e.key === "ArrowRight" || e.key === 'd') {
    setHorizontalDirection(true);
  }

  // reset & pause
  if (e.key === 'p' || e.key === ' ') {
    isRunning.value = !isRunning.value;
  } else if (e.key === 'r') {
    resetGame();
  }
}

function setVerticalDirection(isDown) {
  if (!isHorizontal) {
    if ((isDown && verticalDirection < 0) || (!isDown && verticalDirection > 0)) {
      return; // opposite direction, don't allow
    }
  }

  isSnakeMoving = true;
  isHorizontal = false;
  verticalDirection = isDown ? 1 : -1;
  snakeDirection = isDown ? 'down' : 'up';
}

function setHorizontalDirection(isRight) {
  if (isHorizontal) {
    if ((isRight && horizontalDirection < 0) || (!isRight && horizontalDirection > 0)) {
      return; // opposite direction, don't allow
    }
  }

  isSnakeMoving = true;
  isHorizontal = true;
  horizontalDirection = isRight ? 1 : -1;
  snakeDirection = isRight ? 'right' : 'left';
}

</script>

<style scoped>
p {
  margin: 0;
}
canvas {
  background: moccasin;
  display: block;
  margin: 0 auto;
}
.green-border {
  border: 3px solid green;
}
.red-border {
  border: 3px solid red;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 40px;
}
table {
  margin: 0 auto;
}
td {
  padding: 0 20px;
}
</style>