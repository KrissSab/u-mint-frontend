<template>
  <div class="wallet-info">
    <div v-if="isWalletConnected" class="wallet-connected">
      <div class="wallet-header">
        <h3>Wallet Connected</h3>
        <div class="wallet-type">{{ walletType }}</div>
      </div>

      <div class="wallet-address">
        <span class="label">Address:</span>
        <span class="address">{{ truncatedAddress }}</span>
        <button
          @click="copyAddress"
          class="copy-button"
          title="Copy to clipboard"
        >
          <span v-if="copied">Copied!</span>
          <span v-else>Copy</span>
        </button>
      </div>

      <button @click="disconnectWallet" class="disconnect-button">
        Disconnect Wallet
      </button>
    </div>

    <div v-else class="wallet-disconnected">
      <h3>Wallet Not Connected</h3>
      <button @click="openConnectModal" class="connect-button">
        Connect Wallet
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import userStore from "../../store/userStore";

// Props
const props = defineProps({
  showConnectButton: {
    type: Boolean,
    default: true,
  },
});

// Emit events
const emit = defineEmits(["connect", "disconnect"]);

// State
const copied = ref(false);
const showAuthModal = ref(false);

// Computed properties
const isWalletConnected = computed(() => userStore.state.wallet.isConnected);

const walletAddress = computed(() => {
  return userStore.state.user?.walletAddress || "";
});

const truncatedAddress = computed(() => {
  if (!walletAddress.value) return "";
  return (
    walletAddress.value.substring(0, 6) +
    "..." +
    walletAddress.value.substring(walletAddress.value.length - 4)
  );
});

const walletType = computed(() => {
  const type = userStore.state.wallet.type;
  if (!type) return "";
  return type.charAt(0).toUpperCase() + type.slice(1);
});

// Methods
const copyAddress = () => {
  if (walletAddress.value) {
    navigator.clipboard.writeText(walletAddress.value);
    copied.value = true;

    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
};

const disconnectWallet = () => {
  userStore.disconnectWallet();
  emit("disconnect");
};

const openConnectModal = () => {
  emit("connect");
};

// Initialize
onMounted(() => {
  // Check for connected wallet on component mount
  userStore.checkWalletConnection();
});
</script>

<style scoped>
.wallet-info {
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wallet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wallet-header h3 {
  margin: 0;
  color: #333;
}

.wallet-type {
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  background-color: var(--secondary-color, #6633cc);
  color: white;
  border-radius: 4px;
}

.wallet-address {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  background-color: white;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.label {
  font-weight: 500;
  margin-right: 0.5rem;
  color: #555;
}

.address {
  font-family: monospace;
  color: #333;
  margin-right: 0.5rem;
}

.copy-button {
  background-color: transparent;
  border: none;
  color: var(--secondary-color, #6633cc);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.copy-button:hover {
  background-color: rgba(102, 51, 153, 0.1);
}

.disconnect-button,
.connect-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--secondary-color, #6633cc);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.disconnect-button {
  background-color: #e74c3c;
}

.disconnect-button:hover {
  background-color: #c0392b;
}

.connect-button:hover {
  background-color: var(--secondary-light, #7744dd);
}

.wallet-disconnected {
  text-align: center;
}

.wallet-disconnected h3 {
  margin-top: 0;
  color: #666;
  font-weight: 500;
  margin-bottom: 1rem;
}
</style>
