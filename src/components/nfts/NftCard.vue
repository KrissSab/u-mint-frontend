<template>
  <div class="nft-card" @click="$emit('click', nft)">
    <div class="nft-image">
      <img :src="nft.image" :alt="nft.name" />
      <div v-if="nft.isForSale" class="sale-badge">
        <span>FOR SALE</span>
      </div>
    </div>
    <div class="nft-info">
      <h3 class="nft-name">{{ nft.name }}</h3>
      <p v-if="nft.description" class="nft-description">
        {{ truncateText(nft.description, 60) }}
      </p>
      <div v-if="nft.price && nft.isForSale" class="nft-price">
        <span>{{ nft.price }} {{ nft.currency }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { PropType } from "vue";
import type { Nft } from "../../services/nfts";

// Props
defineProps({
  nft: {
    type: Object as PropType<Nft>,
    required: true,
  },
});

// Emits
defineEmits(["click"]);

// Methods
const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};
</script>

<style scoped>
.nft-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nft-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nft-image {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.nft-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.nft-card:hover .nft-image img {
  transform: scale(1.05);
}

.sale-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.nft-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.nft-name {
  margin: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 1.1rem;
}

.nft-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.nft-price {
  font-weight: 600;
  color: var(--primary-color);
  margin-top: auto;
}
</style>
