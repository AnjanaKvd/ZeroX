import { useTheme } from '../../context/ThemeContext';

const ThemedText = ({ 
  children, 
  className = '', 
  variant = 'primary', // 'primary', 'secondary', 'accent', etc.
  as: Component = 'span',
  size = 'base' // 'xs', 'sm', 'base', 'lg', 'xl', '2xl', etc.
}) => {
  const { theme } = useTheme();
  
  const getTextColorClass = () => {
    switch (variant) {
      case 'primary':
        return theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary';
      case 'secondary':
        return theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary';
      case 'accent':
        return 'text-accent';
      case 'error':
        return theme === 'dark' ? 'text-error-dark' : 'text-error-light';
      case 'success':
        return theme === 'dark' ? 'text-success-dark' : 'text-success-light';
      case 'brand':
        return 'text-primary';
      default:
        return theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'text-xs';
      case 'sm': return 'text-sm';
      case 'base': return 'text-base';
      case 'lg': return 'text-lg';
      case 'xl': return 'text-xl';
      case '2xl': return 'text-2xl';
      case '3xl': return 'text-3xl';
      default: return 'text-base';
    }
  };
  
  return (
    <Component className={`transition-colors duration-300 ${getTextColorClass()} ${getSizeClass()} ${className}`}>
      {children}
    </Component>
  );
};

export default ThemedText; 