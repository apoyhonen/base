<template>
  <h3 style="font-size: 40px; font-weight: bold; font-style: italic;">MineSweeper!</h3>
  <div class="mine-controls">
    <label for="colsAmount">columns:</label>
    <input id="colsAmount" type="number" class="mine-controls-input" v-model="tableCols" />
    <label for="rowsAmount">rows:</label>
    <input id="rowsAmount" type="number" class="mine-controls-input" v-model="tableRows" />
    <label for="minesAmount">mines:</label>
    <input id="minesAmount" type="number" class="mine-controls-input" v-model="tableMines" />
  </div>
  <div class="mine-controls">
    <button class="mine-controls-button"  @click="resetGame">RESET FIELD</button>
    <button class="mine-controls-button"  @click="resetValues">RESET VALUES</button>
  </div>
  <table class="mine-table" v-if="isValidField">
    <tr v-for="row in tableRows" :key="'row' + row">
      <MineSweeperCell
          v-for="col in tableCols" :key="'col' + col"
          :col="col - 1"
          :row="row - 1"
          :value="mineField[row - 1][col - 1]" />
    </tr>
  </table>
  <div v-if="!isValidField">
    <p style="color: red;">Game settings are not valid.</p>
    <p>At least two rows, two columns and one mine are required.</p>
    <p>Furthermore, amount of mines cannot surpass amount of cells.</p>
  </div>
</template>

<script setup>
import {ref, watchEffect} from "vue";
import MineSweeperCell from "@/components/MineSweeperCell.vue";

const tableRows = ref(10);
const tableCols = ref(10);
const tableMines = ref(5);

function resetValues() {
  tableRows.value = 10;
  tableCols.value = 10;
  tableMines.value = 5;
}

const mineField = ref([[]]); // rows array x column values
const isValidField = ref(true);
const isGameLost = ref(false);

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomCell() {
  return {
    col: randomNumber(0, tableCols.value),
    row: randomNumber(0, tableRows.value),
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
  isGameLost.value = false;
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
    isValidField.value = true;
    resetGame();
  } else {
    isValidField.value = false;
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
.mine-controls-button,
.mine-controls-input {
  margin: 5px 10px;
}
.mine-controls-input {
  width: 40px;
}
</style>