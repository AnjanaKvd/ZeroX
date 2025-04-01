import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { z } from "zod";
import Header from "../components/common/Header/Header";
import Footer from "../components/common/Footer/Footer";

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .nonempty({ message: "Name is required !" })
      .min(3, "Full name must be at least 3 characters !"),
    email: z
      .string()
      .nonempty({ message: "Email is required !" })
      .email("Invalid email format !"),
    phone: z
      .string()
      .nonempty({ message: "Phone number is required !" })
      .regex(
        /^(?:\+94|0)\d{9}$/,
        "Invalid format ! Use +94XXXXXXXXX or 0XXXXXXXXX"
      )
      .min(10, "Phone number must be at least 10 digits !")
      .max(12, "Phone number must be at most 15 digits !"),
    password: z
      .string()
      .nonempty({ message: "Password is required !" })
      .min(8, { message: "Password must be at least 8 characters !" }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirmation password is required !" })
      .min(8, { message: "Confirm password must be at least 8 characters !" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match !",
    path: ["confirmPassword"],
  });

const Register = () => {
  const { register: registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState("");
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
    setError("");
    try {
      const result = await registerUser(data);
      if (result.success) {
        navigate("/login");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-lg p-6 w-full max-w-md rounded-lg">
          <h3 className="text-center text-2xl font-semibold mb-4">Sign Up</h3>

          {error && (
            <p className="bg-red-100 text-blue-600 p-2 rounded-md">{error}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium">Full Name</label>
              <input
                {...register("fullName")}
                className="w-full p-2 border rounded-md"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">
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
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium">Phone Number</label>
              <input
                {...register("phone")}
                className="w-full p-2 border rounded-md"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
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
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full p-2 border rounded-md"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition disabled:opacity-70"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Register;
