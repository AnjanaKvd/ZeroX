import api from './api';

// Get all coupons with pagination
export const getCoupons = async (page = 0, size = 20, sortBy = "code", sortDir = "asc") => {
  try {
    const response = await api.get('/coupons', {
      params: { page, size, sortBy, sortDir }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching coupons:', error);
    throw error;
  }
};

// Get coupon by ID
export const getCouponById = async (couponId) => {
  try {
    const response = await api.get(`/coupons/${couponId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon with ID ${couponId}:`, error);
    throw error;
  }
};

// Get coupon by code
export const getCouponByCode = async (code) => {
  try {
    const response = await api.get(`/coupons/code/${code}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon with code ${code}:`, error);
    throw error;
  }
};

// Get active coupons
export const getActiveCoupons = async (page = 0, size = 20) => {
  try {
    const response = await api.get('/coupons/active', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    throw error;
  }
};

// Get valid coupons
export const getValidCoupons = async (page = 0, size = 20) => {
  try {
    const response = await api.get('/coupons/valid', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching valid coupons:', error);
    throw error;
  }
};

// Search coupons
export const searchCoupons = async (params) => {
  try {
    const response = await api.get('/coupons/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching coupons:', error);
    throw error;
  }
};

// Create coupon (admin only)
export const createCoupon = async (couponData) => {
  try {
    const response = await api.post('/coupons', couponData);
    return response.data;
  } catch (error) {
    console.error('Error creating coupon:', error);
    throw error;
  }
};

// Update coupon (admin only)
export const updateCoupon = async (couponId, couponData) => {
  try {
    const response = await api.put(`/coupons/${couponId}`, couponData);
    return response.data;
  } catch (error) {
    console.error(`Error updating coupon ${couponId}:`, error);
    throw error;
  }
};

// Delete coupon (admin only)
export const deleteCoupon = async (couponId) => {
  try {
    await api.delete(`/coupons/${couponId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting coupon ${couponId}:`, error);
    throw error;
  }
};

// Validate coupon
export const validateCoupon = async (code, orderAmount, userId) => {
  try {
    // Log the request data to verify userId is being included
    console.log('Validating coupon with data:', { code, orderAmount, userId });
    
    // Make sure we have a valid userId
    if (!userId) {
      console.warn('No userId provided for coupon validation');
    }
    
    // Create the request body with all required fields
    const requestData = {
      code: code,
      orderAmount: orderAmount,
      userId: userId
    };
    
    // Send the request to the API
    const response = await api.post('/coupons/validate', requestData);
    
    // Log the response for debugging
    console.log('Coupon validation response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// Get coupon usages (admin only)
export const getCouponUsages = async (couponId, page = 0, size = 20) => {
  try {
    const response = await api.get(`/coupons/${couponId}/usages`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching usages for coupon ${couponId}:`, error);
    throw error;
  }
};

// Get user coupon usages
export const getUserCouponUsages = async (userId, page = 0, size = 20) => {
  try {
    const response = await api.get(`/coupons/usages/user/${userId}`, {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching coupon usages for user ${userId}:`, error);
    throw error;
  }
}; 