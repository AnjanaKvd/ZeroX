import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { slugify } from '../../utils/helpers';
import IconPickerModal from './IconPickerModal';
import { IconRenderer } from '../../utils/iconRegistry';

const CategoryModal = ({ isOpen, onClose, onSubmit, category = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

  // Reset form when modal opens with a different category
  useEffect(() => {
    if (category && mode === 'edit') {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        icon: category.icon || '',
      });
      // If slug exists and doesn't match the generated slug, assume it was manually set
      setAutoSlug(category.slug === slugify(category.name));
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        icon: '',
      });
      setAutoSlug(true);
    }
    setErrors({});
  }, [category, mode, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug from name if autoSlug is enabled
      if (name === 'name' && autoSlug) {
        newData.slug = slugify(value);
      }
      
      return newData;
    });
    
    // Clear any errors for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleIconSelect = (iconName) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
    if (errors.icon) {
      setErrors(prev => ({ ...prev, icon: null }));
    }
  };

  const toggleAutoSlug = () => {
    setAutoSlug(!autoSlug);
    if (!autoSlug) {
      // If turning auto-slug back on, regenerate from current name
      setFormData(prev => ({
        ...prev,
        slug: slugify(prev.name)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (!formData.icon) newErrors.icon = 'Please select an icon';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === 'add' ? 'Add New Category' : 'Edit Category'}
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
                Category Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Slug *
                </label>
                <button 
                  type="button"
                  onClick={toggleAutoSlug}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {autoSlug ? 'Edit manually' : 'Auto-generate'}
                </button>
              </div>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                disabled={autoSlug}
                className={`w-full border rounded-md px-3 py-2 ${
                  errors.slug ? 'border-red-500' : 'border-gray-300'
                } ${autoSlug ? 'bg-gray-100' : ''}`}
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon *
              </label>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(true)}
                  className={`flex items-center justify-center border rounded-md px-3 py-2 hover:bg-gray-50 ${
                    errors.icon ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {formData.icon ? (
                    <IconRenderer iconName={formData.icon} className="w-5 h-5 mr-2 text-gray-700" />
                  ) : (
                    <span className="w-5 h-5 mr-2 bg-gray-200 rounded-sm"></span>
                  )}
                  {formData.icon ? formData.icon : 'Select an icon'}
                </button>
              </div>
              {errors.icon && (
                <p className="mt-1 text-sm text-red-500">{errors.icon}</p>
              )}
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
            >
              {mode === 'add' ? 'Create Category' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
      
      <IconPickerModal 
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
        onSelect={handleIconSelect}
        currentIcon={formData.icon}
      />
    </div>
  );
};

export default CategoryModal; 