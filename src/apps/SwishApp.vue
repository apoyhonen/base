<template>
  <table>
    <tr>

      <td>
        <table>
          <tr>

            <td>
              <p><b>Controls</b></p>
              <br>
              <p>WASD or Arrow Keys to move character.</p>
              <p>Mouse click or swipe (while holding button) to swipe with weapon.</p>
              <br>
              <p><b>Moves</b></p>
              <br>
              <p>
                Click / Swipe Up - frontal slash
                <br>
                Swipe Left - slash and turn to left
                <br>
                Swipe Right - slash and turn to right
                <br>
                Swipe Down - slash widely and turn around
              </p>
              <br><br>
            </td>
          </tr>

          <tr>

            <td>
              <b>Game</b>
              <br><br>
              <p>Points: {{ enemiesKilled }}</p>
              <p>Enemies: {{ enemiesSpawned - enemiesKilled - enemiesLost }}</p>
              <br><br>
              <p>Frame: {{ frameCount }}</p>
              <button class="controls-button" @click="isRunning = !isRunning">START / STOP</button>
              <br>
              <button class="controls-button" @click="resetGame">RESET</button>
              <br><br>
              <label for="enemySpeedMs">Enemy speed / sec (px):</label>
              <input id="enemySpeedMs" type="number" class="controls-input" v-model="enemySpeedPerSec" />
              <br>
              <label for="enemiesMaxAmount">Max enemies:</label>
              <input id="enemiesMaxAmount" type="number" class="controls-input" v-model="maxEnemies" />
              <br>
              <label for="enemySpawnMs">Enemy spawn time (ms):</label>
              <input id="enemySpawnMs" type="number" class="controls-input" v-model="enemySpawnTimerMs" />
            </td>

          </tr>
        </table>
      </td>

      <td>
        <h1>Swish</h1>
        <canvas id="swishCanvas" width="400" height="300" @auxclick.prevent="canvasSecondaryClicked" oncontextmenu="return false"></canvas>
        <br>

        <table><tr>
          <td v-for="n in charHealth" :key="'health-' + n" class="health-emoji">&#x1F496;</td>
          <td v-for="i in (initialHealth - charHealth)" :key="'skull-' + i" class="health-emoji">&#128128;</td>
        </tr></table>

        <br>
        <div v-if="gameFinished">
          <h2 style="color: darkred;">Game finished, you killed {{ enemiesKilled }} enemies!</h2>
          <button class="controls-button" @click="tryAgain">Try again!</button>
        </div>
      </td>

    </tr>
  </table>
</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { degreesToRadian, distanceBetweenPoints, projectPoint, radianToDegrees, } from "@/util/MathUtil";
import {
  angleLineByMoveDirections, angleToCoords,
  checkCollisions,
  enemiesMoved,
  initEnemies,
  moveEnemies,
  newEnemy, removeEnemies
} from "@/engines/SwishEngine";
import { downPressed, initKeyListeners, leftPressed, rightPressed, upPressed } from "@/util/KeysUtil";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("swishCanvas");
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight * 0.55;
  c = canvas.getContext("2d");

  resetGame();

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) {
    enemiesMoved();
    draw();
  }
})

let prevDrawTimestamp = null;

function draw() {
  frameCount.value++;

  clear();

  const currTimestamp = Date.now();
  if (currTimestamp - animateTimestamp >= animationSpeedMs.value) {
    if (prevDrawTimestamp) moveChar(currTimestamp - prevDrawTimestamp); // move char

    const angle = angleLineByMoveDirections(upPressed, rightPressed, downPressed, leftPressed);
    if (angle || angle === 0) angleInDegrees.value = angle; // set new angle by move direction
  }
  prevDrawTimestamp = currTimestamp;

  if (enemies.length < maxEnemies.value && currTimestamp - prevEnemySpawnTimestamp > enemySpawnTimerMs.value) {
    prevEnemySpawnTimestamp = currTimestamp;
    enemiesSpawned.value += newEnemy(canvas, enemies, charPoint);
  }

  moveEnemies(enemies, charPoint, charRadius.value * 0.3, enemySpeedPerSec.value);
  const enemiesHit = checkCollisions(enemies, lineHandlePoint, lineEndPoint, charPoint, charRadius.value);
  enemiesKilled.value += enemiesHit;

  checkDamage();

  drawChar();
  drawLine();
  drawEnemies();
  drawScore();

  if (isRunning.value && !gameFinished.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
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
const scoreColor = 'red';

let charPoint = { x: 0, y: 0 };
const defaultAngle = 270;
const angleInDegrees = ref(defaultAngle);
watch(angleInDegrees, () => {
  if (angleInDegrees.value < 0) angleInDegrees.value = 360 + angleInDegrees.value;
  if (angleInDegrees.value > 359) angleInDegrees.value = 0 + angleInDegrees.value - 360;
})

const angleInRadians = computed(() => degreesToRadian(angleInDegrees.value))

function drawScore() {
  let size = Math.floor(charRadius.value * 3);
  c.font = '' + size + 'px Arial'; // emoji size with font
  c.fillStyle = scoreColor;
  c.fillText('💀 ' + enemiesKilled.value, canvas.width - 130, 70);

  if (gameFinished.value) {
    size = Math.floor(charRadius.value * 5);
    c.font = '' + size + 'px Arial'; // emoji size with font

    c.fillStyle = scoreColor;
    c.fillText('Game over! 💀 ' + enemiesKilled.value, canvas.width / 2, canvas.height * 0.8);
  }
}

function canvasSecondaryClicked(e) {
  angleInDegrees.value = angleToCoords(e.clientX, e.clientY, charPoint, canvas);
}

const gameFinished = ref(false);

function tryAgain() {
  resetGame();
  draw();
}

function resetGame() {
  charPoint.x = canvas.width / 2;
  charPoint.y = canvas.height / 2;
  charRadius.value = canvas.height / 30;
  charSpeedPerSec.value = charRadius.value * 15;
  enemySpeedPerSec.value = Math.floor(charSpeedPerSec.value * 0.4);
  enemySpawnTimerMs.value = enemySpawnMsDefault;
  lineLength.value = charRadius.value * 4;

  charHealth.value = initialHealth;

  enemiesSpawned.value = initEnemies(canvas, enemies, charPoint);
  enemiesKilled.value = 0;
  enemiesLost.value = 0;

  gameFinished.value = false;
  isRunning.value = true;
}

function gameOver() {
  gameFinished.value = true;
}

// character

const charRadius = ref(20);
const charSpeedPerSec = ref(charRadius.value);
const initialHealth = 10;
const charHealth = ref(initialHealth);

function drawChar() {
  c.fillStyle = charColor;
  c.beginPath();
  c.arc(charPoint.x, charPoint.y, charRadius.value * 0.6, 0, Math.PI * 2);
  c.fill();

  c.lineCap = "round";
  c.strokeStyle = charColor;
  c.lineWidth = charRadius.value / 3;

  let armStartPoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 0.5, angleInRadians.value + Math.PI / 2.2);
  let armEndPoint = projectPoint(charPoint.x, charPoint.y, charRadius.value, angleInRadians.value + Math.PI / 4);

  c.beginPath();
  c.moveTo(armStartPoint.x, armStartPoint.y);
  c.lineTo(armEndPoint.x, armEndPoint.y);
  c.stroke();

  armStartPoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 0.5, angleInRadians.value - Math.PI / 2.2);
  armEndPoint = projectPoint(charPoint.x, charPoint.y, charRadius.value, angleInRadians.value - Math.PI / 4);

  c.beginPath();
  c.moveTo(armStartPoint.x, armStartPoint.y);
  c.lineTo(armEndPoint.x, armEndPoint.y);
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

// enemies

const enemies = [];

const enemySpawnMsDefault = 2000;
const enemySpawnTimerMs = ref(enemySpawnMsDefault);
const maxEnemies = ref(10);
const enemiesSpawned = ref(0);
const enemiesKilled = ref(0);
const enemiesLost = ref(0);
const enemySpeedPerSecDefault = 120;
const enemySpeedPerSec = ref(enemySpeedPerSecDefault);
let prevEnemySpawnTimestamp = Date.now();

function drawEnemies() {
  const size = Math.floor(charRadius.value);
  c.font = '' + size + 'px serif'; // emoji size with font
  c.textAlign = "center"; // align to given coords
  c.textBaseline = "middle"; // align to given coords
  enemies.forEach(enemy => c.fillText('💀', enemy.x, enemy.y));
}

function checkDamage() {
  const damagingEnemies = enemies.filter(enemy => distanceBetweenPoints(charPoint.x, charPoint.y, enemy.x, enemy.y) < charRadius.value * (0.6 + 0.5));
  if (damagingEnemies.length > 0) {
    charHealth.value--;
    removeEnemies(enemies, damagingEnemies);
  }

  enemiesLost.value += damagingEnemies.length;

  if (charHealth.value <= 0) gameOver();
}

// line

const lineLength = ref(100);
let lineHandlePoint = { x: 0, y: 0 };
let lineEndPoint = { x: 0, y: 0 };

function drawLine() {
  c.strokeStyle = lineColor;
  c.lineWidth = 3;
  c.beginPath();

  const timeDiff = Date.now() - animateTimestamp;
  if (timeDiff < animationSpeedMs.value) {
    // mid-swing animation
    const angleDiff = Math.abs(swingEndAngleInRadians - swingStartAngleInRadians);
    const angleByRatio = angleDiff * timeDiff / animationSpeedMs.value;
    const angleRadians = swingStartAngleInRadians + angleByRatio * swingDirection;
    lineHandlePoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 1.1, angleRadians);
    lineEndPoint = projectPoint(charPoint.x, charPoint.y, lineLength.value, angleRadians);
  } else {
    if (animationOnGoing) {
      // animation end
      animationOnGoing = false;
      angleInDegrees.value = radianToDegrees(afterSwingAngleInRadians);
    }

    lineHandlePoint = projectPoint(charPoint.x, charPoint.y, charRadius.value * 1.1, angleInRadians.value + Math.PI / 4);
    lineEndPoint = projectPoint(charPoint.x, charPoint.y, lineLength.value, angleInRadians.value + 0.45);
  }

  c.moveTo(lineHandlePoint.x, lineHandlePoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();
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

initKeyListeners(document, 'swishCanvas');

</script>

<style scoped>
canvas {
  background: lightgray;
}

.health-emoji {
  position: relative;
  width: 10px;
  font-size: 30px;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 60px;
}

/* disable text selection, causes trouble with mouse controls */
table,
table *,
table * * {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
</style>