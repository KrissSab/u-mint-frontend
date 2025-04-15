<template>
  <div class="advert-container" v-if="isVisible">
    <h1 class="advert">Hop On With Your NFT's</h1>
    <h1 class="cross" @click="hideAdvert">x</h1>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isVisible = ref(true);
const hideAdvert = () => {
  isVisible.value = false;
};
</script>

<style scoped>
.advert-container {
  position: relative;
  width: 100vw;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-block: 0.75rem;

  background-color: var(--dark-background);
}
.advert {
  text-align: center;
  color: var(--accent-dark);
}

.cross {
  position: absolute;
  right: 0;
  margin-right: 1rem;
  font-size: x-large;
}
.cross:hover {
  cursor: pointer;
  scale: 1.2;
  transition: ease-in 1s;
}
</style>
