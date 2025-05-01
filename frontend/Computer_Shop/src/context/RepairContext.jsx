import React, { createContext, useContext, useState } from 'react';
import {
  createRepairRequest,
  getRepairRequest,
  getUserRepairRequests,
  getRepairRequestsByStatus,
  updateRepairRequest,
} from '../services/repairService';

const RepairContext = createContext();

export const useRepair = () => useContext(RepairContext);

export const RepairProvider = ({ children }) => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepairsByStatus = async (status, page = 0, size = 10) => {
    setLoading(true);
    try {
      const data = await getRepairRequestsByStatus(status, page, size);
      console.log('API Response:', data); // Log the API response
      setRepairs(data.content || []);
    } catch (err) {
      console.error('Error fetching repairs:', err); // Log the error
      setError('Failed to fetch repair requests.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RepairContext.Provider
      value={{
        repairs,
        loading,
        error,
        createRepairRequest,
        getRepairRequest,
        getUserRepairRequests,
        fetchRepairsByStatus,
        updateRepairRequest,
      }}
    >
      {children}
    </RepairContext.Provider>
  );
};

const App = () => (
  <RepairProvider>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </RepairProvider>
);