import api from './api';

export const login = async (credentials) => {
  try {
    const loginData = {
      email: credentials.email,
      password: credentials.password
    };
    
    const response = await api.post('/auth/login', loginData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error };
  }
};

export const getUserCount = async () => {
  try {
    const response = await api.get('/auth/users/count');
    return response.data.count;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0; // Return 0 as a fallback
  }
}; 