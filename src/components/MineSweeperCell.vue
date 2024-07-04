<template>
  <td :class="hiddenCellStyle" v-if="!open" @click="openClick" @auxclick.prevent="rightClick"></td>
  <td :class="cellStyle" v-if="open"></td>
</template>

<script setup>
import { computed, defineProps, ref, watch, defineEmits } from "vue";

const props = defineProps({
  col: Number,
  row: Number,
  value: Number,
  resetCounter: Number,
  shownEmptyCellArray: Array,
  preventClicks: Boolean,
})

const cellValue = computed(() => props.value);
const cellStyle = computed(() => getCellStyle(cellValue.value));
function getCellStyle(value) {
  return !value
      ? 'cell-empty' :
      (value < 0 ? 'cell-mine' : getValueCellStyle(value));
}
function getValueCellStyle(value) {
  if (value > 7) return 'cell-value-8';
  else if (value > 6) return 'cell-value-7';
  else if (value > 5) return 'cell-value-6';
  else if (value > 4) return 'cell-value-5';
  else if (value > 3) return 'cell-value-4';
  else if (value > 2) return 'cell-value-3';
  else if (value > 1) return 'cell-value-2';
  else return 'cell-value-1';
}

const emit = defineEmits([ 'boom', 'emptyClick', 'flagged' ]);
const open = ref(false);
function openClick() {
  if (props.preventClicks) return;
  open.value = true;
  const value = cellValue.value;
  if (value) {
    if (value === -1) emit('boom');
  } else {
    emit('emptyClick', props.col, props.row);
  }
}

const flagged = ref(false);
function rightClick() {
  if (props.preventClicks) return;
  flagged.value = !flagged.value;
  emit('flagged', props.col, props.row, flagged.value);
}
const hiddenCellStyle = computed(() => flagged.value ? 'cell-flagged' : 'cell-hidden');

const resetTrigger = computed(() => props.resetCounter);
watch(resetTrigger, () => {
  open.value = false;
  flagged.value = false;
});

const shownCells = ref(props.shownEmptyCellArray);
watch(shownCells, () => {
  if (open.value === false) { // if this is hidden
    shownCells.value.forEach(cell => {
      if (cell.col === props.col && cell.row === props.row) {
        open.value = true; // open if this should be shown
      }
    })
  }
}, { deep: true })

</script>

<style scoped>
td {
  background-size: contain;
  width: 20px;
  height: 20px;
  user-select: none;
  line-height: 19px;
}
.cell-hidden {
  background-image: url("../assets/minesweeper/closed.svg");
}
.cell-empty {
  background-image: url("../assets/minesweeper/type0.svg");
}
.cell-mine {
  background-image: url("../assets/minesweeper/mine_red.svg");
}
.cell-flagged {
  background-image: url("../assets/minesweeper/flag.svg");
}
.cell-value-1 {
  background-image: url("../assets/minesweeper/type1.svg");
}
.cell-value-2 {
  background-image: url("../assets/minesweeper/type2.svg");
}
.cell-value-3 {
  background-image: url("../assets/minesweeper/type3.svg");
}
.cell-value-4 {
  background-image: url("../assets/minesweeper/type4.svg");
}
.cell-value-5 {
  background-image: url("../assets/minesweeper/type5.svg");
}
.cell-value-6 {
  background-image: url("../assets/minesweeper/type6.svg");
}
.cell-value-7 {
  background-image: url("../assets/minesweeper/type7.svg");
}
.cell-value-8 {
  background-image: url("../assets/minesweeper/type8.svg");
}
</style>