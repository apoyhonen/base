<template>
  <div class="buttonBanner">
    <button class="appButton" @click="shownApp = 'smileyPong'">Pong</button>
    <button class="appButton" @click="shownApp = 'breakout'">Breakout</button>
    <button class="appButton" @click="shownApp = 'minesweeper'">MineSweeper</button>
    <button class="appButton" @click="shownApp = 'canvascharts'">CanvasCharts</button>
    <button class="appButton" @click="shownApp = 'misctesting'">MiscTesting</button>
  </div>
  <SmileyPong v-if="shownApp === 'smileyPong'"></SmileyPong>
  <Breakout v-if="shownApp === 'breakout'"></Breakout>
  <MineSweeper v-if="shownApp === 'minesweeper'"></MineSweeper>
  <CanvasCharts v-if="shownApp === 'canvascharts'"></CanvasCharts>
  <MiscTesting v-if="shownApp === 'misctesting'"></MiscTesting>
</template>

<script setup>
import SmileyPong from "@/apps/SmileyPong.vue";
import Breakout from "@/apps/BreakoutTutorial.vue";
import MineSweeper from "@/apps/MineSweeper.vue";
import CanvasCharts from "@/apps/CanvasCharts.vue";
//import CanvasChartsOriginal from "@/apps/CanvasChartsOriginal.vue";
import MiscTesting from "@/apps/MiscTesting.vue";

import { ref } from "vue";

const shownApp = ref("smileyPong");

/*
import Pong from "@/apps/SmileyPong.vue";
import Breakout from "@/apps/BreakoutTutorial.vue";
import MineSweeper from "@/apps/MineSweeper.vue";
import CanvasCharts from "@/apps/CanvasCharts.vue";
import App from "@/apps/CanvasChartsOriginal.vue";
import MiscTesting from "@/apps/MiscTesting.vue";
*/
</script>

<style>
#app {

}
body {
  text-align: center;
  margin: 0;
}
.buttonBanner {
  width: 100%;
  height: 40px;
  background-color: white;
}
.appButton {
  margin: 5px 10px;
  padding: 8px 30px;
  background-color: darkolivegreen;
  color: white;
  font-weight: bold;
  border: none;
}
</style>