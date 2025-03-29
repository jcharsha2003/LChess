import React, { useState } from "react";
import "./App.css";
import Register from "./components/register/Register";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./components/home/Home";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import ErrorPage from "./components/errorpage/ErrorPage";
import Student from "./components/student/Student";
import Details from "./components/details/Details";
import MiniRoot from "./components/rootlayout/MiniRoot";
import Payment from "./components/payment/Payment";

import EditStudent from "./components/edit_student/EditStudent";

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
          path: "/edit-student",
          element: <EditStudent />,
        },
        {
          path: "/details",
          element: <Details />,
          
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
