import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import AdminLayout from "../components/layouts/AdminLayout";
import AuthLayout from "../components/layouts/AuthLayout";
import LoadingOverlay from "../components/common/LoadingOverlay";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { useAuth } from "../context/AuthContext";
import CouponManagement from "../pages/CouponManagement";
import Repair from "../pages/Repair";

// Lazy-loaded pages
const Home = lazy(() => import("../pages/Home"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetails"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Cart = lazy(() => import("../pages/Cart"));
const Checkout = lazy(() => import("../pages/Checkout"));
const OrderConfirmation = lazy(() => import("../pages/OrderConfirmation"));
const Profile = lazy(() => import("../pages/Profile"));
const SavedAddresses = lazy(() => import("../pages/SavedAddresses"));
const OrderHistory = lazy(() => import("../pages/OrderHistory"));
const OrderDetails = lazy(() => import("../pages/OrderDetails"));
const NotFound = lazy(() => import("../pages/NotFound"));
const ProductManagement = lazy(() => import("../pages/ProductManagement"));
const CategoryManagement = lazy(() => import("../pages/CategoryManagement"));
const OrderManagement = lazy(() => import("../pages/OrderManagement"));
const UserManagement = lazy(() => import("../pages/UserManagement"));
const DiscountManagement = lazy(() => import("../pages/DiscountManagement"));
const Settings = lazy(() => import("../pages/Settings"));
const Logout = lazy(() => import("../pages/Logout"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));
const ProductsListing = lazy(() => import("../pages/ProductsListing"));
const DisplayRatingAndReviews = lazy(() =>
  import("../pages/DisplayRatingAndReviews")
);
const ReviewForm = lazy(() => import("../pages/ReviewForm"));
const ReviewItem = lazy(() => import("../pages/ReviewItem"));
const AdminOrderDetails = lazy(() => import("../pages/AdminOrderDetails"));
const Rewards = lazy(() => import("../pages/Rewards"));

const ProtectedRoute = ({ roles = [], children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles.length > 0 && !roles.some((role) => user.roles?.includes(role))) {
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
            <Route path="repair" element={<Repair />} />
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
              <Route
                path="order-confirmation/:orderId"
                element={<OrderConfirmation />}
              />
              <Route path="profile" element={<Profile />} />
              <Route path="saved-addresses" element={<SavedAddresses />} />
              <Route path="order-history" element={<OrderHistory />} />
              <Route path="orders/:orderId" element={<OrderDetails />} />
              <Route path="/rewards" element={<Rewards />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="discounts" element={<DiscountManagement />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="orders/:orderId" element={<AdminOrderDetails />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="coupons" element={<CouponManagement />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
