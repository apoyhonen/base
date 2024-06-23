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
      <td class="cell-empty"
          v-for="(col, colIndex) in tableCols" :key="'col' + col">
        {{ getValue(rowIndex, colIndex ) }}
      </td>
    </tr>
  </table>
</template>

<script setup>
import {ref, watchEffect} from "vue";

/*
<td class="{{ getValue(rowIndex, colIndex) < 0 ? 'cell-mine' : getValue(rowIndex, colIndex) > 0 ? 'cell-value' : 'cell-empty' }}"
 */

const tableRows = ref(10);
const tableCols = ref(10);
const tableMines = ref(5);

const mineField = ref([[]]); // rows array x column values

function randomNumber(min, max) {
  return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

function randomCell() {
  return {
    col: randomNumber(0, tableCols.value - 1),
    row: randomNumber(0, tableRows.value - 1),
  }
}

function getValue(col, row) {
  return mineField.value[row][col];
}

function setValue(col, row, value) {
  mineField.value[row][col] = value;
}

function initRowArrays() {
  for (let row = 0; row < 500; row++) {
    mineField.value[row] = [];
  }
}

function resetTable() {
  for (let row = 0; row < tableRows.value + 2; row++) {
    for (let col = 0; col < tableCols.value + 2; col++) {
      setValue(col, row, 0);
    }
  }
}

function resetGame() {
  resetTable();
  let mines = 0;
  while (mines < tableMines.value) {
    const cell = randomCell();
    const value = getValue(cell.col, cell.row);
    if (!value || value > -1) {
      setValue(cell.col, cell.row, -1);
      mines++;
    }
  }
  for (let row = 0; row < tableRows.value; row++) {
    for (let col = 0; col < tableCols.value; col++) {
      const currValue = getValue(col, row);
      if (!currValue || currValue > -1) setValue(col, row, calculateMinesAround(col, row));
    }
  }
}

function calculateMinesAround(targetCol, targetRow) {
  let value = 0;
  // search +-1 row and +-1 column for mines
  for (let row = Math.max(0, targetRow - 1); row <= Math.min(tableRows.value, targetRow + 1); row++) {
    for (let col = Math.max(0, targetCol - 1); col <= Math.min(tableCols.value, targetCol + 1); col++) {
      if (row === targetRow && col === targetCol) continue; // don't test cell itself
      const currValue = getValue(col, row);
      if (currValue && currValue < 0) value++;
    }
  }
  return value;
}

// INIT

initRowArrays();
resetGame();

watchEffect(() => {
  if (tableRows.value >= 2 && tableCols.value >= 2
      && tableMines.value >= 1 && tableMines.value <= tableRows.value * tableCols.value) {
    resetGame();
  }
})

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