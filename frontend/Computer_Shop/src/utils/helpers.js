// src/utils/helpers.js

/**
 * Debounce function to limit the rate of execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} immediate - Whether to trigger immediately
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
      const context = this;
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
  
  /**
   * Throttle function to limit execution rate
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  export const throttle = (func, limit = 300) => {
    let lastFunc;
    let lastRan;
    return function executedFunction(...args) {
      const context = this;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };
  
  /**
   * Format date to local string
   * @param {Date|string} date - Date to format
   * @param {string} locale - Locale string
   * @returns {string} Formatted date
   */
  export const formatDate = (date, locale = 'en-US') => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString(locale, options);
  };
  
  /**
   * Format currency
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: USD)
   * @param {string} locale - Locale string
   * @returns {string} Formatted currency
   */
  export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  /**
   * Generate unique ID
   * @param {number} length - Length of ID (default: 8)
   * @returns {string} Unique ID
   */
  export const generateId = (length = 8) => {
    return Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .padEnd(length, '0');
  };
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Validation result
   */
  export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  /**
   * Truncate text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength 
      ? text.substring(0, maxLength - 3) + '...' 
      : text;
  };
  
  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  export const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  /**
   * Check mobile device
   * @returns {boolean} Whether mobile device
   */
  export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };
  
  export default {
    debounce,
    throttle,
    formatDate,
    formatCurrency,
    generateId,
    validateEmail,
    deepClone,
    truncateText,
    capitalizeFirst,
    isMobileDevice,
  };