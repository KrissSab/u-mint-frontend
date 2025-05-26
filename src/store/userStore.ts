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
      } catch (e) {
        console.error("Failed to parse user data from localStorage");
        localStorage.removeItem("user");
      }
    }

    // Then check if any wallet is connected
    await this.checkWalletConnection();

    // If we have wallet connected but no user data, try to authenticate with the wallet
    if (state.wallet.isConnected && (!state.isAuthenticated || !state.user)) {
      console.log(
        "Wallet connected but no user data, attempting to authenticate"
      );
      try {
        if (state.wallet.type === "phantom") {
          await this.connectPhantomWallet();
        } else if (state.wallet.type === "metamask") {
          await this.connectMetaMaskWallet();
        }
      } catch (error) {
        console.error("Failed to authenticate with connected wallet:", error);
      }
    }

    // If we have both user and wallet connected, ensure wallet address is in user data
    if (state.isAuthenticated && state.user && state.wallet.isConnected) {
      console.log("Both user and wallet detected on startup");
    }
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

      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const walletAddress = accounts[0];

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
        });

        console.log("Successfully logged in with wallet:", userData);
        return walletAddress;
      } catch (error: any) {
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
    if (state.isAuthenticated && state.user && state.user.walletAddress) {
      const updatedUser = { ...state.user };
      delete updatedUser.walletAddress;
      this.login(updatedUser);
    }
  },

  // Check if wallet is already connected
  async checkWalletConnection() {
    try {
      // Check Phantom
      const isPhantomInstalled = window.phantom?.solana?.isPhantom;
      if (isPhantomInstalled) {
        const provider = window.phantom?.solana;
        if (provider && provider.isConnected) {
          // Get the wallet address
          try {
            // Need to check if we can get the public key
            // This is a workaround since TypeScript doesn't know about this property
            const publicKey = (provider as any).publicKey;
            if (publicKey) {
              const walletAddress = publicKey.toString();

              // Update wallet state
              state.wallet.isConnected = true;
              state.wallet.provider = provider;
              state.wallet.type = "phantom";

              // If user is already authenticated but wallet address is missing, update it
              if (
                state.isAuthenticated &&
                state.user &&
                !state.user.walletAddress
              ) {
                const updatedUser = { ...state.user, walletAddress };
                this.login(updatedUser);
              }

              console.log(
                "Phantom wallet detected on page load:",
                walletAddress
              );
              return;
            }
          } catch (error) {
            console.error("Error getting Phantom wallet address:", error);
          }
        }
      }

      // Check MetaMask
      if (window.ethereum && window.ethereum.isConnected()) {
        try {
          // Get accounts without prompting user
          const accounts = await window.ethereum.request({
            method: "eth_accounts", // This doesn't prompt, unlike eth_requestAccounts
          });

          if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0];

            // Update wallet state
            state.wallet.isConnected = true;
            state.wallet.provider = window.ethereum;
            state.wallet.type = "metamask";

            // If user is already authenticated but wallet address is missing, update it
            if (
              state.isAuthenticated &&
              state.user &&
              !state.user.walletAddress
            ) {
              const updatedUser = { ...state.user, walletAddress };
              this.login(updatedUser);
            }

            console.log(
              "MetaMask wallet detected on page load:",
              walletAddress
            );
            return;
          }
        } catch (error) {
          console.error("Error getting MetaMask accounts:", error);
        }
      }
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
