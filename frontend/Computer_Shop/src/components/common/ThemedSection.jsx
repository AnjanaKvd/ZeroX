import { useTheme } from '../../context/ThemeContext';

const ThemedSection = ({ 
  children, 
  className = '', 
  surface = false,
  bordered = false,
  rounded = false
}) => {
  const { theme } = useTheme();
  
  const baseClasses = theme === 'dark' 
    ? `${surface ? 'bg-surface-dark' : 'bg-background-dark'} text-text-dark-primary` 
    : `${surface ? 'bg-surface-light' : 'bg-background-light'} text-text-light-primary`;
    
  const borderClasses = bordered 
    ? theme === 'dark' ? 'border border-border' : 'border border-gray-200' 
    : '';
    
  const roundedClasses = rounded ? 'rounded-lg' : '';
  
  return (
    <div className={`transition-colors duration-300 ${baseClasses} ${borderClasses} ${roundedClasses} ${className}`}>
      {children}
    </div>
  );
};

export default ThemedSection; 