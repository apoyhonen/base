<template>
  <table>
    <tr>

      <td>
        <p><b>Controls</b></p>
        <br>
        <p>Click, drag and release cue stick to launch ball.</p>
        <p>Longer drag results in sharper hit.</p>
        <br><br>

        <b>Game</b>
        <br><br>
        <p>Balls left: 0</p>
        <br><br>
        <button class="controls-button" @click="resetGame">RESET</button>
        <br><br>

        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <br>
        <button @click="isRunning = !isRunning">START / STOP</button>
      </td>

      <td>
        <h1>Pool</h1>
        <canvas v-bind:id="canvasName" width="400" height="300"></canvas>
      </td>

    </tr>
  </table>
  <br>
  <p>Mouse position: x: {{ mousePos.x }}, y: {{ mousePos.y }}</p>
  <p v-if="mousePressed" style="color: red; font-size: 30px;">Mouse pressed!</p>
  <div>
  </div>
</template>

<script setup>

import { onMounted, ref, watch } from "vue";
import {
  angleBetweenPointsRadian,
  circleCollisionMovingAndStationary,
  circleCollisionTwoMoving,
  distanceBetweenPoints,
  isCircleCollision,
  isRectCircleCollision, isTriangleCircleCollision,
  projectPoint,
  randomBetween
} from "@/util/MathUtil";
import { getCanvasMouseEventOffsetPos } from "@/util/LayoutUtil";
import { clearArray, removeItem } from "@/util/ArrayUtil";
import { getPoolEquipmentSizes, getPoolTableDecorationSizes, getPoolTableSizes } from "@/engines/pool/PoolSizes";

const canvasName = 'poolCanvas';
let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById(canvasName);
  canvas.width = (window.innerWidth - 200) * 0.7;
  canvas.height = window.innerHeight * 0.8;
  c = canvas.getContext("2d");

  tableWidth = canvas.width * 0.75;

  const tableSizes = getPoolTableSizes(tableWidth);
  const decorationSizes = getPoolTableDecorationSizes(tableWidth);
  tableHeight = tableSizes.tableHeight;
  railSize = tableSizes.railWidth;
  playAreaWidth = tableSizes.playAreaWidth;
  playAreaHeight = tableSizes.playAreaHeight;
  cushionSize = tableSizes.cushionWidth;
  mouthCushionSize = tableSizes.mouthCushionWidth;
  pocketRadius = tableSizes.pocketRadius;

  diamondCenterSizeFromNose = decorationSizes.diamondCenterFromNose;
  diamondLength = decorationSizes.diamondLength;
  diamondWidth = decorationSizes.diamondWidth;

  tableStartX = canvas.width / 2 - tableWidth / 2;
  tableStartY = canvas.height / 2 - tableHeight / 2;

  createRails();
  createCushions();
  createDecorations();
  createPockets();

  headPos.x = tableStartX + railSize + (cushionSize + playAreaWidth) / 4 * 3;
  headPos.y = tableStartY + tableHeight / 2;
  resetCueBallPos();

  const equipmentSizes = getPoolEquipmentSizes(tableWidth);
  ballRadius = equipmentSizes.ballRadius;
  cueStickLength = equipmentSizes.stickLength;
  cueStickBaseWidthRadius = equipmentSizes.stickBaseRadius;
  cueStickTipWidthRadius = equipmentSizes.stickTipRadius;

  maxBallSpeedPerSec = tableWidth * 0.75;
  ballDampeningPerSec = tableWidth / 3000;
  cueStickMaxDrawingDistance = cueStickLength * 0.3;

  createBalls();

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

  const currTimestamp = Date.now();
  // eslint-disable-next-line no-unused-vars
  const differenceMs = currTimestamp - prevDrawTimestamp;
  moveBalls(differenceMs);
  prevDrawTimestamp = currTimestamp;

  drawTable();
  drawBalls();
  if (cueBall && !isAnyBallMoving()) drawCueStick();
  drawHintLine();

  checkCollisions(differenceMs);

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

// game

const tableColor = 'seagreen';
const railColor = 'brown';
const tableCushionColor = 'green';
const diamondColor = 'silver';
const pocketColor = 'black';
const cueStickHandleColor = 'brown';
const cueStickMainColor = 'burlywood';

function resetGame() {
  clearArray(balls);

  resetCueBallPos();
  createBalls();
}

function checkCollisions(differenceMs) {
  const ballsToRemove = [];
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    if (isPocketsCollision(ball.x, ball.y, ballRadius)) {
      ballsToRemove.push(ball);
      ball.isMoving = false;

      if (ball.value === 0) {
        cueBall = null;
        resetCueBallPos();
      }
    }

    if (isCushionsRailsCollision(ball.x, ball.y, ballRadius)) {
      if (!isCushionsRailsCollision(ball.x - 5, ball.y, ballRadius) || !isCushionsRailsCollision(ball.x + 5, ball.y, ballRadius)) {
        ball.speedPerSecX *= -1;
        ball.x += ball.speedPerSecX / 1000 * differenceMs * 2;
      } else if (!isCushionsRailsCollision(ball.x, ball.y - 5, ballRadius) || !isCushionsRailsCollision(ball.x, ball.y + 5, ballRadius)) {
        ball.speedPerSecY *= -1;
        ball.y += ball.speedPerSecY / 1000 * differenceMs * 2;
      }
    }

    const ballCollidedWith = getAnyBallCollidedWith(ball.x, ball.y, ballRadius, ball.ballId);
    if (ballCollidedWith) {
      if (!ball.isColliding) { // if not already colliding
        ball.isColliding = true;
        ballCollidedWith.isColliding = true;

        if (ballCollidedWith.isMoving && ball.isMoving) {
          const collisionInfo = circleCollisionTwoMoving(ball.speedPerSecX, ball.speedPerSecY, ballCollidedWith.speedPerSecX, ballCollidedWith.speedPerSecY);

          ball.speedPerSecX = collisionInfo.firstDx;
          ball.x += ball.speedPerSecX / 1000 * differenceMs * 2;
          ball.speedPerSecY = collisionInfo.firstDy;
          ball.y += ball.speedPerSecY / 1000 * differenceMs * 2;

          ballCollidedWith.speedPerSecX = collisionInfo.secondDx;
          ballCollidedWith.x += ballCollidedWith.speedPerSecX / 1000 * differenceMs * 2;
          ballCollidedWith.speedPerSecY = collisionInfo.secondDy;
          ballCollidedWith.y += ballCollidedWith.speedPerSecY / 1000 * differenceMs * 2;

        } else if (ballCollidedWith.isMoving || ball.isMoving) {
          const movingBall = ball.isMoving ? ball : ballCollidedWith;
          const stationaryBall = ball.isMoving ? ballCollidedWith : ball;
          const collisionInfo = circleCollisionMovingAndStationary(
              movingBall.x, movingBall.y, movingBall.speedPerSecX, movingBall.speedPerSecY,
              stationaryBall.x, stationaryBall.y, { staticSecond: false });

          movingBall.speedPerSecX = collisionInfo.movingDx;
          movingBall.x += movingBall.speedPerSecX / 1000 * differenceMs * 2;
          movingBall.speedPerSecY = collisionInfo.movingDy;
          movingBall.y += movingBall.speedPerSecY / 1000 * differenceMs * 2;

          stationaryBall.speedPerSecX = collisionInfo.stationaryDx;
          stationaryBall.x += stationaryBall.speedPerSecX / 1000 * differenceMs * 2;
          stationaryBall.speedPerSecY = collisionInfo.stationaryDy;
          stationaryBall.y += stationaryBall.speedPerSecY / 1000 * differenceMs * 2;
          stationaryBall.isMoving = true;

        } else {
          console.log("Something went wrong: non-moving balls collision");
          console.log("ballId: " + ball.ballId + ', dx: ' + ball.speedPerSecX + ', dy: ' + ball.speedPerSecY);
          console.log("otherId: " + ballCollidedWith.ballId + ', dx: ' + ballCollidedWith.speedPerSecX + ', dy: ' + ballCollidedWith.speedPerSecY);
        }

        // nudge both circles away from each other

        const collisionAngle = angleBetweenPointsRadian(ball.x, ball.y, ballCollidedWith.x, ballCollidedWith.y);
        const magnitude = maxBallSpeedPerSec / 1000 * differenceMs * 2;

        const ballPoint = projectPoint(ball.x, ball.y, magnitude, collisionAngle - Math.PI);
        ball.x = ballPoint.x;
        ball.y = ballPoint.y;

        const ballCollidedWithPoint = projectPoint(ballCollidedWith.x, ballCollidedWith.y, magnitude, collisionAngle);
        ballCollidedWith.x = ballCollidedWithPoint.x;
        ballCollidedWith.y = ballCollidedWithPoint.y;
      }
    } else if (ball.isColliding) {
      ball.isColliding = false; // not colliding anymore
    }

    if (ball.x < 0 || ball.x > canvas.width || ball.y < 0 || ball.y > canvas.height) ballsToRemove.push(ball);
  }

  for (let i = 0; i < ballsToRemove.length; i++) {
    const ball = ballsToRemove[i];
    removeBall(ball);
  }
}

// table

let tableWidth = 100;
let tableHeight = 100;
let playAreaWidth = 80;
let playAreaHeight = 80;
let railSize = 10;
let cushionSize = 10;
let mouthCushionSize = 5;
let pocketRadius = 5;
let tableStartX = 0;
let tableStartY = 0;
let diamondCenterSizeFromNose = 1;
let diamondLength = 2;
let diamondWidth = 1;

const rails = [];
const pockets = [];
const cushions = [];
const cushionMouthPieces = [];
const diamondPositions = [];

function drawTable() {
  c.fillStyle = tableColor;
  c.beginPath();
  c.roundRect(tableStartX, tableStartY, tableWidth, tableHeight, pocketRadius);
  c.fill();

  drawRails();
  drawCushions();
  drawDecorations();
  drawPockets();
}

function createRails() {
  rails.push({ x: tableStartX, y: tableStartY, width: tableWidth, height: railSize })
  rails.push({ x: tableStartX, y: tableStartY, width: railSize, height: tableHeight })
  rails.push({ x: tableStartX, y: tableStartY + tableHeight - railSize, width: tableWidth, height: railSize })
  rails.push({ x: tableStartX + tableWidth - railSize, y: tableStartY, width: railSize, height: tableHeight })

}

function createCushions() {
  const horizontalCushionLength = (playAreaWidth - pocketRadius * 2 - mouthCushionSize * 4) / 2 - 3;
  const verticalCushionLength = playAreaHeight - mouthCushionSize * 2 - 4;

  // top horizontal first
  let cushionX = tableStartX + railSize + pocketRadius + mouthCushionSize;
  let cushionY = tableStartY + railSize;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX - mouthCushionSize, triangleThreeY: cushionY })
  cushions.push({ x: cushionX, y: cushionY, width: horizontalCushionLength, height: cushionSize })
  cushionMouthPieces.push({
    triangleOneX: cushionX + horizontalCushionLength, triangleOneY: cushionY,
    triangleTwoX: cushionX + horizontalCushionLength + mouthCushionSize, triangleTwoY: cushionY,
    triangleThreeX: cushionX + horizontalCushionLength, triangleThreeY: cushionY + cushionSize })

  // top horizontal second
  cushionX = cushionX + pocketRadius * 2 + horizontalCushionLength + mouthCushionSize * 2;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX - mouthCushionSize, triangleThreeY: cushionY })
  cushions.push({ x: cushionX, y: cushionY, width: horizontalCushionLength, height: cushionSize })
  cushionMouthPieces.push({
    triangleOneX: cushionX + horizontalCushionLength, triangleOneY: cushionY,
    triangleTwoX: cushionX + horizontalCushionLength + mouthCushionSize, triangleTwoY: cushionY,
    triangleThreeX: cushionX + horizontalCushionLength, triangleThreeY: cushionY + cushionSize })

  // left vertical
  cushionX = tableStartX + railSize;
  cushionY = tableStartY + railSize + pocketRadius + mouthCushionSize;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX, triangleTwoY: cushionY - mouthCushionSize,
    triangleThreeX: cushionX + cushionSize, triangleThreeY: cushionY })
  cushions.push({ x: cushionX, y: cushionY, width: cushionSize, height: verticalCushionLength })
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY + verticalCushionLength,
    triangleTwoX: cushionX + cushionSize, triangleTwoY: cushionY + verticalCushionLength,
    triangleThreeX: cushionX, triangleThreeY: cushionY + verticalCushionLength + mouthCushionSize })

  // bottom horizontal first
  cushionX = tableStartX + railSize + pocketRadius + mouthCushionSize;
  cushionY = tableStartY + tableHeight - railSize - cushionSize;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX - mouthCushionSize, triangleThreeY: cushionY + cushionSize })
  cushions.push({ x: cushionX, y: cushionY, width: horizontalCushionLength, height: cushionSize })
  cushionMouthPieces.push({
    triangleOneX: cushionX + horizontalCushionLength, triangleOneY: cushionY,
    triangleTwoX: cushionX + horizontalCushionLength + mouthCushionSize, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX + horizontalCushionLength, triangleThreeY: cushionY + cushionSize })

  // bottom horizontal second
  cushionX = cushionX + pocketRadius * 2 + horizontalCushionLength + mouthCushionSize * 2;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX - mouthCushionSize, triangleThreeY: cushionY + cushionSize })
  cushions.push({ x: cushionX, y: cushionY, width: horizontalCushionLength, height: cushionSize })
  cushionMouthPieces.push({
    triangleOneX: cushionX + horizontalCushionLength, triangleOneY: cushionY,
    triangleTwoX: cushionX + horizontalCushionLength + mouthCushionSize, triangleTwoY: cushionY + cushionSize,
    triangleThreeX: cushionX + horizontalCushionLength, triangleThreeY: cushionY + cushionSize })

  // right vertical
  cushionX = tableStartX + tableWidth - railSize - cushionSize;
  cushionY = tableStartY + railSize + pocketRadius + mouthCushionSize;
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY,
    triangleTwoX: cushionX + cushionSize, triangleTwoY: cushionY - mouthCushionSize,
    triangleThreeX: cushionX + cushionSize, triangleThreeY: cushionY })
  cushions.push({ x: cushionX, y: cushionY, width: cushionSize, height: verticalCushionLength })
  cushionMouthPieces.push({
    triangleOneX: cushionX, triangleOneY: cushionY + verticalCushionLength,
    triangleTwoX: cushionX + cushionSize, triangleTwoY: cushionY + verticalCushionLength,
    triangleThreeX: cushionX + cushionSize, triangleThreeY: cushionY + verticalCushionLength + mouthCushionSize })
}

function createDecorations() {
  // sights / diamonds
  const withoutRailsStartX = tableStartX + railSize;
  const withoutRailsStartY = tableStartY + railSize;
  for (let i = 1; i < 8; i++) {
    if (i === 4) continue;
    diamondPositions.push({ isVertical: true, x: withoutRailsStartX + (cushionSize * 2 + playAreaWidth) / 8 * i, y: withoutRailsStartY + cushionSize - diamondCenterSizeFromNose });
    diamondPositions.push({ isVertical: true, x: withoutRailsStartX + (cushionSize * 2 + playAreaWidth) / 8 * i, y: withoutRailsStartY + cushionSize + playAreaHeight + diamondCenterSizeFromNose });
  }
  for (let i = 1; i < 4; i++) {
    diamondPositions.push({ isVertical: false, x: withoutRailsStartX + cushionSize - diamondCenterSizeFromNose, y: withoutRailsStartY + (cushionSize * 2 + playAreaHeight) / 4 * i });
    diamondPositions.push({ isVertical: false, x: withoutRailsStartX + cushionSize + playAreaWidth + diamondCenterSizeFromNose, y: withoutRailsStartY + (cushionSize * 2 + playAreaHeight) / 4 * i });
  }
}

function isCushionsRailsCollision(x, y, radius) {
  let isCollision = false;
  for (let i = 0; i < cushions.length; i++) {
    const cushion = cushions[i];
    if (isRectCollision(cushion, x, y, radius)) {
      isCollision = true;
      break;
    }
  }

  if (!isCollision) { // cushion mouth collision
    for (let i = 0; i < cushionMouthPieces.length; i++) {
      const piece = cushionMouthPieces[i];
      if (isTriangleCircleCollision(
          piece.triangleOneX, piece.triangleOneY,
          piece.triangleTwoX, piece.triangleTwoY,
          piece.triangleThreeX, piece.triangleThreeY,
          x, y, radius)) {
        isCollision = true;
        break;
      }
    }
  }

  if (!isCollision) { // backup rails collision
    for (let i = 0; i < rails.length; i++) {
      const rail = rails[i];
      if (isRectCollision(rail, x, y, radius)) {
        isCollision = true;
        break;
      }
    }
  }

  return isCollision;
}

function isRectCollision(rail, x, y, radius) {
  return isRectCircleCollision(rail.x, rail.y, rail.width, rail.height, x, y, radius);
}

function drawRails() {
  c.fillStyle = railColor;
  rails.forEach(rail => {
    c.beginPath();
    c.roundRect(rail.x, rail.y, rail.width, rail.height, pocketRadius);
    c.fill();
  });
}

function drawCushions() {
  c.fillStyle = tableCushionColor;
  cushions.forEach(cushion => c.fillRect(cushion.x, cushion.y, cushion.width, cushion.height));
  cushionMouthPieces.forEach(piece => {
    c.beginPath();
    c.moveTo(piece.triangleOneX, piece.triangleOneY);
    c.lineTo(piece.triangleTwoX, piece.triangleTwoY);
    c.lineTo(piece.triangleThreeX, piece.triangleThreeY);
    c.fill();
  })
}

function drawDecorations() {
  // sights / diamonds
  c.fillStyle = diamondColor;
  diamondPositions.forEach(diamond => {
    c.beginPath();
    if (diamond.isVertical) {
      c.moveTo(diamond.x, diamond.y - diamondLength / 2);
      c.lineTo(diamond.x + diamondWidth / 2, diamond.y);
      c.lineTo(diamond.x, diamond.y + diamondLength / 2);
      c.lineTo(diamond.x - diamondWidth / 2, diamond.y);
    } else {
      c.moveTo(diamond.x, diamond.y - diamondWidth / 2);
      c.lineTo(diamond.x + diamondLength / 2, diamond.y);
      c.lineTo(diamond.x, diamond.y + diamondWidth / 2);
      c.lineTo(diamond.x - diamondLength / 2, diamond.y);
    }
    c.fill();
  })

  // head & foot
  c.beginPath();
  c.arc(tableStartX + railSize + (cushionSize + playAreaWidth) / 4, tableStartY + tableHeight / 2, diamondWidth / 2, 0, Math.PI * 2);
  c.fill();

  c.beginPath();
  c.arc(tableStartX + railSize + (cushionSize + playAreaWidth) / 4 * 3, tableStartY + tableHeight / 2, diamondWidth / 2, 0, Math.PI * 2);
  c.fill();
}

function createPockets() {
  pockets.push({ x: tableStartX + railSize, y: tableStartY + railSize })
  pockets.push({ x: tableStartX + railSize, y: tableStartY + tableHeight - railSize })
  pockets.push({ x: tableStartX + tableWidth / 2, y: tableStartY + railSize })
  pockets.push({ x: tableStartX + tableWidth / 2, y: tableStartY + tableHeight - railSize })
  pockets.push({ x: tableStartX + tableWidth - railSize, y: tableStartY + railSize })
  pockets.push({ x: tableStartX + tableWidth - railSize, y: tableStartY + tableHeight - railSize })
}

function isPocketsCollision(x, y, radius) {
  let isCollision = false;
  for (let i = 0; i < pockets.length; i++) {
    const pocket = pockets[i];
    if (distanceBetweenPoints(x, y, pocket.x, pocket.y) <= radius + pocketRadius) isCollision = true;
  }
  return isCollision;
}

function drawPockets() {
  c.fillStyle = pocketColor;

  for (let i = 0; i < pockets.length; i++) {
    const pocket = pockets[i];
    c.beginPath();
    c.arc(pocket.x, pocket.y, pocketRadius, 0, 2*Math.PI);
    c.fill();
  }
}

// balls (cue-ball & numbers 1-9)

const ballColors = [];
ballColors.push({ color: 'white', oneColored: true }); // white cue-ball

ballColors.push({ color: 'yellow', oneColored: true }); // numbered 1-7 one-color
ballColors.push({ color: 'blue', oneColored: true });
ballColors.push({ color: 'red', oneColored: true });
ballColors.push({ color: 'purple', oneColored: true });
ballColors.push({ color: 'orange', oneColored: true });
ballColors.push({ color: 'green', oneColored: true });
ballColors.push({ color: 'maroon', oneColored: true });

ballColors.push({ color: 'black', oneColored: true }); // black 8-ball

ballColors.push({ color: 'yellow', oneColored: false }); // numbered 9-15 striped
ballColors.push({ color: 'blue', oneColored: false });
ballColors.push({ color: 'red', oneColored: false });
ballColors.push({ color: 'purple', oneColored: false });
ballColors.push({ color: 'orange', oneColored: false });
ballColors.push({ color: 'green', oneColored: false });
ballColors.push({ color: 'maroon', oneColored: false });

let ballRadius = 7;
let maxBallSpeedPerSec = 10;
let ballDampeningPerSec = 1;
const headPos = { x: 0, y: 0 };
const cueBallPos = { x: 0, y: 0 };

function resetCueBallPos() {
  cueBallPos.x = headPos.x;
  cueBallPos.y = headPos.y;
}

let ballId = 0;
let cueBall = null;
// TODO 8-ball implementation
// eslint-disable-next-line no-unused-vars
let eightBall = null;
const balls = [];

function createBalls() {
  createCueBall();

  for (let i = 1; i < 15; i++) {
    const ballColor = ballColors[i];
    const ball = createBall(i, ballColor.color, ballColor.oneColored);
    balls.push(ball);

    if (i === 8) eightBall = ball;
  }
}

function createBall(value, ballColor, oneColored) {
  let randomX = randomBetween(tableStartX, tableStartX + tableWidth);
  let randomY = randomBetween(tableStartY, tableStartY + tableHeight);

  while (
      isCushionsRailsCollision(randomX, randomY, ballRadius)
      || getAnyBallCollidedWith(randomX, randomY, ballRadius)
      || isPocketsCollision(randomX, randomY, ballRadius)
      || isCloseToMid(randomX, randomY, ballRadius)
      ) {
    // randomize new coords
    randomX = randomBetween(tableStartX, tableStartX + tableWidth);
    randomY = randomBetween(tableStartY, tableStartY + tableHeight);
  }

  return { x: randomX, y: randomY, ballId: ballId++, value: value, color: ballColor, oneColored: oneColored,
    isMoving: false, isColliding: false, speedPerSecX: 0, speedPerSecY: 0 };
}

function createCueBall() {
  // clear possible old cue-balls
  const cueBalls = [];
  balls.forEach(ball => {
    if (ball.value === 0) cueBalls.push(ball)
  });
  cueBalls.forEach(cueBall => removeBall(cueBall));

  // create new cue-ball
  const cueBallColor = ballColors[0];
  cueBall = { x: tableStartX + railSize + (cushionSize + playAreaWidth) / 4 * 3, y: tableStartY + tableHeight / 2,
    ballId: ballId++, value: 0, color: cueBallColor.color, oneColored: cueBallColor.oneColored,
    isMoving: false, speedPerSecX: 0, speedPerSecY: 0 };
  balls.push(cueBall);
}

function isCloseToMid(x, y, radius) {
  return isCircleCollision(x, y, radius, headPos.x, headPos.y, radius * 9);
}

const ballMinMoveSpeedPx = 2;

function moveBalls(differenceMs) {
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.isMoving || ball.isColliding) {
      if (ball.speedPerSecX !== 0) {
        ball.x += ball.speedPerSecX / 1000 * differenceMs;
        ball.speedPerSecX += getBallSpeedDampening(differenceMs, ball.speedPerSecX);
        if (Math.abs(ball.speedPerSecX) < ballMinMoveSpeedPx) {
          ball.speedPerSecX = 0;
        }
      }

      if (ball.speedPerSecY !== 0) {
        ball.y += ball.speedPerSecY / 1000 * differenceMs;
        ball.speedPerSecY += getBallSpeedDampening(differenceMs, ball.speedPerSecY);
        if (Math.abs(ball.speedPerSecY) < ballMinMoveSpeedPx) {
          ball.speedPerSecY = 0;
        }
      }

      if (ball.speedPerSecX === 0 && ball.speedPerSecY === 0) {
        ball.isMoving = false;
        if (ball.value === 0) cueBall = null;
      }
    }
  }

  if (!isAnyBallMoving() && !cueBall) {
    createCueBall();
  }
}

function getBallSpeedDampening(differenceMs, number) {
  return number * -1 * ballDampeningPerSec / 1000 * differenceMs;
}

function isAnyBallMoving() {
  let anyBallMoving = false;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ball.isMoving) anyBallMoving = true;
  }
  return anyBallMoving;
}

function removeBall(ball) {
  removeItem(balls, ball);
}

function getAnyBallCollidedWith(x, y, radius, ballId = -1) {
  let ballCollidedWith = null;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];
    if (ballId === ball.ballId) continue;
    if (isCircleCollision(x, y, radius, ball.x, ball.y)) ballCollidedWith = ball;
  }
  return ballCollidedWith;
}

function drawBalls() {
  c.strokeStyle = 'black';
  c.lineWidth = 1;
  for (let i = 0; i < balls.length; i++) {
    const ball = balls[i];

    if (ball.value < 9) {
      // fill with single color
      c.fillStyle = ball.color; // actual ball color
      c.beginPath();
      c.arc(ball.x, ball.y, ballRadius, 0, 2*Math.PI);
      c.fill();
      c.stroke(); // slight border around for distinction
    } else {
      // stripes arced path

      // actual ball color
      c.fillStyle = 'white';
      c.beginPath();
      c.arc(ball.x, ball.y, ballRadius, 0, 2*Math.PI);
      c.fill();

      // colored stripe
      c.fillStyle = ball.color;
      c.beginPath();

      const firstAngle = Math.PI / 4;
      const secondAngle = firstAngle * 3;
      const thirdAngle = firstAngle * 5;
      const fourthAngle = firstAngle * 7;

      const startPoint = projectPoint(ball.x, ball.y, ballRadius, firstAngle);
      c.moveTo(startPoint.x, startPoint.y);
      const secondPoint = projectPoint(ball.x, ball.y, ballRadius, secondAngle);
      c.lineTo(secondPoint.x, secondPoint.y);
      c.arc(ball.x, ball.y, ballRadius, secondAngle, thirdAngle);
      const fourthPoint = projectPoint(ball.x, ball.y, ballRadius, fourthAngle);
      c.lineTo(fourthPoint.x, fourthPoint.y);
      c.arc(ball.x, ball.y, ballRadius, fourthAngle, firstAngle);
      c.fill();
      c.stroke();

      // slight border around for distinction
      c.beginPath();
      c.arc(ball.x, ball.y, ballRadius, 0, 2*Math.PI);
      c.stroke();
    }

    if (ball.value !== 0) {
      c.fillStyle = 'white'; // number-surrounding circle
      c.beginPath();
      c.arc(ball.x, ball.y, ballRadius * 0.55, 0, 2 * Math.PI);
      c.fill();

      c.fillStyle = 'black'; // actual number
      c.font = '' + ballRadius * 0.9 + 'px Arial'; // emoji size with font
      const xNudge = ball.value < 10 ? 3 : -1;
      c.fillText(ball.value, ball.x - ballRadius / 2 + xNudge, ball.y + ballRadius / 2 - 2);
    }
  }
}

// cue-stick

let cueStickLength = 70;
let cueStickBaseWidthRadius = 5;
// eslint-disable-next-line no-unused-vars
let cueStickTipWidthRadius = 3;
let cueAngleRadian = 0;
let cueStickMaxDrawingDistance = 20;

function drawCueStick() {
  c.lineCap = 'round';
  c.lineWidth = cueStickBaseWidthRadius;

  let cueCenteringPos;
  if (mousePressedPos) {
    const mousePressToBallDistance = distanceBetweenPoints(cueBallPos.x, cueBallPos.y, mousePressedPos.x, mousePressedPos.y);
    const distance = Math.max(0, Math.min(
        cueStickMaxDrawingDistance,
        distanceBetweenPoints(cueBallPos.x, cueBallPos.y, mousePos.value.x, mousePos.value.y) - mousePressToBallDistance));
    cueCenteringPos = projectPoint(cueBallPos.x, cueBallPos.y, distance, cueAngleRadian);
  } else {
    cueCenteringPos = cueBallPos;
  }

  c.strokeStyle = cueStickMainColor;
  let lineStartPoint = projectPoint(cueCenteringPos.x, cueCenteringPos.y, ballRadius * 2, cueAngleRadian);
  let lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 0.7, cueAngleRadian);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();

  c.strokeStyle = cueStickHandleColor;
  lineStartPoint = lineEndPoint;
  lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 0.3, cueAngleRadian);

  c.beginPath();
  c.moveTo(lineStartPoint.x, lineStartPoint.y);
  c.lineTo(lineEndPoint.x, lineEndPoint.y);
  c.stroke();
}

const isDrawHintLine = true;

function drawHintLine() {
  if (isDrawHintLine && mousePressedPos) {
    const cueBallAngleRadian = angleBetweenPointsRadian(mousePressedPos.x, mousePressedPos.y, cueBallPos.x, cueBallPos.y);

    c.lineCap = 'round';
    c.lineWidth = 1;
    c.strokeStyle = 'grey';

    let lineStartPoint = projectPoint(cueBallPos.x, cueBallPos.y, ballRadius * 2, cueBallAngleRadian);
    let lineEndPoint = projectPoint(lineStartPoint.x, lineStartPoint.y, cueStickLength * 2, cueBallAngleRadian);

    c.beginPath();
    c.moveTo(lineStartPoint.x, lineStartPoint.y);
    c.lineTo(lineEndPoint.x, lineEndPoint.y);
    c.stroke();
  }
}

// mouse handlers

const mousePos = ref({ x: 0, y: 0 })
let mousePressed = ref(false);
let mousePressedPos = null;

document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener("mousedown", mouseDownHandler, false);
document.addEventListener("mouseup", mouseUpHandler, false);

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  mousePos.value = getCanvasMouseEventOffsetPos(e, canvas, true);
  cueAngleRadian = angleBetweenPointsRadian(cueBallPos.x, cueBallPos.y, mousePos.value.x, mousePos.value.y);

  if (mousePressedPos) {
    const oldDistance = distanceBetweenPoints(cueBallPos.x, cueBallPos.y, mousePressedPos.x, mousePressedPos.y);
    const newDistance = distanceBetweenPoints(cueBallPos.x, cueBallPos.y, mousePos.value.x, mousePos.value.y);
    if (oldDistance > newDistance) mousePressedPos = mousePos.value; // more natural cue-stick grabbing
  }
}

function mouseDownHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  mousePressed.value = true;
  mousePressedPos = mousePos.value;
}

function mouseUpHandler(e) {
  if (!isAppActive() || e.which !== 1) return;

  if (cueBall && !isAnyBallMoving() && mousePressedPos) {
    const mousePressedDistance = distanceBetweenPoints(cueBallPos.x, cueBallPos.y, mousePressedPos.x, mousePressedPos.y);
    const angledMousePressedPoint = projectPoint(cueBallPos.x, cueBallPos.y, mousePressedDistance, cueAngleRadian);
    const drawDistance = distanceBetweenPoints(angledMousePressedPoint.x, angledMousePressedPoint.y, mousePos.value.x, mousePos.value.y);
    if (drawDistance > 3) {
      // launch cue-ball
      const speedDrawFactor = 0.3 + drawDistance / cueStickMaxDrawingDistance * 0.7;
      cueBall.speedPerSecX = Math.cos(cueAngleRadian + Math.PI) * maxBallSpeedPerSec * speedDrawFactor;
      cueBall.speedPerSecY = Math.sin(cueAngleRadian + Math.PI) * maxBallSpeedPerSec * speedDrawFactor;
      cueBall.isMoving = true;
      //balls.forEach(ball => ball.isMoving = true);
    }
  }

  mousePressed.value = false;
  mousePressedPos = null;
}

</script>

<style scoped>
canvas {
  background: lavender;
}

/* disable text selection, causes trouble with mouse controls */
p,
table,
table *,
table * * {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}

.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 60px;
}
</style>