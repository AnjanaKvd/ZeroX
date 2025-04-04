import { useTheme } from '../../context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="p-2 rounded-full bg-opacity-20 hover:bg-opacity-30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-secondary" />
      ) : (
        <SunIcon className="h-5 w-5 text-secondary-dark" />
      )}
    </button>
  );
};

export default ThemeToggle; 