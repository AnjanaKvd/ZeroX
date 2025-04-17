import { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

const DiscountModal = ({ isOpen, onClose, onSubmit, discount = null, mode = 'add', products = [] }) => {
  const [formData, setFormData] = useState({
    productId: '',
    discountPrice: '',
    startDate: '',
    endDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

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
    } else {
      // Reset form for adding new discount
      setFormData({
        productId: '',
        discountPrice: '',
        startDate: '',
        endDate: ''
      });
      setSelectedProduct(null);
    }
  }, [discount, products, mode]);

  // Update selectedProduct when productId changes
  useEffect(() => {
    if (formData.productId) {
      const product = products.find(p => p.productId === formData.productId);
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId, products]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors for the field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
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
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                disabled={mode === 'edit'} // Can't change product when editing
                required
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.name} (${product.price?.toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-red-500 text-sm mt-1">{errors.productId}</p>
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
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.01"
                min="0"
                required
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
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
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
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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