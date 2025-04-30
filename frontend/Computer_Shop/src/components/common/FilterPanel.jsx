import { useState, useEffect } from 'react';
import { searchProducts } from '../../services/productService';

const FilterPanel = ({ categories, filters, onFilterChange, onSortChange = () => {} }) => {
    const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
    const [minPrice, setMinPrice] = useState(filters.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [validationError, setValidationError] = useState(null);

    // Sync local state if filters change externally
    useEffect(() => {
        setSearchTerm(filters.searchQuery || '');
        setMinPrice(filters.minPrice || '');
        setMaxPrice(filters.maxPrice || '');
    }, [filters.searchQuery, filters.minPrice, filters.maxPrice]);

    // Validate search and price inputs
    const validateInputs = (checkSearchOnly = false) => {
        // Clear previous errors
        setValidationError(null);
        
        // Validate search term (only allow alphanumeric characters)
        if (searchTerm && !/^[a-zA-Z0-9\s]+$/.test(searchTerm)) {
            setValidationError("Search term should only contain letters, numbers, and spaces");
            return false;
        }
        
        // If we're only checking search, return true if we got this far
        if (checkSearchOnly) return true;
        
        // Validate price fields if either is provided
        if (minPrice || maxPrice) {
            // Ensure both min and max are provided
            if (minPrice && !maxPrice) {
                setValidationError("Max price is required when min price is specified");
                return false;
            }
            
            if (!minPrice && maxPrice) {
                setValidationError("Min price is required when max price is specified");
                return false;
            }
            
            // Parse prices as numbers for comparison
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            
            // Check if prices are valid numbers
            if (isNaN(min) || isNaN(max)) {
                setValidationError("Price values must be valid numbers");
                return false;
            }
            
            // Ensure min price is less than max price
            if (min >= max) {
                setValidationError("Min price must be less than max price");
                return false;
            }
            
            // Ensure prices are positive
            if (min < 0 || max < 0) {
                setValidationError("Prices cannot be negative");
                return false;
            }
        }
        
        return true;
    };

    const handleSearchClick = async () => {
        // Validate inputs before proceeding
        if (!validateInputs()) return;
        
        // Prevent empty searches
        if (!searchTerm.trim() && !minPrice && !maxPrice) {
            setValidationError("Please enter a search term or price range");
            return;
        }
        
        try {
            setIsSearching(true);
            setError(null);
            console.log("Searching for:", searchTerm, "Min Price:", minPrice, "Max Price:", maxPrice);
            
            // Always update parent component filters before search
            onFilterChange('minPrice', minPrice);
            onFilterChange('maxPrice', maxPrice);
            onFilterChange('searchQuery', searchTerm);
            
            const results = await searchProducts(searchTerm, {
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined
            });
            console.log("Search results:", results);
            
            // Check if results is empty or undefined
            if (!results || (Array.isArray(results) && results.length === 0)) {
                setError("No products found matching your search criteria.");
                // Pass empty results to parent to clear any previous results
                onFilterChange('searchResults', []);
                onFilterChange('isSearchResults', true); // Still set to true for proper display
                return;
            }
            
            // Pass the search results to parent component
            onFilterChange('searchResults', results);
            onFilterChange('isSearchResults', true); // Flag to indicate search mode
        } catch (error) {
            console.error('Search failed:', error);
            setError("Failed to search products. Please try again.");
            onFilterChange('searchResults', []);
            onFilterChange('isSearchResults', false);
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        setMinPrice('');
        setMaxPrice('');
        setError(null);
        setValidationError(null);
        onFilterChange('searchQuery', '');
        onFilterChange('minPrice', '');
        onFilterChange('maxPrice', '');
        onFilterChange('searchResults', []);
        onFilterChange('isSearchResults', false);
    };
    
    // Handle change in price inputs
    const handlePriceChange = (field, value) => {
        // Only allow numbers and decimal point
        if (value && !/^[0-9]*\.?[0-9]*$/.test(value)) return;
        
        if (field === 'min') {
            setMinPrice(value);
        } else {
            setMaxPrice(value);
        }
    };

    return (
      <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
        <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Products
              </label>
              {(filters.isSearchResults || filters.minPrice || filters.maxPrice) && (
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearchClick}
                disabled={isSearching}
                className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 h-10 ${
                  isSearching ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  // Auto-validate as user types
                  if (value && !/^[a-zA-Z0-9\s]*$/.test(value)) {
                    setValidationError("Search term should only contain letters, numbers, and spaces");
                  } else {
                    // Clear error if it was a search term error
                    if (validationError && validationError.includes("Search term")) {
                      setValidationError(null);
                    }
                  }
                  setSearchTerm(value);
                }}
                className={`flex-grow p-2 border rounded-md h-10 ${
                  validationError && validationError.includes("Search term") ? 'border-red-500' : ''
                }`}
                placeholder="Search by name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isSearching) {
                    handleSearchClick();
                  }
                }}
                disabled={isSearching}
              />
            </div>
            
            {/* Display only error message if search fails */}
            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={minPrice}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  validationError && (validationError.includes("Min price") || validationError.includes("Price values")) 
                    ? 'border-red-500' : ''
                }`}
                placeholder="Min price"
              />
              <input
                type="text"
                value={maxPrice}
                onChange={(e) => handlePriceChange('max', e.target.value)}
                className={`w-full p-2 border rounded-md ${
                  validationError && (validationError.includes("Max price") || validationError.includes("Price values")) 
                    ? 'border-red-500' : ''
                }`}
                placeholder="Max price"
              />
              <button
                onClick={handleSearchClick}
                disabled={isSearching}
                className={`px-3 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 h-10 ${
                  isSearching ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                title="Filter by price range"
              >
                Filter
              </button>
            </div>
            
            {/* Display validation error */}
            {validationError && (
              <div className="mt-2 text-sm text-red-600">
                {validationError}
              </div>
            )}
          </div>
  
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                
                // Apply sort immediately
                onSortChange(sortBy, sortOrder);
                
                // If we have search results and price filters, apply them too
                if (filters.isSearchResults && (minPrice || maxPrice)) {
                  // Validate price inputs
                  if (!validateInputs()) return;
                  
                  console.log(`Applying price filter: $${minPrice}-$${maxPrice} with sort: ${sortBy} (${sortOrder})`);
                  
                  // Update parent filters with current price values
                  onFilterChange('minPrice', minPrice);
                  onFilterChange('maxPrice', maxPrice);
                }
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

export default FilterPanel;