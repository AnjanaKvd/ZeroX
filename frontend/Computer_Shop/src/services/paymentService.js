import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Create a payment intent with the server
 * @param {Object} paymentData - Payment data including orderId and amount
 * @returns {Promise<Object>} - Returns the client secret and other payment details
 */
export const createPaymentIntent = async (paymentData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/payments/create-payment-intent`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error.response?.data?.message || 'Failed to create payment intent';
  }
};

/**
 * Confirm that a payment was successful
 * @param {string} paymentIntentId - The Stripe payment intent ID
 * @param {string} orderId - The order ID
 * @returns {Promise<Object>} - Returns the updated order details
 */
export const confirmPayment = async (paymentIntentId, orderId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/confirm`,
      { paymentIntentId, orderId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error.response?.data?.message || 'Failed to confirm payment';
  }
};

export default {
  createPaymentIntent,
  confirmPayment
};
