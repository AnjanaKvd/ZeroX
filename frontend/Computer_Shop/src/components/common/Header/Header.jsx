import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const { cartItems } = useCart();
  
  // Safely calculate cart items count
  const cartItemCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600 transition-colors hover:text-blue-700">
              TechZone
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="items-center hidden space-x-8 md:flex">
            <Link 
              to="/products" 
              className="font-medium text-gray-700 transition-colors hover:text-blue-600"
            >
              Products
            </Link>
            
            {hasRole('ADMIN') && (
              <Link
                to="/admin"
                className="font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/cart"
                  className="relative text-gray-700 transition-colors hover:text-blue-600"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute px-2 py-1 text-xs font-bold text-white bg-blue-600 rounded-full -top-2 -right-3">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <div className="relative group">
                  <button className="font-medium text-gray-700 transition-colors hover:text-blue-600">
                    {user.email}
                  </button>
                  <div className="absolute right-0 hidden w-48 py-1 mt-2 bg-white rounded-md shadow-lg group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;