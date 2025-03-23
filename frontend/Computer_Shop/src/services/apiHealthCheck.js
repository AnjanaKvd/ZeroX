import api from './api';

export const checkApiConnection = async () => {
  try {
    // Use a simple endpoint that doesn't require authentication
    console.log("Attempting to connect to API...");
    const response = await api.get('/api/products', { 
      params: { page: 0, size: 1 },
      timeout: 5000 // 5 seconds timeout for health check
    });
    
    console.log('API connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('API connection failed:', error);
    
    // Detailed error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      // If we got a response with any status code, the server is at least running
      return error.response.status < 500;
    } else if (error.request) {
      console.error('No response received. This could be a CORS or network issue.');
      
      if (error.code === 'ECONNABORTED') {
        console.error('Request timed out. The server might be down or not responding quickly enough.');
      }
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    return false;
  }
}; 