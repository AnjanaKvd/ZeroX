import api from './api';

export const createOrder = async (orderData) => {
  try {
    console.log('Sending order data to API with coupon:', orderData);
    
    const orderPayload = {
      ...orderData,
      couponCode: orderData.couponCode || ""
    };
    
    const response = await api.post('/orders', orderPayload);
    console.log('Order API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    console.log(`Fetching order details for ID: ${orderId}`);
    const response = await api.get(`/orders/${orderId}`);
    console.log('Order API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
    }
    throw error;
  }
};

export const getUserOrders = async (userId, params = {}) => {
  try {
    const response = await api.get(`/orders/user/${userId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

export const getAllOrders = async (params = {}) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(`Updating order ${orderId} status to ${status}`);
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

export const cancelOrder = async (orderId) => {
  try {
    await api.delete(`/orders/${orderId}`);
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
}; 