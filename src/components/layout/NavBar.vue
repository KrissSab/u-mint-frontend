<template>
  <div class="navbar">
    <nav class="nav-left-side">
      <router-link to="/" class="logo-container left-align">
        <img src="/u-mint-white-logo.png" alt="app-logo" class="logo" />
        <img src="/u-mint-white-text.png" alt="app-text" class="logo-text" />
      </router-link>
      <h1 class="vertical-line">│</h1>
      <TheButton variant="navigation" size="sm"> Create</TheButton>
      <TheButton variant="navigation" size="sm">News</TheButton>
    </nav>
    <SearchBar />
    <ProfileNavigation />
  </div>
</template>

<script setup lang="ts">
import TheButton from "../shared/TheButton.vue";
import SearchBar from "./SearchBar.vue";
import ProfileNavigation from "./ProfileNavigation.vue";
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
  text-decoration: none;
  cursor: pointer;
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
</style>
