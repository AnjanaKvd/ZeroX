import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, ShoppingCart, Trash } from 'lucide-react';

const icons = {
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  cart: <ShoppingCart className="h-5 w-5" />,
  remove: <Trash className="h-5 w-5" />
};

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose();
      }, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-500 text-green-700';
      case 'error': return 'bg-red-50 border-red-500 text-red-700';
      case 'cart': return 'bg-blue-50 border-blue-500 text-blue-700';
      case 'remove': return 'bg-orange-50 border-orange-500 text-orange-700';
      default: return 'bg-gray-50 border-gray-500 text-gray-700';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 max-w-sm w-full shadow-lg rounded-lg border-l-4 flex items-center p-4 transition-opacity duration-300 z-50 ${
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
        onClick={() => setIsVisible(false)}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast; 