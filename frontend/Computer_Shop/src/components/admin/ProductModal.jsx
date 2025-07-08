import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { getCategories } from '../../services/categoryService';
import { getFullImageUrl } from '../../utils/imageUtils';
import api from '../../services/api';
import BarcodeInput from './BarcodeInput';

const ProductModal = ({ isOpen, onClose, onSubmit, product = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    sku: '',
    brand: '',
    stockQuantity: '',
    lowStockThreshold: '',
    warrantyPeriodMonths: '',
    keywords: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [stockError, setStockError] = useState(null);

  // Fetch categories when modal opens
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setCategoryError(null);
        const response = await getCategories();
        console.log("Categories response:", response); // Debug: Check category structure
        setCategories(response || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        categoryId: product.categoryId || '',
        sku: product.sku || '',
        brand: product.brand || '',
        stockQuantity: product.stockQuantity || '',
        lowStockThreshold: product.lowStockThreshold || '',
        warrantyPeriodMonths: product.warrantyPeriodMonths || '',
        keywords: product.keywords || '',
        image: null
      });
      
      // If there's an image URL from the server, use the helper function
      if (product.imageUrl || product.imagePath || product.image) {
        import('../../utils/imageUtils').then(module => {
          const imageUrl = module.getProductImageUrl(product);
          setImagePreview(imageUrl);
        });
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        sku: '',
        brand: '',
        stockQuantity: '',
        lowStockThreshold: '',
        warrantyPeriodMonths: '',
        keywords: '',
        image: null
      });
      setImagePreview(null);
    }
  }, [product, mode]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
          alert('Please upload a valid image file (JPG, PNG, or WebP)');
          return;
        }

        if (file.size > maxSize) {
          alert('Image size should be less than 5MB');
          return;
        }

        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
        setFormData(prev => ({
          ...prev,
          image: file
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (name === 'stockQuantity' || name === 'lowStockThreshold') {
        setStockError(null);
      }
      
      // Check stock quantity validation
      if ((name === 'stockQuantity' || name === 'lowStockThreshold') && 
          formData.lowStockThreshold && formData.stockQuantity) {
        const stockQty = name === 'stockQuantity' ? Number(value) : Number(formData.stockQuantity);
        const threshold = name === 'lowStockThreshold' ? Number(value) : Number(formData.lowStockThreshold);
        
        if (stockQty < threshold) {
          const difference = threshold - stockQty;
          setStockError(`Stock quantity is lower than Low Stock Threshold by ${difference} units`);
        } else {
          setStockError(null);
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    
    if (formData.stockQuantity && formData.lowStockThreshold) {
      const stockQty = Number(formData.stockQuantity);
      const threshold = Number(formData.lowStockThreshold);
      
      if (stockQty < threshold) {
        const difference = threshold - stockQty;
        setStockError(`Stock quantity is lower than Low Stock Threshold by ${difference} units`);
        return; // Prevent form submission
      }
    }
    
    const submitFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'image') {
        if (formData.image) {
          submitFormData.append('image', formData.image);
        }
      } else if (key === 'keywords') {
        // Ensure keywords are properly formatted (trim spaces after commas)
        if (formData.keywords) {
          const formattedKeywords = formData.keywords
            .split(',')
            .map(keyword => keyword.trim())
            .filter(keyword => keyword.length > 0)
            .join(',');
          
          submitFormData.append('keywords', formattedKeywords);
          
          // For debugging
          console.log('Submitting keywords:', formattedKeywords);
        }
      } else if (formData[key] !== '') {
        if (['price', 'stockQuantity', 'lowStockThreshold', 'warrantyPeriodMonths'].includes(key)) {
          submitFormData.append(key, Number(formData[key]));
        } else {
          submitFormData.append(key, formData[key]);
        }
      }
    });
    
    onSubmit(submitFormData);
  };

  // Handle barcode scanning - now just updates the form data with scanned code
  const handleScanBarcode = (scannedCode) => {
    console.log('ProductModal received barcode:', scannedCode);
    
    // Set the SKU field with the scanned barcode
    if (scannedCode && scannedCode.trim()) {
      setFormData(prev => ({
        ...prev,
        sku: scannedCode
      }));
      
      // Optionally, you can try to look up product info by SKU from your API
      // This would be an enhancement for future implementation
      // lookupProductBySku(scannedCode);
    }
  };

  // Lookup product info by SKU - for future enhancement
  const lookupProductBySku = async (sku) => {
    try {
      const response = await api.get(`/api/products/lookup?sku=${sku}`);
      
      if (response.data) {
        const productData = response.data;
        setFormData(prev => ({
          ...prev,
          name: productData.name || prev.name,
          brand: productData.brand || prev.brand,
          price: productData.price || prev.price,
          description: productData.description || prev.description,
          stockQuantity: productData.stockQuantity || prev.stockQuantity,
        }));
      }
    } catch (error) {
      console.error('Error looking up product:', error);
      // Display error via toast or alert if needed
    }
  };

  if (!isOpen) return null;

  // Helper function to determine the category ID property name
  const getCategoryIdProperty = () => {
    if (categories.length === 0) return 'id';
    const category = categories[0];
    // Check possible property names that could contain the UUID
    if (category.categoryId !== undefined) return 'categoryId';
    if (category.id !== undefined) return 'id';
    if (category.uuid !== undefined) return 'uuid';
    // Default fallback
    return Object.keys(category).find(key => 
      typeof category[key] === 'string' && 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category[key])
    ) || 'id';
  };

  // Get the appropriate category ID property
  const categoryIdProperty = getCategoryIdProperty();

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black bg-opacity-50`}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
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
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
                {stockError && (
                  <p className="mt-1 text-sm text-red-500">{stockError}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-4 md:grid-cols-2">
              <div>
                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    SKU *
                  </label>
                  <BarcodeInput
                    value={formData.sku}
                    onChange={(value) => {
                      console.log('SKU input changed:', value);
                      setFormData(prev => ({
                        ...prev,
                        sku: value
                      }));
                    }}
                    required={true}
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Brand *
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Category *
                </label>
                {loading ? (
                  <div className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md bg-gray-50">
                    Loading categories...
                  </div>
                ) : categoryError ? (
                  <div className="text-sm text-red-500">{categoryError}</div>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option 
                        key={category[categoryIdProperty]} 
                        value={category[categoryIdProperty]}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Warranty (Months)
                </label>
                <input
                  type="number"
                  name="warrantyPeriodMonths"
                  value={formData.warrantyPeriodMonths}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Product Image
              </label>
              <div className="flex items-center mt-1 space-x-4">
                <div className="flex-shrink-0 w-32 h-32 overflow-hidden bg-gray-100 border rounded-lg">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                      <Upload size={24} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50"
                  >
                    {mode === 'edit' ? 'Change Image' : 'Upload Image'}
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="px-3 py-2 text-sm font-medium text-red-600 border border-gray-300 rounded-md shadow-sm hover:bg-red-50"
                    >
                      Remove Image
                    </button>
                  )}
                  <p className="text-xs text-gray-500">
                    JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={loading}
            >
              {mode === 'add' ? 'Create Product' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal; 