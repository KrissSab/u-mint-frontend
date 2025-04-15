<template>
  <header class="header-container">
    <NavBar />
  </header>
</template>
<script setup lang="ts">
import NavBar from "./NavBar.vue";
</script>
<style scoped>
.header-container {
  width: 100vw;
  left: 0;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--gradient-end);
}
</style>
