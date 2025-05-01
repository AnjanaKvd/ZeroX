import api from './api';

/**
 * Gets all addresses for a user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of user addresses
 */
export const getUserAddresses = async (userId) => {
  const response = await api.get(`/addresses/user/${userId}`);
  return response.data;
};

/**
 * Gets a specific address
 * @param {string} addressId - The address ID
 * @returns {Promise<Object>} The address data
 */
export const getAddressById = async (addressId) => {
  const response = await api.get(`/addresses/${addressId}`);
  return response.data;
};

/**
 * Creates a new address for a user
 * @param {string} userId - The user ID
 * @param {Object} addressData - The address data to create
 * @returns {Promise<Object>} The created address
 */
export const createAddress = async (userId, addressData) => {
  const response = await api.post(`/addresses/user/${userId}`, addressData);
  return response.data;
};

/**
 * Updates an existing address
 * @param {string} addressId - The address ID
 * @param {Object} addressData - The updated address data
 * @returns {Promise<Object>} The updated address
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/addresses/${addressId}`, addressData);
  return response.data;
};

/**
 * Deletes an address
 * @param {string} addressId - The address ID to delete
 * @returns {Promise<void>}
 */
export const deleteAddress = async (addressId) => {
  await api.delete(`/addresses/${addressId}`);
};

/**
 * Sets an address as the default for a user
 * @param {string} userId - The user ID
 * @param {string} addressId - The address ID to set as default
 * @returns {Promise<Object>} The updated address
 */
export const setDefaultAddress = async (userId, addressId) => {
  const response = await api.put(`/addresses/user/${userId}/default`, { addressId });
  return response.data;
}; 