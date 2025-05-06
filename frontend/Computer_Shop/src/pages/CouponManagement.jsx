import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Search, ChevronsUpDown, Calendar, Activity } from 'lucide-react';
import { 
  getCoupons,
  deleteCoupon,
  createCoupon,
  updateCoupon,
  getCouponUsages
} from '../services/couponService';
import { getCategories } from '../services/categoryService';
import { getProducts } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { ErrorMessage } from '../components/auth/FormElements';
import PriceDisplay from '../components/common/PriceDisplay';

// Create modal components
const CouponModal = ({ isOpen, onClose, onSubmit, initialData, categories, products, mode }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    maxUsesPerUser: '1',
    isActive: true,
    categoryId: '',
    productId: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      // Format dates for input fields
      const startDate = initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '';
      const endDate = initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '';
      
      setFormData({
        code: initialData.code || '',
        description: initialData.description || '',
        discountType: initialData.discountType || 'PERCENTAGE',
        discountValue: initialData.discountValue || '',
        minimumOrderAmount: initialData.minimumOrderAmount || '',
        maximumDiscountAmount: initialData.maximumDiscountAmount || '',
        startDate,
        endDate,
        maxUses: initialData.maxUses || '',
        maxUsesPerUser: initialData.maxUsesPerUser || '1',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        categoryId: initialData.categoryId || '',
        productId: initialData.productId || ''
      });
    }
  }, [initialData]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.code) newErrors.code = 'Coupon code is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.discountType) newErrors.discountType = 'Discount type is required';
    if (!formData.discountValue) newErrors.discountValue = 'Discount value is required';
    if (formData.discountType === 'PERCENTAGE' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
      newErrors.discountValue = 'Percentage must be between 0 and 100';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    // Format dates with time component (ensuring it follows the "YYYY-MM-DDTHH:MM:SS" format)
    const formatDateWithTime = (dateString) => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
    };
    
    // Format the data with proper types and formats
    const formattedData = {
      ...formData,
      // Format dates with time component
      startDate: formatDateWithTime(formData.startDate),
      endDate: formatDateWithTime(formData.endDate),
      // Convert numeric values to proper number types with decimal precision
      discountValue: parseFloat(parseFloat(formData.discountValue).toFixed(1)), // Force 1 decimal place
      minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(parseFloat(formData.minimumOrderAmount).toFixed(1)) : null,
      maximumDiscountAmount: formData.maximumDiscountAmount ? parseFloat(parseFloat(formData.maximumDiscountAmount).toFixed(1)) : null,
      // Convert to integers
      maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
      maxUsesPerUser: parseInt(formData.maxUsesPerUser, 10),
      categoryId: formData.categoryId || null,
      productId: formData.productId || null
    };
    
    onSubmit(formattedData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'add' ? 'Add New Coupon' : 'Edit Coupon'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Code*
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                placeholder="E.g., SUMMER2023"
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                                <span className="ml-2 text-sm text-gray-700">
                  Active
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description*
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className={`w-full border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
              placeholder="Brief description of the coupon"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Type*
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className={`w-full border ${errors.discountType ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
              >
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED_AMOUNT">Fixed Amount</option>
              </select>
              {errors.discountType && (
                <p className="text-red-500 text-xs mt-1">{errors.discountType}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Value* ({formData.discountType === 'PERCENTAGE' ? '%' : '$'})
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0"
                step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                className={`w-full border ${errors.discountValue ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                placeholder={formData.discountType === 'PERCENTAGE' ? "E.g., 15" : "E.g., 10.00"}
              />
              {errors.discountValue && (
                <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Order Amount
              </label>
              <input
                type="number"
                name="minimumOrderAmount"
                value={formData.minimumOrderAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="E.g., 50.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Discount Amount
              </label>
              <input
                type="number"
                name="maximumDiscountAmount"
                value={formData.maximumDiscountAmount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="E.g., 100.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date*
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date*
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses (total)
              </label>
              <input
                type="number"
                name="maxUses"
                value={formData.maxUses}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="E.g., 500 (leave empty for unlimited)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Uses Per User*
              </label>
              <input
                type="number"
                name="maxUsesPerUser"
                value={formData.maxUsesPerUser}
                onChange={handleChange}
                min="1"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="E.g., 1"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category (optional)
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product (optional)
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product.productId} value={product.productId}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
            >
              {mode === 'add' ? 'Create Coupon' : 'Update Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const UsageModal = ({ isOpen, onClose, couponId, couponCode }) => {
  const [usages, setUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    if (!isOpen || !couponId) return;
    
    const fetchUsages = async () => {
      try {
        setLoading(true);
        const response = await getCouponUsages(couponId, page - 1, 10);
        setUsages(response.content || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Error fetching coupon usages:", err);
        setError("Failed to load coupon usage data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsages();
  }, [isOpen, couponId, page]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Usage History: {couponCode}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="py-8 text-center">
              <LoadingSpinner />
              <p className="mt-2 text-gray-600">Loading usage data...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : usages.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-600">No usage data found for this coupon.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Used At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usages.map(usage => (
                      <tr key={usage.usageId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {usage.userName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {usage.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <PriceDisplay amount={usage.discountAmount} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(usage.usedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination 
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState({
    showAdd: false,
    showEdit: false,
    showDelete: false,
    showUsage: false,
    selectedCoupon: null
  });

  const [filters, setFilters] = useState({
    code: '',
    isActive: '',
    page: 1,
    size: 10,
    sortBy: 'code',
    sortDir: 'asc'
  });

  const [totalPages, setTotalPages] = useState(1);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCoupons(
        filters.page - 1, 
        filters.size,
        filters.sortBy,
        filters.sortDir
      );
      setCoupons(response.content || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError(err.message || "Failed to load coupons");
      setCoupons([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch categories and products for the modal
  const fetchCategoriesAndProducts = useCallback(async () => {
    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        getCategories(),
        getProducts()
      ]);
      setCategories(categoriesResponse.content || []);
      setProducts(productsResponse.content || []);
    } catch (err) {
      console.error("Error fetching categories or products:", err);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
    fetchCategoriesAndProducts();
  }, [fetchCoupons, fetchCategoriesAndProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleSort = (column) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortDir: prev.sortBy === column ? 
        (prev.sortDir === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const openModal = (type, coupon = null) => {
    setModalState({
      showAdd: type === 'add',
      showEdit: type === 'edit',
      showDelete: type === 'delete',
      showUsage: type === 'usage',
      selectedCoupon: coupon
    });
  };

  const closeModal = () => {
    setModalState({
      showAdd: false,
      showEdit: false,
      showDelete: false,
      showUsage: false,
      selectedCoupon: null
    });
    setError(null);
  };

  const handleCouponSubmit = async (couponData) => {
    try {
      if (modalState.showEdit) {
        await updateCoupon(modalState.selectedCoupon.couponId, couponData);
      } else {
        await createCoupon(couponData);
      }
      fetchCoupons();
      closeModal();
    } catch (err) {
      setError(err.message || "An error occurred while saving the coupon");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCoupon(modalState.selectedCoupon.couponId);
      setCoupons(prevCoupons => 
        prevCoupons.filter(c => c.couponId !== modalState.selectedCoupon.couponId)
      );
      closeModal();
    } catch (err) {
      setError(err.message || "An error occurred while deleting the coupon");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) {
      return { status: 'inactive', label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    }
    
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);
    
    if (now >= startDate && now <= endDate) {
      return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (now < startDate) {
      return { status: 'scheduled', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
        <button
          onClick={() => openModal('add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" size={18} />
          Add Coupon
        </button>
      </div>

      {error && (
        <ErrorMessage message={error} className="mb-4" />
      )}

      {/* Filters */}
      <div className="bg-white p-4 mb-6 rounded-md shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Code
            </label>
            <div className="relative">
              <input
                type="text"
                name="code"
                value={filters.code}
                onChange={handleInputChange}
                placeholder="Enter coupon code..."
                className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="isActive"
              value={filters.isActive}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          
          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items per page
            </label>
            <select
              name="size"
              value={filters.size}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner />
            <p className="mt-2 text-gray-600">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-gray-600">No coupons found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center">
                      Code
                      {filters.sortBy === 'code' && (
                        <ChevronsUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('discountValue')}
                  >
                    <div className="flex items-center">
                      Discount
                      {filters.sortBy === 'discountValue' && (
                        <ChevronsUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    <div className="flex items-center">
                      Validity
                      {filters.sortBy === 'startDate' && (
                        <ChevronsUpDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coupons.map((coupon, index) => {
                  const status = getCouponStatus(coupon);
                  
                  return (
                    <tr key={coupon.couponId || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {coupon.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {coupon.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <span>{coupon.discountValue}%</span>
                        ) : (
                          <PriceDisplay amount={coupon.discountValue} />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={16} className="mr-1 text-gray-400" />
                          {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span>{coupon.currentUses || 0} / {coupon.maxUses || '∞'}</span>
                          <button
                            onClick={() => openModal('usage', coupon)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            aria-label="View usage history"
                          >
                            <Activity size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openModal('edit', coupon)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openModal('delete', coupon)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && coupons.length > 0 && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page {filters.page} of {totalPages}
            </div>
            <Pagination 
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      
      {/* Modals */}
      <CouponModal 
        isOpen={modalState.showAdd || modalState.showEdit}
        onClose={closeModal}
        onSubmit={handleCouponSubmit}
        initialData={modalState.selectedCoupon}
        categories={categories}
        products={products}
        mode={modalState.showAdd ? 'add' : 'edit'}
      />
      
      <ConfirmModal 
        isOpen={modalState.showDelete}
        onClose={closeModal}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${modalState.selectedCoupon?.code}"? This action cannot be undone.`}
      />
      
      <UsageModal 
        isOpen={modalState.showUsage}
        onClose={closeModal}
        couponId={modalState.selectedCoupon?.couponId}
        couponCode={modalState.selectedCoupon?.code}
      />
    </div>
  );
};

export default CouponManagement;
