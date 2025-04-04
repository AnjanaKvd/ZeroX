import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../../services/categoryService';
import { Spinner } from '../LoadingSpinner/Spinner';
import { IconRenderer } from '../../../utils/iconRegistry';
import { useTheme } from '../../../context/ThemeContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryId = (category) => {
    return category.id || category._id || category.uuid || '';
  };

  return (
    <aside className={`h-screen border-r border-border transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    } bg-surface`}>
      <button
        onClick={onToggle}
        className={`w-full p-4 hover:bg-background transition-colors ${
          theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
        }`}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? '←' : '→'}
      </button>
      
      <nav className={`p-4 ${isOpen ? '' : 'flex flex-col items-center'}`}>
        {loading ? (
          <div className="flex justify-center p-4">
            <Spinner className={`w-6 h-6 ${
              theme === 'dark' ? 'text-primary' : 'text-primary'
            }`} />
          </div>
        ) : error ? (
          <div className={`text-sm p-2 ${
            theme === 'dark' ? 'text-error-dark' : 'text-error-light'
          }`}>
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className={`text-sm p-2 ${
            theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
          }`}>
            {isOpen ? 'No categories available' : 'None'}
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={getCategoryId(category)}
              to={`/category/${category.slug}`}
              className={`flex items-center p-2 mb-2 rounded-lg hover:bg-background transition-colors ${
                isOpen ? '' : 'justify-center'
              } ${
                theme === 'dark' 
                  ? 'text-text-dark-primary' 
                  : 'text-text-light-primary'
              }`}
              title={!isOpen ? category.name : ''}
            >
              <span className={isOpen ? '' : 'text-center'}>
                {category.icon ? (
                  <IconRenderer 
                    iconName={category.icon} 
                    className={`${isOpen ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} 
                  />
                ) : (
                  <div className={`${
                    isOpen ? 'w-5 h-5' : 'w-6 h-6'
                  } rounded-full flex items-center justify-center ${
                    theme === 'dark' 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {category.name.charAt(0)}
                  </div>
                )}
              </span>
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