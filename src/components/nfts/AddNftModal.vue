<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Add NFT to Collection</h2>
        <button class="close-button" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'create' }]"
          @click="activeTab = 'create'"
        >
          Create New NFT
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'existing' }]"
          @click="activeTab = 'existing'"
        >
          Add Existing NFT
        </button>
      </div>

      <div class="modal-body">
        <!-- Create new NFT tab -->
        <div v-if="activeTab === 'create'" class="tab-content">
          <CreateNftForm
            :preselectedCollectionId="collectionId"
            :showCollectionSelect="false"
            @submit="handleCreateNft"
            @cancel="$emit('close')"
          />
        </div>

        <!-- Add existing NFT tab -->
        <div v-else-if="activeTab === 'existing'" class="tab-content">
          <div v-if="isLoadingNfts" class="loading-state">
            <div class="spinner"></div>
            <p>Loading your NFTs...</p>
          </div>

          <div v-else-if="myNfts.length === 0" class="empty-state">
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
            <p>You don't have any NFTs yet</p>
            <button @click="activeTab = 'create'" class="switch-tab-button">
              Create New NFT
            </button>
          </div>

          <div v-else class="nfts-grid">
            <div
              v-for="nft in availableNfts"
              :key="nft._id"
              class="nft-selection"
              :class="{ selected: selectedNftId === nft._id }"
              @click="selectNft(nft._id)"
            >
              <NftCard :nft="nft" />
              <div class="selection-overlay">
                <div class="checkbox">
                  <svg
                    v-if="selectedNftId === nft._id"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-button" @click="$emit('close')">
              Cancel
            </button>
            <button
              type="button"
              class="submit-button"
              :disabled="!selectedNftId || isSubmitting"
              @click="addExistingNftToCollection"
            >
              <span v-if="isSubmitting">Adding...</span>
              <span v-else>Add to Collection</span>
            </button>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CreateNftForm from "./CreateNftForm.vue";
import NftCard from "./NftCard.vue";
import userStore from "../../store/userStore";
import nftsApi from "../../services/nfts";
import type { Nft, CreateNftDto } from "../../services/nfts";

// Props
const props = defineProps({
  collectionId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(["close", "nft-added"]);

// State
const activeTab = ref("create");
const myNfts = ref<Nft[]>([]);
const isLoadingNfts = ref(false);
const selectedNftId = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");

// Computed
const availableNfts = computed(() => {
  // Filter out NFTs that are already in this collection
  return myNfts.value.filter((nft) => nft.collectionId !== props.collectionId);
});

// Methods
const fetchMyNfts = async () => {
  if (!userStore.state.user) return;

  try {
    isLoadingNfts.value = true;
    myNfts.value = await nftsApi.getByOwner(userStore.state.user.id);
  } catch (error: any) {
    console.error("Error fetching NFTs:", error);
    errorMessage.value = error.message || "Failed to load your NFTs";
  } finally {
    isLoadingNfts.value = false;
  }
};

const handleCreateNft = async (nftData: CreateNftDto) => {
  if (!userStore.state.user) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    // Add collection ID to the NFT data
    nftData.collectionId = props.collectionId;

    // Create the NFT
    const createdNft = await nftsApi.create(userStore.state.user.id, nftData);

    // Notify parent component
    emit("nft-added", createdNft);

    // Close modal
    emit("close");
  } catch (error: any) {
    console.error("Error creating NFT:", error);
    errorMessage.value = error.message || "Failed to create NFT";

    // Log more details about the error for debugging
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
  } finally {
    isSubmitting.value = false;
  }
};

const selectNft = (nftId: string) => {
  selectedNftId.value = nftId;
};

const addExistingNftToCollection = async () => {
  if (!selectedNftId.value) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = "";

    // Add NFT to collection
    const updatedNft = await nftsApi.addToCollection(
      selectedNftId.value,
      props.collectionId
    );

    // Notify parent component
    emit("nft-added", updatedNft);

    // Close modal
    emit("close");
  } catch (error: any) {
    console.error("Error adding NFT to collection:", error);
    errorMessage.value = error.message || "Failed to add NFT to collection";
  } finally {
    isSubmitting.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  if (userStore.state.isAuthenticated) {
    fetchMyNfts();
  }
});
</script>

<style scoped>
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
  width: 800px;
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

.modal-tabs {
  display: flex;
  border-bottom: 1px solid #eee;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: #777;
}

.tab-button:hover {
  background-color: #f9f9f9;
}

.tab-button.active {
  color: var(--secondary-color);
  border-bottom: 2px solid var(--secondary-color);
}

.modal-body {
  padding: 0;
}

.tab-content {
  padding: 1.5rem;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
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

/* Empty state */
.empty-state {
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

.switch-tab-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.switch-tab-button:hover {
  background-color: var(--secondary-light);
}

/* NFTs grid */
.nfts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.nft-selection {
  position: relative;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
}

.selection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nft-selection:hover .selection-overlay {
  opacity: 1;
}

.nft-selection.selected .selection-overlay {
  opacity: 1;
  background-color: rgba(102, 51, 153, 0.3);
}

.checkbox {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: white;
  border: 2px solid var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--secondary-color);
  transition: all 0.2s;
}

.nft-selection.selected .checkbox {
  background-color: var(--secondary-color);
  color: white;
}

/* Form actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #e0e0e0;
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
</style>
