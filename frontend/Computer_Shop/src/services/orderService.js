import api from './api';

export const createOrder = async (orderData) => {
  try {
    
    const orderPayload = {
      ...orderData,
      couponCode: orderData.couponCode || ""
    };
    
    const response = await api.post('/orders', orderPayload);
    return response.data;
  } catch (error) {
    if (error.response) {
    }
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
    }
    throw error;
  }
};

export const getUserOrders = async (userId, params = {}) => {
  try {
    const response = await api.get(`/orders/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    if (error.response) {
    }
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    await api.delete(`/orders/${orderId}`);
    return true;
  } catch (error) {
    throw error;
  }
}; 