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
            <div class="wallet">
              <img src="/phantom.svg" alt="" class="wallet-logo" />
              <p>Phantom</p>
            </div>
            <div class="wallet">
              <img src="/metamask-fox.svg" alt="" class="wallet-logo" />
              <p>Meta Mask</p>
            </div>
            <div class="wallet">
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
            >
              <svg
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
            :disabled="!isCodeComplete"
            @click="verifyCode"
          >
            Verify
          </button>

          <p class="resend-code">
            Didn't receive the code?
            <span @click="resendCode" class="resend-link">Resend</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const email = ref("");
const codeSent = ref(false);
const verificationCode = ref(["", "", "", ""]);
const codeInputRefs = ref([]);

const isCodeComplete = computed(() => {
  return verificationCode.value.every((digit) => digit.length === 1);
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
  email.value = "";
  verificationCode.value = ["", "", "", ""];
  emit("close");
};

const goBack = () => {
  // Return to email input screen
  codeSent.value = false;
};

const handleEmailSubmit = () => {
  if (email.value.length > 0 && email.value.includes("@")) {
    // Here would be the API call to send verification code
    // For now, we'll just simulate it
    codeSent.value = true;
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

const verifyCode = () => {
  const code = verificationCode.value.join("");
  // Here would be the API call to verify the code
  console.log("Verifying code:", code);

  // For demo purposes, we'll simulate a successful authentication
  // In a real app, this would be an API call to verify the code
  const user = {
    email: email.value,
    id: Math.random().toString(36).substring(2, 15),
    name: email.value.split("@")[0],
  };

  // Emit authenticated event with user data
  emit("authenticated", user);

  // Close modal
  close();
};

const resendCode = () => {
  // Here would be the API call to resend the verification code
  console.log("Resending code to:", email.value);
  // For now, we'll just log it
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

.email-submit:hover {
  background-color: var(--secondary-light);
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
</style>
