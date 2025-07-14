// pages/Logout.jsx
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LoadingOverlay } from '../components/common/Loading';

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate('/', { replace: true, state: { from: 'logout' } });
      } catch (error) {
        navigate('/');
      }
    };

    performLogout();
  }, [logout, navigate]);

  return <LoadingOverlay message="Securely logging you out..." />;
};

export default Logout;