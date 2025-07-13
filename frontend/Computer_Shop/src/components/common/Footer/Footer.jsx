import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import logoImage from '../../../assets/images/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer className={`mt-auto bg-surface border-t border-border transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link 
              to="/" 
              className="flex items-center text-2xl font-bold text-primary hover:text-primary-hover transition-colors"
            >
              <img src={logoImage} alt="Taprodev Computers" className="h-9 w-auto mr-2" />
            </Link>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
            }`}>
              Premium computer components and peripherals for enthusiasts and professionals
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/products"
                className={`text-sm hover:text-primary-hover transition-colors ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                }`}
              >
                Shop All Products
              </Link>
              <Link
                to="/pc-building-guides"
                className={`text-sm hover:text-primary-hover transition-colors ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                }`}
              >
                PC Building Guides
              </Link>
              <Link
                to="/contact"
                className={`text-sm hover:text-primary-hover transition-colors ${
                  theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
                }`}
              >
                Customer Support
              </Link>
            </nav>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Contact Us</h3>
            <address className={`not-italic text-sm ${
              theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
            }`}>
              <p>No. 254,</p>
              <p>Rjawella 02,</p>
              <p> Gonawala,</p>
              <p> Digana</p>
              <p>Kandy</p>
              <p>Sri Lanka</p>
              <p className="mt-2">
                Email:{' '}
                <a 
                  href="mailto:support@Taprodev Computers.com" 
                  className="hover:text-primary-hover transition-colors"
                >
                  taprodev@gmail.com
                </a>
              </p>
              <p>
                Phone:{' '}
                <a 
                  href="tel:+94757333502" 
                  className="hover:text-primary-hover transition-colors"
                >
                  (94)757333502
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Copyright Section */}
        <div className={`mt-12 pt-8 border-t border-border text-center ${
          theme === 'dark' ? 'text-text-dark-secondary' : 'text-text-light-secondary'
        }`}>
          <p className="text-sm">
            &copy; {currentYear} Taprodev Computers. All rights reserved.
            <span className="mx-2">|</span>
            <Link 
              to="/privacy" 
              className="hover:text-primary-hover transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="mx-2">|</span>
            <Link 
              to="/terms" 
              className="hover:text-primary-hover transition-colors"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;