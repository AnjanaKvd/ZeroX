import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../../services/categoryService';
import { Spinner } from '../LoadingSpinner/Spinner';
import { IconRenderer } from '../../../utils/iconRegistry';
import { useTheme } from '../../../context/ThemeContext';

const Sidebar = ({ isOpen, onToggle, isVisible = true }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scrolling to hide sidebar
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Only fetch categories that are marked for sidebar
        const data = await getCategories(true); // true means sidebarOnly
        setCategories(data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryId = (category) => {
    return category.categoryId || category.id || category._id || category.uuid || '';
  };
  
  // Handle category click - ensures proper navigation and data fetching
  const handleCategoryClick = (category) => {
    // Close sidebar on mobile after selection
    if (onToggle) {
      onToggle();
    }
    
    // The actual navigation is handled by the Link component's to prop
    // The CategoryProductsPage will handle the data fetching based on the URL parameter
  };

  // Hide sidebar completely when scroll position is beyond the first page
  const shouldShowSidebar = scrollPosition < window.innerHeight;

  return (
    <aside className={`
      transition-all duration-300 
      fixed left-4 top-20 bottom-4
      rounded-xl shadow-lg
      ${isOpen ? 'w-60' : 'w-20'}
      ${isDark 
        ? 'bg-black/40 backdrop-blur-md border border-white/10' 
        : 'bg-white/40 backdrop-blur-md border border-gray-200/50'
      }
      ${shouldShowSidebar && isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      z-30 overflow-hidden
    `}>
      <button
        onClick={onToggle}
        className={`w-full p-4 transition-colors ${
          isDark 
            ? 'text-white/80 hover:text-white hover:bg-white/10' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
        }`}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? '←' : '→'}
      </button>
      
      <nav className={`p-3 ${isOpen ? '' : 'flex flex-col items-center'} overflow-y-auto overflow-x-hidden max-h-[calc(100vh-8rem)]`}>
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner className="w-6 h-6 text-primary" />
          </div>
        ) : error ? (
          <div className={`text-sm p-2 ${
            isDark ? 'text-red-400' : 'text-red-500'
          }`}>
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className={`text-sm p-2 ${
            isDark ? 'text-white/70' : 'text-gray-500'
          }`}>
            {isOpen ? 'No categories available' : 'None'}
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={getCategoryId(category)}
              to={`/categories/${getCategoryId(category)}`}
              onClick={() => handleCategoryClick(category)}
              state={{ fromSidebar: true }}
              className={`flex items-center p-2 mb-3 rounded-lg transition-all ${
                isOpen ? '' : 'justify-center'
              } ${
                isDark 
                  ? 'text-white hover:bg-white/20' 
                  : 'text-gray-700 hover:bg-gray-100/80'
              }`}
              title={!isOpen ? category.name : ''}
            >
              <div className={`flex items-center justify-center ${
                isOpen ? 'w-10 h-10' : 'w-12 h-12'
              } rounded-full ${
                isDark 
                  ? 'bg-white/10 text-white shadow-inner' 
                  : 'bg-primary/10 text-primary shadow-sm'
              }`}>
                {category.icon ? (
                  <IconRenderer 
                    iconName={category.icon} 
                    className={`${isOpen ? 'w-5 h-5' : 'w-6 h-6'}`} 
                  />
                ) : (
                  <span className="text-lg font-medium">
                    {category.name.charAt(0)}
                  </span>
                )}
              </div>
              
              {isOpen && (
                <span className="ml-3 font-medium truncate">{category.name}</span>
              )}
            </Link>
          ))
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;