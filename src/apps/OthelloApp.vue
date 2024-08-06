<template>

  <table class="info-table">
    <tr>

      <td>
        <p>Player One<br><b>{{ playerOne === 1 ? 'WHITE' : 'BLACK' }}</b></p>
        <p>Player Two<br><b>{{ playerOne === 1 ? 'BLACK' : 'WHITE' }}{{ cpuOpponent ? ' - COMPUTER' : '' }}</b></p>

        <button class="controls-button"  @click="cpuOpponent = false">2 PLAYERS</button>
        <br>
        <button class="controls-button"  @click="cpuOpponent = true">VS COMPUTER</button>
        <br><br>

        <span :class="currentPlayerRef === 1 ? 'player-white' : 'player-black'">
          Turn: {{ currentPlayerRef === 1 ? 'white' : 'black' }}
        </span>
        <p>
          White: <b>{{ whitePieces }}</b> pieces
          <br>
          Black: <b>{{ blackPieces }}</b> pieces
        </p>
        <button class="controls-button"  @click="resetGame">RESTART</button>
        <br><br>
        <button class="controls-button"  @click="runSingleSimulationStep">SIMULATE ONE STEP</button>
        <br>
        <button class="controls-button"  @click="runSimulatedGame(true)">SIMULATE GAME TO END</button>
        <br>
        <button class="controls-button"  @click="stopSimulation = true">STOP SIMULATION</button>

        <br><br>

        <label for="animationSpeed">animation speed (ms):</label>
        <input id="animationSpeed" type="number" class="controls-input" v-model="animationDurationMs" />

        <br>

        <label for="simulatedSpeed">simulated move speed (ms):</label>
        <input id="simulatedSpeed" type="number" class="controls-input" v-model="simulationStepLengthMs" />

        <br><br>
        <br><br>

        <h3>Board size</h3>
        <div class="controls-div">
          <label for="cellSize">cell size (px):</label>
          <input id="cellSize" type="number" class="controls-input" v-model="cellSize" />
          <br><br>
          <button class="controls-button"  @click="cellSize = calculateCellSizeByWindow()">RESET SIZE</button>
        </div>
      </td>

      <td>
        <h1 style="font-size: 60px;">Othello</h1>

        <table id="othello-table">
          <tr v-for="rowIndex in 8" :key="'row' + rowIndex">
            <OthelloCell
                v-for="colIndex in 8"
                :key="'row' + rowIndex + 'col' + colIndex"
                :col="colIndex"
                :row="rowIndex"
                :value="grid[rowIndex - 1][colIndex - 1]"
                :size="cellSize"
                :animation-duration-ms="animationDurationMs"
                @left-click="cellClicked"
            />
          </tr>
        </table>
      </td>

    </tr>
  </table>

</template>

<script setup>

import OthelloCell from "@/components/OthelloCell.vue";
import { computed, onMounted, ref, watch } from "vue";
import { randomIntBetween } from "@/util/MathUtil";
import {
  initGrid,
  resetGrid,
  addStarterPieces,
  placePiece,
  markPossibleMoves,
  emptyGrid, selectRandomOptionFromPossibleMoves
} from "@/engines/OthelloEngine";

const defaultCellSize = 50;
const cellSize = ref(defaultCellSize);

const animationDurationMs = ref(500);

const grid = ref([]);
initGrid(grid.value, 0);

const possibleMovesGrid = ref([]);
initGrid(possibleMovesGrid.value, []);

onMounted(() => {
  cellSize.value = calculateCellSizeByWindow();

  startGame();
})

function calculateCellSizeByWindow() {
  const table = document.getElementById("othello-table");
  return Math.floor(Math.min(window.innerWidth - table.offsetLeft, window.innerHeight - table.offsetTop) * 0.8 / 8);
}

// game

const playerOne = ref(1);
const cpuOpponent = ref(true); // cpu opponent by default
const currentPlayerRef = ref(1);
watch(cpuOpponent, () => {
  // if turning CPU opponent on and is Player Two turn, run single simulation step straight away
  if (isCpuOpponentTurn()) runSingleSimulationStep();
})

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
  resetGrid(grid.value, 0);
  startGame();
}

function startGame() {
  addStarterPieces(grid.value);

  // random player starts
  setCurrentPlayer(randomIntBetween(1, 2));
  playerOne.value = currentPlayerRef.value;
  resetPossibleMoves(true);
}

function cellClicked(col, row) {
  const placed = placePiece(grid.value, possibleMovesGrid.value, currentPlayerRef.value, col -1, row -1);

  if (placed) afterPiecePlaced();
}

function afterPiecePlaced() {
  if (whitePieces.value + blackPieces.value === 64) {
    // game has ended
    let winText = '';
    if (whitePieces.value === blackPieces.value) {
      // tie
      winText += 'The game ended in a tie of 32:32 points. What a wonderful match!';
    } else {
      const winnerName = whitePieces.value > blackPieces.value ? 'White' : 'Black';
      const winnerTiles = Math.max(whitePieces.value, blackPieces.value);
      winText += winnerName + ' has won with a score of ' + winnerTiles + ':' + (64 - winnerTiles) + '. Congratulations!'
    }

    requestAnimationFrame(() => {
      alert(winText);
      resetGame();
    })

    return true;
  } else {
    togglePlayer();
    resetPossibleMoves(true);
    runCpuMoveIfApplicable();
  }
  return false;
}

function resetPossibleMoves(tryAgain) {
  emptyGrid(possibleMovesGrid.value);
  markPossibleMoves(grid.value, possibleMovesGrid.value, currentPlayerRef.value);

  if (!isPossibleMoves()) {
    if (tryAgain) {
      alert('No possible moves! ' + (isCpuOpponentTurn() ? 'Computer has passed their turn.' : 'Turn passed!'));
      togglePlayer();
      resetPossibleMoves(false);
      requestAnimationFrame(() => runCpuMoveIfApplicable());
    }
  }
}

function runCpuMoveIfApplicable(){
  if (isCpuOpponentTurn()) setTimeout(runSingleSimulationStep, simulationStepLengthMs.value);
}

function isCpuOpponentTurn() {
  return cpuOpponent.value && playerOne.value !== currentPlayerRef.value;
}

function isPossibleMoves() {
  for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
    for (let colIndex = 0; colIndex < 8; colIndex++) {
      if (possibleMovesGrid.value[rowIndex][colIndex].length > 0) return true; // possible moves found
    }
  }
  return false;
}

function togglePlayer() {
  setCurrentPlayer(currentPlayerRef.value === 1 ? 2 : 1);
}

function setCurrentPlayer(playerVal) {
  currentPlayerRef.value = playerVal;
}

// SIMULATED (RANDOM) GAME

const simulationStepLengthMs = ref(750);
let lastSimulatedStepTimeStamp = 0;
let stopSimulation = false;

function runSingleSimulationStep() {
  runSimulatedGameStep(false);
  stopSimulation = true;
}

function runSimulatedGame(trySimulationAgain) {
  runSimulatedGameStep(trySimulationAgain);
}

function runSimulatedGameStep(trySimulationAgain) {
  if (!isCpuOpponentTurn() && stopSimulation) {
    stopSimulation = false;
    return;
  }

  if (getRemainingMoves() > 0) {
    if (Date.now() - lastSimulatedStepTimeStamp > simulationStepLengthMs.value) {

      const randomPlacement = selectRandomOptionFromPossibleMoves(possibleMovesGrid.value);
      if (randomPlacement) {
        placePiece(grid.value, possibleMovesGrid.value, currentPlayerRef.value, randomPlacement.col, randomPlacement.row);
        lastSimulatedStepTimeStamp = Date.now();
        if (afterPiecePlaced()) return; // game was won, no need to continue animating
      } else {
        // couldn't find next simulated step
        if (trySimulationAgain) {
          alert('Ran into a dead-end with simulation, resetting the game!');
          runSimulatedGame(false);
        } else {
          alert('Could not run simulator to the end.');
        }
        return;
      }

    }

    requestAnimationFrame(() => runSimulatedGameStep(trySimulationAgain));
  }
}

function getRemainingMoves() {
  return 64 - whitePieces.value - blackPieces.value;
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
  width: 180px;
  height: 120px;
  margin: 10px;
  line-height: 120px;
  font-size: 26px;
  font-weight: bold;
}
.player-white {
  background-color: white;
  border: 3px solid black;
  color: black;
}
.player-black {
  background-color: black;
  border: 3px solid white;
  color: white;
}

#othello-table {
  border-spacing: 0;
  border: 3px solid black;
}
</style>