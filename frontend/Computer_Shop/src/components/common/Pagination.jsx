// src/components/common/Pagination.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showPageNumbers = true,
  maxPageButtons = 5,
  className,
  showItemCount = true,
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Calculate range of page numbers to show
    let startPage = Math.max(0, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(0, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {showItemCount && (
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, totalPages * 12)} of {totalPages * 12} items
        </div>
      )}
      
      <nav className="flex gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || disabled}
          className={`px-3 py-1 rounded ${
            currentPage === 0 || disabled 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        
        {showPageNumbers && (
          <div className="flex space-x-1">
            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                disabled={disabled}
                className={`w-10 h-10 rounded flex items-center justify-center ${
                  pageNum === currentPage
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {pageNum + 1}
              </button>
            ))}
          </div>
        )}
        
        {!showPageNumbers && (
          <span className="text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
        )}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1 || disabled}
          className={`px-3 py-1 rounded ${
            currentPage >= totalPages - 1 || disabled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  showPageNumbers: PropTypes.bool,
  maxPageButtons: PropTypes.number,
  className: PropTypes.string,
  showItemCount: PropTypes.bool,
};

export default Pagination;