<template>
  <td :class="hiddenCellStyle" v-if="!open" @click="openClick" @auxclick.prevent="rightClick"></td>
  <td :class="cellStyle" v-if="open">
    {{ cellValue ? cellValue : '' }}
  </td>
</template>

<script setup>
import { computed, defineProps, ref, watch } from "vue";

const props = defineProps({
  col: Number,
  row: Number,
  value: Number,
  resetCounter: Number,
})

const cellValue = computed(() => props.value);
const cellStyle = computed(() => getCellStyle(cellValue.value));
function getCellStyle(value) {
  return value
      ? (value < 0 ? 'cell-mine' : 'cell-value')
      : 'cell-empty';
}

const open = ref(false);
function openClick() {
  open.value = true;
}

const flagged = ref(false);
function rightClick() {
  flagged.value = !flagged.value;
}
const hiddenCellStyle = computed(() => flagged.value ? 'cell-flagged' : 'cell-hidden');

const resetTrigger = computed(() => props.resetCounter);
watch(resetTrigger, () => {
  open.value = false;
  flagged.value = false;
});

</script>

<style scoped>
.cell-hidden,
.cell-empty,
.cell-value,
.cell-mine,
.cell-flagged {
  padding: 5px;
  border: 1px solid black;
  width: 20px;
  height: 20px;
  user-select: none;
}
.cell-hidden {
  background-color: darkgray;
}
.cell-value {
  background-color: #52da76;
}
.cell-mine {
  background-color: lightcoral;
}
.cell-flagged {
  background-color: darkred;
}
</style>