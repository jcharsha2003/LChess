import React, { useContext, useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { loginContext } from "../../context/loginContext";
import { FaChessKnight } from "react-icons/fa";
import { FaSignInAlt } from "react-icons/fa";
import { FaSignOutAlt } from "react-icons/fa";
import { IoMdPersonAdd } from "react-icons/io";
import { Link } from "react-router-dom";
import { useProSidebar } from "react-pro-sidebar";
import logo from "../../images/logo-c.png";
import { IconButton } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import "./NavbarMain.css";
import NotificationBar from "./NotificationBar";
const NavbarMain = () => {
  const { toggleSidebar, broken, rtl } = useProSidebar();
let [currentUser,error,setError,userLoginStatus,setUserLoginStatus,loginUser,logoutUser,role,setRole,setCurrentUser] = useContext(loginContext);

 

  return (
    <Navbar expand="lg" className="p-0 n-bar  ">
      <div className=" px-3 body1 d-flex ">
        <div className="flex me-auto">
          <Link className="nav-link text-black fs-3 m-2 s-p fw-bold" to="/">
            <img src={logo} width="23px" height="35px" alt="image"></img>
            {"  "}
            LChess
          </Link>
        </div>
        

        {broken && !rtl && userLoginStatus && (
          <IconButton
            sx={{ margin: "0 6 0 2" }}
            onClick={() => toggleSidebar()}
          >
            <MenuOutlinedIcon />
          </IconButton>
        )}

        <Navbar id="basic-navbar-nav ">
          <Nav className="d-block me-2 pt-2 ">
            {!userLoginStatus && (
              <ul className="navbar-nav menu ms-auto text-decoration-none ">
                <li className="nav-item active mx-2">
                  <Link
                    className="nav-link  icon-button horse "
                    style={{ padding: "1.3rem" }}
                    to="/"
                  >
                    <FaChessKnight className="icon-horse" />
                    <span></span>
                  </Link>
                </li>
                <li className="nav-item active mx-2">
                  <Link
                    className="nav-link  icon-button horse "
                    style={{ padding: "1.3rem" }}
                    to="/login"
                  >
                    <FaSignInAlt className="icon-horse" />
                    <span></span>
                  </Link>
                </li>
                <li className="nav-item active mx-2">
                  <Link
                    className="nav-link  icon-button horse "
                    style={{ padding: "1.3rem" }}
                    to="/register"
                  >
                    <IoMdPersonAdd className="icon-horse" />
                    <span></span>
                  </Link>
                </li>
              </ul>
            )}
            {userLoginStatus && role == "admin" && (
              <ul className="navbar-nav menu   text-decoration-none ">
                <li className="nav-item active mx-2">
                  <Link
                    className="nav-link  icon-button horse "
                    style={{ padding: "1.3rem" }}
                    to="/"
                  >
                    <FaChessKnight className="icon-horse" />
                    <span></span>
                  </Link>
                </li>
  {/* Notification bell here */}
  <NotificationBar
   
  />
                <li className="nav-item active mx-2">
                  <Link
                    className="nav-link  icon-button horse "
                    style={{ padding: "1.3rem" }}
                    to="/login"
                    onClick={logoutUser}
                  >
                    <FaSignOutAlt className="icon-horse" />
                    <span></span>
                  </Link>
                </li>
              </ul>
            )}
          </Nav>
        </Navbar>
      </div>
    </Navbar>
  );
};

export default NavbarMain;
