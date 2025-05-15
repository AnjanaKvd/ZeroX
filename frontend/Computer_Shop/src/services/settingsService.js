import api from './api';

// Get all settings (admin only)
export const getAllSettings = async () => {
  try {
    const response = await api.get('/admin/settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

// Get public settings
export const getPublicSettings = async () => {
  try {
    const response = await api.get('/settings/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    throw error;
  }
};

// Get current currency
export const getCurrentCurrency = async () => {
  try {
    const response = await api.get('/settings/currency');
    return response.data;
  } catch (error) {
    console.error('Error fetching currency:', error);
    throw error;
  }
};

// Update setting by key (admin only)
export const updateSetting = async (key, settingData) => {
  try {
    const response = await api.put(`/admin/settings/${key}`, settingData);
    return response.data;
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    throw error;
  }
};

// Create new setting (admin only)
export const createSetting = async (settingData) => {
  try {
    const response = await api.post('/admin/settings', settingData);
    return response.data;
  } catch (error) {
    console.error('Error creating setting:', error);
    throw error;
  }
}; 