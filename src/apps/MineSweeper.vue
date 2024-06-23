<template>
  <h3 style="font-size: 40px; font-weight: bold; font-style: italic;">MineSweeper!</h3>
  <div class="mine-controls">
    <label>columns</label>
    <input type="number" class="mine-controls-input" v-model="tableCols" />
    <label>rows</label>
    <input type="number" class="mine-controls-input" v-model="tableRows" />
    <label>mines</label>
    <input type="number" class="mine-controls-input" v-model="tableMines" />
    <button @click="resetGame">RESET GAME</button>
  </div>
  <table class="mine-table">
    <tr v-for="(row, rowIndex) in tableRows" :key="'row' + row">
      <td class="cell-value"
          v-for="(col, colIndex) in tableCols" :key="'col' + col">
        {{ getValue(rowIndex, colIndex ) }}
      </td>
    </tr>
  </table>
</template>

<script setup>
import {ref} from "vue";

/*

<td class="{{ getValue(rowIndex, colIndex) < 0 ? 'cell-mine' : getValue(rowIndex, colIndex) > 0 ? 'cell-value' : 'cell-empty' }}"

 */

const tableRows = ref(10);
const tableCols = ref(10);
const tableMines = ref(5);

const mineField = ref([[]]); // rows array x column values

function initRowArrays() {
  for (let row = 0; row < 500; row++) {
    mineField.value[row] = [];
  }
}
initRowArrays(); // init

function resetTable() {
  for (let row = 0; row < tableRows.value; row++) {
    for (let col = 0; col < tableCols.value; col++) {
      setValue(col, row, 0);
    }
  }
}

function resetGame() {
  resetTable();
  let mines = 0;
  while (mines < tableMines.value) {
    const cell = randomCell();
    const value = getValue(cell.x, cell.y);
    if (value > -1) {
      setValue(cell.x, cell.y, -1);
      mines++;
    }
  }
  for (let y = 0; y < tableRows.value; y++) {
    for (let x = 0; x < tableCols.value; x++) {
      if (getValue(x, y) > -1) setValue(x, y, calculateMinesAround(x, y));
    }
  }
}
resetGame(); // init

function randomCell() {
  return {
    x: randomNumber(1, tableCols.value) - 1,
    y: randomNumber(1, tableRows.value) - 1,
  }
}

function getValue(x, y) {
  return mineField.value[y][x];
}

function setValue(x, y, value) {
  mineField.value[y][x] = value;
}

function calculateMinesAround(x, y) {
  let value = 0;
  // search +-1 row and +-1 column for mines
  for (let row = Math.max(0, y - 1); row <= Math.min(tableRows.value, y + 1); row++) {
    for (let col = Math.max(0, x - 1); col <= Math.min(tableCols.value, x + 1); col++) {
      if (row === y && col === x) continue; // don't test cell itself
      if (getValue(col, row) < 0) value++;
    }
  }
  return value;
}

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max + 1) + min);
}

</script>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
.mine-table {
  margin: 10px auto;
}
.mine-controls {
}
.mine-controls-input {
  width: 40px;
  margin: 10px 20px;
}
.cell-empty,
.cell-value,
.cell-mine {
  padding: 5px;
  border: 1px solid black;
  width: 15px;
}
.cell-value {
  background-color: #52da76;
}
.cell-mine {
  background-color: lightcoral;
}
</style>