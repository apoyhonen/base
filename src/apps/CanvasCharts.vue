<template>
  <h1>Automatic Charts & Canvas</h1>
  <SimpleCanvas id="simpleCanvas" @mouse-clicked="canvasClick" class="canvas">
    <CanvasItem
        v-for="(obj, index) of chartValues"
        :key=index
        :x1="index / chartValues.length * 100"
        :x2="index / chartValues.length * 100 + 100 / chartValues.length"
        :y1="100"
        :y2="100 - obj.val"
        :color="obj.color"
        :value="obj.val"
    ></CanvasItem>
  </SimpleCanvas>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import SimpleCanvas from '../components/SimpleCanvas.vue';
import CanvasItem from '../components/CanvasItemBase.vue';
import { randomColor } from "@/util/ColorUtil";

const chartValues = ref([
  { val: 24, color: 'red' },
  { val: 32, color: '#0f0' },
  { val: 66, color: 'rebeccapurple' },
  { val: 1, color: 'green' },
  { val: 28, color: 'blue' },
  { val: 60, color: 'rgba(150, 100, 0, 0.2)' },
]);

// CHARTS AUTOMATION

let dir = 1;
let selectedVal = randomChart();

function randomize() {
  if (Math.random() > 0.995) dir *= -1; // select increase/decrease direction
  if (Math.random() > 0.99) selectedVal = randomChart(); // new bar

  chartValues.value[selectedVal].val = newSlightlyChangedValue(selectedVal);
}

function randomChart() {
  return Math.floor(Math.random() * chartValues.value.length);
}

function newSlightlyChangedValue(index) {
  // increase or decrease by 0.5, ensuring min and max
  const change = dir * 0.5;
  const oldVal = chartValues.value[index].val;
  let newVal = oldVal + change;
  if (newVal > 100 || newVal < 0) dir *= -1;

  return Math.min(Math.max(newVal, 0), 100);
}

// automated randomization with interval
onMounted(() => {
  // eslint-disable-next-line no-self-assign
  chartValues.value.forEach((chartValue, index) => chartValue.val = newSlightlyChangedValue(index));
  setInterval(randomize, 16);
});

// CANVAS INTERACTIONS

const canvas = ref(null);
onMounted(() => canvas.value = document.getElementById('simpleCanvas'));
//const measurer = document.getElementById('measurer')

const pxWidthToPercent = (px) => Math.floor(px / canvasWidth() * 100);
function canvasWidth() {
  return canvas.value ? canvas.value.valueOf().offsetWidth : 300;
}
const pxHeightToPercent = (px) => Math.floor(px / canvasHeight() * 100);
function canvasHeight() {
  return canvas.value ? canvas.value.valueOf().offsetHeight : 100;
}

function canvasClick(x, y) {
  const clickXPercent = pxWidthToPercent(x);
  const clickYPercent = pxHeightToPercent(y);
  chartValues.value.forEach(chartVal => {
    const index = chartValues.value.indexOf(chartVal);
    const xMin = index / chartValues.value.length * 100;
    const xMax = index / chartValues.value.length * 100 + 100 / chartValues.value.length;
    const yMin = 100 - chartVal.val;
    if (clickXPercent < xMax && clickXPercent > xMin) {
      // clicked x area for this chart
      if (yMin <= clickYPercent) {
        // clicked actual bar
        chartVal.color = randomColor();
      }
    }
  })
}

</script>

<style scoped>
.canvas {
  height: 80vh;
}
</style>