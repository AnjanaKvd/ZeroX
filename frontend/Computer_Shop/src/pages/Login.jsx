import { useCallback, useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { z } from "zod";
import { FormInput, ErrorMessage, AuthButton } from "../components/auth/FormElements";

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
  const { login, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = useCallback(async (data) => {
    setLoading(true);
    setError("");
    try {
      const result = await login(data);
      if (!result?.success) {
        throw new Error(result?.message || "Login failed");
      }

      const redirectTo = state?.from || (hasRole("ADMIN") ? "/admin/dashboard" : "/");
      navigate(redirectTo);
    } catch (err) {
      setError(err.message || "An error occurred during login");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  }, [login, navigate, hasRole, state]);

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-4 text-2xl font-semibold text-center">Sign In</h3>

          {error && <ErrorMessage message={error} />}

          <form onSubmit={handleSubmit(handleLogin)} noValidate>
            <FormInput
              id="email"
              label="Email Address"
              type="email"
              placeholder="your.email@example.com"
              error={errors.email}
              register={register("email")}
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password}
              register={register("password")}
            />

            <AuthButton isLoading={loading}>Sign In</AuthButton>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;