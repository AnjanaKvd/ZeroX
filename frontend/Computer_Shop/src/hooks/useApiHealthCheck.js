// hooks/useApiHealthCheck.js
import { useEffect, useState } from 'react';
import { checkApiConnection } from '../services/apiHealthCheck';

export default function useApiHealthCheck() {
  const [apiConnected, setApiConnected] = useState(true);
  const [apiCheckComplete, setApiCheckComplete] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkApiConnection();
        setApiConnected(isConnected);
      } catch (error) {
        console.error("API Health Check Error:", error);
        setApiConnected(false);
      } finally {
        setApiCheckComplete(true);
      }
    };
    
    checkConnection();
  }, []);

  return { apiConnected, apiCheckComplete };
}