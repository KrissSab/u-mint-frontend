<template>
  <div class="create-nft-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">NFT Name *</label>
        <input
          type="text"
          id="name"
          v-model="nftData.name"
          required
          class="form-input"
          placeholder="My Awesome NFT"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="nftData.description"
          class="form-input textarea"
          placeholder="Describe your NFT..."
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="image">Image URL *</label>
        <input
          type="url"
          id="image"
          v-model="nftData.imageUrl"
          required
          class="form-input"
          placeholder="https://example.com/nft-image.jpg"
        />
        <div class="image-preview" v-if="nftData.imageUrl">
          <img :src="nftData.imageUrl" alt="NFT Preview" />
        </div>
      </div>

      <div class="form-group" v-if="showCollectionSelect">
        <label for="collection">Collection</label>
        <select
          id="collection"
          v-model="nftData.collectionId"
          class="form-input"
        >
          <option value="">None</option>
          <option
            v-for="collection in collections"
            :key="collection._id"
            :value="collection._id"
          >
            {{ collection.name }}
          </option>
        </select>
      </div>

      <div class="form-group properties-group">
        <label>Properties</label>
        <div class="properties-list">
          <div
            v-for="(property, index) in properties"
            :key="index"
            class="property-item"
          >
            <input
              type="text"
              v-model="property.name"
              class="form-input property-input"
              placeholder="Trait name"
            />
            <input
              type="text"
              v-model="property.value"
              class="form-input property-input"
              placeholder="Value"
            />
            <button
              type="button"
              class="remove-property-button"
              @click="removeProperty(index)"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            class="add-property-button"
            @click="addProperty"
          >
            + Add Property
          </button>
        </div>
      </div>

      <div class="form-group price-group" v-if="showPriceOptions">
        <label>Price (optional)</label>
        <div class="price-inputs">
          <input
            type="number"
            v-model.number="nftData.price"
            class="form-input price-input"
            placeholder="Price"
            min="0"
            step="0.000001"
          />
          <select v-model="nftData.currency" class="form-input currency-select">
            <option value="SOL">SOL</option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
          </select>
        </div>
        <div class="for-sale-toggle">
          <input type="checkbox" id="for-sale" v-model="nftData.isForSale" />
          <label for="for-sale">List for sale</label>
        </div>
      </div>

      <div class="form-group royalty-group">
        <label>
          Royalties (optional)
          <span v-if="royaltyLockedByCollection" class="locked-badge">from collection</span>
        </label>
        <div class="royalty-inputs">
          <input
            type="text"
            v-model="royaltyAddress"
            class="form-input royalty-address"
            placeholder="Wallet address for royalties"
            :disabled="royaltyLockedByCollection"
            :class="{ 'input-locked': royaltyLockedByCollection }"
          />
          <div class="royalty-percentage">
            <input
              type="number"
              v-model.number="royaltyPercentage"
              class="form-input"
              min="0"
              max="15"
              step="0.1"
              :disabled="royaltyLockedByCollection"
              :class="{ 'input-locked': royaltyLockedByCollection }"
            />
            <span class="percentage-symbol">%</span>
          </div>
        </div>
        <p v-if="royaltyLockedByCollection" class="help-text">
          Royalty is set by the collection and cannot be changed.
        </p>
        <p v-else class="help-text">
          Royalties allow you to earn a fee when your NFT is sold on the secondary market.
        </p>
      </div>

      <div class="form-actions">
        <button type="button" class="cancel-button" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="submit"
          class="submit-button"
          :disabled="isSubmitting || !isValidForm"
        >
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create NFT</span>
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, onMounted, watch } from "vue";
import type { PropType } from "vue";
import type { Collection } from "../../services/collections";
import type { CreateNftDto, Nft } from "../../services/nfts";
import { api } from "../../services/api";

// Props
const props = defineProps({
  preselectedCollectionId: {
    type: String,
    default: "",
  },
  collections: {
    type: Array as PropType<Collection[]>,
    default: () => [],
  },
  showCollectionSelect: {
    type: Boolean,
    default: true,
  },
  showPriceOptions: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(["submit", "cancel"]);

// State
const isSubmitting = ref(false);
const errorMessage = ref("");

const nftData = ref<CreateNftDto>({
  name: "",
  description: "",
  imageUrl: "",
  collectionId: props.preselectedCollectionId,
  isForSale: false,
  currency: "SOL",
  contractAddress: "",
  tokenId: "",
});

const royaltyAddress = ref("");
const royaltyPercentage = ref(5);

const properties = ref<{ name: string; value: string }[]>([]);

// Royalty from collection
const royaltyLockedByCollection = computed(() => {
  if (!nftData.value.collectionId) return false;
  const col = props.collections.find((c) => c._id === nftData.value.collectionId);
  return !!col?.royalties?.address;
});

watch(
  () => nftData.value.collectionId,
  (id) => {
    const col = props.collections.find((c) => c._id === id);
    if (col?.royalties?.address) {
      royaltyAddress.value = col.royalties.address;
      royaltyPercentage.value = col.royalties.percentage;
    } else if (!id) {
      royaltyAddress.value = "";
      royaltyPercentage.value = 5;
    }
  }
);

// Computed
const isValidForm = computed(() => {
  return (
    nftData.value.name.trim().length > 0 &&
    nftData.value.imageUrl.trim().length > 0
  );
});

// Methods
const handleSubmit = () => {
  if (!isValidForm.value) return;

  // Add properties to the NFT data as metadata
  if (properties.value.length > 0) {
    const metadataObj: Record<string, any> = {};
    properties.value.forEach((prop) => {
      if (prop.name && prop.value) {
        metadataObj[prop.name] = prop.value;
      }
    });

    if (Object.keys(metadataObj).length > 0) {
      nftData.value.metadata = metadataObj;
    }
  }

  // Add royalty if provided
  if (royaltyAddress.value && royaltyPercentage.value > 0) {
    nftData.value.royalties = {
      address: royaltyAddress.value,
      percentage: royaltyPercentage.value,
    };
  }

  // Emit the submit event with the NFT data
  emit("submit", nftData.value);
};

const addProperty = () => {
  properties.value.push({ name: "", value: "" });
};

const removeProperty = (index: number) => {
  properties.value.splice(index, 1);
};

onMounted(async () => {
  nftData.value.tokenId = Date.now().toString();
  try {
    const res = await api.get<{ platformContract: string }>("/blockchain/addresses");
    nftData.value.contractAddress = res.platformContract;
  } catch {
    // fallback: field stays empty, backend will validate
  }
});
</script>

<style scoped>
.create-nft-form {
  padding: 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

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
  transition: border-color 0.2s;
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

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.properties-group {
  margin-top: 2rem;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.property-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.property-input {
  flex: 1;
}

.remove-property-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-property-button:hover {
  color: #e74c3c;
}

.add-property-button {
  padding: 0.5rem;
  background-color: #f0f0f0;
  border: none;
  border-radius: 6px;
  color: #555;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.add-property-button:hover {
  background-color: #e0e0e0;
}

.price-group,
.royalty-group {
  margin-top: 2rem;
}

.price-inputs {
  display: flex;
  gap: 1rem;
}

.price-input {
  flex: 3;
}

.currency-select {
  flex: 1;
}

.for-sale-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.for-sale-toggle label {
  margin-bottom: 0;
  cursor: pointer;
}

.royalty-inputs {
  display: flex;
  gap: 1rem;
}

.royalty-address {
  flex: 3;
}

.royalty-percentage {
  flex: 1;
  position: relative;
}

.percentage-symbol {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
  pointer-events: none;
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #777;
}

.input-locked {
  background-color: #f5f5f5;
  color: #888;
  cursor: not-allowed;
}

.locked-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.1rem 0.4rem;
  background-color: #ede9f8;
  color: var(--secondary-color, #6633cc);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  vertical-align: middle;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
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
