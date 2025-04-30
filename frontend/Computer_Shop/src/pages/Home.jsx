import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getProducts, searchProducts, sortProducts } from '../services/productService';
import HeroBanner from "../components/home/HeroBanner";
import ProductGrid from "../components/product/ProductGrid";
import FilterPanel from "../components/common/FilterPanel";
import Pagination from "../components/common/Pagination";
import ErrorDisplay from "../components/common/ErrorDisplay";
import LoadingSpinner from "../components/common/LoadingSpinner/LoadingSpinner";
import DiscountedProducts from "../components/discount/DiscountedProducts";

const Home = () => {
  const { theme } = useTheme();
  const [state, setState] = useState({
    products: [],
    sortedProducts: [],
    loading: true,
    error: null,
    pagination: {
      page: 0,
      totalPages: 0,
      totalElements: 0,
      size: 12,
    },
    filters: {
      searchQuery: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      sortOrder: "asc",
      page: 1,
      pageSize: 12,
      isSearchResults: false
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
      setState((prev) => ({ ...prev, loading: true }));

      const productsResponse = await getProducts();
      const products = productsResponse?.content || [];

      // Initialize both filteredProducts and sortedProducts
      setState(prev => {
        // Apply current sort settings to the fetched products
        const { sortBy, sortOrder } = prev.filters;
        let sortedProducts = products;
        
        try {
          if (products.length > 0) {
            sortedProducts = sortProducts(products, sortBy, sortOrder);
            console.log(`Initially sorted ${products.length} products by ${sortBy} (${sortOrder})`);
          }
        } catch (error) {
          console.error('Error sorting initial products:', error);
        }
        
        return {
          ...prev,
          products,
          filteredProducts: products,
          sortedProducts,
          error: null,
          loading: false
        };
      });
    } catch (err) {
      console.error("Data fetch error:", err);
      setState((prev) => ({
        ...prev,
        error: "Failed to load data. Please try again later.",
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to handle featured products on login
  useEffect(() => {
    // If user is logged in, fetch featured products
    const isLoggedIn = localStorage.getItem('token') || false;
    
    if (isLoggedIn && !state.filters.isSearchResults) {
      console.log("User is logged in - fetching featured products");
      fetchData();
    }
  }, [fetchData]);

  // Apply price filtering to featured products and return both filtered and sorted results
  const handleFeaturedProductFilter = () => {
    // Start with all products
    let filtered = [...state.products];
    
    // Apply price filters if they exist
    if (state.filters.minPrice || state.filters.maxPrice) {
      const { minPrice, maxPrice } = state.filters;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Number.MAX_VALUE;
      
      console.log(`Filtering featured products by price range: $${min}-$${max}`);
      
      // Filter the products using our existing price filter logic
      filtered = filtered.filter(product => {
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
      
      console.log(`Filtered featured products: ${state.products.length} → ${filtered.length}`);
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
    if (!state.filters.isSearchResults && state.products.length > 0) {
      // Apply filtering to featured products
      const { filtered, sorted } = handleFeaturedProductFilter();
      
      // Set filtered products (this will trigger the sorting useEffect)
      setState(prev => ({
        ...prev,
        filteredProducts: filtered,
        sortedProducts: sorted
      }));
    }
  }, [state.products, state.filters.minPrice, state.filters.maxPrice]);

  // Make sure sorting happens for both search results and featured products
  useEffect(() => {
    // Skip if no products to sort
    if (!state.filteredProducts || state.filteredProducts.length === 0) return;
    
    const { sortBy, sortOrder } = state.filters;
    
    try {
      // Apply sorting to whatever is in filteredProducts (could be search results or featured products)
      const sorted = sortProducts(state.filteredProducts, sortBy, sortOrder);
      console.log(`Sorted ${state.filteredProducts.length} products by ${sortBy} (${sortOrder})`);
      
      setState(prev => ({
        ...prev,
        sortedProducts: sorted
      }));
    } catch (error) {
      console.error('Error sorting products:', error);
    }
  }, [state.filteredProducts, state.filters.sortBy, state.filters.sortOrder]);

  const handleFilterChange = (name, value) => {
    setState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [name]: value,
        page: 1,
      },
    }));
    
    if (name === 'searchResults' && Array.isArray(value)) {
      setState(prev => ({
        ...prev,
        products: value,
        loading: false,
        filters: {
          ...prev.filters,
          isSearchResults: true
        }
      }));
    }
  };

  // Handle sort change for both search results and featured products
  const handleSortChange = (sortBy, sortOrder) => {
    console.log(`Sort changed to: ${sortBy} ${sortOrder}`);
    
    // Update state with new sort options
    setState(prev => {
      // Get the correct products to sort
      const productsToSort = prev.filteredProducts.length > 0 
        ? prev.filteredProducts 
        : prev.products;
      
      // Apply sorting immediately
      let sortedProducts = productsToSort;
      try {
        if (productsToSort.length > 0) {
          sortedProducts = sortProducts(productsToSort, sortBy, sortOrder);
          console.log(`Sorted ${productsToSort.length} products directly in handler`);
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

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, state.pagination.size);
  };

  const fetchProducts = async (page = 0, size = 12) => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const productsResponse = await getProducts({ page, size });

      if (productsResponse?.content) {
        setState((prev) => ({
          ...prev,
          products: productsResponse.content,
          sortedProducts: productsResponse.content,
          pagination: {
            page: productsResponse.pageable?.pageNumber || 0,
            totalPages: productsResponse.totalPages || 1,
            totalElements: productsResponse.totalElements || 0,
            size: productsResponse.pageable?.pageSize || 12,
          },
          error: null,
        }));
      }
    } catch (err) {
      console.error("Products fetch error:", err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to load products. Please try again later.',
        products: [],
        sortedProducts: []
      }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Update heading text to show what we're looking at
  const getHeadingText = () => {
    const { isSearchResults, searchQuery, minPrice, maxPrice, sortBy, sortOrder, isFiltered } = state.filters;
    
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
    if (isFiltered && (minPrice || maxPrice)) {
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

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-background-dark" : "bg-background-light"
      }`}
    >
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
              {state.sortedProducts.length > 0 ? (
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
