import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Pages
import Home from "../pages/Home";
import ProductDetails from "../pages/ProductDetails";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderConfirmation from "../pages/OrderConfirmation";
import Profile from "../pages/Profile";
import OrderHistory from "../pages/OrderHistory";
import OrderDetails from "../pages/OrderDetails";
import NotFound from "../pages/NotFound";
import MyProfile from "../pages/MyProfile";
import UserReviewForm from "../pages/UserReviewForm";
import DisplayRatingAndReviews from "../pages/DisplayRatingAndReviews";

// Private route component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products/:productId" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/myprofile" element={<MyProfile />} />
      <Route path="/userreviewform" element={<UserReviewForm />} />
      <Route path="/displayreviews" element={<DisplayRatingAndReviews />} />

      {/* Protected routes */}
      <Route
        path="/checkout"
        element={
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/order-confirmation/:orderId"
        element={
          <PrivateRoute>
            <OrderConfirmation />
          </PrivateRoute>
        }
      />
      <Route
        path="/myprofile"
        element={
          <PrivateRoute>
            <MyProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <OrderHistory />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:orderId"
        element={
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        }
      />

      {/* 404 catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
