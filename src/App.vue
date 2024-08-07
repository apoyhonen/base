<template>
  <table>
    <tr>

      <td class="button-cell">
        <template v-for="(app, index) in apps" :key="'buttonTemplate-' + index">
          <button class="app-button" @click="shownApp = app.refName">{{ app.name }}</button>
          <br>
        </template>
      </td>

      <td class="app-cell">
        <Platforms v-if="shownApp === 'platforms'"></Platforms>
        <Swish v-if="shownApp === 'swish'"></Swish>
        <Othello v-if="shownApp === 'othello'"></Othello>
        <Snake v-if="shownApp === 'snake'"></Snake>
        <Pong v-if="shownApp === 'pong'"></Pong>
        <Breakout v-if="shownApp === 'breakout'"></Breakout>
        <MineSweeper v-if="shownApp === 'minesweeper'"></MineSweeper>
        <CircleMotion v-if="shownApp === 'circlemotion'"></CircleMotion>
        <CanvasCharts v-if="shownApp === 'canvascharts'"></CanvasCharts>
        <MiscTesting v-if="shownApp === 'misctesting'"></MiscTesting>
      </td>

    </tr>
  </table>
</template>

<script setup>

import Platforms from "@/apps/PlatformApp.vue";
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

const shownApp = ref("platforms");

const apps = [];
apps.push({ refName: 'platforms', name: 'Platforms' });
apps.push({ refName: 'swish', name: 'Swish' });
apps.push({ refName: 'othello', name: 'Othello' });
apps.push({ refName: 'snake', name: 'Snake' });
apps.push({ refName: 'pong', name: 'Pong' });
apps.push({ refName: 'breakout', name: 'Breakout' });
apps.push({ refName: 'minesweeper', name: 'Minesweeper' });
apps.push({ refName: 'circlemotion', name: 'CircleMotion' })
apps.push({ refName: 'canvascharts', name: 'Auto-Charts' });
apps.push({ refName: 'misctesting', name: 'Misc Testing' });

/*
import Platform from "@/apps/PlatformApp.vue";
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
/* main body */

body {
  text-align: center;
  margin: 0;
}

/* main app structure */

.button-cell {
  width: 200px;
  vertical-align: top;
  padding-top: 101px;
}
.app-button {
  width: 180px;
  margin: 5px 10px;
  padding: 8px 30px;
  background-color: darkolivegreen;
  color: white;
  font-weight: bold;
  border: none;
}
.app-cell {
  width: 100%;
  text-align: center;
}

/* generic styles */

table {
  margin: 0 auto;
}
table > tr > td {
  padding: 0 20px;
}
h1 {
  font-size: 42px;
}
canvas {
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
p {
  margin: 0;
}
</style>