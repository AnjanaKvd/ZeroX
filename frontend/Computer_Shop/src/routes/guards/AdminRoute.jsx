import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, hasRole } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return hasRole('ADMIN') ? children : <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;