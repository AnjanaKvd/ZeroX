import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { 
  ShoppingCartIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  PhoneIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  ChartBarSquareIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../context/ThemeContext';
import logoImage from '../../../assets/images/logo.png';

const Header = () => {
  const { user, logout, hasRole } = useAuth();
  const { cartItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();
  const prevScrollY = useRef(0);
  const settingsRef = useRef(null);
  
  const isDark = theme === 'dark';
  const cartItemCount = cartItems?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  // Track scrolling for animations and fixed header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      prevScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSettingsOpen(false);
  }, [location.pathname]);

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { to: "/", label: "HOME" },
    { to: "/categories", label: "CATEGORIES" },
    { to: "/products", label: "PRODUCTS" },
    { to: "/repair", label: "SERVICES" },
    { to: "/contact", label: "CONTACT" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top header section - full width and transparent */}
      <div 
        className={`transition-all duration-300 ease-in-out w-full mx-auto ${
          isDark ? 'bg-transparent' : 'bg-transparent'
        } ${
          isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-12 opacity-100'
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4">
          {/* Left section */}
          <div className="flex items-center space-x-6">
            <Link to="/stores" className={`flex items-center text-sm text-[#1ba5df] hover:opacity-80`}>
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Digana</span>
            </Link>
            <div className={`hidden sm:flex items-center text-sm text-[#1ba5df]`}>
              <PhoneIcon className="h-4 w-4 mr-1" />
              <span>(94)-757-333-502</span>
            </div>
          </div>

          {/* Center logo - appears in top section when not scrolled */}
          <Link to="/" className="flex items-center">
            <img src={logoImage} alt="Taprodev Computers" className="h-8 w-auto" />
          </Link>
          
          {/* Right section */}
          <div className={`flex items-center space-x-4 text-[#1ba5df]`}>
            <Link to="/wishlist" className="hover:opacity-80 hidden sm:block">
              <HeartIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/cart"
              className="relative hover:opacity-80"
              aria-label="Shopping Cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-green-500 text-xs font-bold text-white rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            {/* Settings dropdown - hidden on smallest screens */}
            <div className="relative hidden sm:block" ref={settingsRef}>
                <button 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="hover:opacity-80 p-1 focus:outline-none"
                aria-label="Settings"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                </button>
                
              {/* Settings dropdown menu */}
              {isSettingsOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        toggleTheme();
                        setIsSettingsOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {isDark ? (
                        <>
                          <SunIcon className="h-4 w-4 mr-2" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <MoonIcon className="h-4 w-4 mr-2" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                    
                    {user ? (
                      <>
                        {/* Admin Dashboard Link - Only shown for admins */}
                        {hasRole('ADMIN') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsSettingsOpen(false)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ChartBarSquareIcon className="h-4 w-4 mr-2" />
                            <span>Administration</span>
                          </Link>
                        )}
                        
                        <Link
                          to="/profile"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-2" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <span className="h-4 w-4 mr-2" />
                          <span>Logout</span>
                        </button>
                      </>
                    ) : (
                      <>
                <Link
                  to="/login"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                          <span className="h-4 w-4 mr-2" />
                          <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                          onClick={() => setIsSettingsOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                          <span className="h-4 w-4 mr-2" />
                          <span>Sign Up</span>
                </Link>
                      </>
                    )}
                  </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation - rounded corners with shorter width */}
      <nav 
        className={`backdrop-blur-md transition-all duration-500 ease-in-out 
          w-3/4 mx-auto rounded-2xl ${
          isDark 
            ? 'bg-black/70' 
            : 'bg-white/80'
        } ${
          isScrolled ? 'shadow-lg' : ''
        }`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile view - Logo + Hamburger */}
          <div className="md:hidden flex justify-between items-center h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src={logoImage} 
                alt="Taprodev" 
                className="h-8 w-auto" 
              />
            </Link>

          {/* Mobile Controls */}
            <div className="flex items-center gap-3">
            <Link
              to="/cart"
                className="relative"
              aria-label="Shopping Cart"
            >
                <ShoppingCartIcon className={`h-6 w-6 ${isDark ? 'text-white' : 'text-gray-700'}`} />
              {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 bg-green-500 text-xs font-bold text-white rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            <button
                className={`p-2 rounded-md ${isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Desktop view - Grid layout */}
          <div className="hidden md:grid grid-cols-3 h-14">
            {/* Left section - Categories dropdown when not scrolled, Logo when scrolled */}
            <div className="flex items-center justify-start w-64">
              {isScrolled ? (
                /* Logo when scrolled */
                <Link to="/" className="flex items-center">
                  <img 
                    src={logoImage} 
                    alt="Taprodev" 
                    className="h-8 w-auto transition-all duration-500 ease-in-out" 
                  />
                </Link>
              ) : (
                /* Categories dropdown when not scrolled */
                <div className="relative">
                  <button 
                    className={`flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${
                      isDark 
                        ? 'text-white hover:bg-white/10' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  >
                    <Bars3Icon className="h-5 w-5 mr-2" />
                    BROWSE ALL CATEGORIES
                  </button>
                  
                  {/* Categories dropdown menu */}
                  {isCategoriesOpen && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                      <div className="py-1">
                        <Link to="/products?category=laptops" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Laptops & Computers
                        </Link>
                        <Link to="/products?category=accessories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Computer Accessories
                        </Link>
                        <Link to="/products?category=storage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Storage Devices
                        </Link>
                        <Link to="/products?category=networking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Networking
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links - Center column, always fixed position */}
            <div className="flex items-center justify-center">
              {navItems.map(item => (
                <NavLink 
                  key={item.to}
                  to={item.to} 
                  className={({ isActive }) => `
                    text-sm font-medium transition-colors px-4 py-2 rounded-md
                    ${isDark
                      ? isActive 
                        ? 'text-white bg-white/20 font-semibold' 
                        : 'text-white/90 hover:text-white hover:bg-white/10'
                      : isActive
                        ? 'text-[#1AA5DE] bg-blue-50 font-semibold'
                        : 'text-gray-700 hover:text-[#1AA5DE] hover:bg-blue-50/50'
                    }
                  `}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* Right section - Search bar when not scrolled, Icons when scrolled */}
            <div className="flex items-center justify-end w-64 ml-14">
              {isScrolled ? (
                /* Icons when scrolled */
                <div className="flex items-center space-x-4">
                  <Link to="/wishlist" className="hover:opacity-80">
                    <HeartIcon className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                  </Link>
                  <Link
                    to="/cart"
                    className="relative hover:opacity-80"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCartIcon className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-green-500 text-xs font-bold text-white rounded-full">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  {/* Settings dropdown */}
                  <div className="relative" ref={settingsRef}>
                    <button 
                      onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                      className={`hover:opacity-80 p-1 focus:outline-none ${isDark ? 'text-white' : 'text-gray-700'}`}
                      aria-label="Settings"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                    </button>
                    
                    {/* Settings dropdown menu */}
                    {isSettingsOpen && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              toggleTheme();
                              setIsSettingsOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {isDark ? (
                              <>
                                <SunIcon className="h-4 w-4 mr-2" />
                                <span>Light Mode</span>
                              </>
                            ) : (
                              <>
                                <MoonIcon className="h-4 w-4 mr-2" />
                                <span>Dark Mode</span>
                              </>
                            )}
                          </button>
                          
                          {user ? (
                            <>
                              {/* Admin Dashboard Link - Only shown for admins */}
                              {hasRole('ADMIN') && (
                                <Link
                                  to="/admin"
                                  onClick={() => setIsSettingsOpen(false)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <ChartBarSquareIcon className="h-4 w-4 mr-2" />
                                  <span>Administration</span>
                                </Link>
                              )}
                              
                              <Link
                                to="/profile"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <UserCircleIcon className="h-4 w-4 mr-2" />
                                <span>Profile</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span className="h-4 w-4 mr-2" />
                                <span>Logout</span>
            </button>
                            </>
                          ) : (
                            <>
                              <Link
                                to="/login"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span className="h-4 w-4 mr-2" />
                                <span>Sign In</span>
                              </Link>
                              <Link
                                to="/register"
                                onClick={() => setIsSettingsOpen(false)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span className="h-4 w-4 mr-2" />
                                <span>Sign Up</span>
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Search bar when not scrolled */
                <div className={`flex items-center rounded-md px-3 py-1.5 w-64 ${
                  isDark ? 'bg-white/10' : 'bg-gray-100'
                }`}>
                  <input
                    type="text"
                    placeholder="ENTER YOUR KEY WORD"
                    className={`bg-transparent text-sm border-none outline-none w-full ${
                      isDark ? 'text-white placeholder-white/70' : 'text-gray-700 placeholder-gray-500'
                    }`}
                  />
                  <MagnifyingGlassIcon className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-500'}`} />
                </div>
              )}
            </div>
          </div>
          </div>
        </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      
      {/* Mobile Menu Panel */}
      <div 
        className={`md:hidden fixed top-0 right-0 w-full sm:w-80 h-full transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDark ? 'bg-black/90' : 'bg-white shadow-lg'}`}
      >
        <div className="p-4">
          {/* Header with logo and close button */}
          <div className="flex justify-between items-center">
            <img src={logoImage} alt="Taprodev Computers" className="h-8 w-auto" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className={`p-2 rounded-md ${
                isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Close menu"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search input */}
          <div className={`my-4 rounded-md px-3 py-2 flex items-center ${
            isDark ? 'bg-white/10' : 'bg-gray-100'
          }`}>
            <input
              type="text"
              placeholder="ENTER YOUR KEY WORD"
              className={`bg-transparent border-none outline-none w-full ${
                isDark ? 'text-white placeholder-white/70' : 'text-gray-700 placeholder-gray-500'
              }`}
            />
            <MagnifyingGlassIcon className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-500'}`} />
          </div>

          {/* Main navigation links */}
          <div className="space-y-2 mt-6">
            {navItems.map(item => (
              <NavLink 
                key={item.to}
                to={item.to} 
                className={({ isActive }) => `
                  block font-medium px-4 py-3 rounded-md
                  ${isDark
                    ? isActive ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'
                    : isActive ? 'bg-blue-50 text-[#1AA5DE]' : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Categories section */}
          <div className="mt-6">
            <div className={`text-sm font-semibold px-4 pb-2 border-b ${
              isDark ? 'text-white border-white/10' : 'text-gray-900 border-gray-200'
            }`}>
              CATEGORIES
            </div>
            <div className="mt-2 space-y-1">
              <Link 
                to="/products?category=laptops" 
                className={`block px-4 py-2 text-sm rounded-md ${
                  isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Laptops & Computers
              </Link>
              <Link 
                to="/products?category=accessories" 
                className={`block px-4 py-2 text-sm rounded-md ${
                  isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Computer Accessories
              </Link>
              <Link 
                to="/products?category=storage" 
                className={`block px-4 py-2 text-sm rounded-md ${
                  isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Storage Devices
              </Link>
              <Link 
                to="/products?category=networking" 
                className={`block px-4 py-2 text-sm rounded-md ${
                  isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Networking
              </Link>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="mt-6 flex justify-around">
            <Link 
              to="/wishlist" 
              className={`flex flex-col items-center ${
                isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-[#1AA5DE]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <HeartIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Wishlist</span>
            </Link>
            <Link 
              to="/cart" 
              className={`flex flex-col items-center ${
                isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-[#1AA5DE]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="text-xs mt-1">Cart</span>
            </Link>
            <button
              onClick={toggleTheme}
              className={`flex flex-col items-center ${
                isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-[#1AA5DE]'
              }`}
            >
              {isDark ? (
                <>
                  <SunIcon className="h-6 w-6" />
                  <span className="text-xs mt-1">Light Mode</span>
                </>
              ) : (
                <>
                  <MoonIcon className="h-6 w-6" />
                  <span className="text-xs mt-1">Dark Mode</span>
                </>
              )}
            </button>
                  </div>

          {/* User info */}
          <div className={`mt-8 border-t pt-4 ${
            isDark ? 'border-white/20' : 'border-gray-200'
          }`}>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <UserCircleIcon className={`h-8 w-8 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                  <div className={isDark ? 'text-white' : 'text-gray-700'}>
                    <div className="font-medium">{user.email?.split('@')[0]}</div>
                    <div className={`text-xs ${isDark ? 'text-white/70' : 'text-gray-500'}`}>{user.email}</div>
                  </div>
                </div>
                
                {/* Admin Dashboard Link - Only shown for admins */}
                {hasRole('ADMIN') && (
                  <Link 
                    to="/admin" 
                    className={`block w-full px-4 py-2 rounded-md ${
                      isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className={`block w-full px-4 py-2 rounded-md ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 rounded-md ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Logout
                </button>
            </div>
          ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className={`block w-full text-center px-4 py-2 rounded-md ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`block w-full text-center px-4 py-2 rounded-md ${
                    isDark 
                      ? 'bg-white text-black hover:bg-white/90' 
                      : 'bg-[#1AA5DE] text-white hover:bg-[#1AA5DE]/90'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
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