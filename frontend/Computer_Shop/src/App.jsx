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

  useEffect(() => {
    // Debug CORS issues by testing a simple request
    const testCors = async () => {
      try {
        console.log("Testing CORS with a simple fetch request...");
        const response = await fetch("http://localhost:8080/api/products?page=0&size=1", {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (response.ok) {
          console.log("CORS test successful! Server is accessible.");
          const data = await response.json();
          console.log("Sample data:", data);
        } else {
          console.error("CORS test failed with status:", response.status);
          const text = await response.text();
          console.error("Error details:", text);
        }
      } catch (error) {
        console.error("CORS test failed with error:", error);
        if (error.message.includes("No 'Access-Control-Allow-Origin'")) {
          console.error("This is a CORS issue! Make sure your Spring Boot has proper CORS configuration.");
        }
      }
    };
    
    testCors();
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {apiCheckComplete && !apiConnected && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-0 left-0 right-0 z-50 text-center">
              Unable to connect to the backend API. Please ensure your backend server is running.
            </div>
          )}
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
