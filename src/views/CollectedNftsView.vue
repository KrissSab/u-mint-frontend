<template>
  <div class="collected-nfts-view">
    <!-- Header -->
    <div class="view-header">
      <h1>My NFTs</h1>
      <p class="subtitle">All NFTs you own</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading collected NFTs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error Loading NFTs</h2>
      <p>{{ error }}</p>
    </div>

    <!-- Filter and Search Options -->
    <div v-else class="filter-container">
      <div class="search-bar">
        <div class="search-input-container">
          <svg
            fill="currentColor"
            height="20"
            role="img"
            viewBox="0 0 24 24"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            class="search-icon"
          >
            <title>Search</title>
            <path
              d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            ></path>
          </svg>
          <input
            type="text"
            placeholder="Search NFTs..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>

        <div class="filter-options">
          <select v-model="filterOption" class="filter-select">
            <option value="all">All NFTs</option>
            <option value="recent">Recently Added</option>
            <option value="oldest">Oldest First</option>
            <option value="collection">By Collection</option>
          </select>
        </div>
      </div>

      <!-- Collection Filter (shows only when "By Collection" is selected) -->
      <div v-if="filterOption === 'collection'" class="collection-filter">
        <label for="collection-select">Select Collection:</label>
        <select
          id="collection-select"
          v-model="selectedCollection"
          class="collection-select"
        >
          <option value="">All Collections</option>
          <option
            v-for="col in uniqueCollections"
            :key="col.id"
            :value="col.id"
          >
            {{ col.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- NFT Grid -->
    <div v-if="!isLoading && !error" class="nft-grid">
      <!-- Empty State -->
      <div v-if="filteredNfts.length === 0" class="empty-state">
        <svg
          fill="currentColor"
          height="64"
          role="img"
          viewBox="0 0 24 24"
          width="64"
          xmlns="http://www.w3.org/2000/svg"
          class="empty-icon"
        >
          <title>Empty Collection</title>
          <path
            d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
          ></path>
          <path
            d="M14.14 12.25l-2.79 2.79c-.2.2-.51.2-.71 0l-1.79-1.79c-.2-.2-.2-.51 0-.71s.51-.2.71 0l1.44 1.44 2.43-2.44c.2-.2.51-.2.71 0 .19.2.19.52 0 .71z"
          ></path>
        </svg>
        <p>
          {{
            searchQuery
              ? "No NFTs found matching your search"
              : "You don't have any NFTs yet"
          }}
        </p>
        <div class="empty-actions">
          <button class="back-button" @click="resetSearch" v-if="searchQuery">
            Back to all NFTs
          </button>
          <router-link to="/marketplace" class="browse-button">
            Browse Marketplace
          </router-link>
        </div>
      </div>

      <!-- NFT Items -->
      <div v-else class="nft-items">
        <div
          v-for="nft in filteredNfts"
          :key="nft._id"
          class="nft-item"
          @click="navigateToNft(nft._id)"
        >
          <div class="nft-image-container">
            <img :src="nft.imageUrl" :alt="nft.name" class="nft-image" />
          </div>
          <div class="nft-info">
            <h3>{{ nft.name }}</h3>
            <div
              class="collection-info"
              v-if="getCollectionName(nft.collectionId)"
            >
              <span>Collection: {{ getCollectionName(nft.collectionId) }}</span>
            </div>
            <div class="acquired-info">
              <span class="acquired-label">Acquired:</span>
              <span class="acquired-date">{{ formatDate(nft.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import nftsApi from "../services/nfts";
import collectionsApi from "../services/collections";
import userStore from "../store/userStore";
import type { Nft } from "../services/nfts";
import type { Collection } from "../services/collections";

// Router
const router = useRouter();

// State
const collectedNfts = ref<Nft[]>([]);
const collections = ref<Collection[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref("");
const filterOption = ref("all");
const selectedCollection = ref("");

// Computed properties
const filteredNfts = computed(() => {
  if (
    !searchQuery.value &&
    filterOption.value === "all" &&
    !selectedCollection.value
  ) {
    return collectedNfts.value;
  }

  let filtered = collectedNfts.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (nft) =>
        nft.name.toLowerCase().includes(query) ||
        (nft.description && nft.description.toLowerCase().includes(query))
    );
  }

  // Apply collection filter
  if (selectedCollection.value) {
    filtered = filtered.filter(
      (nft) => nft.collectionId === selectedCollection.value
    );
  }

  // Apply sort filter
  if (filterOption.value === "recent") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } else if (filterOption.value === "oldest") {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  return filtered;
});

const uniqueCollections = computed(() => {
  const collectionMap = new Map();

  collectedNfts.value.forEach((nft) => {
    if (nft.collectionId && !collectionMap.has(nft.collectionId)) {
      const collection = collections.value.find(
        (c) => c._id === nft.collectionId
      );
      if (collection) {
        collectionMap.set(nft.collectionId, {
          id: collection._id,
          name: collection.name,
        });
      }
    }
  });

  return Array.from(collectionMap.values());
});

// Methods
const fetchCollectedNfts = async () => {
  if (!userStore.state.user?.id) return;

  try {
    isLoading.value = true;
    error.value = null;

    collectedNfts.value = await nftsApi.getByOwner(userStore.state.user.id);

    const collectionIdsToFetch = [
      ...new Set(
        collectedNfts.value
          .filter((nft) => nft.collectionId)
          .map((nft) => nft.collectionId as string)
      ),
    ];

    if (collectionIdsToFetch.length > 0) {
      const fetchedCollections = await Promise.all(
        collectionIdsToFetch.map((id) =>
          collectionsApi.getOne(id).catch(() => null)
        )
      );
      collections.value = fetchedCollections.filter(Boolean) as Collection[];
    } else {
      collections.value = [];
    }
  } catch (err: any) {
    console.error("Error fetching NFTs:", err);
    error.value = err.message || "Failed to load NFTs";
  } finally {
    isLoading.value = false;
  }
};

const getCollectionName = (collectionId: string | undefined) => {
  if (!collectionId) return "";
  const collection = collections.value.find((c) => c._id === collectionId);
  return collection ? collection.name : "Unknown Collection";
};

const navigateToNft = (nftId: string) => {
  router.push(`/nfts/${nftId}`);
};

const resetSearch = () => {
  searchQuery.value = "";
  filterOption.value = "all";
  selectedCollection.value = "";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

// Lifecycle hooks
onMounted(() => {
  fetchCollectedNfts();
});
</script>

<style scoped>
.collected-nfts-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.view-header {
  text-align: center;
  margin-bottom: 2rem;
}

.view-header h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 2rem;
}

.subtitle {
  color: #777;
  margin-top: 0.5rem;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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
  min-height: 300px;
  text-align: center;
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
}

/* Filter and search container */
.filter-container {
  margin-bottom: 2rem;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.search-input-container {
  position: relative;
  flex-grow: 1;
  margin-right: 1rem;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(102, 51, 153, 0.1);
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  color: var(--text-color);
}

.filter-select:focus {
  outline: none;
  border-color: var(--secondary-color);
}

.collection-filter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.collection-select {
  flex-grow: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
}

/* NFT Grid */
.nft-grid {
  margin-top: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #888;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.back-button,
.browse-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  text-decoration: none;
}

.back-button:hover,
.browse-button:hover {
  background-color: var(--secondary-light);
}

/* NFT Items */
.nft-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.nft-item {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.nft-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.nft-image-container {
  position: relative;
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
}

.nft-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nft-info {
  padding: 1rem;
}

.nft-info h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-info {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.acquired-info {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #777;
  margin-top: 0.5rem;
}

.acquired-label {
  margin-right: 0.5rem;
  font-weight: 500;
}

.acquired-date {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .search-input-container {
    margin-right: 0;
  }

  .collection-filter {
    flex-direction: column;
    align-items: flex-start;
  }

  .nft-items {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
