import React from 'react';

// Import computer hardware icons
import { 
  FaDesktop, FaLaptop, FaMicrochip, FaMemory, FaHdd, FaKeyboard,
  FaMouse, FaPlug, FaEthernet, FaServer, FaSdCard, FaHeadphones,
  FaPrint, FaBarcode, FaUsb, FaVideo, FaShoppingCart,
  FaWifi, FaGamepad, FaRobot, FaChargingStation, FaFan,
  FaTabletAlt, FaChartBar, FaShieldAlt, FaDatabase, 
  FaMicrosoft, FaApple, FaLinux, FaAndroid, FaWindows
} from 'react-icons/fa';

import { 
  SiNvidia, SiAmd, SiAsus, SiLogitech, SiRazer, SiHp, SiDell,
  SiSamsung, SiWesterndigital, SiLenovo, SiMsi,
  SiTplink, SiCorsair, SiKingstontechnology, SiSeagate, SiSandisk, SiHyperx, SiIntel
} from 'react-icons/si';

// Create an icon registry object that maps icon names to their component
const iconRegistry = {
  // Hardware Components
  FaDesktop, FaLaptop, FaMicrochip, FaMemory, FaHdd, FaKeyboard,
  FaMouse, FaPlug, FaEthernet, FaServer, FaSdCard, FaHeadphones,
  FaPrint, FaBarcode, FaUsb, FaVideo, FaShoppingCart,
  FaWifi, FaGamepad, FaRobot, FaChargingStation, FaFan,
  FaTabletAlt, FaChartBar, FaShieldAlt, FaDatabase,
  
  // Brand Icons
  SiIntel , FaMicrosoft, FaApple, FaLinux, FaAndroid, FaWindows,
  SiNvidia, SiAmd, SiAsus, SiLogitech, SiRazer, SiHp, SiDell,
  SiSamsung, SiWesterndigital, SiLenovo, SiMsi,
  SiTplink, SiCorsair, SiKingstontechnology, SiSeagate, SiSandisk, SiHyperx
};

// Component that renders an icon by name
export const IconRenderer = ({ iconName, className = "w-6 h-6" }) => {
  if (!iconName) return null;
  
  const IconComponent = iconRegistry[iconName];
  
  if (!IconComponent) {
    // Fallback to a placeholder or first letter
    return (
      <div className={`${className} bg-gray-200 rounded-full flex items-center justify-center text-gray-500`}>
        ?
      </div>
    );
  }
  
  return <IconComponent className={className} />;
};

// List of all available icons for the picker
export const computerIcons = [
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
  { name: 'SiIntel ', icon: SiIntel, category: 'Brands', label: 'Intel' },
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

export default iconRegistry; 