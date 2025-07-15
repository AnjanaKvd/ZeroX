import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentCurrency, getPublicSettings } from '../services/settingsService';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrency();
  }, []);

  const fetchCurrency = async () => {
    try {
      setLoading(true);
      const currencyData = await getCurrentCurrency();
      setCurrency(currencyData.currency || 'USD');
    } catch (error) {
      // Default to USD in case of error
      setCurrency('USD');
    } finally {
      setLoading(false);
    }
  };

  // Get the currency symbol based on the current currency
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'LKR':
        return 'Rs.';
      default:
        return '$';
    }
  };

  // Format a price according to the current currency
  const formatPrice = (amount) => {
    const symbol = getCurrencySymbol();
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        loading, 
        getCurrencySymbol, 
        formatPrice,
        refreshCurrency: fetchCurrency 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}; 