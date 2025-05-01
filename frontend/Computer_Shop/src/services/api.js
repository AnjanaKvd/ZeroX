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
    const token = localStorage.getItem('token');
    
    // Debug token in request
    console.log(`API Request to ${config.url}: Authorization token present: ${!!token}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    console.error('API request failed:', error.config?.url, error);
    const formattedError = handleApiError(error);
    return Promise.reject(formattedError);
  }
);

export default api;
