import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import ApiErrorDisplay from '../common/ApiErrorDisplay';
import { ChevronLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';

const AdminLayout = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const verifyAccess = useCallback(async () => {
    try {
      if (!user) {
        navigate('/login', { state: { from: location }, replace: true });
        return;
      }
      
      if (!hasRole('ADMIN')) {
        navigate('/', { replace: true });
        return;
      }
    } catch (err) {
      setError(err.message || 'Failed to verify admin access');
    } finally {
      setLoading(false);
    }
  }, [user, hasRole, navigate, location]);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      setError('Failed to logout. Please try again.');
    }
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/products', label: 'Product Management' },
    { path: '/admin/categories', label: 'Category Management' },
    { path: '/admin/orders', label: 'Order Management' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/settings', label: 'System Settings' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ApiErrorDisplay message={error} onRetry={verifyAccess} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Bars2Icon className="h-6 w-6" />
      </button>

      {/* Admin Sidebar */}
      <div className={`fixed md:relative md:translate-x-0 inset-y-0 left-0 w-64 bg-gray-800 text-white flex flex-col transform transition-transform duration-300 ease-in-out z-40 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="mt-1 text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            className="md:hidden p-1 hover:bg-gray-700 rounded"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {adminLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => 
                    `block px-3 py-2 rounded transition-colors ${
                      isActive 
                        ? 'bg-gray-700 text-white' 
                        : 'hover:bg-gray-700 text-gray-300'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left rounded hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
          <NavLink
            to="/"
            className="block px-3 py-2 rounded hover:bg-gray-700 transition-colors"
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

export default AdminLayout;