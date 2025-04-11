import axios from "axios";

import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import { useForm } from "react-hook-form";

const Register = () => {
  let [error, setError] = useState("");
  let {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  let formSubmit = (newUser) => {
    newUser = {
      ...newUser,
      middlename: newUser.middlename || "",
      role: "student",
      tasks: [],
    };

    axios
      .post(`/user-api/register-user`, newUser)
      .then((response) => {
        if (response.status === 201) {
          navigate("/login");
        }
        if (response.status !== 201) {
          setError(response.data.message);
          alert(response.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
        } else if (err.request) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      });
    reset();
  };

  return (
    <div className="register container ">
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
      {/* first row for username */}
      {error?.length !== 0 && <p className="text-danger display-1"> {error}</p>}

      <div className="dog  shadow-lg  rounded m-auto my-5">
        <div className="card-body   ">
          <h3 className="title">Sign up</h3>

          <form onSubmit={handleSubmit(formSubmit)} className="signup">
            
              
                {/* first name */}
                <div className="inputbox2 form-floating ">
                  <i className="fa-regular fa-user "></i>
                  <input
                    type="text"
                    id="firstname"
                    className="form-control "
                    placeholder="xyz"
                    {...register("firstname", {
                      required: true,
                      pattern: /^[A-Za-z]+$/i,
                    })}
                  />
                  <label htmlFor="firstname" className="text-dark">
                    user name
                  </label>

                  {errors.firstname?.type === "required" && (
                    <p className="text-danger">* Enter your first name</p>
                  )}
                  {errors.firstname?.type === "pattern" && (
                    <p className="text-danger">
                      * Only text characters allowed
                    </p>
                  )}
                </div>

               
                <div className="inputbox2 form-floating">
                  <i className="fa-solid fa-lock"></i>
                  <input
                    type="password"
                    id="password"
                    className="form-control "
                    placeholder="xyz"
                    {...register("password", {
                      required: true,
                      minLength: 4,
                    })}
                  ></input>
                  <label htmlFor="password" className="text-dark">
                    password
                  </label>

                  {errors.password?.type === "required" && (
                    <p className=" text-danger">*enter your password</p>
                  )}
                  {errors.password?.type === "minLength" && (
                    <p className=" text-danger">
                      *minimum 4 password word is required
                    </p>
                  )}
                </div>

               
            
              {/* second row   */}
              {/*  another col */}
              
               

                {/* third row  contains Email and Phone Number*/}

                <div className="inputbox2 form-floating">
                  <i className="fa-solid fa-envelope"></i>
                  <input
                    type="email"
                    id="email"
                    className="form-control "
                    placeholder="xyz"
                    {...register("email", { required: true })}
                  ></input>
                  <label htmlFor="email" className="text-dark">
                    Email
                  </label>

                  {errors.email?.type === "required" && (
                    <p className=" text-danger">*enter your valid email id</p>
                  )}
                </div>
                <div className="inputbox2 form-floating">
                  <i className="fa-solid fa-phone"></i>
                  <input
                    type="number"
                    id="phone"
                    className="form-control "
                    placeholder="xyz"
                    {...register("phone", { required: true, maxLength: 11 })}
                  ></input>
                  <label htmlFor="phone" className="text-dark">
                    Phone Number
                  </label>

                  {errors.phone?.type === "required" && (
                    <p className=" text-danger">*enter your Phone number</p>
                  )}
                  {errors.phone?.type === "maxLength" && (
                    <p className=" text-danger">
                      *maximum number length should be 10
                    </p>
                  )}
                </div>
              
               
              
            

            <button type="submit" className="text-center button-86 d-block m-auto">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>

  );
};

export default Register;
