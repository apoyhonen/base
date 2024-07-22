
// adapted from https://www.youtube.com/watch?v=raXW5J1Te7Y

<template>
  <table>
    <tr>

      <td>
        <h2>Circular Motion</h2>
        <canvas id="circleMotionCanvas" width="400" height="300" @auxclick.prevent="canvasClicked" oncontextmenu="return false"></canvas>
      </td>

      <td>
        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <button @click="isRunning = !isRunning">START / STOP</button>

        <br><br><br>

        <span>Following: {{ particlesFollowMouse ? 'mouse' : 'middle' }}</span>
        <br>
        <button @click="particlesFollowMouse = !particlesFollowMouse">TOGGLE FOLLOWING</button>
        <br><br><br>
        <label for="particlesAmount">Particles: </label>
        <input id="particlesAmount" type="number" class="controls-input" v-model="particlesAmount" />
        <br>
        <button @click="particlesAmount = defaultParticlesAmount">RESET PARTICLES</button>/
        <br><br><br>
        <button @click="clearCanvas">RESET CANVAS</button>
      </td>

    </tr>
  </table>

</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { randomBetween, randomIntBetween } from "@/util/MathUtil";
import { randomColor } from "@/util/ColorUtil";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("circleMotionCanvas");
  c = canvas.getContext("2d");

  setupCanvasSizes();
  initParticles();

  draw(); // init
});

function setupCanvasSizes() {
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.8;

  middlePoint.x = canvas.width / 2;
  middlePoint.y = canvas.height / 2;

  particleMaxDistance = Math.min(canvas.width, canvas.height) / 4;
  particleMinDistance = particleMaxDistance / 2;
}

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function draw() {
  frameCount.value++;

  // fade out old draws slowly over time, "fade to gray"
  c.fillStyle = 'rgba(255, 255, 255, 0.08)';
  c.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(particle => particle.update());

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function isAppActive() {
  return document.getElementById("circleMotionCanvas") !== null;
}

let middlePoint = { x: 0, y: 0 };
const mousePoint = ref({ x: 0, y: 0 });

function clearCanvas() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// document listeners

document.addEventListener("mousemove", mouseMoveHandler);
window.addEventListener('resize', () => {
  setupCanvasSizes();
  particles.forEach(particle => particle.refreshDistance());
});

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  mousePoint.value.x = e.clientX - getOffsetLeft(canvas);
  mousePoint.value.y = e.clientY - getOffsetTop(canvas);
}

function getOffsetLeft(element) {
  let offsetLeft = element.offsetLeft;
  let offsetParent = element.offsetParent;
  while (offsetParent) {
    offsetLeft += offsetParent.offsetLeft;
    offsetParent = offsetParent.offsetParent;
  }
  return offsetLeft;
}

function getOffsetTop(element) {
  let offsetTop = element.offsetTop;
  let offsetParent = element.offsetParent;
  while (offsetParent) {
    offsetTop += offsetParent.offsetTop;
    offsetParent = offsetParent.offsetParent;
  }
  return offsetTop;
}

// particles

const particlesFollowMouse = ref(false);
const particleCenterPoint = computed(() => {
  if (particlesFollowMouse.value) {
    return { x: mousePoint.value.x, y: mousePoint.value.y }
  } else {
    return middlePoint;
  }
})

let particleMinDistance = 100;
let particleMaxDistance = 200;
const defaultParticlesAmount = 200;
const particlesAmount = ref(defaultParticlesAmount);

let particles = [];
function initParticles() {
  for (let i = 0; i < 300; i++) {
    particles.push(new Particle(middlePoint.x, middlePoint.y));
  }
}

watch(particlesAmount, () => {
  if (particlesAmount.value > particles.length) {
    while (particles.length < particlesAmount.value) {
      particles.push(new Particle(middlePoint.x, middlePoint.y));
    }
  } else {
    while (particles.length > particlesAmount.value) {
      particles.pop();
    }
  }
})

function Particle(x, y) {
  this.x = x;
  this.y = y;
  this.radius = randomIntBetween(1, 2);
  this.color = randomColor();
  this.radians = Math.random() * Math.PI * 2;
  this.velocity = randomBetween(0.015, 0.03);
  this.distanceFromCenter = randomIntBetween(particleMinDistance, particleMaxDistance);
  this.lastTowardsMousePosition = { x: x, y: y };

  this.refreshDistance = () => this.distanceFromCenter = randomIntBetween(particleMinDistance, particleMaxDistance);

  this.update = () => {
    // move points over time
    this.radians += this.velocity;

    const lastPoint = { x: this.x, y: this.y };

    this.lastTowardsMousePosition.x += (particleCenterPoint.value.x - this.lastTowardsMousePosition.x) * 0.05;
    this.lastTowardsMousePosition.y += (particleCenterPoint.value.y - this.lastTowardsMousePosition.y) * 0.05;

    this.x = this.lastTowardsMousePosition.x + Math.cos(this.radians) * this.distanceFromCenter;
    this.y = this.lastTowardsMousePosition.y + Math.sin(this.radians) * this.distanceFromCenter;

    this.draw(lastPoint);
  }

  this.draw = lastPoint => {
    c.strokeStyle = this.color;
    c.lineWidth = this.radius;

    c.beginPath();
    c.moveTo(lastPoint.x, lastPoint.y);
    c.lineTo(this.x, this.y);
    c.stroke();

    c.closePath(); // TODO is this needed?
  }
}

</script>

<style scoped>
table {
  margin: 10px auto;
}
table > tr > td {
  padding: 0 20px;
}
.controls-input {
  margin: 1px 10px;
  width: 40px;
}
canvas {
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
</style>