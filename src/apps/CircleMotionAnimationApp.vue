
// adapted from https://www.youtube.com/watch?v=raXW5J1Te7Y

<template>
  <table>
    <tr>

      <td>
        <b>Animation</b>
        <br><br>
        <p>frame: {{ frameCount }}</p>
        <br>
        <button @click="isRunning = !isRunning">START / STOP</button>

        <br><br><br><br>

        <span>Following: {{ particlesFollowMouse ? 'mouse' : 'middle' }}</span>
        <br>
        <button @click="particlesFollowMouse = !particlesFollowMouse">TOGGLE CENTER</button>
        <br><br>
        <button @click="clearCanvas">RESET CANVAS</button>
      </td>

      <td>
        <h2>Circular Motion</h2>
        <canvas id="circleMotionCanvas" width="400" height="300" @auxclick.prevent="canvasClicked" oncontextmenu="return false"></canvas>
      </td>

    </tr>
  </table>

</template>

<script setup>

import { computed, onMounted, ref, watch } from "vue";
import { angleBetweenPointsRadian, randomBetween, randomIntBetween } from "@/util/MathUtil";
import { randomColor } from "@/util/ColorUtil";

let canvas = null;
let c = null;

const frameCount = ref(1);
const isRunning = ref(true);

onMounted(() => {
  canvas = document.getElementById("circleMotionCanvas");
  canvas.width = window.innerWidth * 0.7;
  canvas.height = window.innerHeight * 0.8;
  c = canvas.getContext("2d");

  middlePoint.x = canvas.width / 2;
  middlePoint.y = canvas.height / 2;

  particleMaxDistance = Math.min(canvas.width, canvas.height) / 4;
  particleMinDistance = particleMaxDistance / 2;

  initParticles();

  draw(); // init
});

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

const angleInRadians = ref(0.5);

function canvasClicked(e) {
  const eventX = e.clientX - canvas.offsetLeft;
  const eventY = e.clientY - canvas.offsetTop;
  angleInRadians.value = angleBetweenPointsRadian(mousePoint.value.x, mousePoint.value.y, eventX, eventY);
}

function clearCanvas() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// key and mouse handlers

document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  mousePoint.value.x = e.clientX - canvas.offsetLeft;
  mousePoint.value.y = e.clientY - canvas.offsetTop;
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

let particles = [];
function initParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle(middlePoint.x, middlePoint.y, 5, 'blue'));
  }
}

function Particle(x, y, radius) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.color = randomColor();
  this.radians = Math.random() * Math.PI * 2;
  this.velocity = randomBetween(0.015, 0.03);
  this.distanceFromCenter = randomIntBetween(particleMinDistance, particleMaxDistance); // factor to oscillate past radius

  this.update = () => {
    // move points over time
    this.radians += this.velocity;
    if (this.radians >= Math.PI * 2) this.radians -= Math.PI * 2;

    const lastPoint = { x: this.x, y: this.y };

    this.x = particleCenterPoint.value.x + Math.cos(this.radians) * this.distanceFromCenter;
    this.y = particleCenterPoint.value.y + Math.sin(this.radians) * this.distanceFromCenter;

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
canvas {
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
</style>