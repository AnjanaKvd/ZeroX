import { createContext, useState, useEffect } from 'react';
import { getUserProfile, login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check for token on app startup
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);
  
  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Clear token if profile fetch fails (likely invalid token)
      localStorage.removeItem('token');
      setUser(null);
      setError('Session expired. Please login again.');
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (credentials) => {
    try {
      const data = await apiLogin(credentials);
      setUser(data);
      setError(null);
      return { success: true };
    } catch (err) {
      let errorMessage = 'Login failed';
      
      if (err.response) {
        errorMessage = err.response.data?.message || errorMessage;
      }
      
      setError(errorMessage);
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };
  
  const register = async (userData) => {
    try {
      const data = await apiRegister(userData);
      setUser(data);
      setError(null);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed',
        validationErrors: err.response?.data?.validationErrors 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:8080/api/auth/myprofile",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setError(null);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Profile update failed";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      updateProfile,
      refreshUser: fetchUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 