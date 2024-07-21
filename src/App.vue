<template>
  <div class="buttonBanner">
    <template v-for="(app, index) in apps" :key="'buttonTemplate-' + index">
      <button class="appButton" @click="shownApp = app.refName">{{ app.name }}</button>
    </template>
  </div>
  <Swish v-if="shownApp === 'swish'"></Swish>
  <Othello v-if="shownApp === 'othello'"></Othello>
  <Snake v-if="shownApp === 'snake'"></Snake>
  <Pong v-if="shownApp === 'pong'"></Pong>
  <Breakout v-if="shownApp === 'breakout'"></Breakout>
  <MineSweeper v-if="shownApp === 'minesweeper'"></MineSweeper>
  <CircleMotion v-if="shownApp === 'circlemotion'"></CircleMotion>
  <CanvasCharts v-if="shownApp === 'canvascharts'"></CanvasCharts>
  <MiscTesting v-if="shownApp === 'misctesting'"></MiscTesting>
</template>

<script setup>

import Swish from "@/apps/SwishApp.vue"
import Snake from "@/apps/SnakeApp.vue";
import Pong from "@/apps/PongApp.vue";
import Breakout from "@/apps/BreakoutApp.vue";
import MineSweeper from "@/apps/MineSweeperApp.vue";
import Othello from "@/apps/OthelloApp.vue";
import CircleMotion from "@/apps/CircleMotionAnimationApp.vue";
import CanvasCharts from "@/apps/CanvasCharts.vue";
import MiscTesting from "@/apps/MiscTesting.vue";

import { ref } from "vue";

const shownApp = ref("circlemotion");

const apps = [];
apps.push({ refName: 'swish', name: 'Swish *' });
apps.push({ refName: 'othello', name: 'Othello' });
apps.push({ refName: 'snake', name: 'Snake' });
apps.push({ refName: 'pong', name: 'Pong' });
apps.push({ refName: 'breakout', name: 'Breakout' });
apps.push({ refName: 'minesweeper', name: 'Minesweeper' });
apps.push({ refName: 'circlemotion', name: 'CircleMotion *' })
apps.push({ refName: 'canvascharts', name: 'Auto-Charts' });
apps.push({ refName: 'misctesting', name: 'Misc Testing' });

/*
import Swish from "@/apps/SwishApp.vue"
import Snake from "@/apps/SnakeApp.vue";
import Pong from "@/apps/PongApp.vue";
import Breakout from "@/apps/BreakoutApp.vue";
import MineSweeper from "@/apps/MineSweeperApp.vue";
import Othello from "@/apps/OthelloApp.vue";
import CircleMotion from "@/apps/CircleMotionAnimationApp.vue";
import CanvasCharts from "@/apps/CanvasCharts.vue";
import MiscTesting from "@/apps/MiscTesting.vue";

import CanvasChartsOriginal from "@/apps/CanvasChartsOriginal.vue";
*/
</script>

<style>
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