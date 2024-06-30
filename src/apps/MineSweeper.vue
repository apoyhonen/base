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
    <button class="mine-controls-button"  @click="resetValuesAndGame">RESET VALUES</button>
  </div>

  <table class="mine-table"
         v-if="isValidField"
         @contextmenu.prevent>
    <tr v-for="row in tableRows" :key="'row' + row">
      <MineSweeperCell
          v-for="col in tableCols" :key="'row' + row + 'col' + col"
          :col="col - 1"
          :row="row - 1"
          :value="mineField[row - 1][col - 1]"
          :reset-counter="resetCounter"
          :shown-empty-cell-array="shownEmptyCells"
          :prevent-clicks="isGameOver || isWin"
          @empty-click="emptyClicked"
          @boom="isGameOver = true"
          @flagged="flag" />
    </tr>
  </table>

  <div v-if="!isValidField">
    <p style="color: red;">Game settings are not valid.</p>
    <p>At least two rows, two columns and one mine are required.</p>
    <p>Furthermore, amount of mines cannot surpass amount of cells.</p>
  </div>

  <div v-if="isGameOver">
    <p style="color: red; font-weight: bold;">BOOM! Game Over :(</p>
  </div>

  <div v-if="isWin">
    <p style="color: green; font-weight: bold;">You found all the mines! ^^</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import MineSweeperCell from "@/components/MineSweeperCell.vue";

const tableRows = ref(10);
const tableCols = ref(10);
const tableMines = ref(5);
const resetCounter = ref(0);
const shownEmptyCells = ref([]);
const flaggedCells = ref([]);

function resetValuesAndGame() {
  tableRows.value = 10;
  tableCols.value = 10;
  tableMines.value = 5;
  resetGame();
}

const mineField = ref([[]]); // rows array x column values
const isValidField = ref(true);
const isGameOver = ref(false);
const isWin = ref(false);

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
  resetCounter.value++; // resets cell states
  for (let row = 0; row < tableRows.value + 2; row++) {
    for (let col = 0; col < tableCols.value + 2; col++) {
      setValue(col, row, 0);
    }
  }

  // empty temp cell arrays
  while (shownEmptyCells.value.length > 0) {
    shownEmptyCells.value.pop();
  }
  while (flaggedCells.value.length > 0) {
    flaggedCells.value.pop();
  }
}

function resetGame() {
  isGameOver.value = false;
  isWin.value = false;
  if (tableRows.value >= 2 && tableCols.value >= 2
      && tableMines.value >= 1 && tableMines.value <= tableRows.value * tableCols.value) {
    isValidField.value = true;

    // actual reset
    resetTable();
    let mines = 0;
    while (mines < tableMines.value) {
      const cell = randomCell();
      const value = getValue(cell.col, cell.row);
      if (!value || value !== -1) {
        setValue(cell.col, cell.row, -1);
        addOneToValuesAround(cell.col, cell.row);
        mines++;
      }
    }
  } else {
    isValidField.value = false;
  }
}

function addOneToValuesAround(targetCol, targetRow) {
  // search +-1 row and +-1 column for adding 1 to value
  for (let row = Math.max(0, targetRow - 1); row <= Math.min(tableRows.value - 1, targetRow + 1); row++) {
    for (let col = Math.max(0, targetCol - 1); col <= Math.min(tableCols.value - 1, targetCol + 1); col++) {
      if (row === targetRow && col === targetCol) continue; // don't mind target cell
      const currValue = getValue(col, row);
      if (!currValue || currValue > -1) setValue(col, row, currValue + 1); // add 1 value to non-mines
    }
  }
}

// EVENTS FROM CELLS

function emptyClicked(clickCol, clickRow) {
  const cellsToOpen = [ { col: clickCol, row: clickRow } ];

  // open all connected empty cells
  let exhausted = false;
  while (!exhausted) {
    let foundNew = false;
    cellsToOpen.forEach(cell => {
      const targetCol = cell.col;
      const targetRow = cell.row;

      for (let row = Math.max(0, targetRow - 1); row <= Math.min(tableRows.value - 1, targetRow + 1); row++) {
        if (cellsToOpen.filter(cell => cell.row === row && cell.col === targetCol).length > 0) continue;
        if (isCellEmpty(targetCol, row)) {
          foundNew = true;
          cellsToOpen.push({ col: targetCol, row: row });
        }
      }

      for (let col = Math.max(0, targetCol - 1); col <= Math.min(tableCols.value - 1, targetCol + 1); col++) {
        if (cellsToOpen.filter(cell => cell.row === targetRow && cell.col === col).length > 0) continue;
        if (isCellEmpty(col, targetRow)) {
          foundNew = true;
          cellsToOpen.push({ col: col, row: targetRow });
        }
      }
    })

    if (!foundNew) exhausted = true;
  }

  // open all adjacent-to-empty cells as well
  cellsToOpen.forEach(cell => {
    const targetCol = cell.col;
    const targetRow = cell.row;

    for (let row = Math.max(0, targetRow - 1); row <= Math.min(tableRows.value - 1, targetRow + 1); row++) {
      for (let col = Math.max(0, targetCol - 1); col <= Math.min(tableCols.value - 1, targetCol + 1); col++) {
        if (cellsToOpen.filter(cell => cell.row === row && cell.col === col).length > 0) continue;
        if (getValue(col, row) > 0) cellsToOpen.push({ col: col, row: row }); // only open adjacent non-empty cells
      }
    }
  })

  cellsToOpen.forEach((cell) => shownEmptyCells.value.push(cell));
}

function isCellEmpty(col, row) {
  return getValue(col, row) === 0;
}

function flag(col, row, flagged) {
  if (flagged) {
    flaggedCells.value.push({ col: col, row: row });
  } else {
    const index = flaggedCells.value.findIndex(cell => cell.col === col && cell.row === row);
    if (index > -1) flaggedCells.value.splice(index, 1);
  }

  // win game if (only) all mines flagged
  const asManyFlagsAsMines = flaggedCells.value.length === tableMines.value;
  const noFalseFlags = flaggedCells.value.filter(cell => getValue(cell.col, cell.row) !== -1).length === 0
  isWin.value = asManyFlagsAsMines && noFalseFlags;
}

// INIT

initRowArrays();
resetValuesAndGame();

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