<template>
  <h1>Othello</h1>

  <table class="info-table">
    <tr>

      <td>
        <h3>Board</h3>
        <div class="controls-div">
          <label for="cellSize">cell size (px):</label>
          <input id="cellSize" type="number" class="controls-input" v-model="cellSize" />
          <br><br>
          <button class="controls-button"  @click="cellSize = defaultCellSize">RESET SIZE</button>
        </div>
        <br><br>

        <h3>Game</h3>
        <p style="font-size: 20px;">
          Turn: <b>{{ currentPlayerRef === 1 ? 'white' : 'black' }}</b>
          <br>
          <span :class="currentPlayerRef === 1 ? 'player-white' : 'player-black'"></span>
        </p>
        <p>
          White: <b>{{ whitePieces }}</b> pieces
          <br>
          Black: <b>{{ blackPieces }}</b> pieces
        </p>
        <button class="controls-button"  @click="resetGame">RESTART</button>
      </td>

      <td>
        <table id="othello-table">
          <tr v-for="rowIndex in 8" :key="'row' + rowIndex">
            <OthelloCell
                v-for="colIndex in 8"
                :key="'row' + rowIndex + 'col' + colIndex"
                :col="colIndex"
                :row="rowIndex"
                :value="grid[rowIndex - 1][colIndex - 1]"
                :size="cellSize"
                @left-click="cellClicked"
                @right-click="cellSecondaryClicked"
            />
          </tr>
        </table>
      </td>

    </tr>
  </table>

</template>

<script setup>

import OthelloCell from "@/components/OthelloCell.vue";
import { computed, onMounted, ref } from "vue";
import { randomIntBetween } from "@/util/MathUtil";
import {
  initGrid,
  resetGrid,
  addStarterPieces,
  placePiece,
  markPossibleMoves, togglePiece
} from "@/engines/OthelloEngine";

const defaultCellSize = 50;
const cellSize = ref(defaultCellSize);

const grid = ref([]);
initGrid(grid.value);

onMounted(() => {
  const table = document.getElementById("othello-table");
  cellSize.value = Math.floor(Math.min(window.innerWidth - table.offsetLeft, window.innerHeight - table.offsetTop) * 0.8 / 8);

  startGame();
})

// game

const currentPlayerRef = ref(1);
const whitePieces = computed(() => sumValuesCount(grid.value, 1));
const blackPieces = computed(() => sumValuesCount(grid.value, 2));

function sumValuesCount(arrayOfArrays, value) {
  let sum = 0;
  for (let i = 0; i < arrayOfArrays.length; i++) {
    sum += arrayOfArrays[i].filter(val => val === value).length;
  }
  return sum;
}

function resetGame() {
  resetGrid(grid.value);
  startGame();
}

function startGame() {
  addStarterPieces(grid.value);

  // random player starts
  setCurrentPlayer(randomIntBetween(1, 2));
  markPossibleMoves(grid.value);
}

function cellClicked(col, row) {
  const placed = placePiece(grid.value, currentPlayerRef.value, col -1, row -1);
  if (placed) {
    togglePlayer();
    markPossibleMoves(grid.value);
  }
}

function togglePlayer() {
  setCurrentPlayer(currentPlayerRef.value === 1 ? 2 : 1);
}

function setCurrentPlayer(playerVal) {
  currentPlayerRef.value = playerVal;
}

function cellSecondaryClicked(col, row) {
  // TODO debug function
  togglePiece(grid.value, col - 1, row - 1);
}

</script>

<style scoped>
.info-table, #othello-table {
  margin: 10px auto;
}
.info-table > tr > td {
  padding: 0 20px;
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

.player-white,
.player-black {
  display: inline-block;
  width: 100px;
  height: 20px;
  margin: 10px;
}
.player-white {
  background-color: white;
  border: 1px solid black;
}
.player-black {
  background-color: black;
  border: 1px solid white;
}

#othello-table {
  border-spacing: 0;
  border: 3px solid black;
}
</style>