import { createContext, useState, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, ShoppingCart, Trash } from 'lucide-react';

// Create the context
export const ToastContext = createContext();

// Export the hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast component
const Toast = ({ id, message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    cart: <ShoppingCart className="h-5 w-5" />,
    remove: <Trash className="h-5 w-5" />
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-500 text-green-700';
      case 'error': return 'bg-red-50 border-red-500 text-red-700';
      case 'cart': return 'bg-blue-50 border-blue-500 text-blue-700';
      case 'remove': return 'bg-orange-50 border-orange-500 text-orange-700';
      default: return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  // Use effect for auto-dismiss
  useState(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Allow time for animation
  };

  return (
    <div 
      className={`max-w-sm w-full shadow-lg rounded-lg border-l-4 flex items-center p-4 mb-3 transition-opacity duration-300 ${
        getBackgroundColor()
      } ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex-shrink-0 mr-3">
        {icons[type]}
      </div>
      <div className="flex-1">
        {message}
      </div>
      <button 
        onClick={handleClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [toastCount, setToastCount] = useState(0);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prevToasts => [...prevToasts, { id, message, type, duration }]);
    return id;
  }, []);

  const hideToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  // Convenience methods for common toast types
  const success = useCallback((message, duration) => 
    showToast(message, 'success', duration), [showToast]);
  
  const error = useCallback((message, duration) => 
    showToast(message, 'error', duration), [showToast]);
  
  const cartAdded = useCallback((message = 'Item added to cart', duration) => 
    showToast(message, 'cart', duration), [showToast]);
  
  const cartRemoved = useCallback((message = 'Item removed from cart', duration) => 
    showToast(message, 'remove', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, success, error, cartAdded, cartRemoved }}>
      {children}
      <div className="fixed top-4 right-4 z-50">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={hideToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}; 