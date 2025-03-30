// pages/Login.jsx
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput, ErrorMessage, AuthButton } from '../components/auth/FormElements';

const Login = () => {
  const { login, hasRole } = useAuth();
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

      // Handle navigation here, after successful login
      const redirectTo = state?.from || (hasRole('ADMIN') ? '/admin/dashboard' : '/');
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || 'An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [login, navigate, hasRole, state]);

  return (
    <>
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
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />

        <AuthButton isLoading={isLoading}>
          Sign In
        </AuthButton>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </>
  );
};

export default Login;