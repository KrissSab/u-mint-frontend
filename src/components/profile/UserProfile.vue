<template>
  <div class="profile-container">
    <!-- Profile Header Section -->
    <div class="profile-header">
      <div class="profile-info">
        <div class="profile-image-container">
          <img
            :src="`https://avatar.iran.liara.run/username?username=${userData.name}+ `"
            alt="Profile"
            class="profile-image"
          />
        </div>
        <div class="profile-details">
          <h1>{{ userData.name || "Unnamed" }}</h1>

          <!-- New Wallet Info Component -->
          <WalletInfo
            @connect="showWalletModal = true"
            @disconnect="refreshUserData"
          />

          <p class="joined-date">Joined {{ joinedDate }}</p>
        </div>
      </div>
    </div>

    <!-- Profile Settings Section -->
    <ProfileSettings v-if="showSettings" />

    <div class="section-toggle">
      <button @click="toggleSettings" class="toggle-button">
        {{ showSettings ? "Hide Settings" : "Show Settings" }}
      </button>
    </div>

    <!-- Collections Section -->
    <div class="collection-section">
      <h2>My Collections</h2>

      <!-- Search and Filter Bar -->
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
            placeholder="Search collections..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>

        <div class="filter-options">
          <select v-model="filterOption" class="filter-select">
            <option value="all">All Collections</option>
            <option value="recent">Recently Added</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading collections...</p>
      </div>

      <!-- Collections Grid -->
      <div v-else-if="filteredCollections.length > 0" class="collection-grid">
        <div
          v-for="collection in filteredCollections"
          :key="collection._id"
          class="collection-item"
          @click="navigateToCollection(collection._id)"
        >
          <img
            :src="collection.profileImage || '/default-collection-profile.jpg'"
            :alt="collection.name"
            class="item-image"
          />
          <div class="item-info">
            <h3>{{ collection.name }}</h3>
            <p class="item-stats">
              {{ collection.totalItems }} Items | Floor:
              {{ collection.floorPrice }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-collection">
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
              ? "No collections found matching your search"
              : "You haven't created any collections yet"
          }}
        </p>
        <div class="empty-actions">
          <button class="back-button" @click="resetSearch" v-if="searchQuery">
            Back to all collections
          </button>
          <router-link to="/collections" class="create-button">
            Create Collection
          </router-link>
        </div>
      </div>
    </div>

    <!-- Wallet Connection Modal -->
    <div
      v-if="showWalletModal"
      class="wallet-modal-overlay"
      @click="closeWalletModal"
    >
      <div class="wallet-modal" @click.stop>
        <div class="wallet-modal-header">
          <h2>Connect Wallet</h2>
          <button class="close-button" @click="closeWalletModal">✕</button>
        </div>
        <div class="wallet-modal-body">
          <button class="wallet-option" @click="connectPhantom">
            <img src="/phantom-icon.svg" alt="Phantom" class="wallet-logo" />
            <span>Phantom</span>
          </button>
          <button class="wallet-option" @click="connectMetaMask">
            <img src="/metamask-fox.svg" alt="MetaMask" class="wallet-logo" />
            <span>MetaMask</span>
          </button>
          <p v-if="walletError" class="wallet-error">{{ walletError }}</p>
        </div>
      </div>
    </div>

    <!-- Authentication Modal for user registration/login -->
    <AuthenticationModal
      v-if="showAuthModal"
      :show="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthentication"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import userStore from "../../store/userStore";
import WalletInfo from "./WalletInfo.vue";
import ProfileSettings from "./ProfileSettings.vue";
import AuthenticationModal from "../auth/AuthenticationModal.vue";
import collectionsApi from "../../services/collections";
import type { Collection } from "../../services/collections";

// Router
const router = useRouter();

// User data
const userData = reactive({
  id: "",
  name: "",
  email: "",
  walletAddress: "",
});

// Collections
const myCollections = ref<Collection[]>([]);
const isLoading = ref(false);

// UI state
const showSettings = ref(false);
const searchQuery = ref("");
const filterOption = ref("all");

// Wallet connection
const showWalletModal = ref(false);
const showAuthModal = ref(false);
const walletError = ref("");
const isConnecting = ref(false);

// Computed properties
const filteredCollections = computed(() => {
  if (!searchQuery.value && filterOption.value === "all") {
    return myCollections.value;
  }

  let filtered = myCollections.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        (collection.description &&
          collection.description.toLowerCase().includes(query))
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

const joinedDate = computed(() => {
  return "May 2023";
});

// Methods
const resetSearch = () => {
  searchQuery.value = "";
  filterOption.value = "all";
};

const fetchUserCollections = async () => {
  if (!userData.id) return;

  try {
    isLoading.value = true;
    myCollections.value = await collectionsApi.getByCreator(userData.id);
  } catch (error: any) {
    console.error("Error fetching collections:", error);
  } finally {
    isLoading.value = false;
  }
};

const navigateToCollection = (collectionId: string) => {
  router.push(`/collections/${collectionId}`);
};

const connectPhantom = async () => {
  try {
    walletError.value = "";
    isConnecting.value = true;

    await userStore.connectPhantomWallet();
    showWalletModal.value = false;
    refreshUserData();
  } catch (error: any) {
    walletError.value = error.message || "Failed to connect Phantom wallet";
  } finally {
    isConnecting.value = false;
  }
};

const connectMetaMask = async () => {
  try {
    walletError.value = "";
    isConnecting.value = true;

    await userStore.connectMetaMaskWallet();
    showWalletModal.value = false;
    refreshUserData();
  } catch (error: any) {
    walletError.value = error.message || "Failed to connect MetaMask wallet";
  } finally {
    isConnecting.value = false;
  }
};

const closeWalletModal = () => {
  showWalletModal.value = false;
  walletError.value = "";
};

const refreshUserData = () => {
  if (userStore.state.user) {
    userData.id = userStore.state.user.id;
    userData.name =
      userStore.state.user.name || userStore.state.user.username || "";
    userData.email = userStore.state.user.email || "";
    userData.walletAddress = userStore.state.user.walletAddress || "";

    // Fetch collections after user data is refreshed
    fetchUserCollections();
  }
};

const handleAuthentication = (user: any) => {
  refreshUserData();
  showAuthModal.value = false;
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

// Initialize
onMounted(() => {
  // Load user data on component mount
  refreshUserData();
});
</script>

<style scoped>
/* Add new styles for the settings toggle */
.section-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.toggle-button {
  padding: 0.5rem 1rem;
  background-color: var(--secondary-color, #6633cc);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.toggle-button:hover {
  background-color: var(--secondary-light, #7744dd);
}

/* Keep existing styles */
.profile-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile-header {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.profile-image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid var(--secondary-color);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-details h1 {
  margin: 0;
  margin-bottom: 0.5rem;
  color: var(--text-color);
  font-size: 1.75rem;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.wallet-icon {
  color: var(--secondary-color);
}

.wallet-address {
  font-family: monospace;
  color: #666;
}

.no-wallet {
  color: #999;
  font-style: italic;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0;
  display: flex;
  align-items: center;
}

.copy-button:hover {
  color: var(--secondary-color);
}

.connect-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #9945ff;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.connect-button:hover {
  background-color: #8034e8;
}

.disconnect-button {
  background-color: transparent;
  color: #ff4d4d;
  border: 1px solid #ff4d4d;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.disconnect-button:hover {
  background-color: #ff4d4d;
  color: white;
}

.phantom-icon {
  width: 16px;
  height: 16px;
}

.joined-date {
  color: #888;
  margin: 0;
  font-size: 0.9rem;
}

.collection-section {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.collection-section h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color);
}

.search-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
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

.collection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}

.collection-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  cursor: pointer;
}

.collection-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.item-info {
  padding: 1rem;
}

.item-info h3 {
  margin: 0;
  margin-bottom: 0.25rem;
  font-size: 1rem;
  color: var(--text-color);
}

.item-stats {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
}

.empty-collection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  color: #888;
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
.create-button {
  padding: 0.5rem 1rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  text-decoration: none;
}

.back-button:hover,
.create-button:hover {
  background-color: var(--secondary-light);
}

/* Loading state */
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

/* Wallet Modal Styles */
.wallet-modal-overlay {
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

.wallet-modal {
  background-color: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.wallet-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.wallet-modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #999;
}

.wallet-modal-body {
  padding: 1.5rem;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
}

.wallet-option:hover {
  background-color: #f9f9f9;
  border-color: #ddd;
}

.wallet-logo {
  width: 32px;
  height: 32px;
}

.wallet-error {
  margin-top: 1rem;
  color: #ff4d4d;
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .search-bar {
    flex-direction: column;
  }

  .search-input-container {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .collection-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
