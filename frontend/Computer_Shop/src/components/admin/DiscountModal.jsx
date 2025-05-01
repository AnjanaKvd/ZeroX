import { useState, useEffect, useMemo } from 'react';
import { X, Info, AlertCircle, Search, XCircle } from 'lucide-react';
import { getActiveDiscountForProduct } from '../../services/discountService';

const DiscountModal = ({ isOpen, onClose, onSubmit, discount = null, mode = 'add', products = [] }) => {
  const [formData, setFormData] = useState({
    productId: '',
    discountPrice: '',
    startDate: '',
    endDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeDiscount, setActiveDiscount] = useState(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);

  // Set form data when editing
  useEffect(() => {
    if (discount && mode === 'edit') {
      // Format dates for the form inputs (if they're ISO strings)
      let startDate = discount.startDate;
      let endDate = discount.endDate;
      
      // If they are full ISO dates, format them for datetime-local input
      if (typeof startDate === 'string' && startDate.includes('T')) {
        startDate = startDate.split('.')[0]; // Remove milliseconds if present
      }
      
      if (typeof endDate === 'string' && endDate.includes('T')) {
        endDate = endDate.split('.')[0]; // Remove milliseconds if present
      }
      
      setFormData({
        productId: discount.productId || '',
        discountPrice: discount.discountPrice || '',
        startDate: startDate,
        endDate: endDate
      });
      
      // Find the selected product
      const product = products.find(p => p.productId === discount.productId);
      setSelectedProduct(product || {
        price: discount.originalPrice,
        sku: discount.productSku
      });
      
      // Set search query to product name
      if (product) {
        setSearchQuery(product.name);
      } else if (discount.productName) {
        setSearchQuery(discount.productName);
      }
    } else {
      // Reset form for adding new discount
      setFormData({
        productId: '',
        discountPrice: '',
        startDate: '',
        endDate: ''
      });
      setSelectedProduct(null);
      setSearchQuery('');
      setActiveDiscount(null);
    }
  }, [discount, products, mode]);

  // Check for active discount when product changes
  useEffect(() => {
    async function checkForActiveDiscount() {
      // Don't make API calls if no product is selected
      if (!formData.productId || formData.productId === '') {
        setActiveDiscount(null);
        setIsCheckingDiscount(false);
        return;
      }
      
      // Don't check for active discounts in edit mode
      if (mode === 'edit') {
        return;
      }
      
      setIsCheckingDiscount(true);
      
      try {
        const activeDiscountData = await getActiveDiscountForProduct(formData.productId);
        setActiveDiscount(activeDiscountData);
      } catch (error) {
        // Error is handled in the service layer
        setActiveDiscount(null);
      } finally {
        setIsCheckingDiscount(false);
      }
    }
    
    checkForActiveDiscount();
  }, [formData.productId, mode]);

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    // Don't filter if we've already selected a product
    // (this was the issue - we need to check selectedProduct here)
    if (selectedProduct && searchQuery === selectedProduct.name) return [];
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 10);
  }, [products, searchQuery, selectedProduct]);

  // Clear selected product
  const handleClearProduct = () => {
    setSelectedProduct(null);
    setFormData(prev => ({ ...prev, productId: '' }));
    setSearchQuery('');
    setActiveDiscount(null);
    // Set showSuggestions to true so dropdown appears again
    setShowSuggestions(true);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If we've cleared the search, also clear the selected product
    if (!e.target.value) {
      setSelectedProduct(null);
      setFormData(prev => ({ ...prev, productId: '' }));
      setActiveDiscount(null);
    }
    setShowSuggestions(true);
  };

  // Handle product selection from dropdown
  const handleProductSelect = (product) => {
    setFormData(prev => ({ ...prev, productId: product.productId }));
    setSelectedProduct(product);
    setSearchQuery(product.name);
    setShowSuggestions(false); // Hide suggestions after selection
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Only show suggestions if there is text and no product selected
    if (searchQuery && !selectedProduct) {
      setShowSuggestions(true);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }
    
    if (activeDiscount && mode === 'add') {
      newErrors.productId = 'This product already has an active discount';
    }
    
    if (!formData.discountPrice || isNaN(formData.discountPrice) || Number(formData.discountPrice) <= 0) {
      newErrors.discountPrice = 'Please enter a valid discount price';
    }
    
    if (selectedProduct && Number(formData.discountPrice) >= selectedProduct.price) {
      newErrors.discountPrice = 'Discount price must be less than the original price';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date';
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const discountData = {
      productId: formData.productId,
      discountPrice: Number(formData.discountPrice),
      startDate: formData.startDate,
      endDate: formData.endDate
    };
    
    onSubmit(discountData);
  };

  if (!isOpen) return null;

  // Calculate savings if we have a product and discount price
  const calculateSavings = () => {
    if (!selectedProduct || !formData.discountPrice || isNaN(formData.discountPrice)) {
      return { amount: 0, percentage: 0 };
    }
    
    const originalPrice = selectedProduct.price;
    const discountPrice = Number(formData.discountPrice);
    
    if (discountPrice >= originalPrice) {
      return { amount: 0, percentage: 0 };
    }
    
    const savingsAmount = originalPrice - discountPrice;
    const savingsPercentage = (savingsAmount / originalPrice) * 100;
    
    return { amount: savingsAmount, percentage: savingsPercentage };
  };

  const savings = calculateSavings();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'add' ? 'Add New Discount' : 'Edit Discount'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              
              {/* Searchable Product Dropdown with Clear Button */}
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for a product..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleInputFocus}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 pr-10"
                    disabled={mode === 'edit'} // Can't change product when editing
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  
                  {/* Clear button - only show when a product is selected */}
                  {selectedProduct && mode === 'add' && (
                    <button
                      type="button"
                      onClick={handleClearProduct}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700"
                      aria-label="Clear selected product"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
                
                {/* Show suggestions when appropriate */}
                {showSuggestions && searchQuery && mode === 'add' && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
                    ) : (
                      filteredProducts.map(product => (
                        <div
                          key={product.productId}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-gray-500">
                            SKU: {product.sku} - ${product.price?.toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected Product Display */}
              {mode === 'edit' && (
                <div className="mt-2 bg-gray-100 p-2 rounded-md">
                  <span className="text-sm font-medium">
                    {selectedProduct?.name || discount?.productName || 'Selected product'}
                  </span>
                </div>
              )}
              
              {/* Hidden select for form validation */}
              <select
                name="productId"
                value={formData.productId}
                onChange={() => {}}
                className="hidden"
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
              
              {errors.productId && (
                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
              )}
              
              {/* Loading indicator */}
              {isCheckingDiscount && (
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking if product has active discounts...
                </div>
              )}
              
              {/* Active Discount Warning */}
              {activeDiscount && (
                <div className="mt-2 bg-red-50 border border-red-200 p-3 rounded-md flex items-start">
                  <AlertCircle size={20} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium text-red-800">This product already has an active discount!</p>
                    <div className="mt-2 space-y-1">
                      <p><span className="font-medium">Current price:</span> ${activeDiscount.discountPrice.toFixed(2)}</p>
                      <p><span className="font-medium">Original price:</span> ${activeDiscount.originalPrice.toFixed(2)}</p>
                      <p><span className="font-medium">Discount ends:</span> {formatDate(activeDiscount.endDate)}</p>
                    </div>
                    <p className="mt-3 font-medium">You cannot create a new discount until the current one expires.</p>
                  </div>
                </div>
              )}
            </div>
            
            {selectedProduct && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium text-gray-700">Selected Product Info</h3>
                <p className="text-sm text-gray-600">Original Price: ${selectedProduct.price?.toFixed(2)}</p>
                <p className="text-sm text-gray-600">SKU: {selectedProduct.sku}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Price ($) *
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPrice: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.01"
                min="0"
                required
                disabled={!!activeDiscount && mode === 'add'}
              />
              {errors.discountPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.discountPrice}</p>
              )}
              
              {selectedProduct && formData.discountPrice && !isNaN(formData.discountPrice) && savings.amount > 0 && (
                <div className="mt-2 text-sm text-green-600">
                  Savings: ${savings.amount.toFixed(2)} ({savings.percentage.toFixed(1)}% off)
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!!activeDiscount && mode === 'add'}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!!activeDiscount && mode === 'add'}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md flex items-start">
              <Info size={20} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p>Discounts will automatically become active/inactive based on the date range.</p>
                <p className="mt-1">Only one active discount is allowed per product at a time.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!!activeDiscount && mode === 'add'}
            >
              {mode === 'add' ? 'Create Discount' : 'Update Discount'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscountModal; 