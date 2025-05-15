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

export const getAllUsers = async (params = {}) => {
  try {
    const response = await api.get('/auth/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
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
    // Try direct user count endpoint first
    try {
      console.log('Trying direct user count endpoint...');
      const response = await api.get('/auth/users/count');
      if (response && response.data && typeof response.data.count === 'number') {
        console.log('User count from endpoint:', response.data.count);
        return response.data.count;
      }
    } catch (countError) {
      console.log('Direct user count endpoint not available:', countError.message);
    }
    
    // Get all users
    console.log('Fetching all users for count...');
    const usersData = await getAllUsers();
    console.log('Users data received:', usersData);
    
    // Check if users data is available in standard format
    if (usersData && usersData.content && Array.isArray(usersData.content)) {
      const count = usersData.content.length;
      console.log('Total users count:', count);
      return count;
    }
    
    // Check if usersData is a plain array
    if (Array.isArray(usersData)) {
      const count = usersData.length;
      console.log('Total users count (plain array):', count);
      return count;
    }
    
    // If we can't determine count, default to 1
    console.log('Could not determine user count, returning default 1');
    return 1;
  } catch (error) {
    console.error('Error calculating user count:', error);
    return 1; // Return default value of 1 on error
  }
}; 