<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div class="header-controls">
          <button
            @click="goBack"
            class="back-button"
            :class="{ 'show-back-button': !codeSent }"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 6L8 12L14 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <line
                x1="20"
                y1="12"
                x2="8"
                y2="12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <p @click="close" class="close-modal">✖</p>
        </div>
        <img src="/u-mint-logo-no-bg.png" alt="u-mint-logo" class="logo" />
        <span>Connect to U-Mint</span>
      </div>
      <div class="modal-body">
        <div v-if="!codeSent">
          <div class="wallets">
            <div class="wallet" @click="connectWallet('phantom')">
              <img src="/phantom.svg" alt="" class="wallet-logo" />
              <p>Phantom</p>
            </div>
            <div class="wallet" @click="connectWallet('metamask')">
              <img src="/metamask-fox.svg" alt="" class="wallet-logo" />
              <p>Meta Mask</p>
            </div>
            <div class="wallet" @click="connectWallet('coinbase')">
              <img src="/coinbase.webp" alt="" class="wallet-logo" />
              <p>Coinbase Wallet</p>
            </div>
          </div>
          <div class="separator">
            <div class="line"></div>
            <p>OR</p>
            <div class="line"></div>
          </div>
          <div class="email-container">
            <input
              v-model="email"
              placeholder="Continue with email"
              class="email-input"
            />
            <button
              class="email-submit"
              :class="{ 'has-content': email.length > 0 }"
              @click="handleEmailSubmit"
              :disabled="isLoading"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <svg
                v-else
                fill="currentColor"
                height="24"
                role="img"
                viewBox="0 -960 960 960"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Arrow Right</title>
                <path
                  d="m560-240-56-58 142-142H160v-80h486L504-662l56-58 240 240-240 240Z"
                ></path>
              </svg>
            </button>
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <p class="email-info">
            If you haven't logged in using your email before, you will create a
            new wallet using this email.
          </p>
        </div>

        <div v-else class="verification-container">
          <p class="verification-title">Verification Code</p>
          <p class="verification-subtitle">
            Enter the 4-digit code sent to {{ email }}
          </p>

          <div class="code-inputs">
            <input
              v-for="(digit, index) in 4"
              :key="index"
              type="text"
              maxlength="1"
              v-model="verificationCode[index]"
              @input="handleCodeInput(index)"
              @keydown="handleKeyDown($event, index)"
              class="code-digit"
              :ref="
                (el) => {
                  if (el) codeInputRefs[index] = el;
                }
              "
            />
          </div>

          <button
            class="verify-button"
            :disabled="!isCodeComplete || isLoading"
            @click="verifyCode"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Verify</span>
          </button>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <p class="resend-code">
            Didn't receive the code?
            <span @click="resendCode" class="resend-link">Resend</span>
          </p>
        </div>

        <div v-if="showCompleteRegistration" class="complete-registration">
          <p class="verification-title">Complete Registration</p>
          <p class="verification-subtitle">
            Set up your account details to complete registration
          </p>

          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="Choose a username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Create a strong password"
            />
          </div>

          <button
            class="complete-button"
            :disabled="!canCompleteRegistration || isLoading"
            @click="completeRegistration"
          >
            <span v-if="isLoading" class="loading-spinner"></span>
            <span v-else>Complete Registration</span>
          </button>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import userStore from "../../store/userStore";

const email = ref("");
const codeSent = ref(false);
const verificationCode = ref(["", "", "", ""]);
const codeInputRefs = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const showCompleteRegistration = ref(false);
const username = ref("");
const password = ref("");

const isCodeComplete = computed(() => {
  return verificationCode.value.every((digit) => digit.length === 1);
});

const canCompleteRegistration = computed(() => {
  return username.value.length > 0 && password.value.length >= 8;
});

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "authenticated"]);

const close = () => {
  // Reset state when closing modal
  codeSent.value = false;
  showCompleteRegistration.value = false;
  email.value = "";
  verificationCode.value = ["", "", "", ""];
  username.value = "";
  password.value = "";
  errorMessage.value = "";
  emit("close");
};

const goBack = () => {
  if (showCompleteRegistration.value) {
    // Go back to verification screen
    showCompleteRegistration.value = false;
  } else {
    // Return to email input screen
    codeSent.value = false;
  }
  errorMessage.value = "";
};

const handleEmailSubmit = async () => {
  if (email.value.length > 0 && email.value.includes("@")) {
    try {
      isLoading.value = true;
      errorMessage.value = "";

      console.log(
        `Connecting to API at ${import.meta.env.PROD ? "production" : "development"} environment`
      );

      // Call API to start registration process
      await userStore.startRegistration(email.value);

      // Show verification code input
      codeSent.value = true;
    } catch (error) {
      errorMessage.value = error.message || "Failed to send verification code";
    } finally {
      isLoading.value = false;
    }
  } else {
    errorMessage.value = "Please enter a valid email address";
  }
};

const handleCodeInput = (index) => {
  // Ensure only digits are entered
  verificationCode.value[index] = verificationCode.value[index].replace(
    /[^0-9]/g,
    ""
  );

  // Auto-focus next input
  if (verificationCode.value[index] && index < 3) {
    codeInputRefs.value[index + 1].focus();
  }
};

const handleKeyDown = (event, index) => {
  // Handle backspace to move to previous input
  if (
    event.key === "Backspace" &&
    !verificationCode.value[index] &&
    index > 0
  ) {
    codeInputRefs.value[index - 1].focus();
  }
};

const verifyCode = async () => {
  const code = verificationCode.value.join("");
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Call API to verify the code
    await userStore.verifyEmail(code);

    // Show complete registration form
    showCompleteRegistration.value = true;
    codeSent.value = false;
  } catch (error) {
    errorMessage.value = error.message || "Invalid verification code";
  } finally {
    isLoading.value = false;
  }
};

const completeRegistration = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Call API to complete registration
    await userStore.completeRegistration(username.value, password.value);

    // Emit authenticated event
    emit("authenticated", userStore.state.user);

    // Close modal
    close();
  } catch (error) {
    errorMessage.value = error.message || "Failed to complete registration";
  } finally {
    isLoading.value = false;
  }
};

const resendCode = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    // Call API to resend verification code
    await userStore.resendVerificationCode();

    // Reset verification code inputs
    verificationCode.value = ["", "", "", ""];
  } catch (error) {
    errorMessage.value = error.message || "Failed to resend verification code";
  } finally {
    isLoading.value = false;
  }
};

const connectWallet = async (type) => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    let walletAddress;

    if (type === "phantom") {
      walletAddress = await userStore.connectPhantomWallet();
      console.log(`Connected to ${type} wallet: ${walletAddress}`);
    } else if (type === "metamask") {
      walletAddress = await userStore.connectMetaMaskWallet();
      console.log(`Connected to ${type} wallet: ${walletAddress}`);
    } else {
      // Implement other wallet connections
      console.log(`${type} wallet connection not implemented yet`);
      errorMessage.value = `${type} wallet integration coming soon`;
      isLoading.value = false;
      return;
    }

    // Emit authenticated event with user data
    if (userStore.state.isAuthenticated && userStore.state.user) {
      // If user has no email, suggest they add one in profile settings
      if (!userStore.state.user.email) {
        console.log("User authenticated with wallet but has no email address");
      }

      emit("authenticated", userStore.state.user);

      // Close modal if successful
      close();
    } else {
      errorMessage.value = "Authentication failed. Please try again.";
    }
  } catch (error) {
    errorMessage.value = error.message || `Failed to connect ${type} wallet`;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 1rem;
  width: 400px;
  min-height: fit-content;
  color: var(--text-color);
}

.modal-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  width: 100%;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
}

.modal-header > span {
  padding-block: 1rem;
  font-weight: 550;
  font-size: x-large;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  padding: 0;
  display: flex;
  align-items: center;
}

.back-button:hover {
  color: var(--secondary-color);
}

.close-modal {
  cursor: pointer;
  font-weight: 300;
}

.logo {
  max-width: 6rem;
  max-height: 6rem;
}

.wallets {
  display: flex;
  flex-direction: column;
  box-shadow: 0 6px 15px rgba(102, 51, 153, 0.3);
  border-radius: 1rem;
}

.wallets > div {
  border: solid 0.5px gainsboro;
}
.wallets > div:first-child {
  border-radius: 1rem 1rem 0 0;
}
.wallets > div:last-child {
  border-radius: 0 0 1rem 1rem;
}

.wallet {
  display: flex;
  justify-content: start;
  align-items: center;
  padding: 0.5rem;
  gap: 1rem;
}

.wallet:hover {
  cursor: pointer;
  background-color: rgb(244, 244, 244);
}

.wallet-logo {
  height: 40px;
  width: 40px;
}

.separator {
  display: flex;
  align-items: center;
  padding-block: 1rem;
  gap: 0.5rem;
}

.line {
  height: 1px;
  width: 100%;
  border: 1px solid rgb(226, 226, 226);
}

.email-container {
  position: relative;
  display: flex;
}

.email-input {
  height: 3.5rem;
  width: 100%;
  border: none;
  border-radius: 1rem;
  background-color: transparent;
  box-shadow: 0 6px 15px rgba(102, 51, 153, 0.3);
  padding-inline: 1rem;
}

.email-submit {
  display: flex;
  position: absolute;
  color: white;
  align-self: center;
  border: none;
  border-radius: 4px;
  background-color: var(--accent-color);
  margin-right: 1rem;
  align-items: center;
  size: 2rem;
  right: 0;
}

.email-submit.has-content {
  background-color: var(--secondary-color);
}

.email-submit:hover:not(:disabled) {
  background-color: var(--secondary-light);
}

.email-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.email-info {
  padding-block: 1.5rem;
  font-size: 12px;
}

.modal-body {
  display: flex;
  flex-direction: column;
}

/* Verification code styles */
.verification-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  width: 100%;
}

.verification-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.verification-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
}

.code-inputs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.code-digit {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(102, 51, 153, 0.1);
}

.code-digit:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.verify-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--secondary-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
}

.verify-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.resend-code {
  font-size: 0.85rem;
  color: #666;
}

.resend-link {
  color: var(--secondary-color);
  cursor: pointer;
  text-decoration: underline;
}

.show-back-button {
  opacity: 0;
}

/* Complete registration form styles */
.complete-registration {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0;
  width: 100%;
}

.form-group {
  width: 100%;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  font-size: 1rem;
  box-shadow: 0 2px 5px rgba(102, 51, 153, 0.1);
}

.form-input:focus {
  border-color: var(--secondary-color);
  outline: none;
}

.complete-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: var(--secondary-color);
  color: white;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
}

.complete-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  text-align: center;
}

.loading-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
