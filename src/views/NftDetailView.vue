<template>
  <div class="nft-detail-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading NFT...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error Loading NFT</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back</button>
    </div>

    <!-- NFT content -->
    <div v-else-if="nft" class="nft-content">
      <div class="nft-container">
        <div class="nft-image-container">
          <img :src="nft.image" :alt="nft.name" class="nft-image" />
        </div>
        <div class="nft-details">
          <h1>{{ nft.name }}</h1>

          <div class="ownership-info">
            <div class="owner-section">
              <span class="label">Owned by</span>
              <router-link :to="`/profile/${nft.ownerId}`" class="link">
                {{ shortenAddress(nft.ownerId) }}
              </router-link>
            </div>

            <div class="creator-section">
              <span class="label">Created by</span>
              <router-link :to="`/profile/${nft.creatorId}`" class="link">
                {{ shortenAddress(nft.creatorId) }}
              </router-link>
            </div>
          </div>

          <div v-if="nft.collectionId" class="collection-info">
            <span class="label">Collection</span>
            <router-link :to="`/collections/${nft.collectionId}`" class="link">
              {{ collectionName }}
            </router-link>
          </div>

          <div class="description-section">
            <h3>Description</h3>
            <p>{{ nft.description || "No description provided." }}</p>
          </div>

          <div
            v-if="nft.properties && Object.keys(nft.properties).length > 0"
            class="properties-section"
          >
            <h3>Properties</h3>
            <div class="properties-grid">
              <div
                v-for="(value, name) in nft.properties"
                :key="name"
                class="property-item"
              >
                <div class="property-name">{{ name }}</div>
                <div class="property-value">{{ value }}</div>
              </div>
            </div>
          </div>

          <div v-if="nft.isForSale" class="price-section">
            <h3>Price</h3>
            <div class="price-amount">{{ nft.price }} {{ nft.currency }}</div>
            <button v-if="!isOwner" class="buy-button">Buy Now</button>
          </div>

          <div v-if="isOwner" class="owner-actions">
            <button class="action-button" @click="handleEdit">
              <span class="icon">✏️</span> Edit
            </button>
            <button
              v-if="!nft.isForSale"
              class="action-button sell-button"
              @click="handleSell"
            >
              List for Sale
            </button>
            <button
              v-else
              class="action-button cancel-button"
              @click="handleCancelSale"
            >
              Cancel Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import userStore from "../store/userStore";
import nftsApi from "../services/nfts";
import collectionsApi from "../services/collections";
import type { Nft } from "../services/nfts";
import type { Collection } from "../services/collections";

// Router and route
const router = useRouter();
const route = useRoute();

// State
const nft = ref<Nft | null>(null);
const collection = ref<Collection | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

// Computed
const isOwner = computed(() => {
  if (!nft.value || !userStore.state.user) return false;
  return nft.value.ownerId === userStore.state.user.id;
});

const collectionName = computed(() => {
  return collection.value?.name || "Unknown Collection";
});

// Methods
const fetchNft = async () => {
  const nftId = route.params.id as string;
  if (!nftId) {
    error.value = "NFT ID not provided";
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    nft.value = await nftsApi.getOne(nftId);

    // If the NFT belongs to a collection, fetch collection details
    if (nft.value.collectionId) {
      fetchCollection(nft.value.collectionId);
    }
  } catch (err: any) {
    console.error("Error fetching NFT:", err);
    error.value = err.message || "Failed to load NFT";
  } finally {
    isLoading.value = false;
  }
};

const fetchCollection = async (collectionId: string) => {
  try {
    collection.value = await collectionsApi.getOne(collectionId);
  } catch (err: any) {
    console.error("Error fetching collection:", err);
  }
};

const goBack = () => {
  router.back();
};

const shortenAddress = (address: string) => {
  if (!address) return "";
  return (
    address.substring(0, 6) + "..." + address.substring(address.length - 4)
  );
};

const handleEdit = () => {
  // To be implemented
  console.log("Edit NFT");
};

const handleSell = () => {
  // To be implemented
  console.log("List for sale");
};

const handleCancelSale = () => {
  // To be implemented
  console.log("Cancel sale");
};

// Lifecycle hooks
onMounted(() => {
  fetchNft();
});
</script>

<style scoped>
.nft-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--secondary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-state h2 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.error-state p {
  color: #777;
  margin-bottom: 1.5rem;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: var(--secondary-light);
}

/* NFT content */
.nft-container {
  display: grid;
  grid-template-columns: minmax(300px, 1fr) 1fr;
  gap: 3rem;
  align-items: start;
}

.nft-image-container {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nft-image {
  width: 100%;
  display: block;
}

.nft-details {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nft-details h1 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 2rem;
}

.ownership-info {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.owner-section,
.creator-section,
.collection-info {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 0.25rem;
}

.link {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.collection-info {
  margin-bottom: 1.5rem;
}

.description-section {
  margin-bottom: 1.5rem;
}

.description-section h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.description-section p {
  color: #555;
  line-height: 1.5;
}

.properties-section {
  margin-bottom: 1.5rem;
}

.properties-section h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.properties-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.property-item {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
}

.property-name {
  color: #777;
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.property-value {
  color: var(--text-color);
  font-weight: 500;
}

.price-section {
  margin-bottom: 1.5rem;
}

.price-section h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.price-amount {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 1rem;
}

.buy-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.buy-button:hover {
  background-color: var(--primary-light);
}

.owner-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.action-button:hover {
  background-color: #e0e0e0;
}

.sell-button {
  background-color: var(--secondary-color);
  color: white;
}

.sell-button:hover {
  background-color: var(--secondary-light);
}

.cancel-button {
  background-color: #e74c3c;
  color: white;
}

.cancel-button:hover {
  background-color: #c0392b;
}

@media (max-width: 768px) {
  .nft-container {
    grid-template-columns: 1fr;
  }

  .ownership-info {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
