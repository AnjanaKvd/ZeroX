import { useState, useEffect } from 'react';

const LoadingSpinner = ({ timeout = 8000 }) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  useEffect(() => {
    // If loading takes too long, show a timeout message
    const timeoutId = setTimeout(() => {
      setShowTimeoutMessage(true);
    }, timeout);
    
    return () => clearTimeout(timeoutId);
  }, [timeout]);
  
  return (
    <div className="flex flex-col justify-center items-center h-40">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
      {showTimeoutMessage && (
        <div className="text-gray-500 text-sm text-center mt-4">
          This is taking longer than expected. You may want to refresh the page.
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 