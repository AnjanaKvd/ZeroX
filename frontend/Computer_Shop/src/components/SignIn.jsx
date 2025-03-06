import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useForm } from "react-hook-form";

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <>
      <div
        className="container-fluid d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#f0f2f5" }}
      >
        <div
          className="card shadow-lg p-4"
          style={{ width: "100%", maxWidth: "500px", marginTop: "-50px" }}
        >
          <h3 className="text-center mb-4">SIGN IN</h3>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label">E-mail Address</label>
              <input
                {...register("email", {
                  required: "Email is required!",
                })}
                name="email"
                type="email"
                className="form-control"
                required
              />
              {errors.email && (
                <p className="text-danger">{errors.email.message}</p>
              )}
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                {...register("password", {
                  required: "Password is required!",
                })}
                name="password"
                type="password"
                className="form-control"
                minLength={8}
                required
              />
              {errors.password && (
                <p className="text-danger">{errors.password.message}</p>
              )}
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Login
              </button>
              <a href="">Sign Up</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignIn;
