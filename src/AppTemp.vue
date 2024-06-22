<template>
  <ProvidedCanvas style="width: 100%; height: 95vh;">
    <ChartBox
        v-for="(obj, index) of chartValues"
        :key=index
        :x1="(index / chartValues.length) * 100"
        :x2="(index / chartValues.length) * 100 + 100 / chartValues.length"
        :y1="100"
        :y2="100 - obj.val"
        :color="obj.color"
        :value="obj.val"
    >
    </ChartBox>
  </ProvidedCanvas>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import ProvidedCanvas from './components/ProvidedCanvas.vue';
import ChartBox from './components/ChartBox.vue';

const chartValues = ref([
  { val: 24, color: 'red' },
  { val: 32, color: '#0f0' },
  { val: 66, color: 'rebeccapurple' },
  { val: 1, color: 'green' },
  { val: 28, color: 'blue' },
  { val: 60, color: 'rgba(150, 100, 0, 0.2)' },
]);

let dir = 1;
let selectedVal = Math.floor(Math.random() * chartValues.value.length);

function randomize() {
  if (Math.random() > 0.995) dir *= -1;
  if (Math.random() > 0.99)
    selectedVal = Math.floor(Math.random() * chartValues.value.length);

  chartValues.value[selectedVal].val = Math.min(
      Math.max(chartValues.value[selectedVal].val + dir * 0.5, 0),
      100
  );
}

onMounted(() => setInterval(randomize, 16));
</script>

<style>
html,
body {
  margin: 0;
  position: relative;
  height: 98vh;
  padding: 20px;
  box-sizing: border-box;
}
</style>