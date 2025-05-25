// Environment configuration for the application

// API configuration
export const API_CONFIG = {
  // Base API URL - change this based on environment
  BASE_URL: import.meta.env.PROD
    ? "https://api.u-mint.com" // Production API URL
    : "http://localhost:8080", // Development API URL - updated to correct port
};

// Feature flags
export const FEATURES = {
  ENABLE_WALLET_CONNECT: true,
};

// Export all configurations
export default {
  API: API_CONFIG,
  FEATURES,
};
