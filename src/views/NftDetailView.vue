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
          <img :src="nft.imageUrl" :alt="nft.name" class="nft-image" />
        </div>
        <div class="nft-details">
          <h1>{{ nft.name }}</h1>

          <div class="ownership-info">
            <div class="owner-section">
              <span class="label">Owned by</span>
              <router-link :to="`/profile/${nft.userId}`" class="link">
                {{ shortenAddress(nft.userId) }}
              </router-link>
            </div>

            <div class="creator-section">
              <span class="label">Created by</span>
              <router-link :to="`/profile/${nft.userId}`" class="link">
                {{ shortenAddress(nft.userId) }}
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

          <div v-if="nft.isForSale && !isCollectedNft" class="price-section">
            <h3>Price</h3>
            <div class="price-amount">{{ nft.price }} {{ nft.currency }}</div>
            <button
              v-if="!isOwner"
              class="buy-button"
              @click="showPurchaseModal = true"
            >
              Buy Now
            </button>
          </div>

          <div v-if="isCollectedNft" class="acquisition-section">
            <h3>Acquisition Details</h3>
            <div class="acquisition-date">
              <span class="label">Acquired on</span>
              <span class="value">{{ formatDate(nft.createdAt) }}</span>
            </div>
          </div>

          <div v-if="isOwner" class="owner-actions">
            <button
              v-if="!hasSoldBefore"
              class="action-button"
              @click="handleEdit"
            >
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

    <!-- Edit Modal -->
    <div v-if="showEditModal && nft" class="modal-overlay">
      <div class="purchase-modal">
        <div class="modal-header">
          <h2>Edit NFT</h2>
          <button class="close-button" @click="showEditModal = false">&times;</button>
        </div>
        <div class="modal-content">
          <div class="form-group-modal">
            <label>Name</label>
            <input v-model="editData.name" type="text" class="modal-input" />
          </div>
          <div class="form-group-modal">
            <label>Description</label>
            <textarea v-model="editData.description" class="modal-input modal-textarea" rows="3"></textarea>
          </div>
          <div class="form-group-modal">
            <label>Image URL</label>
            <input v-model="editData.imageUrl" type="url" class="modal-input" />
            <img v-if="editData.imageUrl" :src="editData.imageUrl" class="edit-preview" />
          </div>
          <div class="modal-actions">
            <button class="cancel-modal-btn" @click="showEditModal = false">Cancel</button>
            <button class="confirm-purchase-btn" @click="saveEdit" :disabled="isSaving || !editData.name.trim()">
              <span v-if="isSaving" class="spinner-small"></span>
              <span v-else>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sell Modal -->
    <div v-if="showSellModal && nft" class="modal-overlay">
      <div class="purchase-modal">
        <div class="modal-header">
          <h2>List NFT for Sale</h2>
          <button class="close-button" @click="showSellModal = false">&times;</button>
        </div>
        <div class="modal-content">
          <div class="nft-preview">
            <img :src="nft.imageUrl" :alt="nft.name" class="modal-nft-image" />
            <div class="nft-info">
              <h3>{{ nft.name }}</h3>
            </div>
          </div>
          <div class="purchase-details">
            <div class="detail-row">
              <label>Price</label>
              <div style="display:flex;gap:0.5rem;align-items:center">
                <input
                  type="number"
                  v-model.number="sellPrice"
                  min="0"
                  step="0.001"
                  placeholder="0.00"
                  style="width:120px;padding:0.4rem;border:1px solid #ddd;border-radius:6px"
                />
                <select
                  v-model="sellCurrency"
                  style="padding:0.4rem;border:1px solid #ddd;border-radius:6px"
                >
                  <option>ETH</option>
                  <option>MATIC</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="cancel-modal-btn" @click="showSellModal = false">Cancel</button>
            <button
              class="confirm-purchase-btn"
              @click="confirmSell"
              :disabled="isSelling || sellPrice <= 0"
            >
              <span v-if="isSelling" class="spinner-small"></span>
              <span v-else>List for Sale</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Purchase Modal -->
    <div
      v-if="showPurchaseModal && nft && !isCollectedNft"
      class="modal-overlay"
    >
      <div class="purchase-modal">
        <div class="modal-header">
          <h2>Purchase NFT</h2>
          <button class="close-button" @click="showPurchaseModal = false">
            &times;
          </button>
        </div>
        <div class="modal-content">
          <div class="nft-preview">
            <img :src="nft.imageUrl" :alt="nft.name" class="modal-nft-image" />
            <div class="nft-info">
              <h3>{{ nft.name }}</h3>
              <p class="modal-price">{{ nft.price }} {{ nft.currency }}</p>
            </div>
          </div>

          <div class="purchase-details">
            <div class="detail-row">
              <span>Item Price</span>
              <span>{{ nft.price }} {{ nft.currency }}</span>
            </div>
            <div class="detail-row">
              <span>Transaction Fee</span>
              <span>{{ calculateFee() }} {{ nft.currency }}</span>
            </div>
            <div class="detail-row total">
              <span>Total</span>
              <span>{{ calculateTotal() }} {{ nft.currency }}</span>
            </div>
          </div>

          <div class="payment-methods">
            <h3>Payment Method</h3>
            <div class="payment-options">
              <label class="payment-option">
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="wallet"
                  checked
                />
                <span class="radio-label">Wallet Balance</span>
              </label>
            </div>
          </div>

          <div class="modal-actions">
            <button class="cancel-modal-btn" @click="showPurchaseModal = false">
              Cancel
            </button>
            <button
              class="confirm-purchase-btn"
              @click="purchaseNft"
              :disabled="isPurchasing"
            >
              <span v-if="isPurchasing" class="spinner-small"></span>
              <span v-else>Confirm Purchase</span>
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
import salesApi from "../services/sales";
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
const hasSoldBefore = ref(false);
const showPurchaseModal = ref(false);
const showSellModal = ref(false);
const showEditModal = ref(false);
const isSaving = ref(false);
const editData = ref({ name: "", description: "", imageUrl: "" });
const paymentMethod = ref("wallet");
const isPurchasing = ref(false);
const isSelling = ref(false);
const sellPrice = ref<number>(0);
const sellCurrency = ref("ETH");

// Computed
const isOwner = computed(() => {
  if (!nft.value || !userStore.state.user) return false;
  return nft.value.userId === userStore.state.user.id;
});

const collectionName = computed(() => {
  return collection.value?.name || "Unknown Collection";
});

const isCollectedNft = computed(() => {
  if (!nft.value || !userStore.state.user) return false;

  // An NFT is considered "collected" if:
  // 1. The user owns it
  // 2. The user didn't create it
  return (
    nft.value.userId === userStore.state.user.id &&
    nft.value.creatorId !== userStore.state.user.id
  );
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

    // Check if this NFT has ever been sold
    const nftSales = await salesApi.getByNft(nftId);
    hasSoldBefore.value = nftSales.some((s) => s.status === "sold");

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
  if (!nft.value) return;
  editData.value = {
    name: nft.value.name,
    description: nft.value.description || "",
    imageUrl: nft.value.imageUrl || "",
  };
  showEditModal.value = true;
};

const saveEdit = async () => {
  if (!nft.value || !userStore.state.user) return;
  try {
    isSaving.value = true;
    nft.value = await nftsApi.update(nft.value._id, userStore.state.user.id, editData.value);
    showEditModal.value = false;
  } catch (err: any) {
    alert(err.message || "Failed to save changes");
  } finally {
    isSaving.value = false;
  }
};

const handleSell = () => {
  sellPrice.value = 0;
  showSellModal.value = true;
};

const confirmSell = async () => {
  if (!nft.value || !userStore.state.user) return;
  if (!sellPrice.value || sellPrice.value <= 0) {
    alert("Please enter a valid price");
    return;
  }

  try {
    isSelling.value = true;
    await salesApi.create(userStore.state.user.id, {
      nftId: nft.value._id,
      price: sellPrice.value,
      currency: sellCurrency.value,
    });
    showSellModal.value = false;
    await fetchNft();
  } catch (err: any) {
    console.error("Error listing NFT for sale:", err);
    alert(err.message || "Failed to list NFT for sale");
  } finally {
    isSelling.value = false;
  }
};

const handleCancelSale = async () => {
  if (!nft.value || !userStore.state.user) return;
  if (!(nft.value as any).currentSaleId) {
    alert("No active sale found");
    return;
  }

  if (!confirm("Cancel the listing for this NFT?")) return;

  try {
    await salesApi.cancel(
      (nft.value as any).currentSaleId,
      userStore.state.user.id
    );
    await fetchNft();
  } catch (err: any) {
    console.error("Error cancelling sale:", err);
    alert(err.message || "Failed to cancel sale");
  }
};

const calculateFee = () => {
  if (!nft.value || !nft.value.price) return 0;
  // Calculate fee (e.g., 2.5% of the price)
  return parseFloat((nft.value.price * 0.025).toFixed(4));
};

const calculateTotal = () => {
  if (!nft.value || !nft.value.price) return 0;
  return parseFloat((nft.value.price + calculateFee()).toFixed(4));
};

const purchaseNft = async () => {
  if (!nft.value || !userStore.state.user) return;
  if (!(nft.value as any).currentSaleId) {
    alert("No active sale found for this NFT");
    return;
  }

  try {
    isPurchasing.value = true;
    await salesApi.buy(
      (nft.value as any).currentSaleId,
      userStore.state.user.id
    );
    showPurchaseModal.value = false;
    await fetchNft();
    alert("NFT purchased successfully!");
  } catch (err: any) {
    console.error("Error purchasing NFT:", err);
    alert(err.message || "Failed to purchase NFT");
  } finally {
    isPurchasing.value = false;
  }
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
  color: var(--secondary-light);
  margin-bottom: 1rem;
}

.buy-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color);
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

/* Purchase Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.purchase-modal {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
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
  font-size: 1.5rem;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #777;
}

.modal-content {
  padding: 1.5rem;
}

.nft-preview {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-nft-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.nft-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.nft-info h3 {
  margin: 0;
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.modal-price {
  color: var(--primary-color);
  font-weight: 600;
  margin: 0;
}

.purchase-details {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  color: #555;
}

.detail-row.total {
  font-weight: 600;
  color: var(--text-color);
  font-size: 1.1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.payment-methods {
  margin-bottom: 1.5rem;
}

.payment-methods h3 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-option {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.payment-option input {
  margin-right: 0.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.cancel-modal-btn {
  flex: 1;
  padding: 0.75rem;
  background-color: #f0f0f0;
  color: #555;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-modal-btn:hover {
  background-color: #e0e0e0;
}

.confirm-purchase-btn {
  flex: 2;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirm-purchase-btn:hover {
  background-color: var(--secondary-light);
}

.confirm-purchase-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

.acquisition-section {
  margin-bottom: 1.5rem;
}

.acquisition-section h3 {
  font-size: 1.25rem;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}

.acquisition-date {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.acquisition-date .label {
  font-size: 0.85rem;
  color: #777;
  margin-bottom: 0.25rem;
}

.acquisition-date .value {
  font-weight: 500;
  color: var(--text-color);
}
.form-group-modal {
  margin-bottom: 1rem;
}

.form-group-modal label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #555;
  margin-bottom: 0.3rem;
}

.modal-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
  box-sizing: border-box;
}

.modal-input:focus {
  outline: none;
  border-color: var(--secondary-color, #6633cc);
}

.modal-textarea {
  resize: vertical;
}

.edit-preview {
  margin-top: 0.5rem;
  max-width: 100%;
  max-height: 140px;
  border-radius: 6px;
  object-fit: cover;
}
</style>
