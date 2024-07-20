<template>
  <h1>Othello</h1>

  <div class="controls-div">
    <label for="cellSize">cell size (px):</label>
    <input id="cellSize" type="number" class="controls-input" v-model="cellSize" />
    <span style="display: inline-block; width: 20px;"></span>
    <button class="controls-button"  @click="cellSize = defaultCellSize">RESET VALUES</button>
  </div>

  <table id="othelloTable">
    <tr v-for="rowIndex in 8" :key="'row' + rowIndex">
      <OthelloCell
          v-for="colIndex in 8"
          :key="'row' + rowIndex + 'col' + colIndex"
          :col="colIndex"
          :row="rowIndex"
          :value="grid[rowIndex - 1][colIndex - 1]"
          :size="cellSize"
          @left-click="cellClicked"
      />
    </tr>
  </table>

</template>

<script setup>

import OthelloCell from "@/components/OthelloCell.vue";
import { onMounted, ref } from "vue";

const defaultCellSize = 50;
const cellSize = ref(defaultCellSize);

const grid = ref([]);
for (let i = 0; i < 8; i++) {
  const row = [];
  for (let j = 0; j < 8; j++) row.push(0);
  grid.value.push(row);
}

function cellClicked(col, row) {
  const currValue = grid.value[row - 1][col - 1];
  grid.value[row - 1][col-1] = currValue === 1 ? 2 : 1;
}

onMounted(() => {
  const table = document.getElementById("othelloTable");
  cellSize.value = Math.floor(Math.min(window.innerWidth - table.offsetLeft, window.innerHeight - table.offsetTop) * 0.8 / 8);
})

</script>

<style scoped>
table {
  border-spacing: 0;
  margin: 10px auto;
  border: 3px solid black;
}
.controls-div {
  margin: 10px auto;
}
.controls-button,
.controls-input {
  margin: 1px 10px;
}
.controls-input {
  width: 40px;
}
</style>