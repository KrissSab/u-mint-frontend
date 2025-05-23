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
          <div class="wallet-info">
            <svg
              fill="currentColor"
              height="20"
              role="img"
              viewBox="0 -960 960 960"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
              class="wallet-icon"
            >
              <title>Wallet</title>
              <path
                d="M240-160q-66 0-113-47T80-320v-320q0-66 47-113t113-47h480q66 0 113 47t47 113v320q0 66-47 113t-113 47H240Z"
              ></path>
            </svg>

            <!-- Wallet connected state -->
            <template v-if="hasWallet">
              <span class="wallet-address">{{ truncatedWalletAddress }}</span>
              <button class="copy-button" @click="copyWalletAddress">
                <svg
                  fill="currentColor"
                  height="16"
                  role="img"
                  viewBox="0 0 24 24"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Copy</title>
                  <path
                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                  ></path>
                </svg>
              </button>
              <button class="disconnect-button" @click="disconnectWallet">
                Disconnect
              </button>
            </template>

            <!-- No wallet connected state -->
            <template v-else>
              <span class="no-wallet">No wallet connected</span>
              <button class="connect-button" @click="connectWallet">
                <img src="" alt="Phantom" class="phantom-icon" />
                Connect Phantom
              </button>
            </template>
          </div>
          <p class="joined-date">Joined {{ joinedDate }}</p>
        </div>
      </div>
    </div>

    <!-- Collection Section -->
    <div class="collection-section">
      <h2>Collection</h2>

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
            placeholder="Search items..."
            v-model="searchQuery"
            class="search-input"
          />
        </div>

        <div class="filter-options">
          <select v-model="filterOption" class="filter-select">
            <option value="all">All Items</option>
            <option value="recent">Recently Added</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <!-- Collection Items Grid -->
      <div v-if="filteredItems.length > 0" class="collection-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="collection-item"
        >
          <img :src="item.image" :alt="item.name" class="item-image" />
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p class="item-chain">{{ item.chain }}</p>
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
        <p>No items found</p>
        <button class="back-button" @click="resetSearch">
          Back to all items
        </button>
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
            <img src="/phantom-icon.png" alt="Phantom" class="wallet-logo" />
            <span>Phantom</span>
          </button>
          <p v-if="walletError" class="wallet-error">{{ walletError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from "vue";
import userStore from "../../store/userStore";

// User data
const userData = reactive({
  id: "",
  name: "",
  email: "",
  walletAddress: "0xb8aa...d07F", // Example wallet address
});

// Collection items
const collectionItems = ref([
  {
    id: 1,
    name: "Digital Art #1",
    image: "",
    chain: "Ethereum",
  },
  {
    id: 2,
    name: "Collectible #42",
    image: "",
    chain: "Solana",
  },
  {
    id: 3,
    name: "Artwork Series",
    image: "",
    chain: "Polygon",
  },
]);

// Search and filter
const searchQuery = ref("");
const filterOption = ref("all");

// Wallet connection
const showWalletModal = ref(false);
const walletError = ref("");
const isConnecting = ref(false);

// Computed properties
const hasWallet = computed(() => {
  return !!userData.walletAddress;
});

const truncatedWalletAddress = computed(() => {
  if (!userData.walletAddress) return "";

  // If the address is already truncated, return as is
  if (userData.walletAddress.includes("...")) {
    return userData.walletAddress;
  }

  // Otherwise truncate it
  const start = userData.walletAddress.substring(0, 6);
  const end = userData.walletAddress.substring(
    userData.walletAddress.length - 4
  );
  return `${start}...${end}`;
});

const joinedDate = computed(() => {
  return "May 2023";
});

const filteredItems = computed(() => {
  if (!searchQuery.value && filterOption.value === "all") {
    return collectionItems.value;
  }

  let filtered = collectionItems.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.chain.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  if (filterOption.value === "recent") {
    filtered = [...filtered].reverse();
  }

  return filtered;
});

// Methods
const copyWalletAddress = () => {
  if (userData.walletAddress) {
    navigator.clipboard.writeText(userData.walletAddress);
    // Could add a toast notification here
  }
};

const resetSearch = () => {
  searchQuery.value = "";
  filterOption.value = "all";
};

const connectWallet = () => {
  showWalletModal.value = true;
  walletError.value = "";
};

const closeWalletModal = () => {
  showWalletModal.value = false;
  walletError.value = "";
};

const connectPhantom = async () => {
  if (isConnecting.value) return;

  isConnecting.value = true;
  walletError.value = "";

  try {
    // Check if Phantom is installed
    const isPhantomInstalled = window.phantom?.solana?.isPhantom;

    if (!isPhantomInstalled) {
      walletError.value =
        "Phantom wallet is not installed. Please install it first.";
      return;
    }

    // Connect to wallet using the store method
    const walletAddress = await userStore.connectPhantomWallet();

    // Update local user data
    userData.walletAddress = walletAddress;

    // Close the modal
    closeWalletModal();
  } catch (error: any) {
    walletError.value = error.message || "Failed to connect wallet";
  } finally {
    isConnecting.value = false;
  }
};

const disconnectWallet = async () => {
  try {
    // Disconnect using the store method
    await userStore.disconnectWallet();

    // Update local user data
    userData.walletAddress = "";
  } catch (error: any) {
    console.error("Error disconnecting wallet:", error);
  }
};

// Initialize user data from store
onMounted(() => {
  if (userStore.state.user) {
    userData.id = userStore.state.user.id;
    userData.name = userStore.state.user.name;
    userData.email = userStore.state.user.email;
    userData.walletAddress = userStore.state.user.walletAddress || "";
  }
});
</script>

<style scoped>
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

.item-chain {
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

.back-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.back-button:hover {
  background-color: var(--secondary-light);
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
