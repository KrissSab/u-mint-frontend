<template>
  <div class="profile-settings">
    <h2>Profile Settings</h2>

    <div class="settings-section">
      <h3>Account Information</h3>

      <div class="form-group">
        <label for="username">Username</label>
        <input
          type="text"
          id="username"
          v-model="username"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          v-model="email"
          class="form-input"
          :placeholder="emailPlaceholder"
        />
        <p v-if="!userHasEmail" class="help-text">
          Your account doesn't have an email address. Adding one will help with
          account recovery.
        </p>
      </div>

      <div class="form-actions">
        <button
          @click="saveChanges"
          class="save-button"
          :disabled="isSaving || !hasChanges"
        >
          <span v-if="isSaving">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import userStore from "../../store/userStore";
import { api } from "../../services/api";

// State
const username = ref("");
const email = ref("");
const originalUsername = ref("");
const originalEmail = ref("");
const isSaving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

// Computed properties
const userHasEmail = computed(() => {
  return !!originalEmail.value;
});

const emailPlaceholder = computed(() => {
  return userHasEmail.value ? "" : "Add an email address";
});

const hasChanges = computed(() => {
  return (
    username.value !== originalUsername.value ||
    (email.value !== originalEmail.value && email.value !== "")
  );
});

// Methods
const loadUserData = () => {
  if (userStore.state.user) {
    username.value =
      userStore.state.user.username || userStore.state.user.name || "";
    email.value = userStore.state.user.email || "";
    originalUsername.value = username.value;
    originalEmail.value = email.value;
  }
};

const saveChanges = async () => {
  try {
    errorMessage.value = "";
    successMessage.value = "";
    isSaving.value = true;

    // Validate email if provided
    if (email.value && !isValidEmail(email.value)) {
      errorMessage.value = "Please enter a valid email address";
      return;
    }

    // Prepare update data
    const updateData: { username?: string; email?: string } = {};

    if (username.value !== originalUsername.value) {
      updateData.username = username.value;
    }

    if (email.value !== originalEmail.value && email.value !== "") {
      updateData.email = email.value;
    }

    // Only make API call if there are changes
    if (Object.keys(updateData).length > 0) {
      // Call API to update user profile
      const response = await api.patch(
        `/users/${userStore.state.user?.id}`,
        updateData
      );

      // Update user state using the userStore login method
      if (userStore.state.user) {
        // Create updated user object
        const updatedUser = {
          ...userStore.state.user,
          username: updateData.username || userStore.state.user.username,
          name: updateData.username || userStore.state.user.name,
          email: updateData.email || userStore.state.user.email,
        };

        // Update the store
        userStore.login(updatedUser);

        // Update local component state
        originalUsername.value = username.value;
        originalEmail.value = email.value;
      }

      successMessage.value = "Profile updated successfully";
    }
  } catch (error: any) {
    errorMessage.value = error.message || "Failed to update profile";
  } finally {
    isSaving.value = false;
  }
};

const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Initialize
onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
.profile-settings {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
}

h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-color, #333);
  font-size: 1.5rem;
}

.settings-section {
  margin-bottom: 2rem;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--text-color, #333);
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
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
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--secondary-color, #6633cc);
  box-shadow: 0 0 0 2px rgba(102, 51, 153, 0.1);
}

.help-text {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.save-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--secondary-color, #6633cc);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background-color: var(--secondary-light, #7744dd);
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #ffeeee;
  color: #e74c3c;
  border-radius: 6px;
  font-size: 0.9rem;
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #eeffee;
  color: #2ecc71;
  border-radius: 6px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .profile-settings {
    padding: 1.5rem;
  }
}
</style>
