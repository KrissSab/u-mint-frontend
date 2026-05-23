import { reactive, readonly } from "vue";
import { authApi } from "../services/api";

// Define Ethereum window interface
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Define user interface
interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  walletAddress?: string;
  walletType?: string;
  username?: string;
}

// Define API response interfaces
interface UserResponse {
  _id: string;
  email: string;
  username: string;
  wallets?: Array<{
    type: string;
    address: string;
  }>;
}

// Define state interface
interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  wallet: {
    isConnected: boolean;
    provider: any;
    type: string | null;
  };
  registration: {
    inProgress: boolean;
    email: string | null;
    username: string | null;
    verificationSent: boolean;
  };
}

// Initial state
const state = reactive<UserState>({
  user: null,
  isAuthenticated: false,
  wallet: {
    isConnected: false,
    provider: null,
    type: null,
  },
  registration: {
    inProgress: false,
    email: null,
    username: null,
    verificationSent: false,
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

  // Login with email and password
  async loginWithEmail(email: string, password: string) {
    try {
      // Call API to login with email/password
      const loginResponse = (await authApi.login({
        email,
        password,
      })) as any;

      // Extract user data from response
      const userData = loginResponse.user || loginResponse;

      // Login the user with the returned data
      this.login({
        id: userData._id,
        email: userData.email,
        name: userData.username,
        username: userData.username,
        walletAddress: userData.wallets?.[0]?.address,
        walletType: userData.wallets?.[0]?.type,
      });

      console.log("Successfully logged in with email:", userData);
      return true;
    } catch (error: any) {
      console.error("Error logging in with email:", error);
      throw error;
    }
  },

  // Initialize store from localStorage on app start
  async init() {
    // First load user from localStorage if available
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        state.user = userData;
        state.isAuthenticated = true;
        console.log("User loaded from localStorage:", userData);

        // If user has wallet data, update wallet state
        if (userData.walletType && userData.walletAddress) {
          console.log(
            `User has wallet: ${userData.walletType} (${userData.walletAddress})`
          );
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage");
        localStorage.removeItem("user");
      }
    }

    // Check if wallet is connected based on user data
    await this.checkWalletConnection();
  },

  // Connect to Phantom wallet
  async connectPhantomWallet() {
    try {
      // Get Phantom provider using recommended approach
      const getPhantomProvider = () => {
        if ("phantom" in window) {
          const provider = window.phantom?.solana;

          if (provider?.isPhantom) {
            return provider;
          }
        }

        throw new Error(
          "Phantom wallet is not installed. Please install it from https://phantom.app/"
        );
      };

      // Get the provider
      const provider = getPhantomProvider();
      console.log("Using Phantom Solana provider:", provider);

      // Connect using the recommended approach
      try {
        const response = await provider.connect();
        const walletAddress = response.publicKey.toString();

        console.log("Phantom wallet address:", walletAddress);
        console.log("Phantom connection response:", response);

        // Update wallet state
        state.wallet.isConnected = true;
        state.wallet.provider = provider;
        state.wallet.type = "phantom";

        try {
          // Try to login with the wallet
          const loginResponse = (await authApi.loginWithWallet({
            type: "phantom",
            address: walletAddress,
          })) as any;

          // Extract user data from response
          const userData = loginResponse.user || loginResponse;

          // Login the user with the returned data
          this.login({
            id: userData._id,
            email: userData.email || "",
            name: userData.username,
            username: userData.username,
            walletAddress: userData.wallets?.[0]?.address || walletAddress,
            walletType: "phantom",
          });

          console.log("Successfully logged in with wallet:", userData);
          return walletAddress;
        } catch (error: any) {
          // If login fails, the user might not exist - register them
          if (
            error.message.includes("not found") ||
            error.message.includes("does not exist")
          ) {
            return await this.registerWithWallet(walletAddress, "phantom");
          }
          throw error;
        }
      } catch (err: any) {
        if (err.code === 4001) {
          throw new Error("User rejected the connection request");
        }
        throw err;
      }
    } catch (error) {
      console.error("Error connecting to Phantom wallet:", error);
      throw error;
    }
  },

  // Register a new user with wallet
  async registerWithWallet(walletAddress: string, walletType: string) {
    try {
      console.log(`Registering with wallet: ${walletAddress} (${walletType})`);

      // Generate a temporary username based on wallet address
      const tempUsername = `user_${walletAddress.substring(0, 8)}`;

      // Create user with wallet only (no email required)
      console.log(tempUsername, walletAddress, walletType);
      const registerResponse = (await authApi.create({
        username: tempUsername,
        // We don't provide email when registering with wallet
        password: Math.random().toString(36).substring(2, 15), // Generate random password
        wallet: {
          type: walletType,
          address: walletAddress,
        },
      })) as any;

      // Extract user data from response
      const userData = registerResponse.user || registerResponse;

      // Login the user with the returned data
      this.login({
        id: userData._id,
        email: userData.email || "", // Email might be empty
        name: userData.username,
        username: userData.username,
        walletAddress: userData.wallets?.[0]?.address || walletAddress,
        walletType: walletType, // Explicitly set wallet type
      });

      console.log("User registered with wallet successfully");
      return walletAddress;
    } catch (error: any) {
      console.error("Error registering with wallet:", error);

      // If user already exists with this wallet, try to fetch and login
      try {
        // This is a placeholder - you would need an endpoint to fetch user by wallet
        // const userData = await authApi.getUserByWallet(walletAddress);
        // this.login(userData);
        // For now, just throw the original error
        throw error;
      } catch (e) {
        throw error;
      }
    }
  },

  // Connect to MetaMask wallet
  async connectMetaMaskWallet() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      // Check if we're actually using MetaMask and not another provider
      if (!window.ethereum.isMetaMask) {
        throw new Error(
          "MetaMask provider not detected. Another wallet might be interfering."
        );
      }

      console.log("Using MetaMask provider:", window.ethereum);

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];
      console.log("MetaMask accounts:", accounts);

      console.log("MetaMask wallet address:", walletAddress);

      // Update wallet state
      state.wallet.isConnected = true;
      state.wallet.provider = window.ethereum;
      state.wallet.type = "metamask";

      try {
        // Try to login with the wallet
        const loginResponse = (await authApi.loginWithWallet({
          type: "metamask",
          address: walletAddress,
        })) as any;

        // Extract user data from response
        const userData = loginResponse.user || loginResponse;

        // Login the user with the returned data
        this.login({
          id: userData._id,
          email: userData.email || "",
          name: userData.username,
          username: userData.username,
          walletAddress: userData.wallets?.[0]?.address || walletAddress,
          walletType: "metamask", // Explicitly set wallet type
        });

        console.log("Successfully logged in with wallet:", userData);
        return walletAddress;
      } catch (error: any) {
        console.log("Error connecting to MetaMask wallet:", error);
        // If login fails, the user might not exist - register them
        if (
          error.message.includes("not found") ||
          error.message.includes("does not exist")
        ) {
          return await this.registerWithWallet(walletAddress, "metamask");
        }
        throw error;
      }
    } catch (error) {
      console.error("Error connecting to MetaMask wallet:", error);
      throw error;
    }
  },

  // Disconnect from wallet
  disconnectWallet() {
    if (state.wallet.provider) {
      if (state.wallet.type === "phantom") {
        state.wallet.provider.disconnect();
      }
      // For other wallet types, add disconnect logic here
    }

    state.wallet.isConnected = false;
    state.wallet.provider = null;
    state.wallet.type = null;

    // Update user data if user is authenticated
    if (
      state.isAuthenticated &&
      state.user &&
      (state.user.walletAddress || state.user.walletType)
    ) {
      const updatedUser = { ...state.user };
      delete updatedUser.walletAddress;
      delete updatedUser.walletType;
      this.login(updatedUser);
    }
  },

  // Check if wallet is already connected
  async checkWalletConnection() {
    try {
      // If we have user data with wallet info, use that as the source of truth
      if (
        state.isAuthenticated &&
        state.user &&
        state.user.walletType &&
        state.user.walletAddress
      ) {
        console.log(
          `Using stored wallet data: ${state.user.walletType} (${state.user.walletAddress})`
        );

        // Set wallet state based on user data
        if (state.user.walletType === "phantom") {
          // Check if Phantom is installed using the recommended approach
          if ("phantom" in window && window.phantom?.solana?.isPhantom) {
            state.wallet.isConnected = true;
            state.wallet.provider = window.phantom?.solana;
            state.wallet.type = "phantom";
            console.log("Phantom wallet state updated from user data");
          }
        } else if (state.user.walletType === "metamask") {
          // Check if MetaMask is installed
          if (window.ethereum) {
            state.wallet.isConnected = true;
            state.wallet.provider = window.ethereum;
            state.wallet.type = "metamask";
            console.log("MetaMask wallet state updated from user data");
          }
        }

        return;
      }

      // If no wallet info in user data, don't try to auto-detect
      console.log("No wallet data in user profile, skipping auto-connection");
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  },

  // API Integration for User Registration
  async startRegistration(email: string) {
    try {
      // Set registration in progress
      state.registration.inProgress = true;
      state.registration.email = email;

      // Generate a temporary username from email
      const tempUsername = email.split("@")[0];

      // Call API to initiate registration and send verification code
      await authApi.register({
        username: tempUsername,
        email,
        password: "temporary", // Will be set during complete registration
      });

      // Update state to show verification code input
      state.registration.verificationSent = true;
      return true;
    } catch (error: any) {
      console.error("Error starting registration:", error);
      throw error;
    }
  },

  async verifyEmail(code: string) {
    try {
      if (!state.registration.email) {
        throw new Error("Email not set for verification");
      }

      // Call API to verify the code
      await authApi.verifyEmail({
        email: state.registration.email,
        code,
      });

      return true;
    } catch (error: any) {
      console.error("Error verifying email:", error);
      throw error;
    }
  },

  async completeRegistration(
    username: string,
    password: string,
    wallet?: { type: string; address: string }
  ) {
    try {
      if (!state.registration.email) {
        throw new Error("Email not set for registration");
      }

      // Call API to complete registration
      const userData = (await authApi.completeRegistration({
        username,
        email: state.registration.email,
        password,
        wallet,
      })) as UserResponse;

      // Login the user with the returned data
      this.login({
        id: userData._id,
        email: userData.email,
        name: userData.username,
        username: userData.username,
        walletAddress: userData.wallets?.[0]?.address,
        walletType: userData.wallets?.[0]?.type,
      });

      // Reset registration state
      state.registration.inProgress = false;
      state.registration.email = null;
      state.registration.username = null;
      state.registration.verificationSent = false;

      return true;
    } catch (error: any) {
      console.error("Error completing registration:", error);
      throw error;
    }
  },

  async resendVerificationCode() {
    try {
      if (!state.registration.email) {
        throw new Error("Email not set for verification");
      }

      // Call API to resend verification code
      await authApi.resendVerificationCode(state.registration.email);
      return true;
    } catch (error: any) {
      console.error("Error resending verification code:", error);
      throw error;
    }
  },
};

// Create store
const userStore = {
  state: readonly(state),
  ...actions,
};

export default userStore;
