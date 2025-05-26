import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import userStore from "./store/userStore";

// Initialize user store and then mount the app
async function initApp() {
  try {
    // Wait for user store initialization
    await userStore.init();
    console.log("User store initialized");

    // Create and mount the app
    const app = createApp(App);
    app.use(router);
    app.mount("#app");
  } catch (error) {
    console.error("Failed to initialize application:", error);

    // Mount app anyway in case of initialization error
    const app = createApp(App);
    app.use(router);
    app.mount("#app");
  }
}

// Start the application
initApp();
