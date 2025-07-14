import api from './api';

export const checkApiConnection = async () => {
  try {
    // Use a simple endpoint that doesn't require authentication
    const response = await api.get('/products', { 
      params: { page: 0, size: 1 },
      timeout: 5000 // 5 seconds timeout for health check
    });
    return true;
  } catch (error) {
    
    // If we got a response with any status code, the server is at least running
    if (error.response) {
      // Even with 403 Forbidden, the API is actually working - just needs auth
      if (error.response.status === 403) {
        return true;
      }
      return error.response.status < 500;
    }
    
    return false;
  }
}; 