import api from './api';

export const checkApiConnection = async () => {
  try {
    // Use a simple endpoint that doesn't require authentication
    console.log("Attempting to connect to API...");
    const response = await api.get('/products', { 
      params: { page: 0, size: 1 },
      timeout: 5000 // 5 seconds timeout for health check
    });
    
    console.log('API connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    
    // If we got a response with any status code, the server is at least running
    if (error.response) {
      // Even with 403 Forbidden, the API is actually working - just needs auth
      if (error.response.status === 403) {
        console.log('API requires authentication, but connection is working');
        return true;
      }
      return error.response.status < 500;
    }
    
    return false;
  }
}; 