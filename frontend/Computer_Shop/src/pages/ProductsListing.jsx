import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, searchProducts, sortProducts } from '../services/productService';
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/common/FilterPanel';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import ErrorDisplay from '../components/common/ErrorDisplay';
import { useTheme } from '../context/ThemeContext';

const ProductsListing = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const [state, setState] = useState({
    // Raw data
    products: [], // Original products (all or search results)
    
    // Processed data
    filteredProducts: [], // Products after price filtering
    sortedProducts: [], // Final products to display after filtering and sorting
    
    // UI state
    loading: true,
    error: null,
    
    // Filter and sort settings
    filters: {
      // Search settings
      searchQuery: searchQuery,
      isSearchResults: !!searchQuery, // Whether current products are from search
      
      // Price filter settings
      minPrice: '',
      maxPrice: '',
      isPriceFiltered: false, // Whether price filter is applied
      
      // Sort settings
      sortBy: 'name',
      sortOrder: 'asc'
    }
  });

  // Handle search and initial data fetch
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        let products = [];
        
        if (searchQuery) {
          // If there's a search query, perform search
          const searchResults = await searchProducts(searchQuery);
          products = Array.isArray(searchResults) ? searchResults : [];
          
          setState(prev => ({
            ...prev,
            products,
            sortedProducts: products,
            loading: false,
            error: null,
            filters: {
              ...prev.filters,
              searchQuery,
              isSearchResults: true
            }
          }));
        } else if (category) {
          // If there's a category filter, fetch products by category
          const response = await getProducts({ categoryId: category });
          products = response.content || response || [];
          
          setState(prev => ({
            ...prev,
            products,
            sortedProducts: products,
            loading: false,
            error: null,
            filters: {
              ...prev.filters,
              searchQuery: '',
              isSearchResults: false
            }
          }));
        } else {
          // Otherwise, fetch all products
          const response = await getProducts();
          products = response.content || response || [];
          
          setState(prev => ({
            ...prev,
            products,
            sortedProducts: products,
            loading: false,
            error: null,
            filters: {
              ...prev.filters,
              searchQuery: '',
              isSearchResults: false
            }
          }));
        }
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: 'Failed to load products. Please try again later.',
          loading: false
        }));
      }
    };

    fetchProducts();
  }, [searchQuery, category]);

  // Process filtered and sorted products when data changes
  useEffect(() => {
    if (!state.products.length) return;
    
    const { sortBy, sortOrder, minPrice, maxPrice } = state.filters;
    
    // First filter by price if needed
    let filtered = [...state.products];
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE;
      
      filtered = filtered.filter(product => {
        const productPrice = typeof product.price === 'number' 
          ? product.price 
          : parseFloat(product.price || '0');
        
        return !isNaN(productPrice) && productPrice >= min && productPrice <= max;
      });
    }
    
    // Then sort the filtered results
    let sorted = [...filtered];
    try {
      sorted = sortProducts(filtered, sortBy, sortOrder);
    } catch (error) {
    }
    
    setState(prev => ({
      ...prev,
      filteredProducts: filtered,
      sortedProducts: sorted
    }));
  }, [state.products, state.filters.sortBy, state.filters.sortOrder, state.filters.minPrice, state.filters.maxPrice]);

  // Handle filter changes from FilterPanel
  const handleFilterChange = (name, value) => {
    // Special handling for search results
    if (name === 'searchResults' && Array.isArray(value)) {
      
      // Update products and set search mode
      setState(prev => ({
        ...prev,
        products: value,
        loading: false,
        filters: {
          ...prev.filters,
          isSearchResults: true
        }
      }));
      return;
    }
    
    // For all other filter changes
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value
      }
    }));
  };

  // Handle sort changes
  const handleSortChange = (sortBy, sortOrder) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        sortBy,
        sortOrder
      }
    }));
  };

  // Get heading based on current filters
  const getHeadingText = () => {
    const { isSearchResults } = state.filters;
    
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    
    if (category) {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      return categoryName === 'Laptops' ? 'Laptops & Computers' : categoryName;
    }
    
    return 'All Products';
  };

  if (state.error) {
    return <ErrorDisplay message={state.error} />;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold mb-6 ${
          theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
        }`}>
          {getHeadingText()}
        </h1>
        
        <FilterPanel
          filters={state.filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          theme={theme}
          className="mb-8"
        />
        
        {state.loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner theme={theme} />
          </div>
        ) : (
          <>
            {state.sortedProducts && state.sortedProducts.length > 0 ? (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  {state.sortedProducts.length} products found
                  {state.filters.minPrice || state.filters.maxPrice ? (
                    <span> (price range: ${state.filters.minPrice || '0'}-${state.filters.maxPrice || 'max'})</span>
                  ) : null}
                </div>
                <ProductGrid 
                  products={state.sortedProducts} 
                  theme={theme}
                />
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-lg text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsListing; 