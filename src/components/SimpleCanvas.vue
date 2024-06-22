<template>
  <div>
    <canvas id="myCanvas" @mousemove="mouseMoved" @click="mouseClicked"></canvas>
    <slot></slot> <!-- reactive canvas (inject) children -->
  </div>
</template>

<script setup>
import {onMounted, provide, ref, defineEmits} from 'vue'

// INJECTION

const provider = {
  context: null,
}

provide('provider', provider);

onMounted(() => {
  const c = document.getElementById('myCanvas');
  provider.context = c.getContext('2d');

  c.width = c.parentElement.clientWidth;
  c.height = c.parentElement.clientHeight;
})

// MOUSE INTERACTION

const mousePos = ref({
  x: null,
  y: null,
})

function mouseMoved(event) {
  mousePos.value.x = event.x;
  mousePos.value.y = event.y;
}

const emit = defineEmits(['mouseClicked']);

function mouseClicked() {
  emit('mouseClicked', mousePos.value.x, mousePos.value.y);
}

</script>

<style scoped>
canvas {
  border: 1px solid black;
}
</style>