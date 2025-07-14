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
    return { success: false, error };
  }
};

export const getUserCount = async () => {
  try {
    const response = await api.get('/auth/users/count');
    return response.data.count;
  } catch (error) {
    return 0; // Return 0 as a fallback
  }
};

export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/auth/users', { params });
    return response.data;
  } catch (error) {
    // Return empty array as fallback
    return { content: [] };
  }
};

// Helper function to determine if a user object is a customer
const isCustomerUser = (user) => {
  if (!user) return false;
  
  // Check roles - handle different formats
  let isCustomer = false;
  
  // Handle array of roles
  if (Array.isArray(user.roles)) {
    isCustomer = user.roles.some(role => 
      typeof role === 'string' ? 
        ['CUSTOMER', 'USER', 'customer', 'user'].includes(role.toUpperCase()) : 
        false
    );
  } 
  // Handle roles as a string that might contain multiple roles
  else if (typeof user.roles === 'string') {
    const rolesArray = user.roles.split(',').map(r => r.trim().toUpperCase());
    isCustomer = rolesArray.some(role => ['CUSTOMER', 'USER'].includes(role));
  }
  // Handle single role as string
  else if (typeof user.role === 'string') {
    isCustomer = ['CUSTOMER', 'USER', 'customer', 'user'].includes(user.role.toUpperCase());
  }
  
  // If no role information but there is a customer flag, use that
  if (!isCustomer && typeof user.isCustomer === 'boolean') {
    isCustomer = user.isCustomer;
  }
  
  // Check status - handle different formats
  let isActive = false;
  
  // Handle status as string
  if (typeof user.status === 'string') {
    isActive = ['ACTIVE', 'active', 'ENABLED', 'enabled', 'true'].includes(user.status.toLowerCase());
  } 
  // Handle active property as boolean
  else if (typeof user.active === 'boolean') {
    isActive = user.active;
  }
  // Handle enabled property as boolean
  else if (typeof user.enabled === 'boolean') {
    isActive = user.enabled;
  }
  
  // If no status information, default to active
  if (user && Object.keys(user).length > 0 && isCustomer && isActive === false && 
      user.status === undefined && user.active === undefined && user.enabled === undefined) {
    isActive = true;
  }
  
  return isCustomer && isActive;
};

export const getCustomerCount = async () => {
  try {
    // Fetch all users
    const usersData = await getAllUsers();
    let users = [];
    if (usersData && Array.isArray(usersData.content)) {
      users = usersData.content;
    } else if (Array.isArray(usersData)) {
      users = usersData;
    }
    // Count users with CUSTOMER role (case-insensitive)
    const customerCount = users.filter(user => {
      if (!user) return false;
      if (Array.isArray(user.roles)) {
        return user.roles.some(role => typeof role === 'string' && role.toUpperCase() === 'CUSTOMER');
      }
      if (typeof user.roles === 'string') {
        return user.roles.split(',').map(r => r.trim().toUpperCase()).includes('CUSTOMER');
      }
      if (typeof user.role === 'string') {
        return user.role.toUpperCase() === 'CUSTOMER';
      }
      return false;
    }).length;
    return customerCount;
  } catch (error) {
    return 0;
  }
}; 