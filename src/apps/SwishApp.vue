<template>
  <h2>Swish</h2>
  <canvas id="swishCanvas" width="400" height="300" @auxclick.prevent="canvasClicked" oncontextmenu="return false"></canvas>
  <br>
  <div>
    <table>
      <tr>

        <td>
          <p><b>Controls</b></p>
          <br>
          <p>TBA...</p>
          <br><br>
        </td>

        <td>
          <b>Game</b>
          <br><br>
          <p>Angle (degrees): {{ Math.floor(angleInDegrees) }}</p>
          <label for="angleAmount">Degrees:</label>
          <input id="angleAmount" type="number" class="controls-input" v-model="angleInDegrees" />
          <br>
          <button @click="angleInDegrees -= 45">- 45</button>
          <button @click="angleInDegrees += 45">+ 45</button>
        </td>

        <td>
          <b>Animation</b>
          <br><br>
          <p>frame: {{ frameCount }}</p>
          <br>
          <button @click="isRunning = !isRunning">START / STOP</button>
        </td>

      </tr>
    </table>
  </div>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { angleBetweenPointsDegreesPositive, degreesToRadian, projectPoint } from "@/util/MathUtil";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("swishCanvas");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  charPoint.x = canvas.width / 2;
  charPoint.y = canvas.height / 2;
  charRadius.value = canvas.height / 30;
  charSpeedPerSec.value = charRadius.value * 15;
  lineLength.value = charRadius.value * 3;

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

let prevTimestamp = null;

function draw() {
  frameCount.value++;

  clear();

  const currTimestamp = Date.now();
  if (prevTimestamp) moveChar(currTimestamp - prevTimestamp);
  prevTimestamp = currTimestamp;

  angleLineByMoveDirections();

  drawChar();
  drawLine();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function isAppActive() {
  return document.getElementById("swishCanvas") !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// game

const charColor = 'red';
const lineColor = 'green';

let charPoint = { x: 0, y: 0 };
const defaultAngle = 270;
const angleInDegrees = ref(defaultAngle);
const angleInRadians = computed(() => degreesToRadian(angleInDegrees.value))
watch(angleInDegrees, () => {
  if (angleInDegrees.value < 0) angleInDegrees.value = 360 + angleInDegrees.value;
  if (angleInDegrees.value > 359) angleInDegrees.value = 0 + angleInDegrees.value - 360;
})

function canvasClicked(e) {
  pointLineToEvent(e.clientX, e.clientY);
}

function pointLineToEvent(clientX, clientY) {
  const eventX = clientX - canvas.offsetLeft;
  const eventY = clientY - canvas.offsetTop;
  angleInDegrees.value = angleBetweenPointsDegreesPositive(charPoint.x, charPoint.y, eventX, eventY);
}

// character

const charRadius = ref(20);
const charSpeedPerSec = ref(charRadius.value);

function drawChar() {
  c.fillStyle = charColor;
  c.beginPath();
  c.arc(charPoint.x, charPoint.y, charRadius.value, 0, Math.PI * 2);
  c.fill();
}

function moveChar(moveMs) {
  const charMoveDelta = charSpeedPerSec.value / 1000 * moveMs;

  if (upPressed) {
    charPoint.y -= charMoveDelta;
  }

  if (downPressed) {
    charPoint.y += charMoveDelta;
  }

  if (rightPressed) {
    charPoint.x += charMoveDelta;
  }

  if (leftPressed) {
    charPoint.x -= charMoveDelta;
  }
}

// line

const lineLength = ref(100);

function drawLine() {
  let x = charPoint.x;
  let y = charPoint.y;

  c.strokeStyle = lineColor;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x, y);
  const linePoint = projectPoint(x, y, lineLength.value, angleInRadians.value);
  c.lineTo(linePoint.x, linePoint.y);
  c.stroke();
}


const angleDirectionChangeIntervalMs = 50;
let lastCrossDirectionalTimestamp = Date.now;

function angleLineByMoveDirections() {
  let crossDirectional = false;
  let cardinalDirectional = false;
  if (isAnyDirectionPressed()) {
    // moving is affecting angle
    let angleDegrees;
    if (upPressed) {
      if (rightPressed || leftPressed) {
        angleDegrees = leftPressed ? 225 : 315;
        crossDirectional = true;
      } else {
        angleDegrees = 270;
        cardinalDirectional = true;
      }
    } else if (downPressed) {
      if (rightPressed || leftPressed) {
        angleDegrees = leftPressed ? 135 : 45;
        crossDirectional = true;
      } else {
        angleDegrees = 90;
        cardinalDirectional = true;
      }
    } else {
      angleDegrees = leftPressed ? 180 : 0;
      cardinalDirectional = true;
    }

    if (crossDirectional) lastCrossDirectionalTimestamp = Date.now();

    if (cardinalDirectional) {
      const currTimestamp = Date.now();
      if (currTimestamp - lastCrossDirectionalTimestamp < angleDirectionChangeIntervalMs) return;
    }

    angleInDegrees.value = angleDegrees;
  }
}

// mouse handlers

const mouseDown = ref(false);
const mouseDownPos = ref({ x: 0, y: 0 });

document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler() {
  if (!isAppActive()) return;

  // TODO delete later if unnecessary
  //pointLineToEvent(e.clientX, e.clientY);
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mouseDown.value = true;
  mouseDownPos.value.x = e.clientX - canvas.offsetLeft;
  mouseDownPos.value.y = e.clientY - canvas.offsetTop;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  const relativeX = e.clientX - canvas.offsetLeft;
  const deltaX = relativeX - mouseDownPos.value.x;
  const relativeY = e.clientY - canvas.offsetTop;
  const deltaY = relativeY - mouseDownPos.value.y;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // sideways move
    if (deltaX > 0) {
      // right swing
      angleInDegrees.value += 90;
    } else {
      // left swing
      angleInDegrees.value -= 90;
    }
  } else {
    // upwards move
    if (deltaY < 0) {
      // forwards pierce
    } else {
      // backwards swing
      angleInDegrees.value += 180;
    }
  }

  mouseDown.value = false;
}

// key handlers

let upPressed = false;
let rightPressed = false;
let downPressed = false;
let leftPressed = false;

function isAnyDirectionPressed() {
  return upPressed || rightPressed || downPressed || leftPressed;
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (!isAppActive()) return;

  // left paddle keys
  if (e.key === 'w' || e.key === "ArrowUp") {
    upPressed = true;
  } else if (e.key === "d" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "s" || e.key === "ArrowDown") {
    downPressed = true;
  } else if (e.key === "a" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (!isAppActive()) return;

  // left paddle keys
  if (e.key === 'w' || e.key === "ArrowUp") {
    upPressed = false;
  } else if (e.key === "d" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "s" || e.key === "ArrowDown") {
    downPressed = false;
  } else if (e.key === "a" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

</script>

<style scoped>
p {
  margin: 0;
}
canvas {
  background: lightgray;
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
table {
  margin: 0 auto;
}
td {
  padding: 0 20px;
}
.controls-input {
  margin: 1px 10px;
  width: 40px;
}
</style>