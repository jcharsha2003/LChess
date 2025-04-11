import axios from "axios";

import React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Theory.css";
import { useForm } from "react-hook-form";

const Theory = () => {
  let [error, setError] = useState("");
  let {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const navigate = useNavigate();

  let formSubmit = (newUser) => {
   

    axios
      .post(`https://udyog-saarathi2-0.onrender.com/user-api/register-user`, newUser)
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
    <div className="bf container ">
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
      {/* first row for username */}
      {error?.length !== 0 && <p className="text-danger display-1"> {error}</p>}

      <div className="card shadow-lg  rounded my-5">
        <div className="card-body   ">
          

          <form onSubmit={handleSubmit(formSubmit)}>
            <div className="row justify-content-center ">
              <div className="col-md-10 col-lg-6 col-xl-5  ">
                {/* first name */}
                <div className="inputbox6 form-floating">
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    id="firstname"
                    className="form-control"
                    placeholder="xyz"
                    {...register("firstname", {
                      required: true,
                      pattern: /^[A-Za-z]+$/i,
                    })}
                  />
                  <label htmlFor="firstname" className="text-dark">
                    First Name
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

                {/* middle name */}
                <div className="inputbox6 form-floating">
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    id="middlename"
                    className="form-control"
                    placeholder="xyz"
                    {...register("middlename", {
                      pattern: /^[A-Za-z]+$/i,
                    })}
                  />
                  <label htmlFor="middlename" className="text-dark">
                    Middle Name
                  </label>
                  {errors.middlename?.type === "pattern" && (
                    <p className="text-danger">
                      * Only text characters allowed
                    </p>
                  )}
                </div>

                {/* last name*/}
                <div className="inputbox6 form-floating">
                  <i className="fa-regular fa-user"></i>
                  <input
                    type="text"
                    id="lastname"
                    className="form-control"
                    placeholder="xyz"
                    {...register("lastname", {
                      required: true,
                      pattern: /^[A-Za-z]+$/i,
                    })}
                  />
                  <label htmlFor="lastname" className="text-dark">
                    Last Name
                  </label>

                  {errors.lastname?.type === "required" && (
                    <p className="text-danger">* Enter your last name</p>
                  )}
                  {errors.lastname?.type === "pattern" && (
                    <p className="text-danger">
                      * Only text characters allowed
                    </p>
                  )}
                </div>

                <div className="inputbox6 form-floating">
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

                <div className="inputbox6 form-floating">
                  <i className="fa-solid fa-calendar-days"></i>
                  <input
                    type="date"
                    id="dob"
                    className="form-control "
                    placeholder="xyz"
                    {...register("dob", { required: true })}
                  ></input>
                  <label htmlFor="dob" className="text-dark">
                    date of birth
                  </label>

                  {errors.dob?.type === "required" && (
                    <span className="text-sm text-danger">
                      *date of birth is required
                    </span>
                  )}
                </div>
              </div>
              {/* second row   */}
              {/*  another col */}
              <div className="col-md-10 col-lg-6 col-xl-5  ">
                <div className="inputbox6 form-floating py-0 mb-5">
                  <select
                    className="form-select py-0 "
                    defaultValue=""
                    {...register("gender", { required: true })}
                  >
                    <option value="" disabled>
                      Choose gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>

                  {errors.gender?.type === "required" && (
                    <p className=" text-danger">*Select your gender</p>
                  )}
                  <i className="fa-solid fa-square-caret-down"></i>
                </div>

                {/* third row  contains Email and Phone Number*/}

                <div className="inputbox6 form-floating">
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
                <div className="inputbox6 form-floating">
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
                <div className="inputbox6 form-floating py-0 mb-5">
                  <select
                    className="form-select py-0 "
                    defaultValue=""
                    {...register("category", { required: true })}
                  >
                    <option value="" disabled>
                      Choose Category Type
                    </option>
                    <option value="D">Category-D</option>
                    <option value="E">Category-E</option>
                  </select>

                  {errors.category?.type === "required" && (
                    <p className=" text-danger">*Select your category Type</p>
                  )}
                  <i className="fa-solid fa-square-caret-down"></i>
                </div>
                <div className="inputbox6 form-floating">
                  <i className="fa-solid fa-user-magnifying-glass"></i>
                  <input
                    type="text"
                    id="udid"
                    className="form-control "
                    placeholder="udid"
                    {...register("udid", {
                      required: true,
                      minLength: 18,
                      maxLength: 18,
                    })}
                  ></input>
                  <label htmlFor="udid" className="text-dark">
                    UDID
                  </label>

                  {errors.udid?.type === "required" && (
                    <p className=" text-danger">*enter your UDID </p>
                  )}
                  {errors.udid?.type === "minLength" && (
                    <p className=" text-danger">
                      *minimum 18 letter word is required
                    </p>
                  )}
                  {errors.udid?.type === "maxLength" && (
                    <p className=" text-danger">
                      *maximum 18 letter word is required
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="text-center button-86 d-block m-auto">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Theory