<template>
  <h3 style="font-size: 40px; font-weight: bold; font-style: italic;">MineSweeper!</h3>
  <div class="mine-controls">
    <label>columns</label>
    <input type="number" class="mine-controls-input" v-model="tableCols" />
    <label>rows</label>
    <input type="number" class="mine-controls-input" v-model="tableRows" />
    <button @click="resetGame">RESET GAME</button>
  </div>
  <table class="mine-table">
    <tr v-for="row in tableRows" :key="'row' + row">
      <td class="table-cell" v-for="col in tableCols" :key="'col' + col">{{row}} : {{col}}</td>
    </tr>
  </table>
</template>

<script setup>
import {ref} from "vue";

const tableRows = ref(10);
const tableCols = ref(10);

function resetGame() {
  tableRows.value = randomNumber();
  tableCols.value = randomNumber();
}

function randomNumber() {
  return Math.floor(Math.random() * 9 + 2);
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
.table-cell {
  padding: 5px;
  border: 1px solid black;
  background-color: #52da76;
}
</style>