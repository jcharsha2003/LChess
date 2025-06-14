import React, { useState, useEffect, useRef ,useMemo,useContext,useCallback } from "react";
import "./Account.css";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdScheduleSend } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { NotificationContext } from "../../context/NotificationContext";
// ...other imports...
import axios from "axios";

import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports
import { TfiStatsUp } from "react-icons/tfi";

import CurrencyConvertor from "./currency-convertor";
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
const Account = () => {
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

  const [isEditing, setIsEditing] = useState(false);
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
  const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const getStudentDetails = (students = [], selectedYear, selectedMonthNum) => {
    if (!selectedYear || !selectedMonthNum) return [];

    return students.flatMap((student) => {
      const paymentDetail =
        student?.Payment_Details?.[selectedYear]?.[selectedMonthNum];
      if (!paymentDetail) return [];

      const coachFees = paymentDetail.coach_fees || [];
      return coachFees.map((feeObj, idx) => ({
        ...student,
        coach_payment_detail: `${feeObj.coach_name} : ${feeObj.coach_fee}`,
        _rowSpanIndex: idx,
        _totalCoachEntries: coachFees.length,
        unique_key: `${student._id || student.Client_ID}_${idx}`,
        amonth: selectedMonthNum,
        ayear: selectedYear,
      }));
    });
  };

  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  let [student, setStudent] = useState([]);
  let [students, setStudents] = useState([]);
  let [studentDetails, setStudentDetails] = useState([]);
  let [orgStudents, setOrgStudents] = useState([]);
  const getStudents = useCallback((ayear, amonth) => {
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
  }, [token]);
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

 

  const deleteStudent = (year, month) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-delete-student`,
        { _id: student?._id },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
          params: { year, month },
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
  };

  const deleteStudents = (year, month) => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-delete-students`,
        { students: selectedCustomers },
        {
          headers: { Authorization: "Bearer " + token },
          params: { year, month },
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
  };

  const hideDialog = () => {
    setSubmitted(false);
    setStudentDialog(false);
    reset();
  };
 const addNewStudent = () => {
  if (Object.keys(errors).length === 0) {
    let modifiedUser = getValues();

    // Clean coach_fees array (remove empty entries)
    let validCoachFees =
      (modifiedUser.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.coach_fees || []).filter(
        (fee) => fee.coach_name && fee.coach_fee
      );

    // Get Payment Amount safely
    let paymentAmount =
      Number(modifiedUser.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Payment_Amount || 0);

    // Calculate total coach fees
    let totalCoachFees = validCoachFees.reduce(
      (acc, fee) => acc + Number(fee.coach_fee),
      0
    );

    // Calculate Profit and Percentage Profit
    let profit = paymentAmount - totalCoachFees;
    let percentageProfit = paymentAmount > 0 ? (profit * 100) / paymentAmount : 0;

    // Prepare payment data for the selected year/month
    let paymentData = {
      ...modifiedUser.Payment_Details[selectedYear][selectedMonthNum],
      coach_fees: validCoachFees,
      Payment_Amount: paymentAmount,
      profit,
      percentage_profit: percentageProfit,
    };

    // Prepare payload
    let payload = {
      _id: modifiedUser._id,
      selectedYear,
      selectedMonthNum,
      paymentData,
    };

    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-add-student`,
        payload,
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

  const saveModifiedUser = () => {
    
    if (Object.keys(errors).length === 0) {
      const modifiedUser = getValues();

      // Safety check
      if (!selectedYear || !selectedMonthNum) {
        alert("Please select year and month before saving.");
        return;
      }

      const coachFeesPath =
        modifiedUser.Payment_Details?.[selectedYear]?.[selectedMonthNum]
          ?.coach_fees || [];
      const paymentDetails =
        modifiedUser.Payment_Details?.[selectedYear]?.[selectedMonthNum] || {};

      // Filter valid coach fee entries
      const validCoachFees = coachFeesPath.filter(
        (fee) =>
          fee &&
          typeof fee === "object" &&
          fee.coach_name?.trim() &&
          !isNaN(Number(fee.coach_fee))
      );

      const paymentAmount = Number(paymentDetails.Payment_Amount || 0);
      const totalCoachFees = validCoachFees.reduce(
        (acc, fee) => acc + Number(fee.coach_fee),
        0
      );

      const profit = paymentAmount - totalCoachFees;
      const percentageProfit =
        paymentAmount > 0 ? (profit * 100) / paymentAmount : 0;

      // Construct final updated object
      const updatedPaymentDetails = {
  ...modifiedUser.Payment_Details,
  [selectedYear]: {
    ...modifiedUser.Payment_Details?.[selectedYear],
    [selectedMonthNum]: {
      ...paymentDetails,
      coach_fees: validCoachFees,
      profit,
      percentage_profit: percentageProfit,
    },
  },
};

      const finalStudent = {
        ...modifiedUser,
        Payment_Details: updatedPaymentDetails,
      };

      console.log("✅ Final student object:", finalStudent);

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
  const hideDeleteProductDialog = () => {
    setDeleteStudentDialog(false);
  };
  const [currDialog, setCurrDialog] = useState(false);
  const hideCurrDialog = () => {
    setCurrDialog(false);
  };

  const deleteProductDialogFooter = (
    <React.Fragment>
      <button
        className="icon-button horse "
        style={{ padding: "1.3rem" }}
        onClick={hideDeleteProductDialog}
      >
        <GiCancel className="icon-horse" /> <span></span>
      </button>

      <button
        className="icon-button1 horse1 border-danger"
        style={{ padding: "1.3rem" }}
        onClick={() => {
          if (
            window.confirm(
              "Are you sure you want to delete this Student Account?"
            )
          ) {
            deleteStudent(selectedYear, selectedMonthNum);
            hideDeleteProductDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );
  const CurrDialogFooter = (
    <React.Fragment>
      <button
        className="icon-button horse "
        style={{ padding: "1.3rem" }}
        onClick={hideCurrDialog}
      >
        <GiSemiClosedEye className="icon-horse" /> <span></span>
      </button>
    </React.Fragment>
  );
  // In your component
  const [emptyAccounts, setEmptyAccounts] = useState([]); // will store dropdown options
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

 const openNew = () => {
  // Only show students who do NOT have an account for the selected year/month
  const emptyStudents = orgStudents.filter((student) => {
    const payment = student.Payment_Details || {};
    return !(
      payment[selectedYear] &&
      payment[selectedYear][selectedMonthNum]
    );
  });

  // Set dropdown options
  const dropdownOptions = emptyStudents.map((student) => ({
    Client_ID: student.Client_ID,
    Full_Name: student.Full_Name,
  }));

  setEmptyAccounts(dropdownOptions);

  // Reset form fields
  setStudent({
    Client_ID: "",
    Full_Name: "",
    Payment_Details: {
      [selectedYear]: {
        [selectedMonthNum]: {
          Currency: "",
          Payment_Amount: 0,
          Payment_Date: "",
          Due_Date: "",
          payment_status: "Not paid",
          coach_fees: [{ coach_name: "", coach_fee: 0 }],
          profit: 0,
          percentage_profit: 0,
        },
      },
    },
  });
  setIsEditing(false);
  setSubmitted(false);

  setValue("Client_ID", "");
  setValue("Full_Name", "");
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Currency`, "");
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Amount`, 0);
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Date`, "");
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Due_Date`, "");
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.payment_status`, "Not paid");
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees`, [{ coach_name: "", coach_fee: 0 }]);
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.profit`, 0);
  setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.percentage_profit`, 0);

  setAvailableCoaches([]);
  setStudentDialog(true);
};

  const openCurr = () => {
    setCurrDialog(true); // Open the currency creation dialog
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
  };

  const confirmDeleteSelected = () => {
    setDeleteProductsDialog(true);
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

        <button
          className="icon-button horse border-success "
          style={{ padding: "1.3rem" }}
          type="submit"
          onClick={openNew}
        >
          <MdAddCard className="icon-horse" /> <span></span>
        </button>
        <button
          className="icon-button1 horse1 border-danger dss"
          style={{ padding: "1.3rem" }}
          onClick={confirmDeleteSelected}
          disabled={!selectedCustomers || !selectedCustomers.length}
        >
          <MdDelete className="icon-horse1" /> <span></span>
        </button>
      </div>
    );
  };


  
const copyLastMonthAccounts = () => {
  if (!selectedYear || !selectedMonthNum) {
    toast.error("Please select a year and month first.", { theme: "colored" });
    return;
  }
  if (
    window.confirm(
      `Are you sure you want to copy last month's accounts to ${selectedYear}-${selectedMonthNum}?`
    )
  ) {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/copy-last-month-accounts`,
        {},
        {
          headers: { Authorization: "Bearer " + token },
          params: { year: selectedYear, month: selectedMonthNum },
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
            autoClose: false,
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
            autoClose: false,
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
  }
};
  const rightToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          className="icon-button horse border-success "
          style={{ padding: "1.3rem" }}
          type="submit"
          onClick={openCurr}
        >
          <MdCurrencyExchange className="icon-horse" /> <span></span>
        </button>
        <button
          className="icon-button horse border-success "
          style={{ padding: "1.3rem" }}
          type="submit"
          onClick={exportCSV}
        >
          <FaFileExport className="icon-horse" /> <span></span>
        </button>
        <button
        className="icon-button horse border-primary"
        style={{ padding: "1.3rem" }}
        type="button"
        onClick={copyLastMonthAccounts}
      >
        <MdContentCopy className="icon-horse" /> <span></span>
      </button>
      </div>
    );
  };

  const deleteProductsDialogFooter = (
    <React.Fragment>
      <button
        className="icon-button horse "
        style={{ padding: "1.3rem" }}
        onClick={hideDeleteProductsDialog}
      >
        <GiCancel className="icon-horse" /> <span></span>
      </button>

      <button
        className="icon-button1 horse1 border-danger"
        style={{ padding: "1.3rem" }}
        onClick={() => {
          if (
            window.confirm(
              "Are you sure you want to delete the Selected Students Account?"
            )
          ) {
            deleteStudents(selectedYear, selectedMonthNum);
            hideDeleteProductsDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );

  const balanceFilterTemplate = (options) => {
    return (
      <InputNumber
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        locale="en-US"
      />
    );
  };
  const confirmDeleteBatch = (student) => {
    setStudent({ ...student }); // Setting the batch data in state
    setDeleteStudentDialog(true); // Opening the batch deletion confirmation dialog
  };
  const editBatch = (student) => {
    const OBatch = students.find((b) => b._id === student._id);
    if (!OBatch) return;

    const studentBatch = batches.find((b) => b.batch_id === OBatch.Batch);
    const mainCoach = studentBatch?.coaches?.main;
    const subCoaches = studentBatch?.coaches?.sub_coaches || [];
    const allBatchCoaches = [mainCoach, ...subCoaches];

    // Map batch coaches with full details from Coaches list
    const coachOptions = allBatchCoaches?.map((name) => {
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

    const paymentData =
      OBatch?.Payment_Details?.[selectedYear]?.[selectedMonthNum] || {};

    // Step 1: Reconstruct Payment_Details object in correct format
    const paymentDetails = {
      [selectedYear]: {
        [selectedMonthNum]: {
          Payment_Amount: paymentData.Payment_Amount,
          Currency: paymentData.Currency,
          Payment_Date: paymentData.Payment_Date,
          Due_Date: paymentData.Due_Date,
          payment_status: paymentData.payment_status,
          coach_fees: paymentData.coach_fees || [],
        },
      },
    };

    // Step 2: Set values correctly
    setStudent({ ...OBatch });
    setAvailableCoaches(coachOptions);
    setIsEditing(true);
    setStudentDialog(true);

    // Set top-level fields
    setValue("Client_ID", OBatch.Client_ID);
    setValue("Full_Name", OBatch.Full_Name);
    setValue("_id", OBatch._id);
    setValue("status", OBatch.status);

    // ✅ Set complete nested Payment_Details object (no partial paths)
    setValue("Payment_Details", paymentDetails);
    
    replace(paymentData?.coach_fees || []);
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
        onClick={handleSubmit(isEditing ? saveModifiedUser : addNewStudent)}
      >
        <IoIosSave className="icon-horse2" /> <span></span>
      </button>
    </React.Fragment>
  );

  const actionBodyTemplate = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div className="d-flex gap-2" rowSpan={rowData._totalCoachEntries}>
        <button
          className="icon-button horse"
          style={{ padding: "1.3rem" }}
          onClick={() => editBatch(rowData)}
        >
          <MdOutlineEdit className="icon-horse" />
          <span></span>
        </button>
        <button
          className="icon-button1 horse1 border-danger"
          style={{ padding: "1.3rem" }}
          onClick={() => confirmDeleteBatch(rowData)}
        >
          <MdDelete className="icon-horse1" />
          <span></span>
        </button>
      </div>
    ) : null;

  // column body
  const coachFeesBody = (rowData) => rowData.coach_payment_detail;
  const clientIdBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>{rowData.Client_ID}</div>
    ) : null;
  const fullNameBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>{rowData.Full_Name}</div>
    ) : null;
  const paymentAmountBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData?.Payment_Details?.[selectedYear]?.[selectedMonthNum]
          ?.Payment_Amount ?? "-"}
      </div>
    ) : null;

  const CurrencyBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData?.Payment_Details?.[selectedYear]?.[selectedMonthNum]
          ?.Currency ?? "-"}
      </div>
    ) : null;

  const profitBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.profit ??
          "-"}
      </div>
    ) : null;

  const percentageProfitBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData?.Payment_Details?.[selectedYear]?.[selectedMonthNum]
          ?.percentage_profit ?? "-"}
      </div>
    ) : null;

  const groupByOriginal = (data) => {
    const map = new Map();
    data.forEach((row) => {
      if (!map.has(row._id)) map.set(row._id, []);
      map.get(row._id).push(row);
    });
    return Array.from(map.values());
  };

  const customCheckboxBody = (rowData) => {
    if (rowData._rowSpanIndex !== 0) return null;

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
      <div rowSpan={rowData._totalCoachEntries}>
        <Checkbox
          inputId={rowData._id}
          checked={isSelected}
          onChange={onCheckboxChange}
        />
      </div>
    );
  };

  const selectAllCheckboxHeader = () => {
    const topRows = studentDetails.filter((row) => row._rowSpanIndex === 0);
    const allSelected =
      topRows.length > 0 && selectedCustomers?.length === topRows.length;

    const onHeaderCheckboxChange = (e) => {
      const checked = e.target.checked;

      if (checked) {
        // Group by original _id and take the first row from each group
        const selectedDocs = groupByOriginal(studentDetails).map(
          (group) => group[0]
        );
        setSelectedCustomers(selectedDocs);
      } else {
        setSelectedCustomers([]);
      }
    };

    return <Checkbox checked={allSelected} onChange={onHeaderCheckboxChange} />;
  };

  // Filter states
  const [coachNameFilter, setCoachNameFilter] = useState([]); // For MultiSelect coach names
  const [coachFeeFilter, setCoachFeeFilter] = useState(""); // For minimum coach fee (input)

  // Utility to extract fee number from "coach_name : ₹fee" string
  const parseCoachFee = (text) => {
    // input: "Shourya : ₹2500"
    // output: { name: "Shourya", fee: 2500 }
    const [name, feeStr] = text.split(" : ₹");
    return {
      name: name?.trim() || "",
      fee: Number(feeStr?.trim()) || 0,
    };
  };
 

  const coachFeesFilterTemplate = () => {
    const clear = () => {
      setCoachNameFilter([]);
      setCoachFeeFilter("");
    };

    return (
      <div className="p-2">
        <div className="mb-2 font-bold">Coach Name Picker</div>

        <MultiSelect
          value={coachNameFilter}
          options={Coaches.map((coach) => coach.Full_Name)} // << Important!!
          onChange={(e) => setCoachNameFilter(e.value)}
          placeholder="Select Coaches"
          className="p-column-filter w-full"
        />

        <div className="mt-3 mb-2 font-bold">Minimum Coach Fee</div>

        <InputNumber
          value={coachFeeFilter}
          onValueChange={(e) => setCoachFeeFilter(e.value || "")}
          placeholder="Enter minimum fee"
          className="p-column-filter w-full"
          mode="decimal"
          min={0}
        />

        <div className="flex justify-end gap-2 mt-3">
          <Button label="Clear" outlined size="small" onClick={clear} />
        </div>
      </div>
    );
  };

  const representativeFilterTemplate = (options) => {
    return (
      <React.Fragment>
        <div className="mb-3 font-bold">Currency Picker</div>
        <MultiSelect
          value={options.value}
          onChange={(e) => options.filterCallback(e.value)}
          options={currencies}
          itemTemplate={representativesItemTemplate}
          filter
          placeholder="Select Currencies"
          className="p-column-filter "
          display="chip"
        />
      </React.Fragment>
    );
  };

  const representativesItemTemplate = (option) => {
    return (
      <div className="flex align-items-center ">
        <span>{option}</span>
      </div>
    );
  };

  const [totalPaymentINR, setTotalPaymentINR] = useState(0);
  const [totalCoachFeesINR, setTotalCoachFeesINR] = useState(0);
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
        <h4 className="m-0">Accounts</h4>
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

  // 🧩 Coach Fees useFieldArray
  const coachFeesPath =
    selectedYear && selectedMonthNum !== null
      ? `Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees`
      : "Payment_Details.2024.0.coach_fees";

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: coachFeesPath,
  });

  // 🧾 Watch and initialize coachFeesPath
  useEffect(() => {
    if (!coachFeesPath) return;
    const existingFees = getValues(coachFeesPath);
    const defaultFees = [{ coach_name: "", coach_fee: 0 }];
    if (!Array.isArray(existingFees)) {
      setValue(coachFeesPath, defaultFees, { shouldValidate: false });
      replace(defaultFees);
    } else {
      replace(existingFees);
    }
  }, [coachFeesPath, replace, getValues, setValue]);

  // 🧠 Dynamic field paths
  const fieldPath = useMemo(() => {
    return selectedYear && selectedMonthNum !== null
      ? `Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Amount`
      : null;
  }, [selectedYear, selectedMonthNum]);

  const currencyFieldPath = useMemo(() => {
    return selectedYear && selectedMonthNum !== null
      ? `Payment_Details.${selectedYear}.${selectedMonthNum}.Currency`
      : "";
  }, [selectedYear, selectedMonthNum]);

  const coachFieldPath = useMemo(() => {
    return selectedYear && selectedMonthNum !== null
      ? `Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees`
      : "";
  }, [selectedYear, selectedMonthNum]);

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

  // ✅ Critical block — setValue for nested field
  useEffect(() => {
    if (!selectedYear || selectedMonthNum === null) return;
    const path = `Payment_Details.${selectedYear}.${selectedMonthNum}`;
    const current = getValues(path);
    const initial = {
      Currency: "",
      Payment_Amount: 0,
      Payment_Date: "",
      Due_Date: "",
      payment_status: "Not paid",
      coach_fees: [{ coach_name: "", coach_fee: 0 }],
      profit: 0,
      percentage_profit: 0,
    };
    if (!current || typeof current !== "object") {
      setValue(path, initial, { shouldValidate: false });
    }
    // Replace coach fees into form array
    const fees = getValues(`${path}.coach_fees`);
    if (Array.isArray(fees)) {
      replace(fees);
    } else {
      replace([{ coach_name: "", coach_fee: 0 }]);
    }
  }, [selectedYear, selectedMonthNum, getValues, setValue, replace]);

  // 🔍 Filters + table flatting
  useEffect(() => {
    if (!dataReady || !selectedYear || selectedMonthNum === null || !students)
      return;
    const pdKey = `Payment_Details.${selectedYear}.${selectedMonthNum}`;
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
      [`${pdKey}.Payment_Amount`]: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      [`${pdKey}.Currency`]: { value: null, matchMode: FilterMatchMode.IN },
      coach_payment_detail: { value: null },
      [`${pdKey}.profit`]: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
      [`${pdKey}.percentage_profit`]: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    });
    const noCoachName = coachNameFilter.length === 0;
    const noCoachFee = coachFeeFilter === "";
    if (noCoachName && noCoachFee) {
      setStudentDetails(getStudentDetails(students, selectedYear, selectedMonthNum));
    } else {
  const filtered = students.filter((s) => {
    const pd = s.Payment_Details?.[selectedYear]?.[selectedMonthNum];
    const coachFees = pd?.coach_fees || [];
    return coachFees.some((fee) => {
      const nameMatch = noCoachName || coachNameFilter.includes(fee.coach_name);
      const feeMatch = noCoachFee || fee.coach_fee >= Number(coachFeeFilter);
      return nameMatch && feeMatch;
    });
  });

  const flat = [];
  filtered.forEach((s) => {
    const pd = s.Payment_Details?.[selectedYear]?.[selectedMonthNum];
    const cfs = pd?.coach_fees || [];
    cfs.forEach((cf, i) => {
      flat.push({
        ...s,
        coach_payment_detail: `${cf.coach_name} : ${cf.coach_fee}`,
        _rowSpanIndex: i,
        _totalCoachEntries: cfs.length,
        unique_key: `${s._id || s.Client_ID}_${i}`,
      });
    });
  });
  setStudentDetails(flat);
}
  }, [
    coachNameFilter,
    coachFeeFilter,
    dataReady,
    selectedYear,
    selectedMonthNum,
    students,
  ]);

  // 💰 Calculate INR totals
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
        return;
      }
      setLoading(true);
      let totalPayment = 0;
      let totalCoach = 0;
      for (const stu of students) {
        const pd = stu?.Payment_Details?.[selectedYear]?.[selectedMonthNum];
        const amount = pd?.Payment_Amount || 0;
        const currency = pd?.Currency || "INR";
        if (amount > 0) totalPayment += await convertCurrency(amount, currency);
        const fees = Array.isArray(pd?.coach_fees) ? pd.coach_fees : [];
        for (const fee of fees) {
          const f = fee?.coach_fee || 0;
          if (f > 0) totalCoach += await convertCurrency(f, currency);
        }
      }
      setTotalPaymentINR(totalPayment);
      setTotalCoachFeesINR(totalCoach);
      setLoading(false);
    };
    calcTotals();
  }, [students, selectedYear, selectedMonthNum, dataReady]);


    const notificationCtx = useContext(NotificationContext);

useEffect(() => {
  if (notificationCtx) {
    notificationCtx.setSelectedYear(selectedYear);
    notificationCtx.setSelectedMonthNum(selectedMonthNum);
    notificationCtx.setRefreshStudents(() => getStudents);
  }
}, [notificationCtx, selectedYear, selectedMonthNum, getStudents]);

  return (
    <div>
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
      <div className=" text-center mx-5">
        <div className="row mt-5">
          {/* Total Students */}
          <div className="col-lg-6 my-3">
            <div
              className="card s-col d-block m-auto"
              style={{ width: "18rem", height: "10rem" }}
            >
              <div className="card-body d-flex gap-4 ">
                <FaMoneyCheckAlt className="icon-stu fs-1" />
                <div>
                  <h5 className="stu-context">Total Revenue :</h5>
                  {loading ? (
                    <>
                      <Skeleton
                        height="2rem"
                        className="mb-2"
                        borderRadius="16px"
                      />
                      <Skeleton
                        height="2rem"
                        className="mb-2"
                        borderRadius="16px"
                      />
                    </>
                  ) : (
                    <>
                      <p className="mb-1 stu-context">
                        <strong>Total Payment Collected:</strong> ₹
                        {Number(totalPaymentINR).toFixed(2)}
                      </p>
                      <p className="mb-0 stu-context">
                        <strong>Total Coach Fees Paid:</strong> ₹
                        {Number(totalCoachFeesINR).toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
                <div className="ag-courses-item_bg"></div>
              </div>
            </div>
          </div>

          {/* Active Students */}
          <div className="col-lg-6 my-3">
            <div
              className="card s-col d-blcok m-auto"
              style={{ width: "18rem", height: "10rem" }}
            >
              <div className="card-body d-flex gap-4">
                <TfiStatsUp className="icon-stu fs-3" />
                <div>
                  <h5 className="stu-context">Profit Insights :</h5>

                  {/* Net Profit: Total payment - total coach fees */}
                  <div className="mb-1 fs-5 stu-context">
                    <strong>Net Profit:</strong> ₹
                    {loading ? (
                      <Skeleton
                        height="2rem"
                        className="mb-2"
                        borderRadius="16px"
                      />
                    ) : (
                      Number(totalPaymentINR - totalCoachFeesINR).toFixed(2)
                    )}
                  </div>

                  {/* Profit %: (Profit / Total Payment) * 100 */}
                  <div className="mb-0 fs-5 stu-context">
                    <strong>Profit %:</strong>{" "}
                    {loading ? (
                      <Skeleton
                        height="2rem"
                        className="mb-2"
                        borderRadius="16px"
                      />
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
              field={`Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Amount`}
              header="Fee"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
              body={paymentAmountBody}
            />

            <Column
              field={`Payment_Details.${selectedYear}.${selectedMonthNum}.Currency`}
              header="Currency"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterMenuStyle={{ width: "14rem" }}
              showFilterMatchModes={false}
              filterElement={representativeFilterTemplate}
              body={CurrencyBody}
            />

            <Column
              field="coach_payment_detail"
              header="Coach Fees"
              filter
              filterElement={coachFeesFilterTemplate}
              showFilterMatchModes={false}
              body={coachFeesBody}
              style={{ minWidth: "14rem" }}
              filterMenuStyle={{ "--class-type-filter": 1 }}
            />

            <Column
              field={`Payment_Details.${selectedYear}.${selectedMonthNum}.profit`}
              header="Profit"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
              body={profitBody}
            />
            <Column
              field={`Payment_Details.${selectedYear}.${selectedMonthNum}.percentage_profit`}
              header="% Profit"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
              body={percentageProfitBody}
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
  header="Account Details"
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
          {isEditing ? (
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
          ) : (
            <div className="inputbox4 form-floating">
              <select
                id="Client_ID"
                className="form-select"
                {...register("Client_ID", { required: true })}
                onChange={(e) => handleStudentSelect(e.target.value)}
              >
                <option value="">Select Client ID</option>
                {emptyAccounts.map((student) => (
                  <option key={student.Client_ID} value={student.Client_ID}>
                    {student.Client_ID}
                  </option>
                ))}
              </select>
              <label htmlFor="Client_ID" className="text-dark">Client ID</label>
              {errors?.Client_ID?.type === "required" && (
                <p className="text-danger">*Enter Student ID</p>
              )}
            </div>
          )}
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
{!isEditing && watch("Client_ID") && (() => {
  const selectedStudent = orgStudents.find(
    (s) => s.Client_ID === watch("Client_ID")
  );
  if (!selectedStudent) return null;

  // Calculate previous month/year
  let prevMonth = Number(selectedMonthNum) - 1;
  let prevYear = Number(selectedYear);
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear = prevYear - 1;
  }
  const prevMonthData = selectedStudent.Payment_Details?.[prevYear]?.[prevMonth];
  if (!prevMonthData) return null;

  return (
    <div className="mb-3">
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() => {
          // Fill form fields with previous month data
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Currency`, prevMonthData.Currency || "");
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Amount`, prevMonthData.Payment_Amount || 0);
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Payment_Date`, "");
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.Due_Date`, `${selectedYear}-${String(selectedMonthNum).padStart(2, "0")}-17`);
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.payment_status`, "Not paid");
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees`, prevMonthData.coach_fees || [{ coach_name: "", coach_fee: 0 }]);
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.profit`, prevMonthData.profit || 0);
          setValue(`Payment_Details.${selectedYear}.${selectedMonthNum}.percentage_profit`, prevMonthData.percentage_profit || 0);
          toast.success("Last month's account copied!", { theme: "light" });
        }}
      >
        Copy Last Month Account
      </button>
    </div>
  );
})()}
      {/* Payment + Currency */}
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="inputbox4 form-floating">
            <i className="fa-solid fa-money-bill"></i>
            <Controller
              name={fieldPath || "dummy"}
              control={control}
              rules={{ required: true, min: 1 }}
              render={({ field }) => (
                <input
                  type="number"
                  id="Payment_Amount"
                  className="form-control"
                  placeholder="Fees"
                  {...field}
                />
              )}
            />
            <label htmlFor="Payment_Amount" className="text-dark">Fees</label>
            {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Payment_Amount?.type === "required" && (
              <p className="text-danger">* Enter Fees</p>
            )}
            {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Payment_Amount?.type === "min" && (
              <p className="text-danger">* Fees must be greater than 0</p>
            )}
          </div>
        </div>

        <div className="col-lg-6 mb-5">
          <div className="inputbox4 form-floating">
            <i className="fa-solid fa-coins"></i>
            <Controller
              name={currencyFieldPath || "dummy"}
              control={control}
              rules={{ required: "Currency is required" }}
              render={({ field }) => (
                <select
                  id="Payment_Currency"
                  className={`form-select ${
                    errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Currency ? "is-invalid" : ""
                  }`}
                  {...field}
                >
                  <option value="">Select Currency</option>
                  {currencies.map((curr) => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              )}
            />
            <label htmlFor="Payment_Currency" className="text-dark">Currency</label>
            {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.Currency?.message && (
              <p className="text-danger">
                * {errors.Payment_Details[selectedYear][selectedMonthNum].Currency.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Coach Fees Section */}
      <div className="row">
        <h5>Coach Fees</h5>
        {coachFieldPath &&
          fields.map((item, index) => {
            const watchCoachFees = watch(coachFieldPath) || [];
            const selectedCoaches = watchCoachFees.map((f) => f.coach_name);
            const selectedCoachesExceptCurrent = selectedCoaches.filter((_, i) => i !== index);
            const dropdownOptions = availableCoaches.filter(
              (c) => !selectedCoachesExceptCurrent.includes(c.name)
            );
            const currentCoach = watchCoachFees[index]?.coach_name || "";

            return (
              <div key={item.id} className="col-md-6 mb-3">
                <div className="input-group">
                  <Controller
                    n name={`Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees.${index}.coach_name`}
                    control={control}
                    rules={{ required: "Select a coach" }}
                    render={({ field }) => (
                      <select
                        className={`form-select ${
                          errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.coach_fees?.[index]?.coach_name
                            ? "is-invalid"
                            : ""
                        }`}
                        {...field}
                        value={field.value || currentCoach}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="">Select Coach</option>
                        {dropdownOptions.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />

                  <Controller
                    name={`Payment_Details.${selectedYear}.${selectedMonthNum}.coach_fees.${index}.coach_fee`}
                    control={control}
                    rules={{
                      required: "Enter coach fee",
                      min: { value: 1, message: "Fee must be greater than 0" },
                    }}
                    render={({ field }) => (
                      <input
                        type="number"
                        min={0}
                        placeholder="Coach Fee"
                        className={`form-control ${
                          errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.coach_fees?.[index]?.coach_fee
                            ? "is-invalid"
                            : ""
                        }`}
                        {...field}
                      />
                    )}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove this coach?")) {
                        remove(index);
                      }
                    }}
                  >
                    ❌
                  </button>
                </div>

                {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.coach_fees?.[index]?.coach_name && (
                  <div className="text-danger small mt-1">
                    * {errors.Payment_Details[selectedYear][selectedMonthNum].coach_fees[index].coach_name.message}
                  </div>
                )}
                {errors?.Payment_Details?.[selectedYear]?.[selectedMonthNum]?.coach_fees?.[index]?.coach_fee && (
                  <div className="text-danger small">
                    * {errors.Payment_Details[selectedYear][selectedMonthNum].coach_fees[index].coach_fee.message}
                  </div>
                )}
              </div>
            );
          })}

        {coachFieldPath &&
          availableCoaches.length > (watch(coachFieldPath)?.length || 0) && (
            <div className="col-12 text-center mt-2">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => append({ coach_name: "", coach_fee: 0 })}
              >
                ➕ Add Coach Fee
              </button>
            </div>
          )}
      </div>
    </div>
   
  </form>
</Dialog>



      {/* delete */}
      <Dialog
        visible={deleteStudentDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductDialogFooter}
        onHide={hideDeleteProductDialog}
      >
        <div className="confirmation-content text-danger gap-2 d-flex">
          <div>
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{ fontSize: "2rem", padding: "2rem" }}
            ></i>
          </div>
          <div className="mt-3 fs-5">
            {student && (
              <span>
                Are you sure you want to Remove the Account of{" "}
                <b>{student?.Full_Name}</b>?
              </span>
            )}
          </div>
        </div>
      </Dialog>
      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={hideDeleteProductsDialog}
      >
        <div className="confirmation-content text-danger d-flex gap-2">
          <div>
            <i
              className="fa-solid fa-triangle-exclamation"
              style={{ fontSize: "2rem", padding: "2rem" }}
            ></i>
          </div>
          <div className="mt-3 fs-5">
            {student && (
              <span>
                Are you sure you want to delete the selected Students Account?
              </span>
            )}
          </div>
        </div>
      </Dialog>

      {/* Currency */}
      <Dialog
        visible={currDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Currency Converter"
        modal
        footer={CurrDialogFooter}
        onHide={hideCurrDialog}
      >
        <div className="container">
          <CurrencyConvertor />
        </div>
      </Dialog>
    </div>
  );
};

export default Account;
