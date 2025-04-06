import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../../context/ThemeContext';
import logoImage from '../../../assets/images/logo.png';

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
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center text-2xl font-bold tracking-tight transition-colors text-primary hover:text-primary-hover"
          >
            <img src={logoImage} alt="Taprodev Computers" className="w-auto mr-2 h-9" />
          </Link>

          {/* Primary Navigation */}
          <div className="items-center hidden gap-8 md:flex">
            <Link 
              to="/products" 
              className="text-sm font-medium transition-colors text-text-primary hover:text-primary-hover"
            >
              Products
            </Link>
            
            {hasRole('ADMIN') && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors text-text-primary hover:text-primary-hover"
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
              className="relative p-2 transition-colors rounded-md hover:bg-background"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className="w-6 h-6 text-text-primary" />
              {cartItemCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-primary">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button 
                  className="flex items-center gap-2 p-2 transition-colors rounded-md hover:bg-background"
                  aria-label="User menu"
                >
                  <UserCircleIcon className="w-6 h-6 text-text-primary" />
                  <span className="hidden text-sm font-medium sm:inline text-text-primary">
                    {user.email}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 hidden w-48 mt-2 origin-top-right border divide-y rounded-lg shadow-lg group-hover:block bg-surface divide-border">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-colors text-text-primary hover:bg-background"
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-sm text-left transition-colors text-text-primary hover:bg-background"
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
                  className="text-sm font-medium transition-colors text-text-primary hover:text-primary-hover"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium transition-colors text-primary hover:text-primary-hover"
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