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
  const [registrationError, setRegistrationError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data) => {
    console.log("Form data:", data);
    setLoading(true);
    setRegistrationError("");
    try {
      const result = await registerUser(data);
      if (result.success) {
        navigate("/login");
      } else {
        const errorMessage = result.message || "Registration failed";

        if (errorMessage.includes("maximum registration attempts")) {
          setRegistrationError(
            "This email has been used too many times. Please use a different email."
          );
        } else if (errorMessage.includes("active account")) {
          setRegistrationError(
            "An active account already exists with this email."
          );
        } else if (errorMessage.includes("Duplicate entry")) {
          setRegistrationError(
            "You signed up with this email before! Please use a different email."
          );
        } else {
          setRegistrationError(errorMessage);
        }
      }

      navigate('/');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "An unexpected error occurred. Please try again.";

      if (errorMessage.includes("maximum registration attempts")) {
        setRegistrationError(
          "This email has been used too many times. Please use a different email."
        );
      } else if (errorMessage.includes("active account")) {
        setRegistrationError(
          "An active account already exists with this email."
        );
      } else if (errorMessage.includes("Duplicate entry")) {
        setRegistrationError(
          "This email is already associated with an account."
        );
      } else {
        setRegistrationError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [registerUser, navigate]);

  return (
    <>
      <Header />

      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-4 text-2xl font-semibold text-center">Sign Up</h3>

          {registrationError && (
            <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
              {registrationError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                {...register("fullName")}
                className="w-full p-2 border rounded-md"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Email Address</label>
              <input
                {...register("email")}
                className="w-full p-2 border rounded-md"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                {...register("phone")}
                className="w-full p-2 border rounded-md"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Password</label>
              <input
                type="password"
                {...register("password")}
                className="w-full p-2 border rounded-md"
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

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