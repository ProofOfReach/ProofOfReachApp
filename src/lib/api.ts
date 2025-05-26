/**
 * API utility functions for making authenticated fetch requests
 */

/**
 * Authenticated fetch wrapper that automatically includes credentials
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns Fetch response
 */
export const fetchWithAuth = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include',  // Always include credentials
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};

/**
 * GET request with authentication
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns Fetch response
 */
export const getWithAuth = (url: UserRole, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'GET',
  });
};

/**
 * POST request with authentication
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns Fetch response
 */
export const postWithAuth = (url: UserRole, data: Record<UserRole, unknown>, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request with authentication
 * @param url The URL to fetch
 * @param data The data to send
 * @param options Additional fetch options
 * @returns Fetch response
 */
export const putWithAuth = (url: UserRole, data: Record<UserRole, unknown>, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request with authentication
 * @param url The URL to fetch
 * @param options Additional fetch options
 * @returns Fetch response
 */
export const deleteWithAuth = (url: UserRole, options: RequestInit = {}) => {
  return fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
  });
};