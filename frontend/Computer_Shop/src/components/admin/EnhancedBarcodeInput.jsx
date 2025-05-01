import React, { useState } from 'react';
import PrimaryScannerComponent from './PrimaryScannerComponent';
import QuaggaScanner from './QuaggaScanner';
import { normalizeBarcode } from '../../utils/barcodeUtils';

const EnhancedBarcodeInput = ({ 
  value, 
  onChange, 
  label = "SKU", 
  placeholder = "Enter or scan SKU/Barcode",
  className = "", 
  required = false,
  disabled = false 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannerType, setScannerType] = useState('primary'); // or 'quagga'
  const [lastScannedType, setLastScannedType] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Handle the scan result from the scanner
  const handleScan = (scannedCode) => {
    if (scannedCode && scannedCode.trim()) {
      console.log('EnhancedBarcodeInput received code:', scannedCode);
      const formattedCode = normalizeBarcode(scannedCode);
      console.log('EnhancedBarcodeInput normalized code:', formattedCode);
      
      // Instead of immediately applying the code, store it and show confirmation
      setScannedResult(formattedCode);
      setShowConfirmation(true);
      setIsScanning(false); // Close the scanner
      
      // Remember last successful scanner type
      setLastScannedType(scannerType);
    }
  };

  // Confirm and apply the scanned code
  const confirmScan = () => {
    onChange(scannedResult);
    setShowConfirmation(false);
    setScannedResult(null);
  };

  // Cancel the scan result
  const cancelScan = () => {
    setShowConfirmation(false);
    setScannedResult(null);
  };

  // Start scanning again
  const rescan = () => {
    setShowConfirmation(false);
    setScannedResult(null);
    startScanning(null);
  };

  const handleInputChange = (e) => {
    // Format the input directly as the user types
    const formattedInput = normalizeBarcode(e.target.value);
    onChange(formattedInput);
  };

  const startScanning = (e, type = null) => {
    // Prevent default behavior for button click
    if (e) e.preventDefault();
    
    if (disabled) return;
    
    // Use the last successful scanner type if available, otherwise use the specified type or default to 'primary'
    const scanType = type || lastScannedType || 'primary';
    setScannerType(scanType);
    setIsScanning(true);
  };

  const closeScanner = () => {
    setIsScanning(false);
  };

  const switchScannerType = () => {
    setScannerType(scannerType === 'primary' ? 'quagga' : 'primary');
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
          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
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
            onClick={(e) => startScanning(e, 'primary')}
            disabled={disabled}
            className={`inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400 ${lastScannedType === 'primary' ? 'bg-blue-50' : ''}`}
            title="Scan barcode with QR scanner"
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
            className={`inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400 ${lastScannedType === 'quagga' ? 'bg-blue-50' : ''}`}
            title="Scan barcode with Quagga scanner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m0 0H8m4 1v3m-4 0h8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Confirmation dialog for scanned result */}
      {showConfirmation && scannedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirm Scanned Barcode</h3>
              <button 
                onClick={cancelScan}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="mb-2">Please confirm that this is the correct barcode:</p>
              <div className="p-4 bg-gray-100 rounded-md text-center">
                <span className="text-xl font-bold">{scannedResult}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={rescan}
                className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
              >
                Scan Again
              </button>
              <button
                onClick={confirmScan}
                className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Use This Code
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <>
          {scannerType === 'primary' ? (
            <PrimaryScannerComponent 
              onScan={handleScan} 
              onClose={closeScanner}
              onSwitch={switchScannerType}
            />
          ) : (
            <QuaggaScanner 
              onScan={handleScan} 
              onClose={closeScanner} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedBarcodeInput; 