import { useState } from 'react';
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';
import Sidebar from '../common/Sidebar/Sidebar';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import ErrorBoundary from '../common/ErrorBoundary';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden fixed right-4 top-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="h-6 w-6 text-gray-700" />
        ) : (
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <Header />
      
      <div className="flex flex-1 relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        
        <main className="flex-1 p-4 md:p-6 transition-all duration-300">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default MainLayout;