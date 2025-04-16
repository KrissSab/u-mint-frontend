<template>
  <div class="collections-container">
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
            {{ collection.volume }} {{ collection.volumeCurrency }}
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
            {{ collection.volume }} {{ collection.volumeCurrency }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Collection {
  id: number;
  rank: number;
  name: string;
  image: string;
  verified: boolean;
  floorPrice: number;
  floorPriceCurrency: string;
  volume: number | string;
  volumeCurrency: string;
}

const collections: Collection[] = [
  {
    id: 1,
    rank: 1,
    name: "Sab's.io",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 42.83,
    floorPriceCurrency: "POL",
    volume: 517,
    volumeCurrency: "ETH",
  },
  {
    id: 2,
    rank: 2,
    name: "JewKo",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 50,
    floorPriceCurrency: "BERA",
    volume: "7,640",
    volumeCurrency: "BERA",
  },
  {
    id: 3,
    rank: 3,
    name: "Cl-ar-1k",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 0.06,
    floorPriceCurrency: "ETH",
    volume: 26,
    volumeCurrency: "ETH",
  },
  {
    id: 4,
    rank: 4,
    name: "Good Maxim",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 0.25,
    floorPriceCurrency: "ETH",
    volume: 27,
    volumeCurrency: "ETH",
  },
  {
    id: 5,
    rank: 5,
    name: "Bad Girls",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 1.16,
    floorPriceCurrency: "ETH",
    volume: 94,
    volumeCurrency: "ETH",
  },
  {
    id: 6,
    rank: 6,
    name: "Kaizen",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 1100.04,
    floorPriceCurrency: "ETH",
    volume: 762.02,
    volumeCurrency: "ETH",
  },
  {
    id: 7,
    rank: 7,
    name: "Vibes",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 121.99,
    floorPriceCurrency: "BERA",
    volume: "11K",
    volumeCurrency: "BERA",
  },
  {
    id: 8,
    rank: 8,
    name: "Musiyakas",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 0.09,
    floorPriceCurrency: "ETH",
    volume: 7,
    volumeCurrency: "ETH",
  },
  {
    id: 9,
    rank: 9,
    name: "SOL110",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 0.65,
    floorPriceCurrency: "ETH",
    volume: 42,
    volumeCurrency: "ETH",
  },
  {
    id: 10,
    rank: 10,
    name: "Apexofties",
    image: "/nft-default.png",
    verified: true,
    floorPrice: 0.13,
    floorPriceCurrency: "ETH",
    volume: 10,
    volumeCurrency: "ETH",
  },
];

const leftColumnCollections = computed(() => {
  return collections.filter((collection) => collection.rank <= 5);
});

const rightColumnCollections = computed(() => {
  return collections.filter((collection) => collection.rank > 5);
});
</script>

<style scoped>
.collections-container {
  display: flex;
  gap: 16px;
  width: 100%;
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
