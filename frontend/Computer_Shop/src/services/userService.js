import api from './api';

const USER_BASE_URL = '/admin/users';

export const userService = {
  // List all users with pagination and filters
  getUsers: async (page = 0, size = 10, queryParams = '') => {
    try {
      const params = new URLSearchParams(queryParams);
      params.append('page', page);
      params.append('size', size);
      
      const response = await api.get(`${USER_BASE_URL}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const response = await api.get(`${USER_BASE_URL}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get single user by ID
  getUserById: async (userId) => {
    try {
      const response = await api.get(`${USER_BASE_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    try {
      const response = await api.patch(
        `${USER_BASE_URL}/${userId}/role`,
        { role }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    }
  },

  // Update user email
  updateUserEmail: async (userId, email) => {
    try {
      const response = await api.patch(
        `${USER_BASE_URL}/${userId}/email`,
        { email }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating email for user ${userId}:`, error);
      throw error;
    }
  },

  // Update user password
  updateUserPassword: async (userId, password) => {
    try {
      const response = await api.patch(
        `${USER_BASE_URL}/${userId}/password`,
        { password }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating password for user ${userId}:`, error);
      throw error;
    }
  },

  // Update user status (active/inactive)
  updateUserStatus: async (userId, active) => {
    try {
      const response = await api.patch(
        `${USER_BASE_URL}/${userId}/status`,
        { active }
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating status for user ${userId}:`, error);
      throw error;
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      await api.delete(`${USER_BASE_URL}/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  }
};

export default userService;
