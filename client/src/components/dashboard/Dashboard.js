import React,{useContext} from 'react'
import { loginContext } from '../../context/loginContext';
const Dashboard = () => {
    let [currentUser,error,setError,userLoginStatus,setUserLoginStatus,loginUser,logoutUser,role,setRole,setCurrentUser] = useContext(loginContext);
  return (
    <div>  {error?.length !== 0 && <p className="text-danger display-1"> {error}</p>}Dashboard</div>
  )
}

export default Dashboard