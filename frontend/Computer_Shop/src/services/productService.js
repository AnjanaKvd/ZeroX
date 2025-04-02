import api from './api';

export const getProducts = async (params = {}) => {
  try {
    // Build query string from params
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page - 1); // API is zero-based
    if (params.size !== undefined) queryParams.append('size', params.size);
    
    // Sorting
    if (params.sortBy) {
      const direction = params.sortDirection || 'asc';
      queryParams.append('sortBy', params.sortBy);
      queryParams.append('sortDirection', direction);
    }
    
    // Filters
    if (params.query) queryParams.append('query', params.query);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.brand) queryParams.append('brand', params.brand);
    
    const queryString = queryParams.toString();
    const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error) {
    console.error('Product service error:', error);
    throw error;
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

export const getProductBySku = async (sku) => {
  try {
    const response = await api.get(`/products/sku/${sku}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with SKU ${sku}:`, error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch('/categories');
    
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
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const updateStock = async (stockUpdateData) => {
  try {
    const response = await api.post('/products/stock', stockUpdateData);
    return response.data;
  } catch (error) {
    console.error('Error updating stock:', error);
    throw error;
  }
};

export const getInventoryLogs = async (productId, params = {}) => {
  try {
    const response = await api.get(`/products/${productId}/inventory-logs`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory logs:', error);
    throw error;
  }
}; 