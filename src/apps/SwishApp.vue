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
          <p>WASD or Arrow Keys to move character.</p>
          <p>Mouse click or swipe (while holding button) to swipe with weapon.</p>
          <br><br>
        </td>
      </tr>

      <tr>

        <td>
          <b>Game</b>
          <br><br>
          <p>Degrees: {{ Math.floor(angleInDegrees) }}</p>
          <p>Radians: {{ Math.floor(angleInRadians * 100) / 100 }}</p>
          <br>
        </td>

      </tr>
    </table>
  </div>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { angleBetweenPointsDegreesPositive, degreesToRadian, projectPoint, radianToDegrees } from "@/util/MathUtil";

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
  if (currTimestamp - animateTimestamp >= animationSpeedMs.value) {
    if (prevTimestamp) moveChar(currTimestamp - prevTimestamp); // move char
    angleLineByMoveDirections(); // set new angle by move direction
  }
  prevTimestamp = currTimestamp;

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

const charColor = 'seagreen';
const lineColor = 'red';

let charPoint = { x: 0, y: 0 };
const defaultAngle = 270;
const angleInDegrees = ref(defaultAngle);
watch(angleInDegrees, () => {
  if (angleInDegrees.value < 0) angleInDegrees.value = 360 + angleInDegrees.value;
  if (angleInDegrees.value > 359) angleInDegrees.value = 0 + angleInDegrees.value - 360;
})

const angleInRadians = computed(() => degreesToRadian(angleInDegrees.value))

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

  c.lineCap = "round";
  c.strokeStyle = charColor;
  c.lineWidth = charRadius.value / 2;
  c.beginPath();
  c.moveTo(charPoint.x, charPoint.y);
  const projectedPoint = projectPoint(charPoint.x, charPoint.y, charRadius.value, angleInRadians.value);
  c.lineTo(projectedPoint.x, projectedPoint.y);
  c.stroke();
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

  // ensure move bounds
  charPoint.x = Math.max(0 + charRadius.value, Math.min(canvas.width - charRadius.value, charPoint.x));
  charPoint.y = Math.max(0 + charRadius.value, Math.min(canvas.height - charRadius.value, charPoint.y));
}

// line

const lineLength = ref(100);

function drawLine() {

  c.strokeStyle = lineColor;
  c.lineWidth = 3;
  c.beginPath();

  let lineHandlePoint;
  let projectedPoint;
  const timeDiff = Date.now() - animateTimestamp;
  if (timeDiff < animationSpeedMs.value) {
    // mid-swing animation
    const angleDiff = Math.abs(swingEndAngleInRadians - swingStartAngleInRadians);
    const angleByRatio = angleDiff * timeDiff / animationSpeedMs.value;
    const angleRadians = swingStartAngleInRadians + angleByRatio * swingDirection;
    lineHandlePoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 1.1, angleRadians);
    projectedPoint = projectPoint(charPoint.x, charPoint.y, lineLength.value, angleRadians);
  } else {
    if (animationOnGoing) {
      // animation end
      animationOnGoing = false;
      angleInDegrees.value = radianToDegrees(afterSwingAngleInRadians);
    }

    lineHandlePoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 1.1, angleInRadians.value + 0.45);
    projectedPoint = projectPoint(charPoint.x, charPoint.y, lineLength.value, angleInRadians.value + 0.45);
  }

  c.moveTo(lineHandlePoint.x, lineHandlePoint.y);
  c.lineTo(projectedPoint.x, projectedPoint.y);
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

// swing animation

let afterSwingAngleInRadians = 0;
let swingStartAngleInRadians = 0;
let swingEndAngleInRadians = 0;
let swingDirection = -1;
let animationOnGoing = false;

function swingForward() {
  afterSwingAngleInRadians = angleInRadians.value;
  swingStartAngleInRadians = angleInRadians.value + 1.5;
  swingEndAngleInRadians = angleInRadians.value - 1.5;
  swingDirection = -1;
  swingAnimate();
}

function swingLeft() {
  afterSwingAngleInRadians = angleInRadians.value - Math.PI / 2;
  swingStartAngleInRadians = angleInRadians.value + 1;
  swingEndAngleInRadians = angleInRadians.value - 3;
  swingDirection = -1;
  swingAnimate();
}

function swingRight() {
  afterSwingAngleInRadians = angleInRadians.value + Math.PI / 2;
  swingStartAngleInRadians = angleInRadians.value - 1;
  swingEndAngleInRadians = angleInRadians.value + 3;
  swingDirection = 1;
  swingAnimate();
}

function swingBackwards() {
  afterSwingAngleInRadians = angleInRadians.value - Math.PI;
  swingStartAngleInRadians = angleInRadians.value + 1;
  swingEndAngleInRadians = angleInRadians.value - Math.PI - 1;
  swingDirection = -1;
  swingAnimate();
}

const animationSpeedMs = ref(350);
let animateTimestamp = Date.now();

function swingAnimate() {
  animateTimestamp = Date.now();
  animationOnGoing = true;
}

// mouse handlers

const mouseDownPos = { x: 0, y: 0 };

document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mouseDownPos.x = e.clientX - canvas.offsetLeft;
  mouseDownPos.y = e.clientY - canvas.offsetTop;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  const relativeX = e.clientX - canvas.offsetLeft;
  const deltaX = relativeX - mouseDownPos.x;
  const relativeY = e.clientY - canvas.offsetTop;
  const deltaY = relativeY - mouseDownPos.y;

  if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
    swingForward(); // click
  } else {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // sideways move
      if (deltaX > 0) {
        swingRight();
      } else {
        swingLeft();
      }
    } else {
      // upwards move
      if (deltaY < 0) {
        swingForward();
      } else {
        swingBackwards();
      }
    }
  }
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
</style>