<template>
  <div class="square"
       :style="'background-color: ' + color"
       @click="setRandomColor">
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { randomColor } from "@/util/ColorUtil";

const color = ref("black");

function setRandomColor() {
  color.value = randomColor();
}
</script>

<style scoped>
.square {
  height: 50px;
  width: 50px;
}
</style>

