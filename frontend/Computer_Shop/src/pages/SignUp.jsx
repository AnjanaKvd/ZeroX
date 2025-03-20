import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "../index.css";

// Creating a schema using zod and Adding schema-based validation using zod
const SignUpSchema = z
  .object({
    firstName: z.string().nonempty({ message: "First name is required!" }),
    lastName: z.string().nonempty({ message: "Last name is required!" }),
    email: z
      .string()
      .nonempty({ message: "Email is required!" })
      .email({ message: "Invalid email address!" }),
    createPassword: z
      .string()
      .nonempty({ message: "Password is required!" })
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirmation password is required!" })
      .min(8, { message: "Confirm password must be at least 8 characters" }),
  })
  .refine((data) => data.createPassword === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg p-6 w-full max-w-md">
        <h3 className="text-center text-2xl font-semibold mb-4">SIGN UP</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="col">
              <label className="block text-sm font-medium">First Name</label>
              <input
                {...register("firstName", {
                  required: "First Name is required!",
                })}
                name="firstName"
                type="text"
                className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
              />
              {errors.firstName && (
                <p className="text-red-400 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                {...register("lastName")}
                name="lastName"
                type="text"
                className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
              />
              {errors.lastName && (
                <p className="text-red-400 text-sm ">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium">E-mail Address</label>
            <input
              {...register("email")}
              name="email"
              type="email"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.email && (
              <p className="text-red-400 text-sm">{errors.email.message}</p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium">Create Password</label>
            <input
              {...register("createPassword")}
              name="createPassword"
              type="password"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.createPassword && (
              <p className="text-red-400 text-sm">
                {errors.createPassword.message}
              </p>
            )}
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              {...register("confirmPassword")}
              name="confirmPassword"
              type="password"
              className="mt-1 p-2 w-full border rounded-md focus:ring focus:ring-blue-300"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            // disabled={!isValid}
            type="submit"
            className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md"
          >
            Sign Up
          </button>

          <p className="mt-2 text-center text-sm">
            Click here to{" "}
            <a href="./signin" className="text-blue-500">
              {" "}
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
