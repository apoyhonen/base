<template>
  <h3>Othello</h3>

  <table id="othelloTable">
    <tr v-for="rowIndex in 8" :key="'row' + rowIndex">
      <OthelloCell
          v-for="colIndex in 8"
          :key="'row' + rowIndex + 'col' + colIndex"
          :col="colIndex"
          :row="rowIndex"
          :value="grid[rowIndex - 1][colIndex - 1]"
          @left-click="cellClicked"
      />
    </tr>
  </table>

</template>

<script setup>

import OthelloCell from "@/components/OthelloCell.vue";

const grid = [];
for (let i = 0; i < 8; i++) {
  const row = [];
  for (let j = 0; j < 8; j++) row.push(1);
  grid.push(row);
}

function cellClicked(col, row) {
  const currValue = grid[row - 1][col - 1];
  grid[row - 1][col-1] = currValue === 1 ? 2 : 1;
}

</script>

<style scoped>
table {
  margin: 10px auto;
}
</style>