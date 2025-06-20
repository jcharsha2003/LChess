import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import UserLoginContextStore from "./context/UserLoginContextStore";
import { ToastContainer,Bounce} from 'react-toastify';
import { NotificationProvider } from "./context/NotificationContext";
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
     
     
    
     <UserLoginContextStore> 
          <NotificationProvider>
               <App />
        
    
   
     <ToastContainer
position="top-right"
autoClose={5000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="colored"
transition={Bounce}
/>
  </NotificationProvider>
</UserLoginContextStore>
   

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
