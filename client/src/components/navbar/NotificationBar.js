import React, { useContext, useRef } from "react";
import { NotificationContext } from "../../context/NotificationContext";
import axios from "axios";
import { FaBell } from "react-icons/fa";
import { toast, Bounce } from "react-toastify";
import "./NotificationBar.css";

const NotificationBar = () => {
  const { notifications, markAsRead, removeNotification, clearRead } = useContext(NotificationContext);
  const { selectedYear, selectedMonthNum, refreshStudents } = useContext(NotificationContext);
  const dropdownRef = useRef();

  // Helper to check if Copy Last Month should be enabled
  function canCopyLastMonth(notif) {
    // Only enable for missing_account_overdue or due_soon
    if (!notif.prevMonthData) return false;
    if (notif.type !== "missing_account_overdue" && notif.type !== "due_soon") return false;
    let prevMonth = Number(notif.month) - 1;
    let prevYear = Number(notif.year);
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = prevYear - 1;
    }
    const match = notif.message?.match(/Earliest unpaid due date was (\d{4})-(\d{2})-\d{2}/);
    if (match) {
      const [, earliestYear, earliestMonth] = match;
      return Number(earliestYear) === prevYear && Number(earliestMonth) === prevMonth;
    }
    return true;
  }

  // Prevent dropdown from closing on click inside
  const handleDropdownClick = (e) => e.stopPropagation();

  // Handler for copying previous month data
  const handleCopyLastMonth = async (notif) => {
    const year = notif.year;
    const month = notif.month;
    const prev = notif.prevMonthData;

    if (!prev) {
      toast.error("Previous month data not available for this student.", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
      return;
    }

    const newMonthData = {
      Currency: prev.Currency || "",
      Payment_Amount: prev.Payment_Amount || 0,
      coach_fees: (prev.coach_fees || []).map(fee => ({
        coach_name: fee.coach_name || "",
        coach_fee: fee.coach_fee || 0
      })),
      profit: prev.profit || 0,
      percentage_profit: prev.percentage_profit || 0,
      Payment_Date: "",
      Due_Date: prev.Due_Date
        ? (() => {
            const prevDue = new Date(prev.Due_Date);
            const day = prevDue.getDate().toString().padStart(2, "0");
            return `${year}-${month.toString().padStart(2, "0")}-${day}`;
          })()
        : `${year}-${month.toString().padStart(2, "0")}-01`,
      payment_status: "Not Paid"
    };

    const updateObj = {
      _id: notif.studentId,
      Payment_Details: {
        [year]: {
          [month]: newMonthData
        }
      }
    };

    axios.put(`${process.env.REACT_APP_API_URL}/student-api/soft-update-student`, updateObj, {
      headers: { Authorization: "Bearer " + sessionStorage.getItem("token") }
    })
      .then((response) => {
        toast.success(response.data.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          transition: Bounce,
        });
        removeNotification(notif._id);
        if (typeof refreshStudents === "function" && selectedYear && selectedMonthNum) {
          refreshStudents(selectedYear, selectedMonthNum);
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        });
      });
  };

  // Handler for "Clear All" button
  const handleClearRead = () => {
    if (notifications.some((n) => !n.read)) {
      toast.info("Please read all notifications before clearing.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }
    clearRead();
    toast.success("All notifications cleared!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
    setTimeout(() => {
      if (dropdownRef.current) dropdownRef.current.click();
    }, 100);
  };

  // Handler for remove button
  const handleRemove = (notif) => {
    if (!notif.read) {
      toast.info("Please read the notification before removing.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }
    removeNotification(notif._id);
    setTimeout(() => {
      if (dropdownRef.current && notifications.length === 1) dropdownRef.current.click();
    }, 100);
  };

  // Handler for "Mark All as Read"
  const handleMarkAllAsRead = () => {
    notifications.forEach((notif) => {
      if (!notif.read) markAsRead(notif._id);
    });
    toast.success("All notifications marked as read!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      theme: "light",
    });
  };

  return (
    <li className="nav-item active mx-2 position-relative">
      <button
        type="button"
        className="icon-button horse position-relative"
        style={{ padding: "1.3rem", border: "none" }}
        id="notifDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        ref={dropdownRef}
      >
        <FaBell className="icon-horse" />
        <div className="position-relative">
          {notifications.some((n) => !n.read) && (
            <div className="notif-badge-sm bg-danger badge">
              {notifications.filter((n) => !n.read).length > 99 ? "99+" : notifications.filter((n) => !n.read).length}
            </div>
          )}
        </div>
        <span></span>
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end shadow"
        aria-labelledby="notifDropdown"
        style={{
          minWidth: 350,
          maxHeight: 400,
          overflowY: "auto",
          right: 0,
          left: "auto",
        }}
        onClick={handleDropdownClick}
      >
        <li className="dropdown-header fw-bold d-flex justify-content-between align-items-center">
          <span>Notifications</span>
          <div>
            {notifications.length > 0 && (
              <>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={handleMarkAllAsRead}
                  style={{ fontSize: "0.8rem" }}
                >
                  Mark All as Read
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleClearRead}
                  style={{ fontSize: "0.8rem" }}
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </li>
        {notifications.length === 0 && (
          <li className="dropdown-item text-muted">No notifications</li>
        )}
        {notifications.map((notif) => (
          <li
            key={notif._id}
            className={`dropdown-item d-flex align-items-start ${notif.read ? "text-muted" : ""}`}
            style={{ listStyle: "none" }}
          >
            <div className="flex-grow-1">
              <div className="notif-message mb-2">
              <div>
  {notif.type === "missing_account_overdue" ? (
    <>
      <b>{notif.studentName}</b> has no account for <b>{notif.year}-{notif.month}</b>.
    </>
  ) : notif.type === "due_soon" ? (
    <>
      <b>{notif.studentName}</b> has an upcoming due for <b>{notif.year}-{notif.month}</b>.
    </>
  ) : notif.type === "overdue" ? (
    <>
      <b>{notif.studentName}</b> payment is overdue for <b>{notif.year}-{notif.month}</b>.
    </>
  ) : null}
</div>
                <div className="text-secondary" style={{ whiteSpace: "pre-line" }}>
                  {notif.message}
                </div>
              </div>
              <div>
                {(notif.type === "missing_account_overdue" || notif.type === "due_soon") && (
                  <button
                    className="btn btn-sm btn-primary mt-2 me-2"
                    onClick={() => handleCopyLastMonth(notif)}
                    disabled={!canCopyLastMonth(notif)}
                  >
                    Copy Last Month
                  </button>
                )}
                <button
                  className="btn btn-sm btn-secondary mt-2 me-2"
                  disabled={notif.read}
                  onClick={() => markAsRead(notif._id)}
                >
                  Mark as Read
                </button>
                <button
                  className="btn btn-sm btn-danger mt-2"
                  onClick={() => handleRemove(notif)}
                >
                  Remove
                </button>
              </div>
            </div>
            {!notif.read && (
              <span className="badge bg-danger ms-2 mt-2">New</span>
            )}
          </li>
        ))}
      </ul>
    </li>
  );
};

export default NotificationBar;