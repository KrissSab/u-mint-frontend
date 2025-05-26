<template>
  <div class="collections-container">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <p>Loading collections...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
    </div>

    <!-- Content when loaded -->
    <template v-else>
      <!-- Ліва колонка (елементи 1-5) -->
      <div class="collections-table">
        <div class="table-header">
          <div class="table-row">
            <div class="rank-column column-name">Rank</div>
            <div class="collection-column column-name">Collection</div>
            <div class="price-column column-name">Floor Price</div>
            <div class="volume-column column-name">Volume</div>
          </div>
        </div>
        <div class="table-body">
          <div
            v-for="collection in leftColumnCollections"
            :key="collection.id"
            class="table-row"
          >
            <div class="rank-column">{{ collection.rank }}</div>
            <div class="collection-column">
              <div class="collection-info">
                <img
                  :src="collection.image"
                  :alt="collection.name"
                  class="collection-image"
                />
                <div class="collection-name">
                  {{ collection.name }}
                  <span v-if="collection.verified" class="verified-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#1DA1F2"
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div class="price-column">
              {{ collection.floorPrice }} {{ collection.floorPriceCurrency }}
            </div>
            <div class="volume-column">
              {{ formatNumberDisplay(collection.volume) }}
              {{ collection.volumeCurrency }}
            </div>
          </div>
        </div>
      </div>

      <div class="collections-table">
        <div class="table-header">
          <div class="table-row">
            <div class="rank-column column-name">Rank</div>
            <div class="collection-column column-name">Collection</div>
            <div class="price-column column-name">Floor Price</div>
            <div class="volume-column column-name">Volume</div>
          </div>
        </div>
        <div class="table-body">
          <div
            v-for="collection in rightColumnCollections"
            :key="collection.id"
            class="table-row"
          >
            <div class="rank-column">{{ collection.rank }}</div>
            <div class="collection-column">
              <div class="collection-info">
                <img
                  :src="collection.image"
                  :alt="collection.name"
                  class="collection-image"
                />
                <div class="collection-name">
                  {{ collection.name }}
                  <span v-if="collection.verified" class="verified-badge">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="#1DA1F2"
                    >
                      <path
                        d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
            <div class="price-column">
              {{ collection.floorPrice }} {{ collection.floorPriceCurrency }}
            </div>
            <div class="volume-column">
              {{ formatNumberDisplay(collection.volume) }}
              {{ collection.volumeCurrency }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { collectionsApi } from "@/services/collections";
import { nftsApi } from "@/services/nfts";
import type { Collection as ApiCollection } from "@/services/collections";
import type { Nft } from "@/services/nfts";

interface Collection {
  id: number;
  rank: number;
  name: string;
  image: string;
  verified: boolean;
  floorPrice: number;
  floorPriceCurrency: string;
  volume: number;
  volumeCurrency: string;
  nfts?: Nft[];
}

const collections = ref<Collection[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Calculate floor price - find the lowest priced NFT in the collection
const calculateFloorPrice = (
  nfts: Nft[]
): { price: number; currency: string } => {
  // Filter out NFTs that don't have a price or aren't for sale
  const nftsForSale = nfts.filter(
    (nft) => nft.isForSale && nft.price && nft.price > 0
  );

  if (nftsForSale.length === 0) {
    return { price: 0, currency: "ETH" };
  }

  // Find the NFT with the lowest price
  const lowestPricedNft = nftsForSale.reduce((lowest, current) => {
    if (!lowest.price || (current.price && current.price < lowest.price)) {
      return current;
    }
    return lowest;
  }, nftsForSale[0]);

  return {
    price: lowestPricedNft.price || 0,
    currency: lowestPricedNft.currency || "ETH",
  };
};

// Calculate total volume - sum of all sales in the collection
const calculateVolume = (nfts: Nft[]): { volume: number; currency: string } => {
  // Sum up the prices of all NFTs that have been sold
  const totalVolume = nfts.reduce((sum, nft) => {
    if (nft.price && nft.isForSale) {
      return sum + (nft.price || 0);
    }
    return sum;
  }, 0);

  // Default to ETH, but could be more sophisticated based on nft.currency
  const mostCommonCurrency =
    nfts.length > 0 && nfts[0].currency ? nfts[0].currency : "ETH";

  return { volume: totalVolume, currency: mostCommonCurrency };
};

// Format number for display
const formatNumberDisplay = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

// Function to fetch top NFT collections and their NFTs from API
const fetchCollections = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Get collections from the API
    const apiCollections = await collectionsApi.getAll();

    // Take only the first 10 collections
    const topCollections = apiCollections.slice(0, 10);

    // Create an array to store processed collections with NFTs
    const processedCollections: Collection[] = [];

    // Fetch NFTs for each collection and calculate metrics
    for (let i = 0; i < topCollections.length; i++) {
      const collection = topCollections[i];

      try {
        // Get NFTs for this collection
        const nfts = await nftsApi.getByCollection(collection._id);

        // Calculate floor price and volume
        const { price: floorPrice, currency: floorPriceCurrency } =
          calculateFloorPrice(nfts);
        const { volume, currency: volumeCurrency } = calculateVolume(nfts);

        // Add collection to processed array
        processedCollections.push({
          id: i + 1,
          rank: i + 1,
          name: collection.name,
          image: collection.profileImage || "/nft-default.png",
          verified: collection.isVerified,
          floorPrice,
          floorPriceCurrency,
          volume,
          volumeCurrency,
          nfts,
        });
      } catch (err) {
        console.error(
          `Error fetching NFTs for collection ${collection._id}:`,
          err
        );

        // Still add the collection, but with default values
        processedCollections.push({
          id: i + 1,
          rank: i + 1,
          name: collection.name,
          image: collection.profileImage || "/nft-default.png",
          verified: collection.isVerified,
          floorPrice: collection.floorPrice || 0,
          floorPriceCurrency: "ETH",
          volume: collection.totalVolume || 0,
          volumeCurrency: "ETH",
        });
      }
    }

    // Update collections with processed data
    collections.value = processedCollections;
  } catch (err) {
    console.error("Error fetching collections:", err);
    error.value = "Failed to load NFT collections. Please try again later.";
  } finally {
    loading.value = false;
  }
};

const leftColumnCollections = computed(() => {
  return collections.value.filter((collection) => collection.rank <= 5);
});

const rightColumnCollections = computed(() => {
  return collections.value.filter((collection) => collection.rank > 5);
});

// Fetch data when component is mounted
onMounted(() => {
  fetchCollections();
});
</script>

<style scoped>
.collections-container {
  display: flex;
  gap: 16px;
  width: 100%;
}

.loading-container,
.error-container {
  width: 100%;
  text-align: center;
  padding: 40px 0;
}

.collections-table {
  width: 100%;
  border-collapse: collapse;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, sans-serif;
  background-color: white;
}

.table-header {
  border-bottom: 1px solid #e0e0e0;
  font-weight: 600;
  color: #333;
}

.table-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 0;
  font-weight: 500;
}

.table-body .table-row:hover {
  background-color: #f9f9f9;
}

.rank-column {
  width: 60px;
  text-align: center;
  font-weight: 700;
}

.column-name {
  font-weight: 300 !important;
}

.collection-column {
  flex: 1;
  padding-left: 10px;
}

.price-column,
.volume-column {
  width: 120px;
  text-align: right;
  padding-right: 20px;
  font-weight: 700;
}

.collection-info {
  display: flex;
  align-items: center;
}

.collection-image {
  width: 50px;
  height: 50px;
  border-radius: 0.75rem;
  object-fit: cover;
  margin-right: 12px;
}

.collection-name {
  font-weight: 700;
  display: flex;
  align-items: center;
}

.verified-badge {
  display: inline-flex;
  margin-left: 4px;
  color: #1da1f2;
}

.table-header .table-row {
  padding: 12px 0;
}

@media (max-width: 1024px) {
  .collections-container {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .collections-table {
    font-size: 14px;
  }

  .rank-column {
    width: 40px;
  }

  .price-column,
  .volume-column {
    width: 80px;
    padding-right: 10px;
  }

  .collection-image {
    width: 30px;
    height: 30px;
  }
}
</style>
