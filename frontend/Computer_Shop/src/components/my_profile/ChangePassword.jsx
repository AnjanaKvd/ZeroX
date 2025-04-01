import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const changePasswordSchema = z
  .object({
    previousPassword: z
      .string()
      .nonempty({ message: "Current password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),
    newPassword: z
      .string()
      .nonempty({ message: "New password is required!" })
      .min(8, { message: "Password must be at least 8 characters!" }),
    // .regex(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    //   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    // ),
    confirmPassword: z
      .string()
      .nonempty({ message: "Confirmation password is required!" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match!",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.previousPassword, {
    message: "New password must be different from current password!",
    path: ["newPassword"],
  });

const ChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Here you would call your API to change the password
      console.log("Password Change Request:", data);
      // Example API call:
      // const response = await axios.put("/api/auth/change-password", data, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess("Password changed successfully!");
      reset();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        Change Password
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Current Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">Current Password</label>
          <input
            type="password"
            {...register("previousPassword")}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
          {errors.previousPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.previousPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">New Password</label>
          <input
            type="password"
            {...register("newPassword")}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium">
            Confirm New Password
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="mt-1 w-full border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none p-2"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-md transition disabled:opacity-70"
        >
          {loading ? "Updating password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
