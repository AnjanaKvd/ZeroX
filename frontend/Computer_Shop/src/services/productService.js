import api from './api';

export const getProducts = async (params = {}) => {
  try {
    console.log('Fetching products with params:', params);
    const response = await api.get('/api/products', { params });
    console.log('Products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out. API server may be down or slow.');
    }
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    console.log(`Fetching product with ID: ${productId}`);
    const response = await api.get(`/api/products/${productId}`);
    console.log('Product details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    console.log('Fetching categories');
    const response = await api.get('/api/categories');
    console.log('Categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await api.get(`/api/reviews/product/${productId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
}; 