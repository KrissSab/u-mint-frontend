<template>
  <div class="collections-view">
    <h1>My Collections</h1>

    <!-- Authentication check -->
    <div v-if="!isAuthenticated" class="auth-required">
      <div class="message">
        <h2>Authentication Required</h2>
        <p>You need to be logged in to view and create collections.</p>
        <button @click="showAuthModal = true" class="auth-button">
          Login or Register
        </button>
      </div>
    </div>

    <div v-else class="collections-container">
      <!-- Create new collection button -->
      <div class="collection-actions">
        <button @click="showCreateModal = true" class="create-button">
          <span class="icon">+</span> Create New Collection
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your collections...</p>
      </div>

      <!-- No collections state -->
      <div v-else-if="collections.length === 0" class="empty-state">
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
            <path
              d="M12 12c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 8.58c0-2.5-3.97-3.58-6-3.58s-6 1.08-6 3.58V18h12v-1.42zM8.48 16c.74-.51 2.23-1 3.52-1s2.78.49 3.52 1H8.48z"
            />
          </svg>
        </div>
        <h3>No Collections Yet</h3>
        <p>Create your first NFT collection to get started.</p>
      </div>

      <!-- Collections grid -->
      <div v-else class="collections-grid">
        <div
          v-for="collection in collections"
          :key="collection._id"
          class="collection-card"
          @click="viewCollection(collection._id)"
        >
          <div class="collection-banner">
            <img
              :src="collection.bannerImage || '/default-collection-banner.jpg'"
              alt="Collection banner"
            />
          </div>
          <div class="collection-profile">
            <img
              :src="
                collection.profileImage || '/default-collection-profile.jpg'
              "
              alt="Collection profile"
            />
          </div>
          <div class="collection-info">
            <h3>{{ collection.name }}</h3>
            <p class="description">
              {{
                truncateText(collection.description || "No description", 100)
              }}
            </p>
            <div class="collection-stats">
              <div class="stat">
                <span class="label">Items</span>
                <span class="value">{{ collection.totalItems }}</span>
              </div>
              <div class="stat">
                <span class="label">Floor</span>
                <span class="value">{{ collection.floorPrice || "-" }}</span>
              </div>
              <div class="stat">
                <span class="label">Volume</span>
                <span class="value">{{ collection.totalVolume || "-" }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Collection Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Create New Collection</h2>
          <button class="close-button" @click="closeCreateModal">✕</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="createCollection">
            <div class="form-group">
              <label for="name">Collection Name *</label>
              <input
                type="text"
                id="name"
                v-model="newCollection.name"
                required
                class="form-input"
                placeholder="My Awesome Collection"
              />
            </div>

            <div class="form-group">
              <label for="symbol">Symbol</label>
              <input
                type="text"
                id="symbol"
                v-model="newCollection.symbol"
                class="form-input"
                placeholder="MAC"
              />
              <p class="help-text">
                A short identifier for your collection (e.g. ETH, BTC)
              </p>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                v-model="newCollection.description"
                class="form-input textarea"
                placeholder="Describe your collection..."
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="profileImage">Profile Image URL</label>
              <input
                type="url"
                id="profileImage"
                v-model="newCollection.profileImage"
                class="form-input"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div class="form-group">
              <label for="bannerImage">Banner Image URL</label>
              <input
                type="url"
                id="bannerImage"
                v-model="newCollection.bannerImage"
                class="form-input"
                placeholder="https://example.com/banner.jpg"
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

            <div class="form-group royalty-group">
              <label>Royalties</label>
              <div class="royalty-inputs">
                <input
                  type="text"
                  v-model="royaltyAddress"
                  class="form-input royalty-address"
                  placeholder="Wallet address for royalties"
                />
                <div class="royalty-percentage">
                  <input
                    type="number"
                    v-model.number="royaltyPercentage"
                    class="form-input"
                    min="0"
                    max="25"
                    step="0.1"
                  />
                  <span class="percentage-symbol">%</span>
                </div>
              </div>
              <p class="help-text">
                Royalties allow you to earn a percentage from secondary sales
              </p>
            </div>

            <div class="form-actions">
              <button
                type="submit"
                class="submit-button"
                :disabled="isSubmitting || !isValidForm"
              >
                <span v-if="isSubmitting">Creating...</span>
                <span v-else>Create Collection</span>
              </button>
            </div>

            <div v-if="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Authentication Modal -->
    <AuthenticationModal
      v-if="showAuthModal"
      :show="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthenticated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import userStore from "../store/userStore";
import AuthenticationModal from "../components/auth/AuthenticationModal.vue";
import collectionsApi from "../services/collections";
import type { Collection, CreateCollectionDto } from "../services/collections";

// Router
const router = useRouter();

// State
const isAuthenticated = computed(() => userStore.state.isAuthenticated);
const collections = ref<Collection[]>([]);
const isLoading = ref(false);
const showCreateModal = ref(false);
const showAuthModal = ref(false);
const isSubmitting = ref(false);
const errorMessage = ref("");

const newCollection = ref<CreateCollectionDto>({
  name: "",
  description: "",
  symbol: "",
  bannerImage: "",
  profileImage: "",
  categories: [],
});

const royaltyAddress = ref("");
const royaltyPercentage = ref(10);

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
const isValidForm = computed(() => {
  return newCollection.value.name.trim().length > 0;
});

// Methods
const fetchCollections = async () => {
  if (!isAuthenticated.value || !userStore.state.user) return;

  try {
    isLoading.value = true;
    collections.value = await collectionsApi.getByCreator(
      userStore.state.user.id
    );
  } catch (error: any) {
    console.error("Error fetching collections:", error);
  } finally {
    isLoading.value = false;
  }
};

const createCollection = async () => {
  if (!isAuthenticated.value || !userStore.state.user) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    // Add royalty info if provided
    if (royaltyAddress.value && royaltyPercentage.value > 0) {
      newCollection.value.royalties = {
        address: royaltyAddress.value,
        percentage: royaltyPercentage.value,
      };
    }

    // Create the collection
    const createdCollection = await collectionsApi.create(
      userStore.state.user.id,
      newCollection.value
    );

    // Add the new collection to the list and close the modal
    collections.value.unshift(createdCollection);
    closeCreateModal();

    // Navigate to the collection detail page
    router.push(`/collections/${createdCollection._id}`);
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to create collection";
  } finally {
    isSubmitting.value = false;
  }
};

const closeCreateModal = () => {
  showCreateModal.value = false;
  // Reset form
  newCollection.value = {
    name: "",
    description: "",
    symbol: "",
    bannerImage: "",
    profileImage: "",
    categories: [],
  };
  royaltyAddress.value = "";
  royaltyPercentage.value = 10;
  errorMessage.value = "";
};

const viewCollection = (id: string) => {
  router.push(`/collections/${id}`);
};

const handleAuthenticated = () => {
  showAuthModal.value = false;
  fetchCollections();
};

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const isSelectedCategory = (category: string) => {
  return newCollection.value.categories?.includes(category) || false;
};

const toggleCategory = (category: string) => {
  if (!newCollection.value.categories) {
    newCollection.value.categories = [];
  }

  if (isSelectedCategory(category)) {
    newCollection.value.categories = newCollection.value.categories.filter(
      (c) => c !== category
    );
  } else {
    newCollection.value.categories.push(category);
  }
};

// Lifecycle hooks
onMounted(() => {
  if (isAuthenticated.value) {
    fetchCollections();
  }
});
</script>

<style scoped>
.collections-view {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

h1 {
  margin-bottom: 2rem;
  color: var(--text-color);
}

/* Authentication Required */
.auth-required {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.message {
  text-align: center;
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 500px;
}

.message h2 {
  margin-top: 0;
  color: var(--text-color);
}

.auth-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-button:hover {
  background-color: var(--secondary-light);
}

/* Collections Container */
.collection-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.create-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-button:hover {
  background-color: var(--secondary-light);
}

.icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 4rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.empty-icon {
  color: #ccc;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.empty-state p {
  color: #777;
  margin: 0;
}

/* Collections Grid */
.collections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.collection-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
  position: relative;
}

.collection-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.collection-banner {
  height: 140px;
  overflow: hidden;
}

.collection-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-profile {
  position: absolute;
  top: 100px;
  left: 20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid white;
}

.collection-profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.collection-info {
  padding: 1.5rem 1rem 1rem;
  margin-top: 40px;
}

.collection-info h3 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  height: 60px;
  overflow: hidden;
}

.collection-stats {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.25rem;
}

.value {
  font-weight: 600;
  color: var(--text-color);
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

.help-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #777;
}

.royalty-group {
  margin-top: 2rem;
}

.royalty-inputs {
  display: flex;
  gap: 1rem;
}

.royalty-address {
  flex: 1;
}

.royalty-percentage {
  width: 80px;
  position: relative;
}

.percentage-symbol {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
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

/* Categories Selector */
.categories-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.category-chip {
  padding: 0.5rem 0.75rem;
  background-color: #f0f0f0;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.category-chip:hover {
  background-color: #e0e0e0;
}

.category-chip.selected {
  background-color: var(--secondary-color);
  color: white;
}

@media (max-width: 768px) {
  .collections-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .royalty-inputs {
    flex-direction: column;
  }

  .royalty-percentage {
    width: 100%;
  }
}
</style>
