import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { z } from "zod";

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .nonempty({ message: "Name is required!" })
      .min(3, { message: "Full name must be at least 3 characters!" }),
    email: z
      .string()
      .nonempty({ message: "Email is required!" })
      .email({ message: "Invalid email format!" }),
    phone: z
      .string()
      .nonempty({ message: "Phone number is required!" })
      .regex(/^(?:\+94|0)\d{9}$/, {
        message: "Invalid format! Use +94XXXXXXXXX or 0XXXXXXXXX",
      })
      .min(10, { message: "Phone number must be at least 10 digits!" })
      .max(12, { message: "Phone number must be at most 12 digits!" }),
    password: z
      .string()
      .nonempty({ message: "Password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirmation password is required!" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
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
    setLoading(true);
    setRegistrationError("");
    try {
      const result = await registerUser(data);
      if (result?.success) {
        // Redirect to login with success state
        navigate("/login", {
          state: {
            registrationSuccess: true,
            email: data.email,
          },
        });
      } else {
        setRegistrationError(result?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response) {
        if (
          err.response.data?.message?.includes("maximum registration attempts")
        ) {
          setRegistrationError(
            "This email has reached maximum registration attempts. Use a different email."
          );
        } else if (
          err.response.data?.message?.includes("Email already in use")
        ) {
          setRegistrationError(
            "An account already exists with this email. Please login instead."
          );
        } else if (err.response.data?.message?.includes("deleted")) {
          setRegistrationError(
            "This email was previously used for a deleted account and cannot be reused."
          );
        } else {
          setRegistrationError(
            err.response.data?.message ||
              "Registration failed. Please try again."
          );
        }
      } else if (err.request) {
        setRegistrationError("Network error. Please check your connection.");
      } else {
        setRegistrationError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-2xl font-semibold text-center">Sign Up</h3>

      {registrationError && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md">
          {registrationError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <input
            {...register("fullName")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Email Address
          </label>
          <input
            {...register("email")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Phone Number</label>
          <input
            {...register("phone")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            Confirm Password
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-medium text-white transition bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
