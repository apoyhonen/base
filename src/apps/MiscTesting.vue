<template>
  <img alt="Vue logo" src="../assets/vue_logo.png">
  <h3>Testing... click on the squares!</h3>
  <br>
  <MiscTesting :class="'misc'"/>
</template>

<script>
import MiscTesting from '../components/MiscTesting.vue'

export default {
  name: 'App',
  components: {
    MiscTesting
  }
}
</script>

<style scoped>
</style>
