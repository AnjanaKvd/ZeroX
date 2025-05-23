/**
 * Barcode scanner utility functions - Optimized for speed
 */

/**
 * Find the most frequently occurring code in an array of scanned codes
 * Returns the code only if it appears at least twice (for validation)
 * 
 * @param {Array} codes - Array of scanned code strings
 * @param {Number} minOccurrences - Minimum occurrences required (default: 2)
 * @returns {String|null} The most frequent code or null if validation threshold not met
 */
export const findMostFrequentCode = (codes, minOccurrences = 2) => {
  if (!codes || !codes.length) return null;
  
  const frequency = {};
  let maxFreq = 0;
  let mostFrequentCode = codes[0];
  
  codes.forEach(code => {
    frequency[code] = (frequency[code] || 0) + 1;
    if (frequency[code] > maxFreq) {
      maxFreq = frequency[code];
      mostFrequentCode = code;
    }
  });
  
  // Only return the code if it appears at least the minimum number of times
  return maxFreq >= minOccurrences ? mostFrequentCode : null;
};

/**
 * Play a beep sound to indicate successful scan
 */
export const playSuccessBeep = () => {
  try {
    // Use a simple beep sound
    const beep = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
    beep.volume = 0.5;
    beep.play().catch(e => console.error('Could not play scan sound', e));
  } catch (e) {
    console.error('Could not create audio', e);
  }
};

/**
 * Checks if a code is likely an EAN-13 barcode
 * @param {String} barcode - The barcode to check
 * @returns {Boolean} - Whether it's likely an EAN-13 barcode
 */
export const isEAN13 = (barcode) => {
  if (!barcode) return false;
  
  // Clean the code to only have digits
  const cleanedCode = barcode.replace(/\D/g, '');
  
  // Standard EAN-13 is 13 digits
  return cleanedCode.length === 13;
};

/**
 * Validate an EAN-13 barcode with check digit
 * @param {String} barcode - The barcode to validate
 * @returns {Boolean} - Whether it's a valid EAN-13
 */
export const validateEAN13 = (barcode) => {
  if (!barcode || !/^\d{13}$/.test(barcode)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(barcode[12]) === checkDigit;
};

/**
 * Extract the complete EAN-13 from partial scans
 * @param {String} barcode - The partial barcode scan
 * @returns {String|null} - The extracted EAN-13 or null if not extractable
 */
export const extractEAN13 = (barcode) => {
  if (!barcode) return null;
  
  // Clean to digits only
  const digits = barcode.replace(/\D/g, '');
  
  // Examples of handling specific barcode formats
  
  // Case 1: If it's exactly 13 digits, it's already an EAN-13
  if (digits.length === 13) {
    // Optionally validate check digit
    return digits;
  }
  
  // Case 2: If it's longer than 13 digits, extract the first 13
  if (digits.length > 13) {
    return digits.substring(0, 13);
  }
  
  // Case 3: If it's a partial scan but contains the start of an EAN-13
  // with a known prefix from product seen in testing (like 6954851...)
  if (digits.length >= 8 && digits.startsWith('695485')) {
    // This is a common prefix seen in your scans
    return null; // We don't have enough info to reconstruct the full code
  }
  
  return null;
};

/**
 * Get international standard barcode format based on length
 * @param {String} barcode - Raw barcode
 * @returns {Object} Information about the barcode format
 */
export const getBarcodeFormat = (barcode) => {
  if (!barcode) return { type: 'unknown', isValid: false };
  
  const cleaned = barcode.replace(/\D/g, '');
  const length = cleaned.length;

  // Common international barcode formats
  if (length === 8) return { type: 'EAN-8', isValid: true };
  if (length === 12) return { type: 'UPC-A', isValid: true };
  if (length === 13) {
    // Check if it's specifically an EAN-13
    const isValidEAN = validateEAN13(cleaned);
    return { 
      type: 'EAN-13', 
      isValid: true,
      validChecksum: isValidEAN
    };
  }
  if (length === 14) return { type: 'GTIN-14', isValid: true };
  
  // Special cases for partial scans
  if (length >= 6 && cleaned.startsWith('69')) {
    return { 
      type: 'partial-EAN-13',
      isValid: true,
      prefix: cleaned.substring(0, 6),
      possibleFull: cleaned.length >= 12
    };
  }
  
  if (length >= 8 && length <= 14) return { type: 'partial', isValid: true };
  
  // Internal code that isn't a standard format but still might be valid
  return { type: 'custom', isValid: length > 4 };
};

/**
 * Format barcode for display or storage
 * Cleans up the barcode by removing unwanted characters
 * 
 * @param {String} barcode - The scanned barcode
 * @returns {String} Cleaned barcode
 */
export const formatBarcode = (barcode) => {
  if (!barcode) return '';
  
  // First trim and remove any non-alphanumeric characters except dashes and underscores
  return barcode.trim().replace(/[^\w-]/g, '');
};

/**
 * Normalize different barcode formats to a consistent format
 * Fast implementation that only does essential normalization
 * 
 * @param {String} barcode - The scanned barcode
 * @returns {String} Normalized barcode
 */
export const normalizeBarcode = (barcode) => {
  if (!barcode) return '';
  
  // First clean the barcode of non-alphanumeric characters
  return barcode.trim().replace(/[^\w-]/g, '');
};

/**
 * Try to match and extract the full EAN-13 based on a reference code
 * @param {String} partialCode - The partial code from scanner
 * @param {String} referenceCode - The known full code to match against
 * @returns {String|null} The full code if matched, otherwise null
 */
export const extractMatchingEAN13 = (partialCode, referenceCode) => {
  // If we have an exact match or the partial code contains the reference
  if (partialCode === referenceCode || referenceCode.includes(partialCode)) {
    return referenceCode;
  }
  
  // If at least 6 consecutive digits match with the reference
  const minMatchLength = 6;
  for (let i = 0; i <= referenceCode.length - minMatchLength; i++) {
    const segment = referenceCode.substring(i, i + minMatchLength);
    if (partialCode.includes(segment)) {
      return referenceCode;
    }
  }
  
  return null;
};

/**
 * Check if two barcodes are equivalent (even if not exactly the same)
 * @param {String} barcode1 - First barcode
 * @param {String} barcode2 - Second barcode
 * @returns {Boolean} - Whether they are equivalent
 */
export const areBarcodesEquivalent = (barcode1, barcode2) => {
  // If they're exactly the same, they're equivalent
  if (barcode1 === barcode2) return true;
  
  // If either is invalid, they're not equivalent
  if (!barcode1 || !barcode2) return false;

  // If one contains the other, they might be equivalent
  if (barcode1.includes(barcode2) || barcode2.includes(barcode1)) {
    return true;
  }
  
  return false;
};

/**
 * Get optimal camera constraints for barcode scanning
 * @returns {Object} Camera constraints object
 */
export const getOptimalCameraConstraints = () => {
  return {
    video: {
      facingMode: 'environment',
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 30 }
    },
    audio: false
  };
};

/**
 * Get common barcode formats for standard retail products
 * @returns {Array} List of common barcode format names
 */
export const getCommonBarcodeFormats = () => {
  return [
    'EAN_13',
    'EAN_8',
    'UPC_A',
    'UPC_E',
    'CODE_128'
  ];
};

/**
 * Get ZXing barcode formats for modern scanner implementation
 * 
 * @returns {Array} List of BarcodeFormat constants from @zxing/library
 * @requires import { BarcodeFormat } from '@zxing/library'
 */
export const getZXingBarcodeFormats = () => {
  // This should be used with @zxing/library's BarcodeFormat
  return [
    'EAN_13',
    'EAN_8',
    'UPC_A',
    'UPC_E',
    'CODE_128'
  ];
}; 