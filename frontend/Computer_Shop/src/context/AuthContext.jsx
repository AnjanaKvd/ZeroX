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

  const handleAuthError = useCallback(
    (error) => {
      console.error("Authentication Error:", error);
      localStorage.removeItem("token");
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
      if (user) {
        return user;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        return null;
      }

      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          return null;
        }
      } catch (error) {
        localStorage.removeItem("token");
        return null;
      }

      const userData = await getUserProfile();

      return {
        ...userData,
        roles: userData.roles || [],
      };
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      handleAuthError(error);
      return null;
    }
  }, [user, handleAuthError]);

  const initializeAuth = useCallback(async () => {
    // Skip if we're already initialized
    if (!isLoading && user) {
      return;
    }

    try {
      // Avoid API calls on pages where auth isn't critical
      const isPublicPage =
        location.pathname === "/" ||
        location.pathname === "/products" ||
        location.pathname.startsWith("/product/");

      // Skip profile check on public pages if we've already done it once
      const skipProfileFetch =
        sessionStorage.getItem("skipProfileFetch") === "true";

      if (skipProfileFetch && isPublicPage) {
        setIsLoading(false);
        return;
      }

      const userData = await loadUserProfile();
      if (userData) {
        setUser(userData);

        // Only redirect if user just logged in
        const justLoggedIn = sessionStorage.getItem("justLoggedIn") === "true";
        if (justLoggedIn) {
          sessionStorage.removeItem("justLoggedIn");
          handleRoleRedirection(userData.roles);
        }
      }

      // Mark that we've checked the profile
      if (isPublicPage) {
        sessionStorage.setItem("skipProfileFetch", "true");
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  }, [loadUserProfile, handleAuthError, location.pathname, isLoading, user]);

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
        sessionStorage.setItem("justLoggedIn", "true");
        sessionStorage.removeItem("skipProfileFetch");

        const authenticatedUser = {
          ...userData,
          roles: userData.role ? [userData.role] : [],
        };

        setUser(authenticatedUser);

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        handleAuthError(error);
        return { success: false, message: error.message };
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthError]
  );

  const register = useCallback(
    async (userData) => {
      try {
        setIsLoading(true);
        const { token, ...newUser } = await apiRegister(userData);
        localStorage.setItem("token", token);

        const registeredUser = {
          ...newUser,
          roles: newUser.roles || [],
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
    },
    [handleAuthError, handleRoleRedirection]
  );

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await apiLogout();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login", { replace: true });
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
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
