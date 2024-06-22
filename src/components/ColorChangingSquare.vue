<template>
  <div class="square"
       :style="'background-color: ' + color"
       @click="randomColor">
  </div>
</template>

<script setup>
import { ref } from 'vue'

const color = ref("black");

function randomColor() {
  color.value = getRandomColor();
}

var getRandomColor = () => {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
</script>

<style scoped>
.square {
  height: 50px;
  width: 50px;
}
</style>

