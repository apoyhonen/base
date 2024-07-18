<template>
  <br>
  <p id="mineSweeperHeader" style="font-size: 40px; font-weight: bold; font-style: italic;">&#129529; MineSweeper! &#129529;</p>
  <br>

  <div v-if="isValidField" :class="'mine-controls-button-reset ' + buttonStyle" @click="resetGame">
    <span class="tooltip">Reset game</span>
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
    <p style="color: green; font-weight: bold;">You found all the mines! WIN! ^^</p>
  </div>

  <br>
  <div>
    <table class="info-table">
      <tr>

        <td>
          <p>
            <b>Controls</b>
          </p>
          <p>
            Aim is to clear the minefield, 'sweep' it clean!
          </p>
          <p>
            Click to open up a tile from the minefield. Right click to flag a probable mine.
          </p>
          <p>
            Tiles with a number indicate amount of mines in the nearby tiles.
          </p>
          <p>
            If you open a tile with a mine, you're finished.
          </p>
          <p>
            Once all mines are correctly flagged, you win.
          </p>
          <br>
          <p>
            'R' to reset
          </p>
        </td>

        <td>
          <b>Game</b><br>
          <br>
          <p>Flags: {{ flaggedCells.length }}</p>
          <p>Mines: {{ tableMines }}</p>
          <br>
          <button @click="resetGame">RESET GAME</button>
        </td>

        <td>
          <div class="mine-controls">
            <label for="colsAmount">columns:</label>
            <input id="colsAmount" type="number" class="mine-controls-input" v-model="tableCols" />
            <br>
            <label for="rowsAmount">rows:</label>
            <input id="rowsAmount" type="number" class="mine-controls-input" v-model="tableRows" />
            <br>
            <label for="minesAmount">mines:</label>
            <input id="minesAmount" type="number" class="mine-controls-input" v-model="tableMines" />
            <br><br>
            <button class="mine-controls-button"  @click="resetValues">RESET VALUES</button>
          </div>
        </td>

      </tr>
    </table>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import MineSweeperCell from "@/components/MineSweeperCell.vue";

const defaultRows = 15;
const defaultCols = 30;
const defaultMines = 35;

const tableRows = ref(defaultRows);
const tableCols = ref(defaultCols);
const tableMines = ref(defaultMines);
const resetCounter = ref(0);
const shownEmptyCells = ref([]);
const flaggedCells = ref([]);

function resetValues() {
  tableRows.value = defaultRows;
  tableCols.value = defaultCols;
  tableMines.value = defaultMines;
  resetGame();
}

watch(tableRows, () => {
  resetGame();
});

watch(tableCols, () => {
  resetGame();
});

watch(tableMines, () => {
  resetGame();
});

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

const buttonStyle = computed(() => getButtonStyle(isGameOver.value, isWin.value))
function getButtonStyle(gameOver, win) {
  return gameOver ? "button-lose"
      : win ? "button-win" : "button-reset";
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

document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler(e) {
  if (!isAppActive()) return;

  if (e.key === 'r') {
    resetGame();
  }
}

function isAppActive() {
  return document.getElementById("mineSweeperHeader") !== null;
}

// INIT

initRowArrays();
resetValues();

</script>

<style scoped>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
p {
  margin: 0;
}

.mine-controls {
  margin: 10px auto;
}
.mine-controls-button,
.mine-controls-input {
  margin: 1px 10px;
}
.mine-controls-input {
  width: 40px;
}

.mine-controls-button-reset {
  background-size: contain;
  width: 39px;
  height: 39px;
  margin: 0 auto;
}
.button-reset {
  background-image: url("../assets/minesweeper/face_unpressed.svg");
}
.button-lose {
  background-image: url("../assets/minesweeper/face_lose.svg");
}
.button-win {
  background-image: url("../assets/minesweeper/face_win.svg");
}
.tooltip {
  visibility: hidden;
  width: 120px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  position: absolute;
  transform: translate(30px, 5px);
  z-index: 1;
}
.mine-controls-button-reset:hover .tooltip {
  visibility: visible;
}

.mine-table {
  margin: 10px auto;
  border: 3px solid grey;
}
.info-table {
  margin: 0 auto;
}
.info-table td {
  padding: 0 20px;
}

</style>