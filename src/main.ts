import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import userStore from "./store/userStore";

// Initialize user store
userStore.init();

const app = createApp(App);
app.use(router);
app.mount("#app");
