import { useState, useEffect } from 'react';
import { searchProducts } from '../../services/productService';

const FilterPanel = ({ categories, filters, onFilterChange }) => {
    const [searchTerm, setSearchTerm] = useState(filters.searchQuery || '');
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);

    // Sync local state if filters change externally
    useEffect(() => {
        setSearchTerm(filters.searchQuery || '');
    }, [filters.searchQuery]);

    const handleSearchClick = async () => {
        if (!searchTerm.trim()) return;
        
        try {
            setIsSearching(true);
            setError(null);
            console.log("Searching for:", searchTerm);
            
            const results = await searchProducts(searchTerm);
            console.log("Search results:", results);
            
            // Check if results is empty or undefined
            if (!results || (Array.isArray(results) && results.length === 0)) {
                setError("No products found matching your search.");
                // Pass empty results to parent to clear any previous results
                onFilterChange('searchResults', []);
                onFilterChange('isSearchResults', false);
                return;
            }
            
            // Pass the search query and results to parent component
            onFilterChange('searchQuery', searchTerm);
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
        setError(null);
        onFilterChange('searchQuery', '');
        onFilterChange('searchResults', []);
        onFilterChange('isSearchResults', false);
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Search Products
              </label>
              {filters.isSearchResults && (
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Search
                </button>
              )}
            </div>
            <div className="flex gap-2 items-center">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow p-2 border rounded-md h-10"
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
              <div className="mt-2 text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="w-1/2 p-2 border rounded-md"
                placeholder="Min price"
              />
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="w-1/2 p-2 border rounded-md"
                placeholder="Max price"
              />
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                onFilterChange('sortBy', sortBy);
                onFilterChange('sortOrder', sortOrder);
              }}
              className="w-full p-2 border rounded-md"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

export default FilterPanel;