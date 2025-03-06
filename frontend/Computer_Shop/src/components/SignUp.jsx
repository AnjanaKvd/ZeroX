import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";


const SignUp = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

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
                {...register("lastName", {
                  required: "Last Name is required!",
                })}
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
              {...register("email", {
                required: "Email is required!",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address!",
                },
              })}
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
              {...register("createPassword", {
                required: "Password is required!",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters!",
                },
              })}
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
              {...register("confirmPassword", {
                required: "Confirm Password is required!",
                validate: (value) =>
                  value === watch("createPassword") ||
                  "Passwords do not match!",
              })}
              name="confirmPassword"
              type="password"
              className="form-control"
            />
            {errors.confirmPassword && (
              <p className="text-danger">{errors.confirmPassword.message}</p>
            )}
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
          <a href="">Sign In</a>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
