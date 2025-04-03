import { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

// Import computer hardware icons
import { 
  FaDesktop, FaLaptop, FaMicrochip, FaMemory, FaHdd, FaKeyboard,
  FaMouse, FaPlug, FaEthernet, FaServer, FaSdCard, FaHeadphones,
  FaPrint, FaBarcode, FaUsb, FaVideo, FaShoppingCart,
  FaWifi, FaGamepad, FaRobot, FaChargingStation, FaFan,
  FaTabletAlt, FaChartBar, FaShieldAlt, FaDatabase
} from 'react-icons/fa';

// Import brand icons
import { 
  FaMicrosoft, FaApple, FaLinux, FaAndroid, FaWindows
} from 'react-icons/fa';

import { 
  SiIntel, SiNvidia, SiAmd, SiAsus, SiLogitech, SiRazer, SiHp, SiDell,
  SiSamsung, SiWesterndigital, SiLenovo, SiMsi,
  SiTplink, SiCorsair,SiKingstontechnology, SiSeagate, SiSandisk, SiHyperx
} from 'react-icons/si';

// Create an array of computer-related icons
const computerIcons = [
  // Hardware Components
  { name: 'FaDesktop', icon: FaDesktop, category: 'Components', label: 'Desktop' },
  { name: 'FaLaptop', icon: FaLaptop, category: 'Components', label: 'Laptop' },
  { name: 'FaMicrochip', icon: FaMicrochip, category: 'Components', label: 'CPU/Chip' },
  { name: 'FaMemory', icon: FaMemory, category: 'Components', label: 'Memory/RAM' },
  { name: 'FaHdd', icon: FaHdd, category: 'Storage', label: 'Hard Drive' },
  { name: 'FaKeyboard', icon: FaKeyboard, category: 'Peripherals', label: 'Keyboard' },
  { name: 'FaMouse', icon: FaMouse, category: 'Peripherals', label: 'Mouse' },
  { name: 'FaPlug', icon: FaPlug, category: 'Components', label: 'Power/PSU' },
  { name: 'FaEthernet', icon: FaEthernet, category: 'Networking', label: 'Ethernet' },
  { name: 'FaServer', icon: FaServer, category: 'Components', label: 'Server' },
  { name: 'FaSdCard', icon: FaSdCard, category: 'Storage', label: 'SD Card' },
  { name: 'FaHeadphones', icon: FaHeadphones, category: 'Peripherals', label: 'Headphones' },
  { name: 'FaPrint', icon: FaPrint, category: 'Peripherals', label: 'Printer' },
  { name: 'FaBarcode', icon: FaBarcode, category: 'Components', label: 'Scanner' },
  { name: 'FaUsb', icon: FaUsb, category: 'Components', label: 'USB' },
  { name: 'FaVideo', icon: FaVideo, category: 'Components', label: 'GPU/Video' },
  { name: 'FaShoppingCart', icon: FaShoppingCart, category: 'Other', label: 'Shopping Cart' },
  { name: 'FaWifi', icon: FaWifi, category: 'Networking', label: 'WiFi' },
  { name: 'FaGamepad', icon: FaGamepad, category: 'Peripherals', label: 'Gaming' },
  { name: 'FaRobot', icon: FaRobot, category: 'Other', label: 'Robot/AI' },
  { name: 'FaFan', icon: FaFan, category: 'Components', label: 'Cooling/Fan' },
  { name: 'FaTabletAlt', icon: FaTabletAlt, category: 'Devices', label: 'Tablet' },
  { name: 'FaChartBar', icon: FaChartBar, category: 'Other', label: 'Performance' },
  { name: 'FaShieldAlt', icon: FaShieldAlt, category: 'Software', label: 'Security' },
  { name: 'FaDatabase', icon: FaDatabase, category: 'Storage', label: 'Database' },
  { name: 'FaChargingStation', icon: FaChargingStation, category: 'Components', label: 'Charging' },
  
  // Brand Icons
  { name: 'SiIntel', icon: SiIntel, category: 'Brands', label: 'Intel' },
  { name: 'FaMicrosoft', icon: FaMicrosoft, category: 'Brands', label: 'Microsoft' },
  { name: 'FaApple', icon: FaApple, category: 'Brands', label: 'Apple' },
  { name: 'FaLinux', icon: FaLinux, category: 'Brands', label: 'Linux' },
  { name: 'FaAndroid', icon: FaAndroid, category: 'Brands', label: 'Android' },
  { name: 'FaWindows', icon: FaWindows, category: 'Brands', label: 'Windows' },
  { name: 'SiNvidia', icon: SiNvidia, category: 'Brands', label: 'Nvidia' },
  { name: 'SiAmd', icon: SiAmd, category: 'Brands', label: 'AMD' },
  { name: 'SiAsus', icon: SiAsus, category: 'Brands', label: 'Asus' },
  { name: 'SiLogitech', icon: SiLogitech, category: 'Brands', label: 'Logitech' },
  { name: 'SiRazer', icon: SiRazer, category: 'Brands', label: 'Razer' },
  { name: 'SiHp', icon: SiHp, category: 'Brands', label: 'HP' },
  { name: 'SiDell', icon: SiDell, category: 'Brands', label: 'Dell' },
  { name: 'SiSamsung', icon: SiSamsung, category: 'Brands', label: 'Samsung' },
  { name: 'SiWesterndigital', icon: SiWesterndigital, category: 'Brands', label: 'Western Digital' },
  { name: 'SiLenovo', icon: SiLenovo, category: 'Brands', label: 'Lenovo' },
  { name: 'SiMsi', icon: SiMsi, category: 'Brands', label: 'MSI' },
  { name: 'SiTplink', icon: SiTplink, category: 'Brands', label: 'TP-Link' },
  { name: 'SiCorsair', icon: SiCorsair, category: 'Brands', label: 'Corsair' },
  { name: 'SiKingstontechnology', icon: SiKingstontechnology, category: 'Brands', label: 'Kingston' },
  { name: 'SiSeagate', icon: SiSeagate, category: 'Brands', label: 'Seagate' },
  { name: 'SiSandisk', icon: SiSandisk, category: 'Brands', label: 'SanDisk' },
  { name: 'SiHyperx', icon: SiHyperx, category: 'Brands', label: 'HyperX' }
];

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