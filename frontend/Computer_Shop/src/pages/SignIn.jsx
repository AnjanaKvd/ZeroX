import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "../index.css";

const SignInSchema = z.object({
  email: z
    .string()
    .nonempty({ message: "Email is required!" })
    .email({ message: "Invalid email address!" }),
  password: z
    .string()
    .nonempty({ message: "Password is required!" })
    .min(8, { message: "Password must be at least 8 characters" }),
});

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(SignInSchema) });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-6 w-full max-w-md">
        <h3 className="text-center text-2xl font-semibold mb-4">SIGN IN</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-4">
            <label className="block text-sm font-medium">E-mail Address</label>
            <input
              {...register("email")}
              type="email"
              name="email"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password</label>
            <input
              {...register("password")}
              type="password"
              name="password"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.password && (
              <p className="text-red-400 text-sm">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
          >
            Login
          </button>
          <p className="mt-2 text-center text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignIn;


