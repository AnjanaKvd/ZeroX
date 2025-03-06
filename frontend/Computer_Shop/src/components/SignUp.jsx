import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";

const SignUp = () => {
  const { register, handleSubmit } = useForm();

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
        <form onSubmit={handleSubmit((data) => console.log(data))}>
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">First Name</label>
              <input
                {...register("firstName")}
                name="firstName"
                type="text"
                className="form-control"
                required
              />
            </div>
            <div className="col">
              <label className="form-label">Last Name</label>
              <input
                {...register("lastName")}
                name="lastName"
                type="text"
                className="form-control"
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">E-mail Address</label>
            <input
              {...register("email")}
              name="email"
              type="email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Create Password</label>
            <input
              {...register("createPassword")}
              name="createPassword"
              type="password"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              name="confirmPassword"
              type="password"
              className="form-control"
              required
            />
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
