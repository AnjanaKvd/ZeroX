import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required!" })
    .email({ message: "Invalid email address!" }),
  password: z
    .string()
    .nonempty({ message: "Password is required!" })
    .min(8, { message: "Password must be at least 8 characters!" }),
});

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check for successful registration redirect
  const registrationSuccess = location.state?.registrationSuccess;
  const registeredEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registeredEmail,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const result = await login(data);
      if (result?.success) {
        navigate("/"); // Only after successful login
      } else {
        setError(result?.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        if (err.response.status === 401) {
          setError("Invalid email or password");
        } else if (err.response.status === 403) {
          setError("Access denied. Please contact support.");
        } else if (
          err.response.data?.message?.includes("account has been deleted")
        ) {
          setError("This account was deleted. Contact support to restore.");
        } else {
          setError(
            err.response.data?.message || "Login failed. Please try again."
          );
        }
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-md rounded-lg p-6 ">
      {/* <h3 className="text-center text-2xl font-semibold mb-4">Sign In</h3> */}

      {registrationSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          Registration successful! Please login to continue.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            {...register("email")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-300"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
