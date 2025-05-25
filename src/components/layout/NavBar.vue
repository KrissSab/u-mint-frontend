<template>
  <div class="navbar">
    <nav class="nav-left-side">
      <router-link to="/" class="logo-container left-align">
        <img src="/u-mint-white-logo.png" alt="app-logo" class="logo" />
        <img src="/u-mint-white-text.png" alt="app-text" class="logo-text" />
      </router-link>
      <h1 class="vertical-line">│</h1>
      <router-link to="/collections">
        <TheButton variant="navigation" size="sm">Collections</TheButton>
      </router-link>

      <!-- Create dropdown -->
      <div class="dropdown">
        <TheButton variant="navigation" size="sm" class="dropdown-trigger">
          Create <span class="dropdown-arrow">▼</span>
        </TheButton>
        <div class="dropdown-content">
          <router-link to="/collections" class="dropdown-item">
            Create Collection
          </router-link>
          <div class="dropdown-divider"></div>
          <router-link to="/create-nft" class="dropdown-item">
            Create NFT
          </router-link>
        </div>
      </div>

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

/* Dropdown styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.dropdown-arrow {
  font-size: 0.7rem;
  margin-left: 0.25rem;
}

.dropdown-content {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 180px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
}

.dropdown:hover .dropdown-content {
  display: block;
}

.dropdown-item {
  display: block;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--text-color);
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #eee;
  margin: 0;
}
</style>
