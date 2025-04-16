<template>
  <div class="home-container gradient">
    <TrendingNFT />
    <TheFilter />
    <CollectionsTable />
  </div>
</template>

<script setup lang="ts">
import CollectionsTable from "./CollectionsTable.vue";
import TheFilter from "./TheFilter.vue";
import TrendingNFT from "./TrendingNFT.vue";
</script>

<style scoped>
.home-container {
  padding: 2rem;
  min-height: 100vh;
}
</style>
