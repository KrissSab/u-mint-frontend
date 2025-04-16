<template>
  <div class="filter-container">
    <div class="trend-switch">
      <button
        v-for="option in trendOptions"
        :key="option.value"
        :class="['trend-option', { active: selectedTrend === option.value }]"
        @click="selectedTrend = option.value"
      >
        {{ option.label }}
      </button>
    </div>
    <div class="right-side-filters">
      <div class="hours-switch">
        <button
          v-for="period in timePeriods"
          :key="period.value"
          :class="['time-option', { active: selectedPeriod === period.value }]"
          @click="selectedPeriod = period.value"
        >
          {{ period.label }}
        </button>
      </div>

      <div class="chains-dropdown">
        <button class="chains-button" @click="toggleChainsDropdown">
          {{ selectedChain }}
          <span class="dropdown-icon">▼</span>
        </button>
        <div v-if="showChainsDropdown" class="dropdown-menu">
          <div
            v-for="chain in chains"
            :key="chain"
            class="dropdown-item"
            @click="selectChain(chain)"
          >
            {{ chain }}
          </div>
        </div>
      </div>

      <button class="view-all-button" @click="viewAll">View all</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const trendOptions = [
  { label: "Trending", value: "trending" },
  { label: "Top", value: "top" },
];

const timePeriods = [
  { label: "1h", value: "1h" },
  { label: "6h", value: "6h" },
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
];

const chains = ["All chains", "Ethereum", "BSC", "Polygon", "Solana"];

const selectedTrend = ref("trending");
const selectedPeriod = ref("1h");
const selectedChain = ref("All chains");
const showChainsDropdown = ref(false);

const toggleChainsDropdown = () => {
  showChainsDropdown.value = !showChainsDropdown.value;
};

const selectChain = (chain: string) => {
  selectedChain.value = chain;
  showChainsDropdown.value = false;
};

const viewAll = () => {
  console.log("View all clicked");
};
</script>

<style scoped>
.filter-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: 3rem;
  align-items: center;
  border-radius: 12px;
}

.trend-switch,
.hours-switch {
  display: flex;
  width: fit-content;
  background-color: #f0f0f0;
  padding: 1px;
  border-radius: 0.75rem;
  overflow: hidden;
}

.right-side-filters {
  display: flex;
  justify-content: end;
  gap: 1rem;
}

.trend-option,
.time-option {
  padding: 8px 16px;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.trend-option.active,
.time-option.active {
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #000;
  font-weight: 700;
  font-size: 1rem;
}

.chains-dropdown {
  position: relative;
}

.chains-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-size: 1rem;
}

.dropdown-icon {
  font-size: 10px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 150px;
  z-index: 10;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.view-all-button {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  font-size: 1rem;
}
</style>
