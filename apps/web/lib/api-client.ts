import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

// Exponential backoff configuration
const RETRY_DELAYS = [1000, 2000, 4000, 8000]; // milliseconds
const MAX_RETRIES = 3;

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // TODO: Add auth token from storage/context
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('auth_token') 
      : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Handle 429 (Rate Limit) errors with exponential backoff
    if (error.response?.status === 429 && originalRequest) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < MAX_RETRIES) {
        originalRequest._retryCount++;

        // Get retry delay from response header or use exponential backoff
        const retryAfter = error.response.headers['retry-after'];
        const delay = retryAfter
          ? parseInt(retryAfter) * 1000
          : RETRY_DELAYS[originalRequest._retryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];

        console.warn(`Rate limited. Retrying after ${delay}ms (attempt ${originalRequest._retryCount}/${MAX_RETRIES})`);

        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      // TODO: Handle token refresh or redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }

    // Extract error message
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Type-safe API call wrapper
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> {
  try {
    let response;
    if (method === 'get' || method === 'delete') {
      // For GET and DELETE, pass config as second parameter
      response = await apiClient[method]<T>(url, config);
    } else {
      // For POST and PUT, pass data and config
      response = await apiClient[method]<T>(url, data, config);
    }
    return response.data;
  } catch (error) {
    console.error(`API Error [${method.toUpperCase()} ${url}]:`, error);
    throw error;
  }
}