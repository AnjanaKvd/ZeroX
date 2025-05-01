// src/services/discountService.js
import api from './api';

// GET all discounts (paginated)
export const getDiscounts = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/discounts', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching discounts:', error);
    throw error;
  }
};

// GET active discounts (paginated)
export const getActiveDiscounts = async (page = 0, size = 10) => {
  try {
    const response = await api.get('/discounts/active', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching active discounts:', error);
    throw error;
  }
};

export const getAllActiveDiscounts = async () => {
  try {
    const response = await api.get('/discounts/active/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all active discounts:', error);
    throw error;
  }
};

// GET discount by ID
export const getDiscountById = async (discountId) => {
  try {
    const response = await api.get(`/discounts/${discountId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching discount with ID ${discountId}:`, error);
    throw error;
  }
};

// GET discounts by product ID
export const getDiscountsByProductId = async (productId) => {
  try {
    const response = await api.get(`/discounts/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching discounts for product ${productId}:`, error);
    throw error;
  }
};

// GET active discount for a product
export const getActiveDiscountForProduct = async (productId) => {
  try {
    const response = await api.get(`/discounts/product/${productId}/active`);
    if(response){
      return response.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching active discount for product ${productId}:`, error);
    throw error;
  }
};

// CREATE a discount
export const createDiscount = async (discountData) => {
  try {
    const response = await api.post('/discounts', discountData);
    return response.data;
  } catch (error) {
    console.error('Error creating discount:', error);
    throw error;
  }
};

// UPDATE a discount
export const updateDiscount = async (discountId, discountData) => {
  try {
    const response = await api.put(`/discounts/${discountId}`, discountData);
    return response.data;
  } catch (error) {
    console.error(`Error updating discount ${discountId}:`, error);
    throw error;
  }
};

// DELETE a discount
export const deleteDiscount = async (discountId) => {
  try {
    await api.delete(`/discounts/${discountId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting discount ${discountId}:`, error);
    throw error;
  }
};