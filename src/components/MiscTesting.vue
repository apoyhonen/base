<template>
  <table :style="'margin: 0px auto;'"><tr>
    <td></td>
    <template v-for="n in 4" :key="n">
      <td><ColorChangingSquare /></td>
      <td></td>
    </template>
  </tr></table>
</template>

<script>
import ColorChangingSquare from "@/components/ColorChangingSquare.vue";

export default {
  name: 'MiscTesting',
  components: {
    ColorChangingSquare
  }
}
</script>

<style scoped>
td {
  width: 50px;
}
</style>
