import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';

const TechnicianLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
    }
  };

  const technicianLinks = [
    { path: '/technician/orders', label: 'Order Management' },
    { path: '/technician/repairs', label: 'Repair Management' },
    { path: '/technician/reports', label: 'Reports' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Technician Sidebar */}
      <div className={`fixed md:relative md:translate-x-0 inset-y-0 left-0 w-64 bg-blue-600 text-white flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-blue-500 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Technician Panel</h1>
            <p className="mt-1 text-xs text-blue-100 truncate">{user?.email}</p>
          </div>
          <button
            className="md:hidden p-1 hover:bg-blue-500 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {technicianLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded transition-colors ${
                      isActive 
                        ? 'bg-blue-700 text-white' 
                        : 'hover:bg-blue-500 text-blue-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-blue-500 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left rounded hover:bg-blue-500 transition-colors"
          >
            Logout
          </button>
          <NavLink
            to="/"
            className="block px-3 py-2 rounded hover:bg-blue-500 transition-colors"
          >
            Back to Store
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default TechnicianLayout;
