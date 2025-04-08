import React, { useState, useEffect, useContext } from "react";
import { loginContext } from "../../context/loginContext";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";

import "./Login.css";
import axios from "axios";

function Login() {
  let navigate = useNavigate();

 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  let [
    currentUser,
    error,
    setError,
    userLoginStatus,
    setUserLoginStatus,
    loginUser,
    logoutUser,
    role,
    setRole,
    setCurrentUser,
  ] = useContext(loginContext);

  let handleUserLogin = (userobj) => {
    loginUser(userobj);
    console.log("successful login ");
  };

  useEffect(() => {
    if (userLoginStatus && role == "admin") {
      navigate("/dashboard");
    }
  }, [userLoginStatus]);
 

  return (
    <div className="Login container pt-5 ">
     
     
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
      <div className="dog m-auto shadow-lg rounded">
        <h2 className="title">Login</h2>
        <form onSubmit={handleSubmit(handleUserLogin)} action="" className="login">
          <div className="inputbox form-floating">
            <i className="fa-regular fa-user"></i>
            <input
              type="email"
              id="email"
              className="form-control"
              name="email"
              {...register("email", { required: true, pattern: /^\S+@\S+$/ })}
              placeholder="xyz"
            />
            <label htmlFor="email" className="text-dark">
              email
            </label>
            {errors.email && errors.email.type === "required" && (
              <p className="text-danger">*enter your email</p>
            )}
            {errors.email && errors.email.type === "pattern" && (
              <p className="text-danger">*enter Link valid email address</p>
            )}
          </div>

          <div className="inputbox form-floating">
            <i className="fa-solid fa-lock"></i>
            <input
              type="password"
              id="password"
              className="form-control"
              name="password"
              {...register("password", { required: true, minLength: 4 })}
              placeholder="xyz"
            />
            <label htmlFor="password" className="text-dark">
              password
            </label>
            {errors.password && errors.password.type === "required" && (
              <p className="text-danger">*enter your password</p>
            )}
            {errors.password && errors.password.type === "minLength" && (
              <p className="text-danger">
                *minimum 4 password word is required
              </p>
            )}
          </div>

          <button
            type="submit"
            className="custom-btn btn-5 d-block m-auto mt-5 rounded"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
