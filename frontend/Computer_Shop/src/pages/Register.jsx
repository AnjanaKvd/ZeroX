// pages/Register.jsx
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { FormInput, ErrorMessage, AuthButton } from '../components/auth/FormElements';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    mode: 'onBlur',
  });

  const password = watch('password');

  const handleRegistration = useCallback(async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await registerUser(data);
      if (!result?.success) {
        throw new Error(result?.message || 'Registration failed');
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [registerUser, navigate]);

  return (
    <>
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit(handleRegistration)} noValidate>
        <FormInput
          id="fullName"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          error={errors.fullName}
          register={register('fullName', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
          })}
        />

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
          id="phone"
          label="Phone Number"
          type="tel"
          placeholder="1234567890"
          error={errors.phone}
          register={register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[1-9]\d{7,14}$/,
              message: 'Invalid phone number format',
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
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          })}
        />

        <FormInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword}
          register={register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => value === password || 'Passwords do not match',
          })}
        />

        <AuthButton isLoading={isLoading}>
          Create Account
        </AuthButton>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
};

export default Register;