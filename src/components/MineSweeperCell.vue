<template>
  <td :class="cellStyle">
    {{ cellValue ? cellValue : '' }}
  </td>
</template>

<script setup>
import {computed, defineProps} from "vue";

const props = defineProps({
  col: {
    type: Number,
    default: 0,
  },
  row: {
    type: Number,
    default: 0,
  },
  value: {
    type: Number,
    default: 0,
  },
})

const cellValue = computed(() => props.value);
const cellStyle = computed(() => getCellStyle(cellValue.value));
function getCellStyle(value) {
  return value
      ? (value < 0 ? 'cell-mine' : 'cell-value')
      : 'cell-empty';
}

</script>

<style scoped>
.cell-empty,
.cell-value,
.cell-mine {
  padding: 5px;
  border: 1px solid black;
  width: 20px;
  height: 20px;
}
.cell-value {
  background-color: #52da76;
}
.cell-mine {
  background-color: lightcoral;
}
</style>