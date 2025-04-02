import React from 'react';

const ApiErrorDisplay = ({ error, retry = null }) => {
  if (!error) return null;
  
  const getErrorMessage = () => {
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'An unknown error occurred';
  };
  
  const getErrorType = () => {
    if (error.type === 'authentication') return 'Authentication Error';
    if (error.type === 'authorization') return 'Authorization Error';
    if (error.type === 'not_found') return 'Not Found';
    if (error.type === 'validation') return 'Validation Error';
    if (error.type === 'server') return 'Server Error';
    if (error.type === 'network') return 'Network Error';
    return 'Error';
  };
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{getErrorType()}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{getErrorMessage()}</p>
          </div>
          {retry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={retry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiErrorDisplay; 