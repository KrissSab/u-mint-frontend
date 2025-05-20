<template>
  <div class="profile-nav right-align">
    <AuthenticationModal
      :show="isModalOpen"
      @close="closeAuthenticationModalWindow"
      @authenticated="handleAuthentication"
    />

    <!-- Not signed in UI -->
    <template v-if="!isAuthenticated">
      <!-- Profile icon -->
      <TheButton
        variant="profile"
        size="sm"
        @click="showAuthenticationModalWindow"
      >
        <svg
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 -960 960 960"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Account Circle</title>
          <path
            d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"
          ></path>
        </svg>
      </TheButton>

      <!-- Cart icon -->
      <TheButton variant="profile" size="sm">
        <svg
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 -960 960 960"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          class="mr-[-0.5px]"
          title="Cart"
        >
          <title>Shopping Cart</title>
          <path
            d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"
          ></path>
        </svg>
      </TheButton>

      <!-- Login button -->
      <TheButton
        variant="profile"
        size="sm"
        @click="showAuthenticationModalWindow"
      >
        <svg
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 -960 960 960"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          title="Wallet"
        >
          <title>Wallet</title>
          <path
            d="M240-160q-66 0-113-47T80-320v-320q0-66 47-113t113-47h480q66 0 113 47t47 113v320q0 66-47 113t-113 47H240Zm0-480h480q22 0 42 5t38 16v-21q0-33-23.5-56.5T720-720H240q-33 0-56.5 23.5T160-640v21q18-11 38-16t42-5Zm-74 130 445 108q9 2 18 0t17-8l139-116q-11-15-28-24.5t-37-9.5H240q-26 0-45.5 13.5T166-510Z"
          ></path>
        </svg>
        Login
      </TheButton>
    </template>

    <!-- Signed in UI -->
    <template v-else>
      <!-- Profile icon with link -->
      <router-link to="/profile" custom v-slot="{ navigate }">
        <TheButton variant="profile" size="sm" @click="navigate">
          <svg
            fill="currentColor"
            height="24"
            role="img"
            viewBox="0 -960 960 960"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Account Circle</title>
            <path
              d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"
            ></path>
          </svg>
        </TheButton>
      </router-link>

      <!-- Cart icon -->
      <TheButton variant="profile" size="sm">
        <svg
          fill="currentColor"
          height="24"
          role="img"
          viewBox="0 -960 960 960"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
          class="mr-[-0.5px]"
          title="Cart"
        >
          <title>Shopping Cart</title>
          <path
            d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"
          ></path>
        </svg>
      </TheButton>

      <!-- Logout button -->
      <div class="user-info">
        <TheButton variant="profile" size="sm" @click="handleLogout">
          Logout
        </TheButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import TheButton from "../shared/TheButton.vue";
import AuthenticationModal from "../auth/AuthenticationModal.vue";
import userStore from "../../store/userStore";
import { useRouter } from "vue-router";

// Define the User interface
interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
}

const router = useRouter();
const isModalOpen = ref(false);
const isAuthenticated = computed(() => userStore.state.isAuthenticated);
const userName = computed(() => userStore.state.user?.name || "");

const showAuthenticationModalWindow = () => {
  isModalOpen.value = true;
};

const closeAuthenticationModalWindow = () => {
  isModalOpen.value = false;
};

const handleAuthentication = (userData: User) => {
  userStore.login(userData);
  closeAuthenticationModalWindow();
};

const handleLogout = () => {
  userStore.logout();

  // If on profile page, redirect to home
  if (router.currentRoute.value.path === "/profile") {
    router.push("/");
  }
};
</script>

<style>
.profile-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.right-align {
  justify-content: end;
}

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  color: white;
  font-size: 0.9rem;
  margin-right: 0.5rem;
}
</style>
