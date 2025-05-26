import { API_CONFIG } from "../config/env";
import { createFetchOptions, DEFAULT_HEADERS } from "../config/cors";

// Base API configuration
const API_URL = API_CONFIG.BASE_URL;

// Types for API responses
interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}

// Generic error handling for API requests
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Error ${response.status}: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data as T;
};

// Wrapper for fetch that handles CORS errors
const fetchWithCorsHandling = async (
  url: string,
  options: RequestInit
): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (error: any) {
    // Check if it's likely a CORS error
    if (
      error.message.includes("NetworkError") ||
      error.message.includes("Failed to fetch")
    ) {
      console.error("CORS error detected:", error);
      throw new Error(
        `CORS error: Unable to connect to ${url}. Make sure the API server is running and has CORS enabled.`
      );
    }
    throw error;
  }
};

// API endpoints for user authentication
export const authApi = {
  // Create a new user directly (used for wallet-based registration)
  create: async (userData: {
    username: string;
    email?: string;
    password: string;
    wallet?: { type: string; address: string };
  }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users`,
      createFetchOptions("POST", userData)
    );
    return handleResponse(response);
  },

  // Login with email and password
  login: async (loginData: { email: string; password: string }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/login`,
      createFetchOptions("POST", loginData)
    );
    return handleResponse(response);
  },

  // Login with wallet
  loginWithWallet: async (walletData: { type: string; address: string }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/login/wallet`,
      createFetchOptions("POST", {
        ...walletData,
      })
    );
    return handleResponse(response);
  },

  // Register a new user (initiate registration process)
  register: async (userData: {
    username: string;
    email?: string;
    password: string;
    wallet?: { type: string; address: string };
  }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/register`,
      createFetchOptions("POST", userData)
    );
    return handleResponse(response);
  },

  // Verify email with code
  verifyEmail: async (verificationData: { email: string; code: string }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/verify-email`,
      createFetchOptions("POST", verificationData)
    );
    return handleResponse(response);
  },

  // Complete registration after email verification
  completeRegistration: async (userData: {
    username: string;
    email?: string;
    password: string;
    wallet?: { type: string; address: string };
  }) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/complete-registration`,
      createFetchOptions("POST", userData)
    );
    return handleResponse(response);
  },

  // Resend verification code
  resendVerificationCode: async (email: string) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}/users/resend-verification`,
      createFetchOptions("POST", { email })
    );
    return handleResponse(response);
  },
};

// Create a general API utility for other endpoints
export const api = {
  get: async <T>(endpoint: string) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}${endpoint}`,
      createFetchOptions("GET")
    );
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data: any) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}${endpoint}`,
      createFetchOptions("POST", data)
    );
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data: any) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}${endpoint}`,
      createFetchOptions("PUT", data)
    );
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, data: any) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}${endpoint}`,
      createFetchOptions("PATCH", data)
    );
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string) => {
    const response = await fetchWithCorsHandling(
      `${API_URL}${endpoint}`,
      createFetchOptions("DELETE")
    );
    return handleResponse<T>(response);
  },
};

export default {
  auth: authApi,
  api,
};
