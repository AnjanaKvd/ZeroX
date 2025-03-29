import api from './api';

export const getProducts = async (params = {}) => {
  try {
    console.log('Fetching products with params:', params);
    const response = await api.get('/products', { params });
    console.log('Products response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw {
      message: error.message || 'Failed to fetch products',
      type: error.type || 'unknown',
      status: error.response?.status
    };
  }
};

export const getProductById = async (productId) => {
  try {
    console.log(`Fetching product with ID: ${productId}`);
    const response = await api.get(`/products/${productId}`);
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
    const response = await api.get('/categories');
    console.log('Categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw {
      message: error.message || 'Failed to fetch categories',
      type: error.type || 'unknown',
      status: error.response?.status
    };
  }
};

export const getProductReviews = async (productId, params = {}) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await api.delete(`/products/${productId}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(productData)) {
      formData.append(key, value);
    }
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();
    for (const [key, value] of Object.entries(productData)) {
      formData.append(key, value);
    }
    const response = await api.put(`/api/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}; 