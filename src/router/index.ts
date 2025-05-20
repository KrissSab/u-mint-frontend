import { createRouter, createWebHistory } from "vue-router";
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import Home from "../components/home/TheHome.vue";
import userStore from "../store/userStore";

// Create a navigation guard for protected routes
const requireAuth = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  if (userStore.state.isAuthenticated) {
    next(); // User is authenticated, proceed to route
  } else {
    next({ name: "Home" }); // Redirect to home if not authenticated
  }
};

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../components/profile/UserProfile.vue"),
    beforeEnter: requireAuth, // Apply the auth guard
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
