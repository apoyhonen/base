<template>
  <h3>Othello</h3>
  <table id="othelloTable">
    <tr v-for="rowIndex in 8" :key="'row' + rowIndex">
      <td v-for="colIndex in grid[rowIndex]" :key="'col' + colIndex">
        {{ !grid[rowIndex - 1][colIndex - 1] ? '' : grid[rowIndex - 1][colIndex - 1] }}
      </td>
    </tr>
  </table>
</template>

<script setup>

const grid = [];
for (let i = 0; i < 8; i++) {
  const row = [];
  for (let j = 0; j < 8; j++) row.push(1);
  grid.push(row);
}
</script>

<style scoped>
table {
  margin: 10px auto;
}
table td {
  text-align: center;
  padding: 15px 0 0 0;
  display: inline-block;
  width: 45px;
  height: 30px;
  border: 1px solid black;
  margin: 5px;
}
</style>