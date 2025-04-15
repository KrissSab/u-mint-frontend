import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/home/TheHome.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
