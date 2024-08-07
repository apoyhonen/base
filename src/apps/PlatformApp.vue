<template>
  <table>
    <tr>

      <td>
        <p><b>Controls</b></p>
        <br>
        <p>WASD or Arrow Keys to move character.</p>
        <br><br>

        <b>Game</b>
        <br><br>
        <label for="groundLevelPercent">Ground level (%):</label>
        <input id="groundLevelPercent" type="number" class="controls-input" v-model="groundLevelPercent" />
        <br>
        <label for="cloudSizePercent">Clouds size (%):</label>
        <input id="cloudSizePercent" type="number" class="controls-input" v-model="cloudSizePercent" />
        <br>
        <label for="moveSpeedPercent">Move speed (%):</label>
        <input id="moveSpeedPercent" type="number" class="controls-input" v-model="moveSpeedPercent" />
        <br><br>
        <button class="controls-button" @click="resetSettings">RESET VALUES</button>
        <br><br><br>

        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <br>
        <button @click="isRunning = !isRunning">START / STOP</button>
      </td>

      <td>
        <h1>Platforms</h1>
        <canvas v-bind:id="canvasName" width="400" height="300"></canvas>
      </td>

    </tr>
  </table>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { easeInCubic, easeOutCubic, randomBetween, randomIntBetween } from "@/util/MathUtil";
import {
  initKeyListeners, isLeftPressed, isRightPressed, isSpacePressed, isUpPressed,
} from "@/util/KeysUtil";

const canvasName = 'platformCanvas';
let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById(canvasName);
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  groundLevelPercent.value = groundLevelPercentDefault;
  cloudHigherY.value = canvas.height * 0.1;
  cloudMidY.value = canvas.height * 0.3;
  cloudLowerY.value = canvas.height * 0.45;
  createClouds();

  charWidth.value = canvas.width / 30;
  charHeight.value = charWidth.value * 3;
  charBottomY.value = groundLevelY.value;
  charJumpTopY.value = charBottomY.value - charHeight.value * 2;

  obstacleMinWidth.value = charWidth.value * 0.25;
  obstacleMaxWidth.value = charWidth.value;

  defaultSpeedPerSec = canvas.width / 4;
  watch(moveSpeedPercent, () => moveSpeedPerSec.value = defaultSpeedPerSec / 100 * moveSpeedPercent.value);
  charJumpSpeedPerSec.value = defaultSpeedPerSec * 3;

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

  considerAddingObstacle();

  const currTimestamp = Date.now();
  const differenceMs = currTimestamp - prevDrawTimestamp;
  moveClouds(differenceMs);
  moveJump(differenceMs);
  moveObstacles(differenceMs);
  prevDrawTimestamp = currTimestamp;

  drawClouds();
  drawGround();
  drawObstacles();
  drawChar();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function resetSettings() {
  moveSpeedPercent.value = 100;
  cloudSizePercent.value = cloudSizePercentDefault;
  groundLevelPercent.value = groundLevelPercentDefault;
}

// game

const moveSpeedPercent = ref(100);
let defaultSpeedPerSec = 400;
const moveSpeedPerSec = ref(defaultSpeedPerSec);
watch(moveSpeedPercent, () => moveSpeedPercent.value = Math.max(5, Math.min(1000, moveSpeedPercent.value)));

// char

const charColor = 'seagreen';

const charWidth = ref(100);
const charHeight = ref(400);
const charStartX = computed(() => canvas.width / 2 - charWidth.value / 2);
const charBottomY = ref(100);
const charJumpSpeedPerSec = ref(100);
const charJumpTopY = ref(50);

function drawChar() {
  c.fillStyle = charColor;
  c.strokeStyle = charColor;
  c.lineWidth = charWidth.value / 4;

  c.beginPath();
  c.rect(charStartX.value, charBottomY.value - charHeight.value, charWidth.value, charHeight.value * 0.75);
  c.fill();

  c.beginPath();
  c.moveTo(charStartX.value + charWidth.value / 8, charBottomY.value - charHeight.value * 0.25);
  c.lineTo(charStartX.value + charWidth.value / 8, charBottomY.value);
  c.moveTo(charStartX.value + charWidth.value - charWidth.value / 8, charBottomY.value - charHeight.value * 0.25);
  c.lineTo(charStartX.value + charWidth.value - charWidth.value / 8, charBottomY.value);
  c.stroke();
}

let jumping = false;
let falling = false;

function moveJump(differenceMs) {
  let moveDelta = charJumpSpeedPerSec.value / 1000 * differenceMs;

  // jump speed is slower the higher in jump / falling you are
  const maxJumpHeight = groundLevelY.value - charJumpTopY.value;
  const charCurrentJumpHeight = groundLevelY.value - charBottomY.value;
  const jumpRatio = Math.min(charCurrentJumpHeight / maxJumpHeight + 0.2, 1);

  if (falling) {
    if (charBottomY.value >= groundLevelY.value) {
      falling = false;
    } else {
      const fallDelta = (1 - easeInCubic(jumpRatio - 0.3)) * moveDelta;
      console.log('fall delta ' + fallDelta);
      charBottomY.value = Math.min(charBottomY.value + fallDelta, groundLevelY.value);
    }
  } else {
    const isJumpPressed = isUpPressed() || isSpacePressed();
    if (isJumpPressed && charBottomY.value > charJumpTopY.value) {
      if (!jumping) {
        jumping = true;
      }

      const riseDelta = easeOutCubic(jumpRatio + 0.3) * moveDelta;
      charBottomY.value = Math.max(charBottomY.value - riseDelta, charJumpTopY.value);
    } else if (jumping) {
      jumping = false;
      falling = true;
    }
  }
}

// obstacles

const obstacles = [];
const obstacleColors = [ 'black', 'red', 'yellow', 'blue', 'purple', 'pink', 'orange' ];
const obstacleMinWidth = ref(50);
const obstacleMaxWidth = ref(100);

function randomObstacleColor() {
  return obstacleColors[randomIntBetween(0, obstacleColors.length - 1)];
}

function considerAddingObstacle() {
  if (obstacles.length > 0) return;
  addObstacle();
}

function addObstacle() {
  obstacles.push({
    x: isRightPressed() ? canvas.width * 1.4 : 0 - canvas.width * 0.4 - obstacleMinWidth.value, // create a bit outside the screen
    width: randomBetween(obstacleMinWidth.value, obstacleMaxWidth.value),
    height: charHeight.value * randomBetween(0.3, 1),
    color: randomObstacleColor(),
  });
}

function moveObstacles(differenceMs) {
  if (!isRightPressed() && !isLeftPressed()) return;

  const moveDelta = moveSpeedPerSec.value / 1000 * differenceMs * (isRightPressed() ? -1 : 1);
  obstacles.forEach(obstacle => {
    obstacle.x += moveDelta;

    if (obstacle.x > canvas.width * 1.5 || obstacle.x < 0 - canvas.width * 0.5 - obstacleMinWidth.value) removeObstacle(obstacle); // remove
  });
}

function removeObstacle(obstacle) {
  obstacles.splice(obstacles.indexOf(obstacle), 1);
}

function drawObstacles() {
  c.lineWidth = 3;
  c.strokeStyle = 'black';
  obstacles.forEach(obstacle => {
    c.fillStyle = obstacle.color;

    c.beginPath();
    c.rect(obstacle.x - obstacle.width / 2, groundLevelY.value - obstacle.height, obstacle.width, obstacle.height);
    c.fill();
    c.stroke();
  })
}

// environment

const groundLevelColor = 'sandybrown';
const groundColor = 'saddlebrown'

const groundLevelPercentDefault = 10;
const groundLevelPercent = ref(9);
watch(groundLevelPercent, () => {
  const groundLevelControlled = Math.max(5, Math.min(50, groundLevelPercent.value));
  groundLevelY.value = canvas.height / 100 * (100 - groundLevelControlled);
  groundLevelPercent.value = groundLevelControlled;
});
const groundLevelY = ref(100);
watch(groundLevelY, () => {
  charBottomY.value = groundLevelY.value;
  charJumpTopY.value = charBottomY.value - charHeight.value * 2;
});

function drawGround() {
  c.fillStyle = groundLevelColor;
  c.strokeStyle = groundColor;
  c.lineWidth = 3;

  c.beginPath();
  c.rect(0, groundLevelY.value + 3, canvas.width, canvas.height - groundLevelY.value - 3);
  c.fill();

  c.beginPath();
  c.moveTo(0, groundLevelY.value + 2);
  c.lineTo(canvas.width, groundLevelY.value + 2);
  c.stroke();
}

const clouds = [];
const cloudSizePercentDefault = 60;
const cloudSizePercent = ref(cloudSizePercentDefault);
const cloudHigherY = ref(20);
const cloudMidY = ref(30);
const cloudLowerY = ref(40);

function createClouds() {
  clouds.push({ x: randomBetween(0, canvas.width), y: cloudHigherY.value, speedFactor: 0.33, sizeFactor: randomBetween(0.3, 1) });
  clouds.push({ x: randomBetween(0, canvas.width), y: cloudMidY.value, speedFactor: 0.66, sizeFactor: randomBetween(0.3, 1) });
  clouds.push({ x: randomBetween(0, canvas.width), y: cloudLowerY.value, speedFactor: 1, sizeFactor: randomBetween(0.3, 1) });
}

function drawClouds() {
  c.strokeStyle = '#797874';
  c.stroke();
  c.fillStyle = 'white';
  c.lineWidth = 3;

  let x = 0;
  let y = 0;
  clouds.forEach(cloud => {
    x = cloud.x;
    y = cloud.y;

    const cloudSizeFactor = 1 / 100 * cloudSizePercent.value * cloud.sizeFactor;

    c.beginPath();
    c.arc(x, y, 60 * cloudSizeFactor, Math.PI * 0.5, Math.PI * 1.5);
    c.arc(x + 70 * cloudSizeFactor, y - 60 * cloudSizeFactor, 70 * cloudSizeFactor, Math.PI, Math.PI * 1.85);
    c.arc(x + 152 * cloudSizeFactor, y - 45 * cloudSizeFactor, 50 * cloudSizeFactor, Math.PI * 1.37, Math.PI * 1.91);
    c.arc(x + 200 * cloudSizeFactor, y, 60 * cloudSizeFactor, Math.PI * 1.5, Math.PI * 0.5);
    c.moveTo(x + 200 * cloudSizeFactor, y + 60 * cloudSizeFactor);
    c.lineTo(x, y + 60 * cloudSizeFactor);
    c.fill()
    c.stroke();
  })
}

function moveClouds(differenceMs) {
  if (!isRightPressed() && !isLeftPressed()) return;

  const moveDelta = moveSpeedPerSec.value / 1000 * differenceMs * (isRightPressed() ? -1 : 1);
  clouds.forEach(cloud => {
    cloud.x += moveDelta * cloud.speedFactor;

    if (cloud.x > canvas.width + 100) cloud.x = 0 - 300 / 100 * cloudSizePercent.value;
    else if (cloud.x < -300 / 100 * cloudSizePercent.value) cloud.x = canvas.width;
  });
}

// key handlers

initKeyListeners(document, canvasName);

</script>

<style scoped>
canvas {
  background: skyblue;
  color: saddlebrown;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 60px;
}
</style>