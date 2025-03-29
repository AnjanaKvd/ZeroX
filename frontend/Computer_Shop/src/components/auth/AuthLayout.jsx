// components/auth/AuthLayout.jsx
import Header from '../common/Header/Header';
import Footer from '../common/Footer/Footer';

export const AuthLayout = ({ children, title }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);