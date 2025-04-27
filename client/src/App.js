import React, { useState } from "react";
import "./App.css";
import Register from "./components/register/Register";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ErrorPage from "./components/errorpage/ErrorPage";
import Student from "./components/student/Student";
import Theory from "./components/theory/Theory";
import MiniRoot from "./components/rootlayout/MiniRoot";
import Practice from "./components/practice/Practice";
import Coach from "./components/coach/Coach";
import Account from "./components/account/Account";

function App() {
 
  const routerObj = createBrowserRouter([
    {
      path: "/",
      element: <MiniRoot/>,
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <Home />,
        },

        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/dashboard",
          element: <Dashboard />,
        },
        {
          path: "/student",
          element: <Student />,
          
        },{
          path: "/practice",
          element: <Practice />,
        },
        {
          path: "/account",
          element: <Account />,
          
        },
        {
          path: "/coach",
          element: <Coach />,
          
        }

      ],
    },
  ]);
  
  return (
 <div className="App">
  
      <RouterProvider router={routerObj} />

    </div>
   
  );
}

export default App;
