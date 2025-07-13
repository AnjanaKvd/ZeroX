import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

// Create axios instance with correct base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10-second timeout
});

// Add request interceptor to include token in all requests
api.interceptors.request.use(
  (config) => {
    // Skip token check for auth routes
    const isAuthRoute = ['/auth/login', '/auth/register', '/auth/refresh'].some(route => 
      config.url.includes(route)
    );
    
    if (!isAuthRoute) {
      const token = localStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Added Authorization header to request: ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn(`[API] No auth token found for request: ${config.method?.toUpperCase()} ${config.url}`);
        // Don't throw here, let the server handle unauthorized requests
      }
    }
    
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response ${response.status} from: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    const { config, response } = error;
    const errorMessage = error.message || 'Unknown error';
    const status = response?.status;
    
    console.error(`[API] Request failed: ${config?.method?.toUpperCase()} ${config?.url}`, {
      status,
      message: errorMessage,
      response: response?.data,
      headers: config?.headers
    });
    
    // Handle specific status codes
    if (status === 401) {
      console.warn('[API] Unauthorized - Redirecting to login');
      // You might want to redirect to login or refresh token here
    }
    
    const formattedError = handleApiError(error);
    return Promise.reject(formattedError);
  }
);

export default api;
