<template>
  <div class="trend-container">
    <div class="gif-background"></div>
    <div class="nft-card">
      <img src="/chill_guy.png" alt="nft-image" class="nft-img" />
      <div class="nft-info">
        <h1>Chill Guys ✓</h1>
        <h4>by Kriss</h4>
        <h4>999 items - 0.5 eth</h4>
      </div>
      <div class="minting-status">
        <div class="status-color"></div>
        <p>Minting now</p>
      </div>
    </div>
    <p class="view-drop">View drop</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.trend-container {
  padding: 2rem;
  position: relative;
  border-radius: 0.75rem;
  background-color: rgba(0, 0, 0, 0.3);
  height: calc(-21.12px + 25vw);
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.gif-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/giphy.gif");
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.3;
  border-radius: 0.75rem;
  z-index: 0;
}

.nft-card,
.view-drop {
  position: relative;
  z-index: 1;
}

.nft-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.nft-info {
  display: flex;
  flex-direction: column;
  color: var(--light-text-color);
  padding-block: 1.5rem;
  gap: 0.5rem;
}

.nft-img {
  border-radius: 1rem;
  background-color: var(--light-text-color);
  max-width: 64px;
  max-height: 64px;
}

.minting-status {
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  background-color: var(--light-text-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
}

.status-color {
  height: 1rem;
  width: 1rem;
  border-radius: 1rem;
  background-color: greenyellow;
}

.view-drop {
  align-self: flex-end;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  background-color: var(--light-text-color);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
}
</style>
