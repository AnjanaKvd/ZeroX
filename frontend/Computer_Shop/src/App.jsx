import { Suspense, useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import useApiHealthCheck from './hooks/useApiHealthCheck';
import './assets/styles/index.css';

const App = () => {
  const { apiConnected, apiCheckComplete } = useApiHealthCheck();
  const [appError, setAppError] = useState(null);

  // Add global error handler
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error('Global error:', event.error);
      setAppError('An unexpected error occurred. Please refresh the page.');
    };

    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  return (
    <ErrorBoundary>
      {appError && (
        <div className="fixed top-0 left-0 right-0 bg-red-100 border-b border-red-400 text-red-700 px-4 py-3 text-center z-50">
          {appError}
          <button 
            className="ml-4 bg-red-700 text-white px-2 py-1 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}
      
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              {/* API Connection Warning */}
              {!apiConnected && apiCheckComplete && (
                <div 
                  role="alert"
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center"
                >
                  ⚠️ Warning: Connection to backend API failed. Some features may be unavailable.
                </div>
              )}

              {/* Main Application Routes */}
              <Suspense fallback={<LoadingOverlay />}>
                <AppRoutes />
              </Suspense>
            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;