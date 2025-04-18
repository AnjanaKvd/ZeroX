import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { 
  ShoppingCartIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BuildingStorefrontIcon,
  ComputerDesktopIcon,
  PhoneIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../../context/ThemeContext';
import logoImage from '../../../assets/images/logo.png';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const { cartItems } = useCart();
  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const cartItemCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  // Track scrolling to add shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { to: "/products", label: "Products", icon: <ComputerDesktopIcon className="w-5 h-5" /> },
    { to: "/services", label: "Services", icon: <BuildingStorefrontIcon className="w-5 h-5" /> },
    { to: "/contact", label: "Contact Us", icon: <PhoneIcon className="w-5 h-5" /> },
  ];

  if (hasRole('ADMIN')) {
    navItems.push({ to: "/admin", label: "Dashboard", icon: <ChartBarSquareIcon className="w-5 h-5" /> });
  }

  return (
    <header 
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        theme === 'dark' ? 'border-background-dark' : 'border-background-light'
      } ${
        isScrolled 
          ? `bg-surface-${theme} shadow-md` 
          : `bg-surface-${theme}`
      }`}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center text-2xl font-bold tracking-tight transition-colors text-primary hover:text-primary-hover"
          >
            <img src={logoImage} alt="Taprodev Computers" className="w-auto h-10 mr-2" />
          </Link>

          {/* Primary Navigation - Desktop */}
          <div className="items-center hidden gap-6 md:flex">
            {navItems.map(item => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => `
                  text-sm font-medium transition-colors px-3 py-2 rounded-md
                  ${isActive 
                    ? `bg-primary/10 text-primary font-semibold` 
                    : `${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'} hover:text-primary`
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Controls - Desktop */}
          <div className="items-center hidden gap-4 md:flex">
            <ThemeToggle />
            
            <Link
              to="/cart"
              className="relative p-2 transition-colors rounded-md hover:bg-background-light dark:hover:bg-background-dark"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className={`h-6 w-6 ${
                theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
              }`} />
              {cartItemCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-primary">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button 
                  className={`flex items-center gap-2 p-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}
                  aria-label="User menu"
                >
                  <UserCircleIcon className="w-6 h-6" />
                  <span className="text-sm font-medium truncate max-w-[100px]">
                    {user.email?.split('@')[0]}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 hidden w-48 mt-2 border rounded-lg shadow-lg group-hover:block bg-surface-light dark:bg-surface-dark border-border">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                        theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                      }`}
                    >
                      <UserCircleIcon className="w-5 h-5" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                        theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className={`text-sm font-medium px-3 py-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-3 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-3 md:hidden">
            <ThemeToggle />
            
            <Link
              to="/cart"
              className="relative p-2 transition-colors rounded-md hover:bg-background-light dark:hover:bg-background-dark"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className={`h-6 w-6 ${
                theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
              }`} />
              {cartItemCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full -top-1 -right-1 bg-primary">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <button
              className={`p-2 rounded-md hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      <div 
        className={`md:hidden fixed top-16 right-0 w-full sm:w-80 h-[calc(100vh-4rem)] bg-surface-light dark:bg-surface-dark border-l border-border transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 space-y-4">
          {/* User Info - Mobile */}
          {user ? (
            <div className="pb-4 mb-4 border-b border-border">
              <div className="flex items-center gap-3 mb-3">
                <UserCircleIcon className={`h-8 w-8 ${
                  theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                }`} />
                <div>
                  <div className={`font-medium ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}>
                    {user.email?.split('@')[0]}
                  </div>
                  <div className={`text-xs ${
                    theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                  }`}>
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/profile"
                  className={`text-sm flex-1 px-3 py-2 rounded-md text-center border border-border hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className={`text-sm flex-1 px-3 py-2 rounded-md text-center border border-border hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="pb-4 mb-4 border-b border-border">
              <div className={`mb-3 text-sm ${
                theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
              }`}>
                Sign in to your account
              </div>
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className={`text-sm flex-1 px-3 py-2 rounded-md text-center border border-border hover:bg-background-light dark:hover:bg-background-dark transition-colors ${
                    theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 px-3 py-2 text-sm text-center text-white transition-colors rounded-md bg-primary hover:bg-primary-hover"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {/* Navigation - Mobile */}
          <div className="space-y-2">
            {navItems.map(item => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => `
                  flex items-center gap-3 text-sm font-medium px-3 py-3 rounded-md transition-colors w-full
                  ${isActive 
                    ? `bg-primary/10 text-primary font-semibold` 
                    : `${theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'} hover:bg-background-light dark:hover:bg-background-dark`
                  }
                `}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;