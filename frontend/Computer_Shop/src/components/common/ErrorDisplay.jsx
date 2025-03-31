import React from 'react';

const ErrorDisplay = ({ error, onRetry }) => {
  if (!error) return null;
  
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unknown error occurred';
  };
  
  const getErrorType = () => {
    if (!error.type) return 'Error';
    
    switch (error.type) {
      case 'authentication': return 'Authentication Error';
      case 'authorization': return 'Authorization Error';
      case 'not_found': return 'Not Found';
      case 'validation': return 'Validation Error';
      case 'server': return 'Server Error';
      case 'network': return 'Network Error';
      default: return 'Error';
    }
  };
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{getErrorType()}</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{getErrorMessage()}</p>
          </div>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="mt-2 px-3 py-1 text-sm font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 