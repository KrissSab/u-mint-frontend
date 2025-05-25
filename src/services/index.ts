// Import and re-export all API services
import { api, authApi } from "./api";
import collectionsApi from "./collections";
import nftsApi from "./nfts";
import salesApi from "./sales";

// Export all services
export { api, authApi, collectionsApi, nftsApi, salesApi };

// Export default object with all services
export default {
  api,
  auth: authApi,
  collections: collectionsApi,
  nfts: nftsApi,
  sales: salesApi,
};
