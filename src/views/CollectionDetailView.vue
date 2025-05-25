<template>
  <div class="collection-detail-view">
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading collection...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>Error Loading Collection</h2>
      <p>{{ error }}</p>
      <button @click="goBack" class="back-button">Go Back</button>
    </div>

    <!-- Collection content -->
    <div v-else-if="collection" class="collection-content">
      <!-- Banner -->
      <div
        class="collection-banner"
        :style="{
          backgroundImage: `url(${collection.bannerImage || '/default-collection-banner.jpg'})`,
        }"
      >
        <div class="banner-overlay"></div>
      </div>

      <!-- Collection header -->
      <div class="collection-header">
        <div class="profile-image">
          <img
            :src="collection.profileImage || '/default-collection-profile.jpg'"
            alt="Collection profile"
          />
        </div>
        <div class="collection-info">
          <h1>{{ collection.name }}</h1>
          <div v-if="collection.symbol" class="symbol">
            {{ collection.symbol }}
          </div>

          <div class="creator-info">
            <span>Created by </span>
            <router-link
              :to="`/profile/${collection.creatorId}`"
              class="creator-link"
            >
              {{ creatorName }}
            </router-link>
          </div>

          <div v-if="isOwner" class="owner-actions">
            <button @click="showEditModal = true" class="edit-button">
              <span class="icon">✏️</span> Edit Collection
            </button>
          </div>
        </div>
      </div>

      <!-- Collection stats -->
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-value">{{ collection.totalItems }}</div>
          <div class="stat-label">Items</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ collection.totalVolume || "0" }}</div>
          <div class="stat-label">Volume</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ collection.floorPrice || "0" }}</div>
          <div class="stat-label">Floor Price</div>
        </div>
      </div>

      <!-- Collection description -->
      <div class="description-container">
        <h2>Description</h2>
        <p>{{ collection.description || "No description provided." }}</p>
      </div>

      <!-- Categories -->
      <div
        v-if="collection.categories && collection.categories.length > 0"
        class="categories-container"
      >
        <h2>Categories</h2>
        <div class="categories">
          <div
            v-for="category in collection.categories"
            :key="category"
            class="category-chip"
          >
            {{ category }}
          </div>
        </div>
      </div>

      <!-- NFTs in this collection -->
      <div class="nfts-container">
        <h2>Items</h2>

        <!-- Empty state -->
        <div v-if="!collectionNfts.length" class="empty-nfts">
          <div class="empty-icon">
            <svg
              fill="currentColor"
              height="64"
              role="img"
              viewBox="0 0 24 24"
              width="64"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
              />
              <path d="M15 15l-4-4-4 4V5h8v10z" />
            </svg>
          </div>
          <p>No items in this collection yet</p>
          <button
            v-if="isOwner"
            class="add-nft-button"
            @click="showAddNftModal = true"
          >
            Add NFT to Collection
          </button>
        </div>

        <!-- NFTs grid -->
        <div v-else class="nfts-grid">
          <div
            v-for="nft in collectionNfts"
            :key="nft._id"
            @click="viewNft(nft._id)"
          >
            <NftCard :nft="nft" />
          </div>

          <div
            v-if="isOwner"
            class="add-nft-card"
            @click="showAddNftModal = true"
          >
            <div class="add-icon">
              <svg
                fill="currentColor"
                height="40"
                role="img"
                viewBox="0 0 24 24"
                width="40"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </div>
            <p>Add NFT</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Collection Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Edit Collection</h2>
          <button class="close-button" @click="closeEditModal">✕</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="updateCollection">
            <div class="form-group">
              <label for="edit-name">Collection Name</label>
              <input
                type="text"
                id="edit-name"
                v-model="editCollection.name"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-symbol">Symbol</label>
              <input
                type="text"
                id="edit-symbol"
                v-model="editCollection.symbol"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-description">Description</label>
              <textarea
                id="edit-description"
                v-model="editCollection.description"
                class="form-input textarea"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="edit-profileImage">Profile Image URL</label>
              <input
                type="url"
                id="edit-profileImage"
                v-model="editCollection.profileImage"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="edit-bannerImage">Banner Image URL</label>
              <input
                type="url"
                id="edit-bannerImage"
                v-model="editCollection.bannerImage"
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Categories</label>
              <div class="categories-selector">
                <div
                  v-for="category in availableCategories"
                  :key="category"
                  class="category-chip"
                  :class="{ selected: isSelectedCategory(category) }"
                  @click="toggleCategory(category)"
                >
                  {{ category }}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="submit-button"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Updating...</span>
                <span v-else>Update Collection</span>
              </button>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Add NFT Modal -->
    <AddNftModal
      v-if="showAddNftModal"
      :collectionId="collection?._id || ''"
      @close="showAddNftModal = false"
      @nft-added="handleNftAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import userStore from "../store/userStore";
import collectionsApi from "../services/collections";
import nftsApi from "../services/nfts";
import AddNftModal from "../components/nfts/AddNftModal.vue";
import NftCard from "../components/nfts/NftCard.vue";
import type { Collection, CreateCollectionDto } from "../services/collections";
import type { Nft } from "../services/nfts";

// Router and route
const router = useRouter();
const route = useRoute();

// State
const collection = ref<Collection | null>(null);
const collectionNfts = ref<Nft[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const showEditModal = ref(false);
const showAddNftModal = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

// Edit collection form
const editCollection = ref<Partial<CreateCollectionDto>>({
  name: "",
  description: "",
  symbol: "",
  bannerImage: "",
  profileImage: "",
  categories: [],
});

// Available categories for NFT collections
const availableCategories = [
  "Art",
  "Collectibles",
  "Music",
  "Photography",
  "Sports",
  "Utility",
  "Virtual Worlds",
  "Gaming",
  "Memes",
  "PFPs",
];

// Computed properties
const isOwner = computed(() => {
  if (!collection.value || !userStore.state.user) return false;
  return collection.value.creatorId === userStore.state.user.id;
});

const creatorName = computed(() => {
  if (!collection.value) return "Unknown";

  // This would ideally fetch the creator's name from a user service
  // For now, just show a shortened version of the creator ID
  const id = collection.value.creatorId;
  return id.substring(0, 6) + "..." + id.substring(id.length - 4);
});

// Methods
const fetchCollection = async () => {
  const collectionId = route.params.id as string;
  if (!collectionId) {
    error.value = "Collection ID not provided";
    isLoading.value = false;
    return;
  }

  try {
    isLoading.value = true;
    collection.value = await collectionsApi.getOne(collectionId);

    // Initialize edit form with current values
    if (collection.value) {
      editCollection.value = {
        name: collection.value.name,
        description: collection.value.description,
        symbol: collection.value.symbol,
        bannerImage: collection.value.bannerImage,
        profileImage: collection.value.profileImage,
        categories: [...(collection.value.categories || [])],
      };

      // Fetch NFTs in this collection
      await fetchCollectionNfts(collectionId);
    }
  } catch (err: any) {
    console.error("Error fetching collection:", err);
    error.value = err.message || "Failed to load collection";
  } finally {
    isLoading.value = false;
  }
};

const fetchCollectionNfts = async (collectionId: string) => {
  try {
    collectionNfts.value = await nftsApi.getByCollection(collectionId);
  } catch (err: any) {
    console.error("Error fetching collection NFTs:", err);
  }
};

const handleNftAdded = async (nft: Nft) => {
  // Refresh the NFTs in the collection
  if (collection.value) {
    await fetchCollectionNfts(collection.value._id);
  }
};

const viewNft = (nftId: string) => {
  // Navigate to NFT detail page (to be implemented later)
  router.push(`/nfts/${nftId}`);
};

const updateCollection = async () => {
  if (!collection.value || !userStore.state.user) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    // Update the collection
    const updatedCollection = await collectionsApi.update(
      collection.value._id,
      userStore.state.user.id,
      editCollection.value
    );

    // Update local state
    collection.value = updatedCollection;

    // Close modal
    closeEditModal();
  } catch (err: any) {
    errorMessage.value = err.message || "Failed to update collection";
  } finally {
    isSubmitting.value = false;
  }
};

const closeEditModal = () => {
  showEditModal.value = false;
  errorMessage.value = "";
};

const goBack = () => {
  router.push("/collections");
};

const isSelectedCategory = (category: string) => {
  return editCollection.value.categories?.includes(category) || false;
};

const toggleCategory = (category: string) => {
  if (!editCollection.value.categories) {
    editCollection.value.categories = [];
  }

  if (isSelectedCategory(category)) {
    editCollection.value.categories = editCollection.value.categories.filter(
      (c) => c !== category
    );
  } else {
    editCollection.value.categories.push(category);
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchCollection();
});
</script>

<style scoped>
.collection-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 3rem;
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

/* Collection content */
.collection-banner {
  height: 300px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

.collection-header {
  display: flex;
  margin-top: -60px;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-right: 2rem;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: 1rem;
}

.collection-info h1 {
  margin: 0;
  margin-bottom: 0.25rem;
  color: var(--text-color);
  font-size: 2.5rem;
}

.symbol {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.creator-info {
  color: #666;
  margin-bottom: 1rem;
}

.creator-link {
  color: var(--secondary-color);
  text-decoration: none;
  font-weight: 500;
}

.creator-link:hover {
  text-decoration: underline;
}

.owner-actions {
  display: flex;
  gap: 1rem;
}

.edit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: var(--secondary-light);
}

/* Stats */
.stats-container {
  display: flex;
  justify-content: space-around;
  margin: 2rem 0;
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

/* Description */
.description-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.description-container h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-size: 1.25rem;
}

/* Categories */
.categories-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
}

.categories-container h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--text-color);
  font-size: 1.25rem;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.category-chip {
  padding: 0.5rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 16px;
  font-size: 0.9rem;
}

/* NFTs container */
.nfts-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.nfts-container h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  font-size: 1.25rem;
}

.empty-nfts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 1rem;
}

.empty-nfts p {
  color: #777;
  margin-bottom: 1.5rem;
}

.add-nft-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-nft-button:hover {
  background-color: var(--secondary-light);
}

/* NFTs Grid */
.nfts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.add-nft-card {
  background-color: #f9f9f9;
  border: 2px dashed #ddd;
  border-radius: 12px;
  height: 100%;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-nft-card:hover {
  background-color: #f0f0f0;
  border-color: var(--secondary-color);
}

.add-icon {
  color: #aaa;
  margin-bottom: 0.5rem;
}

.add-nft-card:hover .add-icon {
  color: var(--secondary-color);
}

.add-nft-card p {
  color: #777;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 1.5rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color);
  box-shadow: 0 0 0 2px rgba(102, 51, 153, 0.1);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.categories-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.categories-selector .category-chip {
  cursor: pointer;
  transition: all 0.2s;
}

.categories-selector .category-chip:hover {
  background-color: #e0e0e0;
}

.categories-selector .category-chip.selected {
  background-color: var(--secondary-color);
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--secondary-light);
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffeeee;
  color: #e74c3c;
  border-radius: 8px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .collection-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -40px;
  }

  .profile-image {
    margin-right: 0;
    margin-bottom: 1.5rem;
  }

  .stats-container {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
