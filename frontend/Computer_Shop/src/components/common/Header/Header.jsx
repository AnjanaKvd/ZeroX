import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { CartContext } from "../../../context/CartContext";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Computer Shop
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200">
            Home
          </Link>

          <div className="relative">
            <Link to="/cart" className="hover:text-blue-200">
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>

          <Link to="/myprofile" className="hover:text-blue-200">
            My Profile
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="hover:text-blue-200">
                {user.fullName || "My Account"}
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-blue-200">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-blue-600 hover:bg-blue-100 px-3 py-1 rounded"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
