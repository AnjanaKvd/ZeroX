import { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const categories = [
    { id: 1, name: 'Laptops', icon: '💻' },
    { id: 2, name: 'Desktop PCs', icon: '🖥️' },
    { id: 3, name: 'Components', icon: '🔧' },
    { id: 4, name: 'Accessories', icon: '🎮' },
    // Add more categories as needed
  ];

  return (
    <aside className={`bg-white shadow-lg transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 w-full flex items-center justify-center hover:bg-gray-100"
      >
        {isOpen ? '←' : '→'}
      </button>
      
      <nav className="p-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/category/${category.id}`}
            className="flex items-center p-2 hover:bg-gray-100 rounded-lg mb-2"
          >
            <span className="text-xl">{category.icon}</span>
            {isOpen && (
              <span className="ml-3">{category.name}</span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 