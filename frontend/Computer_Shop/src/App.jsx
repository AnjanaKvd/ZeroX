import { Suspense, useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
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
        <div className="fixed top-0 left-0 right-0 bg-error-light border-b border-error-light text-white px-4 py-3 text-center z-50 dark:bg-error-dark">
          {appError}
          <button 
            className="ml-4 bg-white text-error-light dark:bg-gray-800 dark:text-error-dark px-2 py-1 rounded text-sm"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}
      
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CurrencyProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen">
                  {/* API Connection Warning */}
                  {!apiConnected && apiCheckComplete && (
                    console.log("API Connection Warning")
                  )}

                  {/* Main Application Routes */}
                  <Suspense fallback={<LoadingOverlay />}>
                    <AppRoutes />
                  </Suspense>
                </div>
              </CartProvider>
            </CurrencyProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;