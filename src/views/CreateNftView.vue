<template>
  <div class="create-nft-view">
    <h1>Create NFT</h1>

    <!-- Authentication check -->
    <div v-if="!isAuthenticated" class="auth-required">
      <div class="message">
        <h2>Authentication Required</h2>
        <p>You need to be logged in to create NFTs.</p>
        <button @click="showAuthModal = true" class="auth-button">
          Login or Register
        </button>
      </div>
    </div>

    <div v-else class="create-nft-container">
      <!-- Loading collections -->
      <div v-if="isLoadingCollections" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your collections...</p>
      </div>

      <!-- NFT creation form -->
      <div v-else>
        <CreateNftForm :collections="myCollections" @submit="handleCreateNft" />
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
import CreateNftForm from "../components/nfts/CreateNftForm.vue";
import collectionsApi from "../services/collections";
import nftsApi from "../services/nfts";
import type { Collection } from "../services/collections";
import type { CreateNftDto } from "../services/nfts";

// Router
const router = useRouter();

// State
const isAuthenticated = computed(() => userStore.state.isAuthenticated);
const myCollections = ref<Collection[]>([]);
const isLoadingCollections = ref(false);
const showAuthModal = ref(false);

// Methods
const fetchMyCollections = async () => {
  if (!isAuthenticated.value || !userStore.state.user) return;

  try {
    isLoadingCollections.value = true;
    myCollections.value = await collectionsApi.getByCreator(
      userStore.state.user.id
    );
  } catch (error: any) {
    console.error("Error fetching collections:", error);
  } finally {
    isLoadingCollections.value = false;
  }
};

const handleCreateNft = async (nftData: CreateNftDto) => {
  if (!isAuthenticated.value || !userStore.state.user) return;

  try {
    const createdNft = await nftsApi.create(userStore.state.user.id, nftData);

    // Navigate to the NFT detail page
    router.push(`/nfts/${createdNft._id}`);
  } catch (error: any) {
    console.error("Error creating NFT:", error);

    // Detailed error logging for debugging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }

    alert(`Failed to create NFT: ${error.message || "Unknown error"}`);
  }
};

const handleAuthenticated = () => {
  showAuthModal.value = false;
  fetchMyCollections();
};

// Lifecycle hooks
onMounted(() => {
  if (isAuthenticated.value) {
    fetchMyCollections();
  }
});
</script>

<style scoped>
.create-nft-view {
  max-width: 800px;
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

/* Create NFT container */
.create-nft-container {
  margin-bottom: 3rem;
}
</style>
