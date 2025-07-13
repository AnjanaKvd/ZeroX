import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { 
  FaCog, 
  FaDesktop, 
  FaGamepad, 
  FaLaptopCode, 
  FaQuestionCircle, 
  FaCheckCircle,
  FaMemory,
  FaHdd,
  FaBolt,
  FaServer,
  FaMicrochip,
  FaFan
} from 'react-icons/fa';
// Using only Font Awesome icons for better compatibility

const PCBuildingGuides = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const components = [
    { icon: <FaMicrochip size={24} />, name: 'CPU (Processor)', desc: 'The brain of your PC. Handles all calculations and instructions. Intel Core i5/i7 or AMD Ryzen 5/7 are great choices for most users.' },
    { icon: <FaMicrochip size={24} className="transform rotate-90" />, name: 'Motherboard', desc: 'The backbone of your system. Connects all components. Choose based on CPU compatibility (e.g., AM4 for Ryzen).' },
    { icon: <FaMemory size={24} />, name: 'RAM (Memory)', desc: 'Helps your system multitask. 16GB is the sweet spot for most users. Gamers or creators may need 32GB+.' },
    { icon: <FaHdd size={24} />, name: 'Storage', desc: 'SSDs are much faster than HDDs. Use an NVMe SSD for your OS and apps; add an HDD for large files.' },
    { icon: <FaDesktop size={24} />, name: 'GPU (Graphics Card)', desc: 'Essential for gaming, 3D rendering, and video editing. E.g., NVIDIA RTX or AMD Radeon series.' },
    { icon: <FaBolt size={24} />, name: 'Power Supply (PSU)', desc: 'Powers all components. Make sure to choose a trusted brand with enough wattage (e.g., 550W–750W).' },
    { icon: <FaServer size={24} />, name: 'Case (Cabinet)', desc: 'Houses all components. Consider airflow, cable management, and aesthetics.' },
    { icon: <FaFan size={24} />, name: 'Cooling', desc: 'Use air or liquid coolers to keep your system temperature in control. Don\'t forget case fans!' },
  ];

  const builds = [
    {
      level: 'Budget Build',
      description: 'Ideal for Office/Home Use',
      icon: <FaDesktop size={32} className="text-green-500" />,
      specs: [
        'CPU: AMD Ryzen 5 5600G (with integrated graphics)',
        'Motherboard: B550 chipset',
        'RAM: 4GB DDR4',
        'Storage: 256GB NVMe SSD',
        'PSU: 500W Bronze Certified',
        'Case: Compact mid-tower with airflow'
      ]
    },
    {
      level: 'Mid-Range Gaming Build',
      description: 'Great for 1080p Gaming',
      icon: <FaGamepad size={32} className="text-yellow-500" />,
      specs: [
        'CPU: Intel Core i5-12400F',
        'GPU: NVIDIA RTX 4060',
        'Motherboard: B660 chipset',
        'RAM: 8GB DDR4 (3200MHz)',
        'Storage: 512GB NVMe SSD',
        'PSU: 650W Bronze Certified',
        'Case: RGB Mid-Tower with cooling'
      ]
    },
    {
      level: 'High-End Build',
      description: 'For Creators & Streamers',
      icon: <FaLaptopCode size={32} className="text-red-500" />,
      specs: [
        'CPU: AMD Ryzen 9 7900X',
        'GPU: NVIDIA RTX 4080 Super',
        'Motherboard: X670 chipset',
        'RAM: 32GB DDR5 (6000MHz)',
        'Storage: 2TB NVMe Gen 4 + 2TB HDD',
        'PSU: 850W Gold Certified',
        'Cooling: 360mm AIO Liquid Cooler',
        'Case: Premium Full Tower'
      ]
    }
  ];

  const faqs = [
    {
      question: 'Can I upgrade later?',
      answer: 'Yes! Most parts are upgradeable, especially RAM, storage, and GPU. Always check future compatibility when choosing parts.'
    },
    {
      question: 'Should I go for Intel or AMD?',
      answer: 'Both are excellent. AMD offers more cores at the price, Intel often performs better per core. Choose based on use-case.'
    },
    {
      question: 'How do I choose a GPU?',
      answer: 'Match it with your resolution and refresh rate: 1080p gaming: GTX 1660, RTX 3050 | 1440p gaming: RTX 4060 Ti, RX 6700 XT | 4K gaming: RTX 4080, RX 7900 XTX'
    }
  ];

  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold mb-4">PC Building Guides</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Whether you're a first-time builder or a seasoned enthusiast, our guides will help you make smart decisions and build your dream PC.
          </p>
        </div>

        {/* Core Components Section */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaCog className="mr-2" /> Understanding the Core Components
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((comp, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} hover:shadow-lg`}
              >
                <div className="flex items-center mb-3">
                  <span className="mr-3 text-blue-500">{comp.icon}</span>
                  <h3 className="text-lg font-semibold">{comp.name}</h3>
                </div>
                <p className="text-sm text-gray-500">{comp.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Build Recommendations */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Recommended Build Configurations (2025)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {builds.map((build, index) => (
              <div 
                key={index}
                className={`rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {build.icon}
                    <div className="ml-3">
                      <h3 className="text-xl font-bold">{build.level}</h3>
                      <p className="text-sm text-gray-500">{build.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mt-4">
                    {build.specs.map((spec, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" size={14} />
                        <span className="text-sm">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Building Tips */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-6">Building Tips for Beginners</h2>
          <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <div>
                  <span className="font-semibold">Static Safety:</span> Ground yourself to avoid damaging components with static electricity.
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <div>
                  <span className="font-semibold">Start with the Motherboard:</span> Install CPU, RAM, and M.2 SSD before placing it in the case.
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <div>
                  <span className="font-semibold">Cable Management:</span> Route cables through back panel to improve airflow and appearance.
                </div>
              </li>
              <li className="flex items-start">
                <span className="font-semibold mr-2">•</span>
                <div>
                  <span className="font-semibold">Use Manuals:</span> Motherboard and PSU manuals are your best friends — don't guess port locations!
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FaQuestionCircle className="mr-2" /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}
              >
                <h3 className="font-semibold text-blue-500">Q: {faq.question}</h3>
                <p className="mt-2 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={`text-center p-8 rounded-xl ${isDark ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Need Help? We're Here for You!</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Still not sure where to start? Contact Taprodev Computers — our tech team will guide you to the best parts within your budget.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              to="/contact" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Contact Our Team
            </Link>
            <a 
              href="tel:+94757333502" 
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Call Now: +94 757 333 502
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PCBuildingGuides;
