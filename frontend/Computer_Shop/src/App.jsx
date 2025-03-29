import { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingOverlay from './components/common/LoadingOverlay';
import useApiHealthCheck from './hooks/useApiHealthCheck';
import './assets/styles/index.css';

const App = () => {
  const { apiConnected, apiCheckComplete } = useApiHealthCheck();

  return (
    <ErrorBoundary>
      <AuthProvider>
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
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;