import React, { useContext, useEffect } from "react";
import NavbarMain from "../navbar/NavbarMain";
import Footer from "../footer/Footer";
import { loginContext } from "../../context/loginContext";
import "./RootLayout.css";
import { Outlet } from "react-router-dom";
import axios from "axios";
import { PrimeReactProvider } from 'primereact/api';
import 'primeflex/primeflex.css';
import 'primereact/resources/primereact.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
function RootLayout() {
  let [currentUser,error,setError,userLoginStatus,setUserLoginStatus,loginUser,logoutUser,role,setRole,setCurrentUser] = useContext(loginContext);
 
  
  useEffect(()=>{
    const token = sessionStorage.getItem("token"); // Get token from sessionStorage

    if (token && !userLoginStatus) {
      axios
      .post(`${process.env.REACT_APP_API_URL}/user-api/verify-user`,{},{
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.data.message==="success") {
          
          setCurrentUser({...response.data.user})
          
          // update user login status
          setUserLoginStatus(true)
          setError("")
          sessionStorage.setItem("token",response.data.token)
         
          
          setRole(response.data.user.role)
        }
        else{
          setError(response.data.message);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          console.log(err.response);
        } else if (err.request) {
          setError(err.message);
        } else {
          setError(err.message);
        }
      });
    }
   
  },[])
  return (
    <div className="root_layout ">
      
      <div className="header">
        <NavbarMain />
      </div>

      <div className="main">
      <PrimeReactProvider  value={{ unstyled: false }}>
      <Outlet />
    </PrimeReactProvider>
       
      </div>
      {/* <div className="sticky-footer">
        <Footer />
      </div> */}
      
     
    </div>
  );
}

export default RootLayout;
