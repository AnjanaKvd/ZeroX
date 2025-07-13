import api from './api';

/**
 * Get the current user's wishlist
 * @returns {Promise<Array>} Array of wishlist items
 */
export const getWishlist = async () => {
  try {
    const response = await api.get('/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

/**
 * Add a product to the wishlist
 * @param {string} productId - The ID of the product to add
 * @returns {Promise<Object>} The added wishlist item
 */
export const addToWishlist = async (productId) => {
  try {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

/**
 * Remove a product from the wishlist
 * @param {string} productId - The ID of the product to remove
 * @returns {Promise<Object>} The response data
 */
export const removeFromWishlist = async (productId) => {
  try {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

/**
 * Check if a product is in the wishlist
 * @param {string} productId - The ID of the product to check
 * @returns {Promise<boolean>} True if the product is in the wishlist, false otherwise
 */
export const checkInWishlist = async (productId) => {
  try {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error checking wishlist status:', error);
    throw error;
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist
};
