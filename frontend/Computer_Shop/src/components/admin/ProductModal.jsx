import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { getCategories } from '../../services/categoryService';

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
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);

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
        image: null
      });
      setImagePreview(product.imageUrl || null);
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const submitFormData = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'image') {
        if (formData.image) {
          submitFormData.append('image', formData.image);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                {loading ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
                    Loading categories...
                  </div>
                ) : categoryError ? (
                  <div className="text-red-500 text-sm">{categoryError}</div>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty (Months)
                </label>
                <input
                  type="number"
                  name="warrantyPeriodMonths"
                  value={formData.warrantyPeriodMonths}
                  onChange={handleChange}
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex-shrink-0 h-32 w-32 border rounded-lg overflow-hidden bg-gray-100">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
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
                    className="cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                      className="py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-600 hover:bg-red-50"
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
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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