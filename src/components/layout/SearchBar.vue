<template>
  <section class="search-bar center-align">
    <div class="search-bar-container">
      <input
        class="search-bar-input"
        type="text"
        placeholder="Search"
        v-model="searchText"
      />
      <button class="clear-button" v-if="searchText" @click="clearSearch">
        /
      </button>
      <span class="search-icon">
        <svg
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 -960 960 960"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="search"
        >
          <title>Search</title>
          <path
            d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
          ></path>
        </svg>
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";

const searchText = ref("");

const clearSearch = () => {
  searchText.value = "";
};
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.search-bar-container {
  position: relative;
  width: 100%;
  max-width: 500px;
  border-radius: 0.75rem;
  background-color: rgba(102, 51, 153, 0.2);
  display: flex;
  align-items: center;
}

.search-bar-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 24px;
  background-color: transparent;
  color: var(--light-text-color);
  font-size: 1rem;
  outline: none;
  padding-left: 2.5rem;
}

.search-bar-input::placeholder {
  padding-left: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text-color);
  pointer-events: none;
}

.clear-button {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: var(--light-text-color);
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  outline: none;
}

.clear-button:hover {
  background-color: rgba(255, 255, 255, 0.4);
}
</style>
