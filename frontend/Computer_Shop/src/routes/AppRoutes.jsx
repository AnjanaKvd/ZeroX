import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from '../components/layouts/MainLayout';
import AdminLayout from '../components/layouts/AdminLayout';
import AuthLayout from '../components/layouts/AuthLayout'; 
import LoadingOverlay from '../components/common/LoadingOverlay';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';

// Lazy-loaded pages
const Home = lazy(() => import('../pages/Home'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetails'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Cart = lazy(() => import('../pages/Cart'));
const Checkout = lazy(() => import('../pages/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/OrderConfirmation'));
const Profile = lazy(() => import('../pages/Profile'));
const OrderHistory = lazy(() => import('../pages/OrderHistory'));
const OrderDetails = lazy(() => import('../pages/OrderDetails'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ProductManagement = lazy(() => import('../pages/ProductManagement'));
const CategoryManagement = lazy(() => import('../pages/CategoryManagement'));
const OrderManagement = lazy(() => import('../pages/OrderManagement'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const Settings = lazy(() => import('../pages/Settings'));
const Logout = lazy(() => import('../pages/Logout'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const Unauthorized = lazy(() => import('../pages/Unauthorized'));
const ProductsListing = lazy(() => import('../pages/ProductsListing'));
const RepairPage = lazy(() => import('../pages/RepairPage'));

const ProtectedRoute = ({ roles = [], children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles.length > 0 && !roles.some(role => user.roles?.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingOverlay />}>
        <Routes>
          {/* Main store routes */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductsListing />} />
            <Route path="products/:id" element={<ProductDetailPage />} />
            <Route path="cart" element={<Cart />} />
            <Route path="repairs" element={<RepairPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Auth routes with proper layout */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="logout" element={<Logout />} />
            <Route path="unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Authenticated user routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="checkout" element={<Checkout />} />
              <Route path="order-confirmation" element={<OrderConfirmation />} />
              <Route path="profile" element={<Profile />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="order/:id" element={<OrderDetails />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;