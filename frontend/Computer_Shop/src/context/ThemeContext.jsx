import { createContext, useState, useEffect, useContext } from 'react';

// Define theme colors
export const themeColors = {
  light: {
    primary: '#1AA5DE',
    secondary: '#546575',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#212529',
    textSecondary: '#546575',
    accent: '#F57C00',
    success: '#2E7D32',
    error: '#D32F2F'
  },
  dark: {
    primary: '#1AA5DE',
    secondary: '#546575',
    background: '#121212',
    surface: '#1E1E1E',
    textPrimary: '#E0E0E0',
    textSecondary: '#A0AAB4',
    accent: '#F57C00',
    success: '#66BB6A',
    error: '#EF5350'
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Check if user has previously selected a theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  const [theme, setTheme] = useState(savedTheme);
  const [colors, setColors] = useState(themeColors[savedTheme]);
  
  // Update theme in localStorage and HTML when changed
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    setColors(themeColors[theme]);
  }, [theme]);
  
  // Check system preference on initial load
  useEffect(() => {
    const checkSystemPreference = () => {
      if (!localStorage.getItem('theme')) {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(systemPrefersDark ? 'dark' : 'light');
      }
    };
    
    checkSystemPreference();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}; 