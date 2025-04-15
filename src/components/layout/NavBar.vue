<template>
  <div class="navbar">
    <section class="nav-left-side">
      <section class="logo-container left-align">
        <img src="/u-mint-white-logo.png" alt="app-logo" class="logo" />
        <img src="/u-mint-white-text.png" alt="app-text" class="logo-text" />
      </section>
      <h1 class="vertical-line">│</h1>
      <TheButton variant="navigation" size="sm"> Create</TheButton>
      <TheButton variant="navigation" size="sm">News</TheButton>
    </section>
    <SearchBar />
    <section class="nav-right-side right-align">
      <TheButton variant="secondary" size="sm">Login</TheButton>
    </section>
  </div>
</template>

<script setup lang="ts">
import TheButton from "../shared/TheButton.vue";
import SearchBar from "./SearchBar.vue";
</script>

<style scoped>
.navbar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: space-between;
  width: 100%;
  color: var(--primary-light);
  align-items: center;
  padding: 0.5rem 2rem;
}

.vertical-line {
  padding: 0 1rem;
}

.nav-right-side,
.nav-left-side {
  display: flex;
  align-items: center;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo {
  width: 1.5rem;
  height: 1.5rem;
}

.logo-text {
  margin-top: -1.5px;
  height: 1.5rem;
}

.left-align {
  text-align: left;
}

.center-align {
  text-align: center;
}

.right-align {
  justify-content: end;
}
</style>
