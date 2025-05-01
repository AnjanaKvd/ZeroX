import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getProducts, searchProducts, sortProducts } from '../services/productService';
import HeroBanner from "../components/home/HeroBanner";
import ProductGrid from '../components/product/ProductGrid';
import FilterPanel from '../components/common/FilterPanel';
import Pagination from '../components/common/Pagination';
import ErrorDisplay from '../components/common/ErrorDisplay';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import DiscountedProducts from '../components/discount/DiscountedProducts';

const Home = () => {
  const { theme } = useTheme();
  const [state, setState] = useState({
    // Raw data
    products: [], // Original products (featured or search results)
    
    // Processed data
    filteredProducts: [], // Products after price filtering
    sortedProducts: [], // Final products to display after filtering and sorting
    
    // UI state
    loading: true,
    error: null,
    
    // Pagination
    pagination: {
      page: 0,
      totalPages: 0,
      totalElements: 0,
      size: 12
    },
    
    // Filter and sort settings
    filters: {
      // Search settings
      searchQuery: '',
      isSearchResults: false, // Whether current products are from search
      
      // Price filter settings
      minPrice: '',
      maxPrice: '',
      isPriceFiltered: false, // Whether price filter is applied
      
      // Sort settings
      sortBy: 'name',
      sortOrder: 'asc',
      
      // Pagination
      page: 1,
      pageSize: 12
    }
  });

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
      
      console.log(`Filtered products by price (${min}-${max}): ${state.products.length} → ${filtered.length}`);
    }
    
    // Then sort the filtered results
    let sorted = [...filtered];
    try {
      sorted = sortProducts(filtered, sortBy, sortOrder);
      console.log(`Sorted ${filtered.length} products by ${sortBy} (${sortOrder})`);
    } catch (error) {
      console.error('Error sorting products:', error);
    }
    
    setState(prev => ({
      ...prev,
      sortedProducts: sorted
    }));
  }, [state.products, state.filters.sortBy, state.filters.sortOrder, state.filters.minPrice, state.filters.maxPrice]);

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const productsResponse = await getProducts();
      const products = productsResponse?.content || [];

      // Reset search and filter flags when loading featured products
      setState(prev => ({
        ...prev,
        products,
        loading: false,
        error: null,
        filters: {
          ...prev.filters,
          isSearchResults: false,
          isPriceFiltered: false
        }
      }));
      
      // Products will be processed by processDataFlow effect
    } catch (err) {
      console.error('Data fetch error:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load data. Please try again later.',
        loading: false
      }));
    }
  }, []);

  // Effect to handle login state and show featured products for logged-in users
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('token') || false;
    
    if (isLoggedIn) {
      console.log("User is logged in - fetching featured products");
      fetchData();
    } else {
      // If not logged in, still show something (e.g., popular products)
      fetchData();
    }
  }, [fetchData]);

  // Apply price filtering to featured products and return both filtered and sorted results
  const handleFeaturedProductFilter = () => {
    // Start with all products, add null check
    let filtered = state.products ? [...state.products] : [];
    
    // Apply price filters if they exist
    if (state.filters.minPrice || state.filters.maxPrice) {
      const { minPrice, maxPrice } = state.filters;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE;
      
      console.log(`Filtering featured products by price range: $${min}-$${max}`);
      
      // Filter the products using our existing price filter logic
      filtered = filtered.filter(product => {
        // Add null check for product
        if (!product) return false;
        
        const productPrice = typeof product.price === 'number' 
          ? product.price 
          : parseFloat(product.price || '0');
        
        return !isNaN(productPrice) && productPrice >= min && productPrice <= max;
      });
      
      setState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          // Set isFiltered flag to indicate we're displaying filtered featured products
          isFiltered: true
        }
      }));
      
      console.log(`Filtered featured products: ${state.products ? state.products.length : 0} → ${filtered.length}`);
    }
    
    // Apply current sorting to filtered products
    const { sortBy, sortOrder } = state.filters;
    let sorted = [...filtered];
    
    try {
      if (filtered.length > 0) {
        sorted = sortProducts(filtered, sortBy, sortOrder);
        console.log(`Sorted filtered featured products by ${sortBy} (${sortOrder})`);
      }
    } catch (error) {
      console.error('Error sorting filtered featured products:', error);
    }
    
    // Return both the filtered products (for future sorting) and sorted products (for display)
    return {
      filtered,
      sorted
    };
  };

  // Effect to update featured product price filter when min/max price changes
  useEffect(() => {
    if (!state.filters.isSearchResults && state.products && state.products.length > 0) {
      try {
        // Apply filtering to featured products
        const { filtered, sorted } = handleFeaturedProductFilter();
        
        // Set filtered products (this will trigger the sorting useEffect)
        setState(prev => ({
          ...prev,
          filteredProducts: filtered || [],
          sortedProducts: sorted || []
        }));
      } catch (error) {
        console.error('Error filtering featured products:', error);
      }
    }
  }, [state.products, state.filters.minPrice, state.filters.maxPrice, state.filters.isSearchResults]);

  // Handle sort change for both search results and featured products
  const handleSortChange = (sortBy, sortOrder) => {
    console.log(`Sort changed to: ${sortBy} ${sortOrder}`);
    
    // Update state with new sort options
    setState(prev => {
      // Get the correct products to sort based on whether we're in search results or featured products
      let productsToSort = [];
      
      if (prev.filters.isSearchResults) {
        // For search results, use the products array
        productsToSort = prev.products || [];
      } else {
        // For featured products, use filteredProducts if available, otherwise use products
        productsToSort = (prev.filteredProducts && prev.filteredProducts.length > 0) 
          ? prev.filteredProducts 
          : (prev.products || []);
      }
      
      // Apply sorting immediately if we have products to sort
      let sortedProducts = productsToSort;
      try {
        if (productsToSort && productsToSort.length > 0) {
          sortedProducts = sortProducts(productsToSort, sortBy, sortOrder);
          console.log(`Sorted ${productsToSort.length} ${prev.filters.isSearchResults ? 'search results' : 'featured products'} by ${sortBy} (${sortOrder})`);
        } else {
          console.log('No products to sort');
        }
      } catch (error) {
        console.error('Error sorting in handler:', error);
      }
      
      return {
        ...prev,
        sortedProducts, // Update sorted products immediately
        filters: {
          ...prev.filters,
          sortBy,
          sortOrder
        }
      };
    });
  };

  // Effect to handle search results sorting
  useEffect(() => {
    if (state.filters.isSearchResults && state.products && state.products.length > 0) {
      const { sortBy, sortOrder } = state.filters;
      try {
        const sorted = sortProducts(state.products, sortBy, sortOrder);
        console.log(`Sorted ${state.products.length} search results by ${sortBy} (${sortOrder})`);
        
        setState(prev => ({
          ...prev,
          sortedProducts: sorted
        }));
      } catch (error) {
        console.error('Error sorting search results:', error);
      }
    }
  }, [state.products, state.filters.sortBy, state.filters.sortOrder, state.filters.isSearchResults]);

  // Effect to handle featured products sorting
  useEffect(() => {
    // Add null check for filteredProducts
    if (!state.filters.isSearchResults && state.filteredProducts && state.filteredProducts.length > 0) {
      const { sortBy, sortOrder } = state.filters;
      try {
        const sorted = sortProducts(state.filteredProducts, sortBy, sortOrder);
        console.log(`Sorted ${state.filteredProducts.length} featured products by ${sortBy} (${sortOrder})`);
        
        setState(prev => ({
          ...prev,
          sortedProducts: sorted
        }));
      } catch (error) {
        console.error('Error sorting featured products:', error);
      }
    }
  }, [state.filteredProducts, state.filters.sortBy, state.filters.sortOrder, state.filters.isSearchResults]);

  // Handle filter change (for both featured and search products)
  const handleFilterChange = (name, value) => {
    // Special handling for search results - must come before the regular state update
    if (name === 'searchResults' && Array.isArray(value)) {
      console.log(`Received ${value.length} search results`);
      
      // Update products and set search mode
      setState(prev => ({
        ...prev,
        products: value,
        filteredProducts: value, // Initialize filtered to match search results
        loading: false,
        filters: {
          ...prev.filters,
          isSearchResults: true,
          isPriceFiltered: false // Reset price filter for new search
        }
      }));
      
      // Products will be processed by the processDataFlow effect
      return;
    }
    
    // For all other filter changes
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value,
        page: name !== 'page' ? 1 : prev.filters.page // Reset page except when changing page
      }
    }));
    
    // Reset isPriceFiltered when price filters are cleared
    if ((name === 'minPrice' || name === 'maxPrice') && !value) {
      const otherPriceFilter = name === 'minPrice' ? 'maxPrice' : 'minPrice';
      const otherValue = state.filters[otherPriceFilter];
      
      if (!otherValue) {
        setState(prev => ({
          ...prev,
          filters: {
            ...prev.filters,
            isPriceFiltered: false
          }
        }));
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, state.pagination.size);
  };

  const fetchProducts = async (page = 0, size = 12) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const productsResponse = await getProducts({ page, size });
      
      if (productsResponse?.content) {
        setState(prev => ({
          ...prev,
          products: productsResponse.content,
          sortedProducts: productsResponse.content,
          pagination: {
            page: productsResponse.pageable?.pageNumber || 0,
            totalPages: productsResponse.totalPages || 1,
            totalElements: productsResponse.totalElements || 0,
            size: productsResponse.pageable?.pageSize || 12
          },
          error: null
        }));
      }
    } catch (err) {
      console.error('Products fetch error:', err);
      setState(prev => ({
        ...prev,
        error: 'Failed to load products. Please try again later.',
        products: [],
        sortedProducts: []
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Update heading text to show what we're looking at
  const getHeadingText = () => {
    const { isSearchResults, searchQuery, minPrice, maxPrice, isPriceFiltered, sortBy, sortOrder } = state.filters;
    
    // For search results
    if (isSearchResults) {
      let headingParts = [];
      
      if (searchQuery && searchQuery.trim()) {
        headingParts.push(`"${searchQuery.trim()}"`);
      }
      
      if (minPrice && maxPrice) {
        headingParts.push(`price range: $${minPrice} - $${maxPrice}`);
      } else if (minPrice) {
        headingParts.push(`min price: $${minPrice}`);
      } else if (maxPrice) {
        headingParts.push(`max price: $${maxPrice}`);
      }
      
      if (headingParts.length === 0) return 'Search Results';
      
      return `Products matching ${headingParts.join(' and ')}`;
    }
    
    // For featured products
    let featuredTitle = 'Featured Products';
    
    // Add price filter info to featured products title if filtered
    if (isPriceFiltered && (minPrice || maxPrice)) {
      if (minPrice && maxPrice) {
        featuredTitle += ` ($${minPrice} - $${maxPrice})`;
      } else if (minPrice) {
        featuredTitle += ` ($${minPrice}+)`;
      } else if (maxPrice) {
        featuredTitle += ` (up to $${maxPrice})`;
      }
    }
    
    return featuredTitle;
  };

  // Process data flow: Products -> Filtered Products -> Sorted Products
  const processDataFlow = useCallback(() => {
    // Skip if no products
    if (!state.products || state.products.length === 0) return;
    
    // 1. Start with original products
    const originalProducts = [...state.products];
    let processed = originalProducts;
    
    // 2. Apply price filtering if needed
    const { minPrice, maxPrice } = state.filters;
    if (minPrice || maxPrice) {
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE;
      
      console.log(`Filtering products by price range: $${min}-$${max}`);
      
      processed = processed.filter(product => {
        if (!product) return false;
        
        const productPrice = typeof product.price === 'number' 
          ? product.price 
          : parseFloat(product.price || '0');
        
        return !isNaN(productPrice) && productPrice >= min && productPrice <= max;
      });
      
      console.log(`Price filtered: ${originalProducts.length} → ${processed.length} products`);
      
      // Update isPriceFiltered flag
      setState(prev => ({
        ...prev,
        filters: {
          ...prev.filters,
          isPriceFiltered: true
        }
      }));
    }
    
    // 3. Apply sorting
    const { sortBy, sortOrder } = state.filters;
    let sorted = [...processed];
    
    try {
      if (processed.length > 0) {
        sorted = sortProducts(processed, sortBy, sortOrder);
        console.log(`Sorted by ${sortBy} (${sortOrder}): ${processed.length} products`);
      }
    } catch (error) {
      console.error('Error sorting products:', error);
    }
    
    // 4. Update the state with both filtered and sorted results
    setState(prev => ({
      ...prev,
      filteredProducts: processed,
      sortedProducts: sorted
    }));
  }, [state.products, state.filters.minPrice, state.filters.maxPrice, state.filters.sortBy, state.filters.sortOrder]);
  
  // Effect to trigger data processing whenever relevant state changes
  useEffect(() => {
    processDataFlow();
  }, [processDataFlow]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
      <HeroBanner
        title="Custom Gaming PCs & Components"
        subtitle="Build Your Ultimate Gaming Rig"
        ctaText="Shop Now"
        ctaLink="/products"
        theme={theme}
      />

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        
        <FilterPanel
          filters={state.filters}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          theme={theme}
          className="mb-8"
        />

        {state.error && (
          <ErrorDisplay 
            error={state.error}
            onRetry={fetchData}
            theme={theme}
            className="mb-8"
          />
        )}

        <DiscountedProducts />

        <section className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-text-dark-primary' : 'text-text-light-primary'
          }`}>
            {getHeadingText()}
          </h2>
          
          {state.loading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner theme={theme} />
            </div>
          ) : (
            <>
              {state.sortedProducts && state.sortedProducts.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-gray-500">
                    {state.sortedProducts.length} {state.filters.isSearchResults ? 'products found' : 'featured products'} 
                    {state.filters.minPrice || state.filters.maxPrice ? (
                      <span> (price range: ${state.filters.minPrice || '0'}-${state.filters.maxPrice || 'max'})</span>
                    ) : null}
                    {state.filters.sortBy && (
                      <span> • sorted by: {state.filters.sortBy === 'price' 
                        ? `price ${state.filters.sortOrder === 'asc' ? 'low to high' : 'high to low'}`
                        : `name ${state.filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`}</span>
                    )}
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
        </section>

        {!state.filters.isSearchResults && (
          <Pagination
            currentPage={state.pagination.page}
            totalPages={state.pagination.totalPages}
            onPageChange={handlePageChange}
            disabled={state.loading}
            theme={theme}
            className="mt-8"
          />
        )}
      </main>
    </div>
  );
};

export default Home;