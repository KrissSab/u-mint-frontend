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

      <!-- Minting status overlay -->
      <div v-if="mintingStatus" class="minting-overlay">
        <div class="minting-card">
          <div class="spinner"></div>
          <p v-if="mintingStatus === 'saving'">Збереження NFT...</p>
          <p v-else-if="mintingStatus === 'minting'">
            Підтвердь транзакцію в MetaMask щоб заминчити NFT on-chain...
          </p>
        </div>
      </div>

      <!-- NFT creation form -->
      <div v-else>
        <div v-if="mintingError" class="minting-error">
          {{ mintingError }}
        </div>
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
import { BrowserProvider, Contract } from "ethers";
import userStore from "../store/userStore";
import AuthenticationModal from "../components/auth/AuthenticationModal.vue";
import CreateNftForm from "../components/nfts/CreateNftForm.vue";
import collectionsApi from "../services/collections";
import nftsApi from "../services/nfts";
import type { Collection } from "../services/collections";
import type { CreateNftDto } from "../services/nfts";

const PLATFORM_CONTRACT_ADDRESS = "0xA91304e35A47b4e9E5c98c063137bBdee03C0C40";
const MINT_ABI = [
  "function mintToken(uint256 tokenId, uint256 nonce) external",
  "function getNonce(address account) external view returns (uint256)",
];

// Router
const router = useRouter();

// State
const isAuthenticated = computed(() => userStore.state.isAuthenticated);
const myCollections = ref<Collection[]>([]);
const isLoadingCollections = ref(false);
const showAuthModal = ref(false);
const mintingStatus = ref<"" | "saving" | "minting" | "done">("");
const mintingError = ref("");

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

const SEPOLIA_CHAIN_ID = "0xaa36a7";

const switchToSepolia = async () => {
  await (window as any).ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID }],
  });
};

const handleCreateNft = async (nftData: CreateNftDto) => {
  if (!isAuthenticated.value || !userStore.state.user) return;

  mintingError.value = "";

  try {
    // Step 1: Save NFT to database
    mintingStatus.value = "saving";
    const createdNft = await nftsApi.create(userStore.state.user.id, nftData);

    // Step 2: Mint on-chain via MetaMask
    mintingStatus.value = "minting";

    if (!(window as any).ethereum) {
      mintingStatus.value = "";
      mintingError.value = "MetaMask не встановлено. NFT збережено в профілі, але не заминчено on-chain.";
      return;
    }

    // Switch to Sepolia if on wrong network
    const chainId = await (window as any).ethereum.request({ method: "eth_chainId" });
    console.log("[Mint] Current chain:", chainId, "| Expected:", SEPOLIA_CHAIN_ID);
    if (chainId !== SEPOLIA_CHAIN_ID) {
      await switchToSepolia();
    }

    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();
    console.log("[Mint] Signer address:", await signer.getAddress());

    const contract = new Contract(PLATFORM_CONTRACT_ADDRESS, MINT_ABI, signer);

    const tokenIdBigInt = BigInt(createdNft.tokenId);
    console.log("[Mint] tokenId:", tokenIdBigInt.toString());

    const nonce = await contract.getNonce(signer.address);
    console.log("[Mint] nonce:", nonce.toString());

    const tx = await contract.mintToken(tokenIdBigInt, nonce);
    console.log("[Mint] tx hash:", tx.hash);
    await tx.wait();
    console.log("[Mint] confirmed!");

    mintingStatus.value = "done";
    router.push(`/nfts/${createdNft._id}`);
  } catch (error: any) {
    mintingStatus.value = "";
    console.error("[Mint] Error:", error);

    if (error.code === 4001 || error.code === "ACTION_REJECTED") {
      mintingError.value = "Транзакцію відхилено в MetaMask. NFT збережено в профілі, але не заминчено on-chain.";
    } else if (error.code === 4902) {
      mintingError.value = "Мережа Sepolia не додана в MetaMask. Додай її вручну.";
    } else {
      mintingError.value = `Помилка минчингу: ${error.reason || error.message || "Невідома помилка"}`;
    }
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

/* Minting overlay */
.minting-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.minting-card {
  text-align: center;
  background-color: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  max-width: 400px;
}

.minting-card p {
  margin-top: 1.25rem;
  color: #555;
  font-size: 1rem;
  line-height: 1.5;
}

.minting-error {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background-color: #fff0f0;
  color: #c0392b;
  border: 1px solid #f5c6c6;
  border-radius: 8px;
  font-size: 0.9rem;
}
</style>
