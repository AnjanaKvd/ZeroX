import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getUserProfile, 
  login as apiLogin, 
  register as apiRegister, 
  logout as apiLogout 
} from '../services/authService';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuthError = useCallback((error) => {
    console.error('Authentication Error:', error);
    localStorage.removeItem('token');
    setUser(null);
    setError(error.message || 'Authentication failed');
    
    if (!location.pathname.includes('login')) {
      navigate('/login', {
        state: { from: location.pathname },
        replace: true
      });
    }
  }, [navigate, location]);

  const loadUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Session expired');
      }

      const userData = await getUserProfile();
      return {
        ...userData,
        roles: userData.roles || []
      };
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  }, [handleAuthError]);

  const initializeAuth = useCallback(async () => {
    try {
      const userData = await loadUserProfile();
      if (userData) {
        setUser(userData);
        handleRoleRedirection(userData.roles);
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, handleAuthError]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleRoleRedirection = useCallback((roles) => {
    const redirectPath = location.state?.from || '/';
    
    if (roles.includes('ADMIN')) {
      navigate('/admin/dashboard', { replace: true });
    } else if (!redirectPath.startsWith('/admin')) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, location]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const { token, ...userData } = await apiLogin(credentials);
      localStorage.setItem('token', token);
      
      const authenticatedUser = {
        ...userData,
        roles: userData.roles || []
      };
      
      setUser(authenticatedUser);
      handleRoleRedirection(authenticatedUser.roles);
      return { success: true };
    } catch (error) {
      handleAuthError(error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError, handleRoleRedirection]);

  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const { token, ...newUser } = await apiRegister(userData);
      localStorage.setItem('token', token);
      
      const registeredUser = {
        ...newUser,
        roles: newUser.roles || []
      };
      
      setUser(registeredUser);
      handleRoleRedirection(registeredUser.roles);
      return { success: true };
    } catch (error) {
      handleAuthError(error);
      return { success: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthError, handleRoleRedirection]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiLogout();
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      navigate('/login', { replace: true });
      setIsLoading(false);
    }
  }, [navigate]);

  const hasRole = useCallback(
    (requiredRole) => user?.roles?.includes(requiredRole) || false,
    [user?.roles]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};