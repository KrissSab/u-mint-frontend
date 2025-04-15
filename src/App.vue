<script setup lang="ts">
import { RouterView } from "vue-router";
import TheHeader from "./components/layout/TheHeader.vue";
import TheFooter from "./components/layout/TheFooter.vue";
import TheAdvert from "./components/layout/TheAdvert.vue";
</script>

<template>
  <div class="app-wrapper">
    <TheAdvert />
    <TheHeader />
    <main>
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
