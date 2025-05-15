import React, { useState } from 'react';
import BarcodeScanner from './BarcodeScanner';
import QuaggaScanner from './QuaggaScanner';
import { normalizeBarcode } from '../../utils/barcodeUtils';

const BarcodeInput = ({ 
  value, 
  onChange, 
  label = "SKU", 
  placeholder = "Enter or scan SKU/Barcode",
  className = "", 
  required = false,
  disabled = false 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerType, setScannerType] = useState('react-qr-scanner'); // or 'quagga'
  const [scanError, setScanError] = useState(null);

  const handleScan = (scannedCode) => {
    if (scannedCode && scannedCode.trim()) {
      console.log('BarcodeInput received code:', scannedCode);
      
      // Process and apply the barcode immediately
      const formattedCode = normalizeBarcode(scannedCode.trim());
      onChange(formattedCode);
      
      // Flash the input field to show success
      const inputEl = document.querySelector('input[type="text"]');
      if (inputEl) {
        inputEl.classList.add('bg-green-100');
        setTimeout(() => {
          inputEl.classList.remove('bg-green-100');
        }, 300);
      }
      
      setIsScanning(false);
      setScanError(null);
    } else {
      setScanError('Invalid barcode scanned. Please try again.');
    }
  };

  const handleScanError = (errorMessage) => {
    setScanError(errorMessage);
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
  };

  const startScanning = (e, type = 'react-qr-scanner') => {
    // Prevent default behavior for button click
    if (e) e.preventDefault();
    
    if (disabled) return;
    setScannerType(type);
    setIsScanning(true);
    setScanError(null);
  };

  const switchScannerType = () => {
    setScannerType(scannerType === 'react-qr-scanner' ? 'quagga' : 'react-qr-scanner');
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500 transition-colors duration-200"
          disabled={disabled}
          required={required}
          // Open scanner when the input field is clicked if empty
          onClick={() => {
            if (!value && !disabled) {
              startScanning(null);
            }
          }}
        />
        <div className="flex">
          <button
            type="button"
            onClick={(e) => startScanning(e, 'react-qr-scanner')}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400"
            title="Scan barcode with primary scanner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
              <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => startScanning(e, 'quagga')}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400"
            title="Scan barcode with fallback scanner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 1v3m-4 0h8" />
            </svg>
          </button>
        </div>
      </div>
      
      {scanError && (
        <div className="mt-1 text-sm text-red-600">{scanError}</div>
      )}

      {isScanning && (
        <>
          {scannerType === 'react-qr-scanner' ? (
            <BarcodeScanner 
              onScan={handleScan} 
              onClose={() => setIsScanning(false)}
              onSwitch={switchScannerType}
              onError={handleScanError}
            />
          ) : (
            <QuaggaScanner 
              onScan={handleScan} 
              onClose={() => setIsScanning(false)}
              onError={handleScanError}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BarcodeInput; 