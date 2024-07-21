
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
      </td>

      <td>
        <h2>Circular Motion</h2>
        <canvas id="circleMotionCanvas" width="400" height="300" @auxclick.prevent="canvasClicked" oncontextmenu="return false"></canvas>
      </td>

    </tr>
  </table>

</template>

<script setup>

import { onMounted, ref, watch } from "vue";
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

  initParticles();

  draw(); // init
});

watch(isRunning, () => {
  if (isRunning.value) draw();
})

function draw() {
  frameCount.value++;

  clear();
  drawParticles();

  if (isRunning.value && isAppActive()) requestAnimationFrame(draw); // redraw as soon as animation frame is available
}

function isAppActive() {
  return document.getElementById("circleMotionCanvas") !== null;
}

function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

let middlePoint = { x: 0, y: 0 };
const mousePoint = ref({ x: 0, y: 0 });

const angleInRadians = ref(0.5);

function canvasClicked(e) {
  const eventX = e.clientX - canvas.offsetLeft;
  const eventY = e.clientY - canvas.offsetTop;
  angleInRadians.value = angleBetweenPointsRadian(mousePoint.value.x, mousePoint.value.y, eventX, eventY);
}

// key and mouse handlers

document.addEventListener("mousemove", mouseMoveHandler, false);

function mouseMoveHandler(e) {
  if (!isAppActive()) return;

  mousePoint.value.x = e.clientX - canvas.offsetLeft;
  mousePoint.value.y = e.clientY - canvas.offsetTop;
}

// particles

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
  this.radians = randomBetween(0, Math.PI * 2);
  this.velocity = randomBetween(0.02, 0.04);
  this.oscillation = randomIntBetween(100, 500); // factor to oscillate past radius

  this.update = () => {
    // move points over time
    this.radians += this.velocity;
    if (this.radians >= Math.PI * 2) this.radians -= Math.PI * 2;

    this.x = x + Math.cos(this.radians) * this.oscillation;
    this.y = y + Math.sin(this.radians) * this.oscillation;

    this.draw();
  }

  this.draw = () => {
    c.fillStyle = this.color;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    c.fill();
    c.closePath(); // TODO is this needed?
  }
}

function drawParticles() {
  particles.forEach(particle => particle.update());
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