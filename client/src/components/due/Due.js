import React, { useState, useEffect, useRef ,useMemo,useContext } from "react";
import "./Due.css";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdScheduleSend } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { NotificationContext } from "../../context/NotificationContext";
// ...other imports...
import axios from "axios";
import { FcPaid } from "react-icons/fc";
import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports
import { TfiStatsUp } from "react-icons/tfi";


import { Button } from "primereact/button";
import { MdCurrencyExchange } from "react-icons/md";
import { Checkbox } from "primereact/checkbox";
import { FaPersonBiking } from "react-icons/fa6";
import { IoToday } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { FaFileExport } from "react-icons/fa6";

import { Toolbar } from "primereact/toolbar";
import { GiCancel } from "react-icons/gi";
import { GiSemiClosedEye } from "react-icons/gi";
import { RiDeleteBinFill } from "react-icons/ri";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";

import { MdOutlineEditOff } from "react-icons/md";
import { IoIosSave } from "react-icons/io";
import { MdAddCard } from "react-icons/md";
import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Skeleton } from "primereact/skeleton";
const Due = () => {
  const [dataReady, setDataReady] = useState(false);

  // year and month settings
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMonthNum, setSelectedMonthNum] = useState(null); // Will store "MM" like "05"
  const [years, setYears] = useState([]);

  // Display months, but store month as value = "MM"
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthMap = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const ValueTemplate = (option, props) => {
    return option ? (
      <div className="flex align-items-center">{option}</div>
    ) : (
      <span>{props.placeholder}</span>
    );
  };

  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  });

  // currency

  const [currencies, setCurrencies] = useState([]);

 
  const dt = useRef(null);
  let {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();




  // Watch the field array
  const watchCoachFees =
    watch(`Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees`) ||
    [];

  const [availableCoaches, setAvailableCoaches] = useState([]);
  let token = sessionStorage.getItem("token");

  let [error, setError] = useState("");
  
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);




  const [submitted, setSubmitted] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  let [student, setStudent] = useState([]);
  let [students, setStudents] = useState([]);
  let [studentDetails, setStudentDetails] = useState([]);
  let [orgStudents, setOrgStudents] = useState([]);



 const getStudentDetails = (students = [], selectedYear, selectedMonthNum) => {
  if (!selectedYear || !selectedMonthNum) return [];

  return students
    .map((student) => {
      const paymentDetail =
        student?.Payment_Details?.[selectedYear]?.[selectedMonthNum];
      if (!paymentDetail) return null;

      // Convert date strings to Date objects for filtering/sorting
      let Payment_Date_Obj = null;
      let Due_Date_Obj = null;
      if (paymentDetail.Payment_Date)
        Payment_Date_Obj = new Date(paymentDetail.Payment_Date);
      if (paymentDetail.Due_Date)
        Due_Date_Obj = new Date(paymentDetail.Due_Date);
if (paymentDetail.Payment_Date && typeof paymentDetail.Payment_Date === "string") {
  paymentDetail.Payment_Date = new Date(paymentDetail.Payment_Date);
}
if (paymentDetail.Due_Date && typeof paymentDetail.Due_Date === "string") {
  paymentDetail.Due_Date = new Date(paymentDetail.Due_Date);
}
      // Normalize payment_status to lowercase
      let payment_status = (paymentDetail.payment_status || "").trim().toLowerCase();

      return {
        ...student,
        Payment_Amount: paymentDetail.Payment_Amount,
        Currency: paymentDetail.Currency,
        Payment_Date: paymentDetail.Payment_Date,
        Due_Date: paymentDetail.Due_Date,
        payment_status, // always lowercase
        Payment_Date_Obj,
        Due_Date_Obj,
      };
    })
    .filter(Boolean); // Remove nulls
};
  const getStudents = (ayear, amonth) => {
    axios
      .get(
        `${process.env.REACT_APP_API_URL}/student-api/get-student-accounts`,
        {
          headers: { Authorization: "Bearer " + token },
          params: {
            year: ayear,
            month: amonth,
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications
          console.log("Original Data:", originalData);
          // Store original data in students (unchanged)
          setStudents(originalData);
           setStudentDetails(getStudentDetails(modifiedData, ayear, amonth));

          // Store modified data in customers
        }
        if (response.status !== 200) {
          setError(response.data.message);

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
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          toast.error(err.message, {
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
        } else if (err.request) {
          setError(err.message);
          toast.error(err.message, {
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
        } else {
          setError(err.message);
          toast.error(err.message, {
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
      });

    axios
      .get(`${process.env.REACT_APP_API_URL}/student-api/get-students`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));

          // Store original data in students (unchanged)
          setOrgStudents(originalData);
        }
        if (response.status !== 200) {
          setError(response.data.message);

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
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          toast.error(err.message, {
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
        } else if (err.request) {
          setError(err.message);
          toast.error(err.message, {
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
        } else {
          setError(err.message);
          toast.error(err.message, {
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
      });
  };
  let [Coaches, setCoaches] = useState([]);
  const getCoaches = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/coach-api/get-coaches`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          // Separate copy for modifications

          setCoaches(originalData);

          // Store modified data in customers
        }
        if (response.status !== 200) {
          setError(response.data.message);

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
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          toast.error(err.message, {
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
        } else if (err.request) {
          setError(err.message);
          toast.error(err.message, {
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
        } else {
          setError(err.message);
          toast.error(err.message, {
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
      });
  };
  let [batches, setBatches] = useState([]);
  const getBatches = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/batch-api/get-batches`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          // Separate copy for modifications

          // Store original data in batches (unchanged)
          setBatches(originalData);
          console.log(originalData);
          // Store modified data if needed (e.g., filtered or formatted data)
        }

        if (response.status !== 200) {
          setError(response.data.message);

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
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          toast.error(err.response.data.message, {
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
        } else if (err.request) {
          setError(err.message);
          toast.error(err.message, {
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
        } else {
          setError(err.message);
          toast.error(err.message, {
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
      });
  };

  const firstLoad = useRef(true); // Add this above or inside your component

 




  const hideDialog = () => {
    setSubmitted(false);
    setStudentDialog(false);
    reset();
  };


const saveModifiedUser = () => {
  if (Object.keys(errors).length === 0) {
    const modifiedUser = getValues();
 console.log("Modified User:", modifiedUser);
    // Safety check
    if (!selectedYear || !selectedMonthNum) {
      alert("Please select year and month before saving.");
      return;
    }

    const paymentDetails =
      modifiedUser.Payment_Details?.[selectedYear]?.[selectedMonthNum] || {};
// Convert Payment_Date and Due_Date to yyyy-mm-dd string if they are Date objects
if (paymentDetails.Payment_Date instanceof Date) {
  paymentDetails.Payment_Date = paymentDetails.Payment_Date.toISOString().split("T")[0];
}
if (paymentDetails.Due_Date instanceof Date) {
  paymentDetails.Due_Date = paymentDetails.Due_Date.toISOString().split("T")[0];
}
    // Prepare only the fields you want to update
    const updatedMonthDetails = {
      Payment_Amount: paymentDetails.Payment_Amount || "",
      Currency: paymentDetails.Currency || "",
      Payment_Date: paymentDetails.Payment_Date || "",
      Due_Date: paymentDetails.Due_Date || "",
      payment_status: paymentDetails.payment_status || "",
      // If you want to keep coach_fees, profit, percentage_profit, include them:
      coach_fees: paymentDetails.coach_fees || [],
      profit: paymentDetails.profit || 0,
      percentage_profit: paymentDetails.percentage_profit || 0,
    };

    // Construct minimal Payment_Details object for backend
    const updatedPaymentDetails = {
      [selectedYear]: {
        [selectedMonthNum]: updatedMonthDetails,
      },
    };

    const finalStudent = {
      _id: modifiedUser._id,
      Client_ID: modifiedUser.Client_ID,
      Full_Name: modifiedUser.Full_Name,
      status: modifiedUser.status,
      Payment_Details: updatedPaymentDetails,
    };

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-update-student`,
        finalStudent,
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
          });
          getStudents(selectedYear, selectedMonthNum);
        }
      })
      .catch((err) => {
        if (err.response) {
          setError(err.message);
          toast.error(err.response.data.message, {
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
        } else if (err.request) {
          setError(err.message);
          toast.error(err.message, {
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
        } else {
          setError(err.message);
          toast.error(err.message, {
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
      });

    hideDialog();
  }
};

 
  


 

  // In your component
  const [emptyDues, setEmptyDues] = useState([]); // will store dropdown options
  const handleStudentSelect = (selectedClientId) => {
      if (!selectedClientId) return;
  const selectedStudent = orgStudents.find(
    (s) => s.Client_ID === selectedClientId
  );
  if (!selectedStudent) return;

    setValue("_id", selectedStudent._id);
    setValue("Client_ID", selectedStudent.Client_ID);
    setValue("Full_Name", selectedStudent.Full_Name);

    // Get student's batch and find coaches
    const studentBatch = batches.find(
      (b) => b.batch_id === selectedStudent.Batch
    );

    if (studentBatch) {
      const mainCoach = studentBatch.coaches?.main;
      const subCoaches = studentBatch.coaches?.sub_coaches || [];
      const allBatchCoaches = [mainCoach, ...subCoaches];

      const coachOptions = allBatchCoaches.map((name) => {
        const coachInfo = Coaches.find((c) => c.Full_Name === name);
        const status = coachInfo?.status || "Inactive";
        const isActive = status === "Active";
        const statusSymbol = isActive ? "🟢" : "🔴";
        const label = `${statusSymbol} ${name}${
          name === mainCoach ? " (main)" : ""
        }`;
        return {
          name,
          label,
          isActive,
        };
      });

      setAvailableCoaches(coachOptions || []);
    } else {
      setAvailableCoaches([]);
    }
  };




  const exportCSV = () => {
    dt.current.exportCSV();
  };





  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <Dropdown
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.value)}
          options={years}
          placeholder="Select Year"
          filter
          valueTemplate={ValueTemplate}
          itemTemplate={(option) => (
            <div className="flex align-items-center ">{option}</div>
          )}
          className="w-full md:w-14rem"
        />

        <Dropdown
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.value);
            setSelectedMonthNum(monthMap[e.value]); // Assuming e.value is an object like { name: 'January', value: 'Jan' }
          }}
          options={months}
          placeholder="Select Month"
          filter
          valueTemplate={ValueTemplate}
          itemTemplate={(option) => (
            <div className="flex align-items-center ">{option}</div>
          )}
          className="w-full md:w-14rem"
        />

      
      </div>
    );
  };


  

  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
      
        <button
          className="icon-button horse border-success "
          style={{ padding: "1.3rem" }}
          type="submit"
          onClick={exportCSV}
        >
          <FaFileExport className="icon-horse" /> <span></span>
        </button>
       
      </div>
    );
  };


 

const editBatch = (student) => {
  console.log("Editing student:", student);
  const OBatch = students.find((b) => b._id === student._id);
  if (!OBatch) return;

  // Get payment data for the selected year and month
  const paymentData =
    OBatch?.Payment_Details?.[selectedYear]?.[selectedMonthNum] || {};
if (paymentData.Payment_Date && typeof paymentData.Payment_Date === "string") {
  paymentData.Payment_Date = new Date(paymentData.Payment_Date);
}
if (paymentData.Due_Date && typeof paymentData.Due_Date === "string") {
  paymentData.Due_Date = new Date(paymentData.Due_Date);
}
  // Prepare Payment_Details object for the form
  const paymentDetails = {
    [selectedYear]: {
      [selectedMonthNum]: {
        Payment_Amount: paymentData.Payment_Amount || 0,
        Currency: paymentData.Currency || "",
        Payment_Date: paymentData.Payment_Date || "",
        Due_Date: paymentData.Due_Date || "",
        payment_status: paymentData.payment_status || "",
        coach_fees: paymentData.coach_fees || [],
        profit: paymentData.profit || 0,
        percentage_profit: paymentData.percentage_profit || 0,
      },
    },
  };

  // Set values for the form
  setStudent({ ...OBatch });
  setStudentDialog(true);

  setValue("Client_ID", OBatch.Client_ID);
  setValue("Full_Name", OBatch.Full_Name);
  setValue("_id", OBatch._id);
  setValue("status", OBatch.status);

  // Only set the due/payment fields for the selected month
  setValue("Payment_Details", paymentDetails);

  console.log("Payment Details:", paymentDetails);
};

  const studentDialogFooter = (
    <React.Fragment>
      <button
        className="icon-button horse "
        style={{ padding: "1.3rem" }}
        onClick={hideDialog}
      >
        <MdOutlineEditOff className="icon-horse" /> <span></span>
      </button>

      <button
        className="icon-button2 horse2 border-success "
        style={{ padding: "1.3rem" }}
        type="submit"
        onClick={handleSubmit(saveModifiedUser)}
      >
        <IoIosSave className="icon-horse2" /> <span></span>
      </button>
    </React.Fragment>
  );

const actionBodyTemplate = (rowData) => (
  <div className="d-flex gap-2">
    <button
      className="icon-button horse"
      style={{ padding: "1.3rem" }}
      onClick={() => editBatch(rowData)}
    >
      <MdOutlineEdit className="icon-horse" />
      <span></span>
    </button>
 
  </div>
);


const clientIdBody = (rowData) => (
  <div>{rowData.Client_ID || "--"}</div>
);

const fullNameBody = (rowData) => (
  <div>{rowData.Full_Name || "--"}</div>
);

const formatDate = (value) => {
  if (!value) return "--";
  // If value is already a Date, use it; if string, convert to Date
  const dateObj = value instanceof Date ? value : new Date(value);
  if (isNaN(dateObj.getTime())) return "--";
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
// Helper to safely get Due_Date

const dateBodyTemplate = (rowData) => {
  return rowData.Due_Date_Obj ? formatDate(rowData.Due_Date_Obj) : "--";
};
const PDateBodyTemplate = (rowData) => {
  return rowData.Payment_Date_Obj ? formatDate(rowData.Payment_Date_Obj) : "--";
};
  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy"
        mask="99/99/9999"
      />
    );
  };




// Checkbox for each row (no rowSpan logic needed)
const customCheckboxBody = (rowData) => {
  const isSelected = selectedCustomers?.some(
    (item) => item._id === rowData._id
  );

  const onCheckboxChange = (e) => {
    const checked = e.target.checked;
    let updated;
    if (checked) {
      updated = [...(selectedCustomers || []), rowData];
    } else {
      updated = (selectedCustomers || []).filter(
        (item) => item._id !== rowData._id
      );
    }
    setSelectedCustomers(updated);
  };

  return (
    <Checkbox
      inputId={rowData._id}
      checked={isSelected}
      onChange={onCheckboxChange}
    />
  );
};

// Select-all checkbox for header
const selectAllCheckboxHeader = () => {
  const allSelected =
    studentDetails.length > 0 &&
    selectedCustomers?.length === studentDetails.length;

  const onHeaderCheckboxChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedCustomers([...studentDetails]);
    } else {
      setSelectedCustomers([]);
    }
  };

  return <Checkbox checked={allSelected} onChange={onHeaderCheckboxChange} />;
};


const [paymentStatuses] = useState(["paid", "not paid"]);

const paymentStatusBodyTemplate = (rowData) => {
  const status = rowData.payment_status || "";
  const isPaid = status === "paid";
  const badgeClass = isPaid
    ? "badge bg-success px-3 py-2"
    : "badge bg-danger px-3 py-2";
  // Display with proper case for UI
  const displayStatus = isPaid ? "Paid" : "Not Paid";
  return (
    <div className="d-flex align-items-center">
      <span className={badgeClass}>{displayStatus}</span>
    </div>
  );
};

const paymentStatusFilterTemplate = (options) => (
  <React.Fragment>
    <div className="mb-3 font-bold">Payment Status Picker</div>
    <MultiSelect
      value={options.value}
      options={paymentStatuses}
      itemTemplate={paymentStatusItemTemplate}
      onChange={(e) => options.filterCallback(e.value)}
      placeholder="Any"
      className="p-column-filter"
    />
  </React.Fragment>
);

const paymentStatusItemTemplate = (option) => (
  <div className="flex align-items-center ">
    <span>{option === "paid" ? "Paid" : "Not Paid"}</span>
  </div>
);

 

  const [globalFilterValue, setGlobalFilterValue] = useState("");
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex flex-wrap gap-3 justify-content-between align-items-center">
        <h4 className="m-0">Dues</h4>
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Keyword Search"
          />
        </IconField>
      </div>
    );
  };
  const header = renderHeader();






  // 🌍 Fetch currencies
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencies(Object.keys(data));
      } catch (err) {
        console.error("Currency Fetch Error:", err);
      }
    })();
  }, []);

  // 🗓️ Init year/month
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth();
    const yearList = Array.from({ length: currentYear - 2024 + 1 }, (_, i) =>
      (2024 + i).toString()
    );
    setYears(yearList);
    const defaultYear = currentYear.toString();
    const defaultMonth = months[currentMonthNum];
    const defaultMonthNum = monthMap[defaultMonth];
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
    setSelectedMonthNum(defaultMonthNum);
    (async () => {
      await getStudents(defaultYear, defaultMonthNum);
      await getCoaches();
      await getBatches();
      setDataReady(true);
    })();
  }, []);

  // 🔁 Fetch students on change
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    if (selectedYear && selectedMonthNum !== null) {
      getStudents(selectedYear, selectedMonthNum);
    }
  }, [selectedYear, selectedMonthNum]);



  // 🔍 Filters + table flatting
  useEffect(() => {
    if (!dataReady || !selectedYear || selectedMonthNum === null || !students)
      return;
  
setFilters({
  global: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
  Client_ID: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Full_Name: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
  },
  Due_Date_Obj: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  Payment_Date_Obj: {
    operator: FilterOperator.AND,
    constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
  },
  payment_status: { value: null, matchMode: FilterMatchMode.IN },
});
  
  }, [
  
    dataReady,
    selectedYear,
    selectedMonthNum,
    students,
  ]);

const [totalPaymentINR, setTotalPaymentINR] = useState(0);
const [totalCoachFeesINR, setTotalCoachFeesINR] = useState(0);
const [totalDueINR, setTotalDueINR] = useState(0);
const [totalOverdueINR, setTotalOverdueINR] = useState(0);
const [totalPaidINR, setTotalPaidINR] = useState(0);
const [totalDueCount, setTotalDueCount] = useState(0);
const [totalOverdueCount, setTotalOverdueCount] = useState(0);
const [totalPaidCount, setTotalPaidCount] = useState(0);
const [loading, setLoading] = useState(true);
  const convertCurrency = async (amount, fromCurrency) => {
    if (!amount || typeof amount !== "number") return 0;
    if (fromCurrency === "INR") {
      return amount; // No need to convert
    }
    try {
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=INR`
      );

      if (!res.ok) {
        console.error("Currency conversion API error:", res.statusText);
        return 0;
      }

      const data = await res.json();
      return data?.rates?.["INR"] || 0;
    } catch (error) {
      console.error("Error in currency conversion:", error);
      return 0;
    }
  };

useEffect(() => {
  const calcTotals = async () => {
    if (
      !dataReady ||
      !selectedYear ||
      selectedMonthNum === null ||
      students.length === 0
    ) {
      setTotalPaymentINR(0);
      setTotalCoachFeesINR(0);
      setTotalDueINR(0);
      setTotalOverdueINR(0);
      setTotalPaidINR(0);
      setTotalDueCount(0);
      setTotalOverdueCount(0);
      setTotalPaidCount(0);
      return;
    }
    setLoading(true);
    let totalPayment = 0;
    let totalCoach = 0;
    let totalDue = 0;
    let totalOverdue = 0;
    let totalPaid = 0;
    let dueCount = 0;
    let overdueCount = 0;
    let paidCount = 0;

    const today = new Date();

    for (const stu of students) {
      const pd = stu?.Payment_Details?.[selectedYear]?.[selectedMonthNum];
      if (!pd) continue;
      const amount = pd?.Payment_Amount || 0;
      const currency = pd?.Currency || "INR";
      const paymentStatus = (pd?.payment_status || "").toLowerCase();
      const dueDateStr = pd?.Due_Date;
      let dueDate = dueDateStr ? new Date(dueDateStr) : null;

      // Convert amounts to INR
      const amountINR = amount > 0 ? await convertCurrency(amount, currency) : 0;
      if (amountINR > 0) totalPayment += amountINR;

      const fees = Array.isArray(pd?.coach_fees) ? pd.coach_fees : [];
      for (const fee of fees) {
        const f = fee?.coach_fee || 0;
        if (f > 0) totalCoach += await convertCurrency(f, currency);
      }

      // Dues logic
      if (paymentStatus !== "paid") {
        totalDue += amountINR;
        dueCount++;
        if (dueDate && today > dueDate) {
          totalOverdue += amountINR;
          overdueCount++;
        }
      } else {
        totalPaid += amountINR;
        paidCount++;
      }
    }
    setTotalPaymentINR(totalPayment);
    setTotalCoachFeesINR(totalCoach);
    setTotalDueINR(totalDue);
    setTotalOverdueINR(totalOverdue);
    setTotalPaidINR(totalPaid);
    setTotalDueCount(dueCount);
    setTotalOverdueCount(overdueCount);
    setTotalPaidCount(paidCount);
    setLoading(false);
  };
  calcTotals();
}, [students, selectedYear, selectedMonthNum, dataReady]);


const getPaymentFieldPath = (field) => {
  return selectedYear && selectedMonthNum !== null
    ? `Payment_Details.${selectedYear}.${selectedMonthNum}.${field}`
    : "";
};


  return (
    <div>
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
     <div className="text-center mx-5">
  <div className="row mt-5">
    {/* Due Overview */}
    <div className="col-lg-6 my-3">
      <div className="card s-col d-block m-auto" style={{ width: "20rem", height: "12rem" }}>
        <div className="card-body d-flex gap-4">
          <FaMoneyCheckAlt className="icon-stu fs-1" />
          <div>
            <h5 className="stu-context">Due Overview</h5>
            {loading ? (
              <>
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
              </>
            ) : (
              <>
                <p className="mb-1 stu-context">
                  <strong>Unpaid Dues:</strong> ₹{Number(totalDueINR).toFixed(2)} ({totalDueCount} students)
                </p>
                <p className="mb-1 stu-context text-danger">
                  <strong>Overdue:</strong> ₹{Number(totalOverdueINR).toFixed(2)} ({totalOverdueCount} students)
                </p>
                <p className="mb-1 stu-context text-success">
                  <strong>Paid:</strong> ₹{Number(totalPaidINR).toFixed(2)} ({totalPaidCount} students)
                </p>
              </>
            )}
          </div>
          <div className="ag-courses-item_bg"></div>
        </div>
      </div>
    </div>

    {/* Profit Insights */}
    <div className="col-lg-6 my-3">
      <div className="card s-col d-blcok m-auto" style={{ width: "20rem", height: "12rem" }}>
        <div className="card-body d-flex gap-4">
          <TfiStatsUp className="icon-stu fs-3" />
          <div>
            <h5 className="stu-context">Profit Insights</h5>
            <div className="mb-1 fs-5 stu-context">
              <strong>Net Profit:</strong> ₹
              {loading ? (
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
              ) : (
                Number(totalPaymentINR - totalCoachFeesINR).toFixed(2)
              )}
            </div>
            <div className="mb-0 fs-5 stu-context">
              <strong>Profit %:</strong>{" "}
              {loading ? (
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
              ) : totalPaymentINR > 0 ? (
                (
                  ((totalPaymentINR - totalCoachFeesINR) /
                    totalPaymentINR) *
                  100
                ).toFixed(2) + "%"
              ) : (
                "0%"
              )}
            </div>
          </div>
          <div className="ag-courses-item_bg"></div>
        </div>
      </div>
    </div>
  </div>
</div>

      <div className=" card s-Student my-5 mx-auto d-block rounded shadow">
        <div className="card-body">
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          ></Toolbar>
          <DataTable
            ref={dt}
            value={studentDetails}
            paginator
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 20]}
            dataKey="unique_key"
            selection={selectedCustomers}
            onSelectionChange={(e) => setSelectedCustomers(e.value)}
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={["Full_Name", "Client_ID"]}
            emptyMessage="No batches found.."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
       <Column
  header={selectAllCheckboxHeader}
  headerStyle={{ width: "3rem" }}
  body={customCheckboxBody}
  exportable={false}
/>
            <Column
              field="Client_ID"
              header="Client ID"
              sortable
              filter
              filterPlaceholder="Search by Client ID"
              style={{ minWidth: "14rem" }}
              body={clientIdBody}
            />
            <Column
              field="Full_Name"
              header="Full Name"
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ minWidth: "14rem" }}
              body={fullNameBody}
            />
 <Column
  field="Due_Date_Obj"
  header="Due Date"
  sortable
  dataType="date"
  style={{ minWidth: "12rem" }}
  body={dateBodyTemplate}
  filter
  filterElement={dateFilterTemplate}
/>
<Column
  field="Payment_Date_Obj"
  header="Payment Date"
  sortable
  dataType="date"
  style={{ minWidth: "12rem" }}
  body={PDateBodyTemplate} // You can reuse the same dateBodyTemplate
  filter
  filterElement={dateFilterTemplate}
/>
<Column
  field="payment_status"
  header="Payment Status"
  sortable
  filter
  style={{ minWidth: "14rem" }}
  body={paymentStatusBodyTemplate}
  filterElement={paymentStatusFilterTemplate}
  showFilterMatchModes={false}
  filterMenuStyle={{ width: "14rem" }}

/>
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "12rem" }}
            ></Column>
          </DataTable>
        </div>
      </div>
     
     
      {/* Edit */}


<Dialog
  key={`${selectedYear}-${selectedMonthNum}`}
  visible={studentDialog}
  style={{ width: "80vw" }}
  breakpoints={{ "960px": "75vw", "641px": "90vw" }}
  header="Due Details"
  modal
   footer={studentDialogFooter}
  className="p-fluid"
  onHide={hideDialog}
>
  <form className="mt-5" >
    <div className="ecat container">
      <div className="row justify-content-center">
        {/* Client ID */}
        <div className="col-lg-6 mb-5">
          
            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-user-secret"></i>
              <input
                type="text"
                id="Client_ID"
                className="form-control"
                placeholder="xyz"
                disabled
                {...register("Client_ID", { required: true })}
              />
              <label htmlFor="Client_ID" className="text-dark">Client ID</label>
              {errors?.Client_ID?.type === "required" && (
                <p className="text-danger">*Enter Student ID</p>
              )}
            </div>
          
        </div>

        {/* Full Name */}
        <div className="col-lg-6">
          <div className="inputbox4 form-floating">
            <i className="fa-regular fa-user"></i>
            <input
              type="text"
              id="Full_Name"
              className="form-control"
              placeholder="xyz"
              disabled
              {...register("Full_Name", { required: true })}
            />
            <label htmlFor="Full_Name" className="text-dark">Full Name</label>
            {errors?.Full_Name?.type === "required" && (
              <p className="text-danger">*Full name is required</p>
            )}
          </div>
        </div>
      </div>
 <div className="row justify-content-center">
        <div className="col-lg-6 mb-4">
  <div className="w-75">
    <label htmlFor="Payment_Date" className="text-dark mb-3">
              Payment Date
              </label>
    <Controller
      name={getPaymentFieldPath("Payment_Date")}
      control={control}
      rules={{
        required: "Payment date is required",
      }}
      render={({ field }) => (
        <Calendar
          {...field}
          inputRef={field.ref}
          value={field.value || null}
          onChange={(e) => field.onChange(e.value)}
          dateFormat="dd-mm-yy"
          showIcon
          placeholder="Select Payment Date"
        />
      )}
    />
   
    {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Payment_Date && (
      <span className="text-sm text-danger">
        {errors.Payment_Details[selectedYear][selectedMonthNum].Payment_Date.message}
      </span>
    )}
  </div>
</div>

<div className="col-lg-6 mb-4">
  <div className="w-75">
     <label htmlFor="Due_Date" className="text-dark mb-3">
              Due Date
              </label>
    <Controller
      name={getPaymentFieldPath("Due_Date")}
      control={control}
      rules={{
        required: "Due date is required",
      }}
      render={({ field }) => (
        <Calendar
          {...field}
          inputRef={field.ref}
          value={field.value || null}
          onChange={(e) => field.onChange(e.value)}
          dateFormat="dd-mm-yy"
          showIcon
          placeholder="Select Due Date"
        />
      )}
    />
    
    {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Due_Date && (
      <span className="text-sm text-danger">
        {errors.Payment_Details[selectedYear][selectedMonthNum].Due_Date.message}
      </span>
    )}
  </div>
</div>
 </div>

<div className="col-lg-6">
  <div className="field mb-5">
    <i><FcPaid className="fs-2" /></i>
    
    <label htmlFor="payment_status" className="mb-2">Payment Status</label>
    <Controller
      name={getPaymentFieldPath("payment_status")}
      control={control}
      rules={{ required: "Please select a payment status" }}
      render={({ field }) => (
        <select
          id="payment_status"
          {...field}
          className={`w-75 form-select ${errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.payment_status ? "p-invalid" : ""}`}
        >
          <option value="">Select Status</option>
          <option value="Paid">Paid</option>
          <option value="Not Paid">Not Paid</option>
        </select>
      )}
    />
    {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.payment_status && (
      <small className="p-error">
        {errors.Payment_Details[selectedYear][selectedMonthNum].payment_status.message}
      </small>
    )}
  </div>
</div>
  
    </div>
   
  </form>
</Dialog>



  

  
    </div>
  );
};

export default Due;
 