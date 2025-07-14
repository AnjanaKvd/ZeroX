import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getUserProfile,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Format user data to ensure roles are consistent
  const formatUserData = (userData) => {
    // Make sure ID fields are consistent (both id and userId should work)
    const formattedData = {
      ...userData,
      // Ensure both id and userId are present and have the same value
      id: userData.id || userData.userId,
      userId: userData.userId || userData.id,
      // Check if we have a role property but empty roles array
      roles:
        userData.roles && userData.roles.length > 0
          ? userData.roles
          : userData.role
          ? [userData.role]
          : [],
    };

    return formattedData;
  };

  const handleAuthError = useCallback(
    (error) => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData"); // Clear userData as well
      setUser(null);
      setError(error.message || "Authentication failed");

      if (!location.pathname.includes("login")) {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
      }
    },
    [navigate, location]
  );

  const loadUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const storedUserData = localStorage.getItem("userData");

      if (!token) {
        return null;
      }

      // Validate token expiry
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
          return null;
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
        return null;
      }

      // Try to use cached userData first for faster loading
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          return formatUserData(parsedUserData);
        } catch (e) {
          // Fall through to the API call
        }
      }

      // Fetch fresh data if needed
      const userData = await getUserProfile();
      const formattedUserData = formatUserData(userData);

      // Cache the user data
      localStorage.setItem("userData", JSON.stringify(formattedUserData));

      return formattedUserData;
    } catch (error) {
      handleAuthError(error);
      return null;
    }
  }, [handleAuthError]);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setIsLoading(false);
        return;
      }

      // Always try to load user profile when token exists
      const userData = await loadUserProfile();

      if (userData) {
        setUser(userData);
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

  const handleRoleRedirection = useCallback(
    (roles) => {
      const redirectPath = location.state?.from || "/";
      const currentPath = location.pathname;

      if (
        currentPath === redirectPath ||
        (roles.includes("ADMIN") && currentPath === "/admin/dashboard")
      ) {
        return;
      }

      if (roles.includes("ADMIN") && !currentPath.startsWith("/admin")) {
        navigate("/admin/dashboard", { replace: true });
      } else if (redirectPath !== "/" && currentPath !== redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    },
    [navigate, location]
  );

  const login = useCallback(
    async (credentials) => {
      try {
        setIsLoading(true);

        const loginResponse = await apiLogin(credentials);
        const { token, ...userData } = loginResponse;

        localStorage.setItem("token", token);

        const formattedUserData = formatUserData(userData);

        // Store user data in localStorage for persistence
        localStorage.setItem("userData", JSON.stringify(formattedUserData));
        setUser(formattedUserData);

        return { success: true };
      } catch (error) {
        handleAuthError(error);
        return { success: false, message: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthError, formatUserData]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setIsLoading(true);
        const response = await apiRegister(userData);

        const { token, ...newUser } = response;

        // Only store token if it's returned
        if (token) {
          localStorage.setItem("token", token);
        }

        const formattedUserData = formatUserData(newUser);
        localStorage.setItem("userData", JSON.stringify(formattedUserData));
        setUser(formattedUserData);

        return { success: true, ...formattedUserData };
      } catch (error) {
        return {
          success: false,
          message:
            error.response?.data?.message ||
            error.message ||
            "Registration failed",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [handleRoleRedirection, formatUserData]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiLogout();
    } catch (error) {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      setUser(null);
      navigate("/login", { replace: true });
      setIsLoading(false);
    }
  }, [navigate]);

  const hasRole = useCallback(
    (requiredRole) => {
      if (!user) return false;

      // Handle the case where role is a string but roles is empty
      if (
        user.role === requiredRole &&
        (!user.roles || user.roles.length === 0)
      ) {
        return true;
      }

      return user.roles?.includes(requiredRole) || false;
    },
    [user]
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
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
