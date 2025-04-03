import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { computerIcons } from '../../utils/iconRegistry';

const IconPickerModal = ({ isOpen, onClose, onSelect, currentIcon = null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Reset search when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('All');
    }
  }, [isOpen]);

  const categories = ['All', 'Components', 'Storage', 'Peripherals', 'Networking', 'Devices', 'Brands', 'Software', 'Other'];

  const filteredIcons = computerIcons.filter(icon => {
    const matchesSearch = 
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      icon.label.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Select an Icon</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Category Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search icons (e.g., 'storage', 'nvidia')"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
            {filteredIcons.map(({ name, icon: Icon, label }) => (
              <button
                key={name}
                onClick={() => {
                  onSelect(name);
                  onClose();
                }}
                className={`p-2 hover:bg-gray-100 rounded-lg flex flex-col items-center group ${
                  currentIcon === name ? 'bg-blue-50 border border-blue-300' : ''
                }`}
                title={label}
              >
                <Icon className={`w-8 h-8 mb-1 ${currentIcon === name ? 'text-blue-600' : 'text-gray-700'}`} />
                <span className="text-xs text-gray-600 truncate max-w-full">
                  {label}
                </span>
              </button>
            ))}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No icons found matching your search criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;