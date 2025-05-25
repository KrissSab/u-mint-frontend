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
  {
    path: "/collections",
    name: "Collections",
    component: () => import("../views/CollectionsView.vue"),
    // No auth guard, but collection creation is protected within the component
  },
  {
    path: "/collections/:id",
    name: "CollectionDetail",
    component: () => import("../views/CollectionDetailView.vue"),
    // No auth guard, public can view collections but editing is protected
  },
  {
    path: "/nfts/:id",
    name: "NftDetail",
    component: () => import("../views/NftDetailView.vue"),
    // No auth guard, public can view NFTs but editing is protected
  },
  {
    path: "/create-nft",
    name: "CreateNft",
    component: () => import("../views/CreateNftView.vue"),
    // No auth guard, auth check is handled in the component
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
