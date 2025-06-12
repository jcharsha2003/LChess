import axios from "axios";
import { useState } from "react";
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

  let formSubmit = (newUser) => {
    axios
      .post(`/register-user`, newUser)
      .then((response) => {
        if (response.status === 201) {
          
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
        <div className="card-body p-3  ">
          

          <form onSubmit={handleSubmit(formSubmit)}>
            <div className="row justify-content-center ">
              {/* first col */}
              <div className="col-md-10 col-lg-6 col-xl-5  ">
             
              </div>
              {/* second column */}
             
              <div className="col-md-10 col-lg-6 col-xl-5  ">
             
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