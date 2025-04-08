import React,{useState,useContext, useEffect} from 'react'
import {loginContext} from "./loginContext"
import axios from 'axios'
import { toast, Bounce } from "react-toastify";
function UserLoginContextStore({children}){
    let [currentUser,setCurrentUser]=useState({})
    let[role,setRole]=useState("")
    let[error,setError]=useState("")
    let[userLoginStatus,setUserLoginStatus]=useState(false)
    
    let url=window.location.href;
  
    
    
    
    // userlogin 
    const loginUser=(userCredObj)=>{
        
        axios.post(`${process.env.REACT_APP_API_URL}/user-api/user-login`,userCredObj)
        .then(response=>{
            if(response.data.message==="success"){
                setCurrentUser({...response.data.user})
                // update user login status
                setUserLoginStatus(true)
                setError("")
                sessionStorage.setItem("token",response.data.token)
               
                
                setRole(response.data.user.role)
            }
            else{
                setError(response.data.message)
                toast.error(response.data.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                    transition: Bounce,
                    });
            }
        }

        )
        .catch(err=>{setError(err.data.message);
            toast.error(err.data.message, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                });
        })

    }
    const logoutUser=()=>{
        sessionStorage.clear()
        setUserLoginStatus(false)
    }
    return (
        <loginContext.Provider value={[currentUser,error,setError,userLoginStatus,setUserLoginStatus,loginUser,logoutUser,role,setRole,setCurrentUser]}>{children}</loginContext.Provider>
    )
    
}
export default UserLoginContextStore