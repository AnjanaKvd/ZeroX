import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

const PriceDisplay = ({ amount, className = "", showSymbol = true }) => {
  const { currency, formatPrice } = useCurrency();
  
  if (amount === undefined || amount === null) {
    return null;
  }

  return (
    <span className={className}>
      {formatPrice(amount)}
    </span>
  );
};

export default PriceDisplay; 