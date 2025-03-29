// pages/Login.jsx
import { useCallback, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { FormInput, ErrorMessage, AuthButton } from '../components/auth/FormElements';

const Login = () => {
  const { login, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onBlur',
  });

  const handleLogin = useCallback(async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await login(data);
      if (!result?.success) {
        throw new Error(result?.message || 'Login failed');
      }

      navigate(hasRole('ADMIN') ? '/admin/dashboard' : state?.from || '/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate, hasRole, state]);

  return (
    <AuthLayout title="Login to Your Account">
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit(handleLogin)} noValidate>
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          error={errors.email}
          register={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password}
          register={register('password', {
            required: 'Password is required',
          })}
        />

        <AuthButton isLoading={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </AuthButton>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;