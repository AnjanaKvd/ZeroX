import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Sidebar from '../common/Sidebar/Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from '../common/ErrorBoundary';
import { useTheme } from '../../context/ThemeContext';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-background-dark' : 'bg-background-light'}`}>
      {/* Mobile Menu Toggle */}
      <button
        className={`md:hidden fixed right-4 top-4 z-50 p-2 rounded-lg shadow-lg ${
          theme === 'dark' ? 'bg-surface-dark text-text-dark-primary' : 'bg-surface-light text-text-light-primary'
        }`}
        onClick={toggleSidebar}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <Header />
      
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isMobileMenuOpen} onToggle={toggleSidebar} />
        
        <main className={`flex-1 p-4 md:p-6 transition-all duration-300 ${
          theme === 'dark' ? 'bg-background-dark text-text-dark-primary' : 'bg-background-light text-text-light-primary'
        }`}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;