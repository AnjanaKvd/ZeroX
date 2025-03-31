import api from './api';

export const getProducts = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.sort) queryParams.append('sort', params.sort);
    
    // Add any filters if needed
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.query) queryParams.append('query', params.query);
    
    const queryString = queryParams.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Product service error:', error);
    // Return an object that matches expected structure
    return { 
      content: [], 
      totalElements: 0,
      totalPages: 0,
      pageable: {
        pageNumber: 0,
        pageSize: 12
      }
    };
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Category service error:', error);
    return [];
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
    const response = await api.put(`/products/${productId}`, formData, {
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