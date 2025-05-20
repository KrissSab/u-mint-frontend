import { reactive, readonly } from "vue";

// Define user interface
interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  walletAddress?: string;
}

// Define state interface
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  wallet: {
    isConnected: boolean;
    provider: any;
  };
}

// Initial state
const state = reactive<UserState>({
  user: null,
  isAuthenticated: false,
  wallet: {
    isConnected: false,
    provider: null,
  },
});

// Actions
const actions = {
  login(userData: User) {
    state.user = userData;
    state.isAuthenticated = true;

    // Store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userData));
  },

  logout() {
    state.user = null;
    state.isAuthenticated = false;

    // Remove from localStorage
    localStorage.removeItem("user");
  },

  // Initialize store from localStorage on app start
  init() {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        state.user = userData;
        state.isAuthenticated = true;
      } catch (e) {
        console.error("Failed to parse user data from localStorage");
        localStorage.removeItem("user");
      }
    }

    // Check if Phantom wallet is already connected
    this.checkWalletConnection();
  },

  // Connect to Phantom wallet
  async connectPhantomWallet() {
    try {
      // Check if Phantom is installed
      const isPhantomInstalled = window.phantom?.solana?.isPhantom;

      if (!isPhantomInstalled) {
        throw new Error("Phantom wallet is not installed");
      }

      // Connect to Phantom
      const provider = window.phantom?.solana;
      if (!provider) {
        throw new Error("Phantom provider not found");
      }

      const response = await provider.connect();
      const walletAddress = response.publicKey.toString();

      // Update wallet state
      state.wallet.isConnected = true;
      state.wallet.provider = provider;

      // Update user data if user is authenticated
      if (state.isAuthenticated && state.user) {
        const updatedUser = {
          ...state.user,
          walletAddress,
        };
        this.login(updatedUser);
      }

      return walletAddress;
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      throw error;
    }
  },

  // Disconnect from Phantom wallet
  disconnectWallet() {
    if (state.wallet.provider) {
      state.wallet.provider.disconnect();
    }

    state.wallet.isConnected = false;
    state.wallet.provider = null;

    // Update user data if user is authenticated
    if (state.isAuthenticated && state.user && state.user.walletAddress) {
      const updatedUser = { ...state.user };
      delete updatedUser.walletAddress;
      this.login(updatedUser);
    }
  },

  // Check if wallet is already connected
  checkWalletConnection() {
    const isPhantomInstalled = window.phantom?.solana?.isPhantom;

    if (isPhantomInstalled) {
      const provider = window.phantom?.solana;
      if (provider) {
        state.wallet.isConnected = provider.isConnected;
        if (provider.isConnected) {
          state.wallet.provider = provider;
        }
      }
    }
  },
};

// Create store
const userStore = {
  state: readonly(state),
  ...actions,
};

export default userStore;
