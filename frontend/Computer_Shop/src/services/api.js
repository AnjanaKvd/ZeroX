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
      } else {
        // Don't throw here, let the server handle unauthorized requests
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { config, response } = error;
    const errorMessage = error.message || 'Unknown error';
    const status = response?.status;
    
    
    // Handle specific status codes
    if (status === 401) {
      // You might want to redirect to login or refresh token here
    }
    
    const formattedError = handleApiError(error);
    return Promise.reject(formattedError);
  }
);

export default api;
