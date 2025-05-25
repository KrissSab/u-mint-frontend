/**
 * CORS Configuration
 *
 * This file contains configuration for handling Cross-Origin Resource Sharing (CORS)
 * between the frontend and backend services.
 */

// Default headers to include in API requests
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// CORS options for fetch API
export const CORS_OPTIONS = {
  // Include credentials (cookies, authorization headers) in requests
  credentials: "include" as RequestCredentials,

  // Headers to include in every request
  headers: DEFAULT_HEADERS,

  // Set mode to cors explicitly
  mode: "cors" as RequestMode,
};

/**
 * Creates fetch options with CORS configuration
 * @param method HTTP method
 * @param body Request body (for POST, PUT, PATCH)
 * @returns Fetch options with CORS configuration
 */
export const createFetchOptions = (
  method: string = "GET",
  body?: any
): RequestInit => {
  const options: RequestInit = {
    method,
    ...CORS_OPTIONS,
  };

  if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  return options;
};

export default {
  DEFAULT_HEADERS,
  CORS_OPTIONS,
  createFetchOptions,
};
