import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthLayout } from "../components/layouts/AuthLayout";
import { FormInput, ErrorMessage, AuthButton } from "../components/auth/FormElements";
import { z } from "zod";

const signUpSchema = z
  .object({
    fullName: z.string().nonempty("Full name is required").min(3, "Full name must be at least 3 characters"),
    email: z.string().nonempty("Email is required").email("Invalid email format"),
    phone: z
      .string()
      .nonempty("Phone number is required")
      .regex(/^(?:\+94|0)\d{9}$/, "Invalid format! Use +94XXXXXXXXX or 0XXXXXXXXX"),
    password: z.string().nonempty("Password is required").min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(signUpSchema) });

  const handleRegistration = useCallback(async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await registerUser(data);
      if (!result?.success) {
        throw new Error(result?.message || "Registration failed");
      }
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  }, [registerUser, navigate]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-4 text-2xl font-semibold text-center">Sign Up</h3>
          {error && <ErrorMessage message={error} />}
          <form onSubmit={handleSubmit(handleRegistration)} noValidate>
            <FormInput id="fullName" label="Full Name" type="text" error={errors.fullName} register={register("fullName")} />
            <FormInput id="email" label="Email Address" type="email" error={errors.email} register={register("email")} />
            <FormInput id="phone" label="Phone Number" type="tel" error={errors.phone} register={register("phone")} />
            <FormInput id="password" label="Password" type="password" error={errors.password} register={register("password")} />
            <FormInput id="confirmPassword" label="Confirm Password" type="password" error={errors.confirmPassword} register={register("confirmPassword")} />
            <AuthButton isLoading={isLoading}>Create Account</AuthButton>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;