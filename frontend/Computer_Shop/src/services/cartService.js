import api from './api';

export const getCart = async (userId) => {
  try {
    const response = await api.get(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const response = await api.post(`/cart/${userId}/items`, { productId, quantity });
    return response.data;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (userId, productId, newQuantity) => {
  try {
    const response = await api.put(`/cart/${userId}/items/${productId}`, { quantity: newQuantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const response = await api.delete(`/cart/${userId}/items/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const response = await api.delete(`/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export const applyDiscount = async (userId, discountCode) => {
  try {
    const response = await api.post(`/cart/${userId}/discount`, { code: discountCode });
    return response.data;
  } catch (error) {
    console.error('Error applying discount:', error);
    throw error;
  }
};

export const getCartSummary = async (userId) => {
  try {
    const response = await api.get(`/cart/${userId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cart summary:', error);
    throw error;
  }
};

export const syncLocalCart = async (userId, localCartItems) => {
  try {
    const response = await api.post(`/cart/${userId}/sync`, { items: localCartItems });
    return response.data;
  } catch (error) {
    console.error('Error syncing local cart:', error);
    throw error;
  }
};

export default {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  applyDiscount,
  getCartSummary,
  syncLocalCart
};