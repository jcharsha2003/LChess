import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast, Bounce } from "react-toastify";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonthNum, setSelectedMonthNum] = useState(null);
  const [refreshStudents, setRefreshStudents] = useState(() => () => {});
  // Fetch notifications on mount
  useEffect(() => {
  const fetchNotifications = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/notify-api/get-notifications`, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      })
      .then(res => setNotifications(res.data.payload || []))
      .catch(() => setNotifications([]));
  };

  fetchNotifications(); // initial fetch

  const interval = setInterval(fetchNotifications, 15000); // every 15 seconds

  return () => clearInterval(interval);
}, []);

  // Mark as read
  const markAsRead = (id) => {
    axios
      .put(`${process.env.REACT_APP_API_URL}/notify-api/mark-read/${id}`, {}, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      })
      .then(() => {
        setNotifications(nots => nots.map(n => n._id === id ? { ...n, read: true } : n));
        toast.success("Notification marked as read!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      });
  };

  // Remove notification
  const removeNotification = (id) => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/notify-api/delete-notification/${id}`, {
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
      })
      .then(() => {
        setNotifications(nots => nots.filter(n => n._id !== id));
        toast.success("Notification removed!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        });
      });
  };

  // Clear all read notifications
  const clearRead = () => {
    notifications.filter(n => n.read).forEach(n => removeNotification(n._id));
    toast.success("All read notifications cleared!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      markAsRead,
      removeNotification,
      clearRead,
      selectedYear,
      setSelectedYear,
      selectedMonthNum,
      setSelectedMonthNum,
      refreshStudents,
      setRefreshStudents,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};