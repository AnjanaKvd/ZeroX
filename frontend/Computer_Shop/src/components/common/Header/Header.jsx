import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../../context/ThemeContext';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const { cartItems } = useCart();
  const { theme } = useTheme();
  
  const cartItemCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
      theme === 'dark' ? 'border-background-dark' : 'border-background-light'
    } bg-surface shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl font-bold tracking-tight text-primary hover:text-primary-hover transition-colors"
          >
            TechZone
          </Link>

          {/* Primary Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/products" 
              className="text-sm font-medium text-text-primary hover:text-primary-hover transition-colors"
            >
              Products
            </Link>
            
            {hasRole('ADMIN') && (
              <Link
                to="/admin"
                className="text-sm font-medium text-text-primary hover:text-primary-hover transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-6">
            <ThemeToggle />
            
            <Link
              to="/cart"
              className="relative p-2 rounded-md hover:bg-background transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className="h-6 w-6 text-text-primary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-primary text-xs font-bold text-white rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-background transition-colors"
                  aria-label="User menu"
                >
                  <UserCircleIcon className="h-6 w-6 text-text-primary" />
                  <span className="hidden sm:inline text-sm font-medium text-text-primary">
                    {user.email}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="hidden group-hover:block absolute right-0 mt-2 w-48 origin-top-right rounded-lg shadow-lg bg-surface border divide-y divide-border">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-background transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-text-primary hover:text-primary-hover transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;