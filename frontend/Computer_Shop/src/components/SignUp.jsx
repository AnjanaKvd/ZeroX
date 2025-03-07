import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Creating a schema using zod and Adding schema-based validation using zod
const Schema = z
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
    formState: { errors }, //formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(Schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f0f2f5" }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ width: "100%", maxWidth: "500px", marginTop: "-50px" }}
      >
        <h3 className="text-center mb-4">SIGN UP</h3>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">First Name</label>
              <input
                {...register("firstName", {
                  required: "First Name is required!",
                })}
                name="firstName"
                type="text"
                className="form-control"
              />
              {errors.firstName && (
                <p className="text-danger">{errors.firstName.message}</p>
              )}
            </div>
            <div className="col">
              <label className="form-label">Last Name</label>
              <input
                {...register("lastName")}
                name="lastName"
                type="text"
                className="form-control"
              />
              {errors.lastName && (
                <p className="text-danger">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">E-mail Address</label>
            <input
              {...register("email")}
              name="email"
              type="email"
              className="form-control"
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Create Password</label>
            <input
              {...register("createPassword")}
              name="createPassword"
              type="password"
              className="form-control"
            />
            {errors.createPassword && (
              <p className="text-danger">{errors.createPassword.message}</p>
            )}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              name="confirmPassword"
              type="password"
              className="form-control"
            />
            {errors.confirmPassword && (
              <p className="text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button
            // disabled={!isValid}
            type="submit"
            className="btn btn-primary w-100"
          >
            Sign Up
          </button>
          Click here to
          <a href=""> Sign In</a>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
