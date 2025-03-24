import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './routes/AppRoutes';
import { checkApiConnection } from './services/apiHealthCheck';
import './assets/styles/index.css';

const App = () => {
  const [apiConnected, setApiConnected] = useState(true);
  const [apiCheckComplete, setApiCheckComplete] = useState(false);

  useEffect(() => {
    // Check API connection when app loads
    const checkConnection = async () => {
      try {
        const isConnected = await checkApiConnection();
        setApiConnected(isConnected);
      } catch (error) {
        console.error("Error during API check:", error);
        setApiConnected(false);
      } finally {
        setApiCheckComplete(true);
      }
    };
    
    checkConnection();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            {!apiConnected && apiCheckComplete && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center">
                Warning: Unable to connect to the API. Some features may be limited.
              </div>
            )}
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
