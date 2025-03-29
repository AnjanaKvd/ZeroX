import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';

const Unauthorized = () => {
  return (
    <AuthLayout title="Access Denied">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-red-600 text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Unauthorized Access
          </h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to view this page. Please contact the 
            administrator or return to the homepage.
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white 
            font-medium px-6 py-3 rounded-md transition duration-300"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Unauthorized;