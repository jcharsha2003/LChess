import React, { useState, useEffect, useRef } from "react";
import "./Account.css";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { MdScheduleSend } from "react-icons/md";

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
import { Skeleton } from 'primereact/skeleton';
const Account = () => {


  const [currencies, setCurrencies] = useState([]);
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await fetch("https://api.frankfurter.app/currencies");
        const data = await res.json();
        setCurrencies(Object.keys(data));
      } catch (error) {
        console.error("Error Fetching", error);
      }
    };
    fetchCurrencies();
  }, []);
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
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "coach_fees",
  });
  
  const [availableCoaches, setAvailableCoaches] = useState([]);
  let token = sessionStorage.getItem("token");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    Client_ID: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Full_Name: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "Payment_Details.Payment_Amount": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    "Payment_Details.Currency": { value: null, matchMode: FilterMatchMode.IN },
    coach_payment_detail: { value: null },
    profit: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    percentage_profit: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
  });

  let [error, setError] = useState("");
  const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const getStudentDetails = (data) => {
    const flat = [];

    [...(data || [])].forEach((student) => {
      const coachFeesArr = student.coach_fees || [];

      coachFeesArr.forEach((feeObj, idx) => {
        flat.push({
          ...student,
          coach_payment_detail: `${feeObj.coach_name} : ${feeObj.coach_fee}`,
          _rowSpanIndex: idx,
          _totalCoachEntries: coachFeesArr.length,
          unique_key: `${student._id || student.Client_ID}_${idx}`,
        });
      });
    });

    return flat;
  };
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [studentDialog, setStudentDialog] = useState(false);
  let [student, setStudent] = useState([]);
  let [students, setStudents] = useState([]);
  let [studentDetails, setStudentDetails] = useState([]);
  let [orgStudents, setOrgStudents] = useState([]);
  const getStudents = () => {

    axios
      .get(
        `${process.env.REACT_APP_API_URL}/student-api/get-student-accounts`,
        {
          headers: { Authorization: "Bearer " + token },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications

          console.log(originalData);

          // Store original data in students (unchanged)
          setStudents(originalData);
          setStudentDetails(getStudentDetails(modifiedData));

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
               
      
                console.log(originalData);
      
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

  useEffect(() => {
    const fetchData = async () => {
      await getStudents();
      await getCoaches();
      await getBatches();
    };

    fetchData();
  }, []);

  const deleteStudent = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-delete-student`,
        { _id: student?._id },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
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
          getStudents();
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

  const deleteStudents = () => {
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-delete-students`,
        { students: selectedCustomers },
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
          getStudents();
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
    
   
      // Step 1: Clean coach_fees array (remove empty entries)
      let validCoachFees = (modifiedUser.coach_fees || []).filter(
        (fee) => fee.coach_name && fee.coach_fee
      );
      
      // Step 2: Calculate total coach fees
      let totalCoachFees = validCoachFees.reduce((acc, fee) => acc + Number(fee.coach_fee), 0);
      
      // Step 3: Get Payment Amount safely
      let paymentAmount = Number(modifiedUser.Payment_Details?.Payment_Amount || 0);
      
      // Step 4: Calculate Profit and Percentage Profit
      let profit = paymentAmount - totalCoachFees;
      let percentageProfit = paymentAmount > 0 ? (profit * 100) / paymentAmount : 0;
      
      // Step 5: Create finalStudent object
      let finalStudent = {
        ...modifiedUser,
        coach_fees: validCoachFees,
        Payment_Details: {
          ...modifiedUser.Payment_Details,
          Payment_Amount: paymentAmount,
          Currency: modifiedUser.Payment_Details?.Currency || "",
        },
        profit: profit,
        percentage_profit: percentageProfit,
      };
      
      // ✅ finalStudent is ready for Axios PUT
      console.log(finalStudent);

      axios.put(
        `${process.env.REACT_APP_API_URL}/student-api/soft-add-student`,
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
            getStudents();
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
      let modifiedUser = getValues();
     

      // Step 1: Clean coach_fees array (remove empty entries)
      let validCoachFees = (modifiedUser.coach_fees || []).filter(
        (fee) => fee.coach_name && fee.coach_fee
      );
      
      // Step 2: Calculate total coach fees
      let totalCoachFees = validCoachFees.reduce((acc, fee) => acc + Number(fee.coach_fee), 0);
      
      // Step 3: Get Payment Amount safely
      let paymentAmount = Number(modifiedUser.Payment_Details?.Payment_Amount || 0);
      
      // Step 4: Calculate Profit and Percentage Profit
      let profit = paymentAmount - totalCoachFees;
      let percentageProfit = paymentAmount > 0 ? (profit * 100) / paymentAmount : 0;
      
      // Step 5: Create finalStudent object
      let finalStudent = {
        ...modifiedUser,
        coach_fees: validCoachFees,
        Payment_Details: {
          ...modifiedUser.Payment_Details,
          Payment_Amount: paymentAmount,
          Currency: modifiedUser.Payment_Details?.Currency || "",
        },
        profit: profit,
        percentage_profit: percentageProfit,
      };
      
      // ✅ finalStudent is ready for Axios PUT
      console.log(finalStudent);
      
    

      
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
            getStudents();
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
            deleteStudent();
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

  const selectedStudent = orgStudents.find((s) => s.Client_ID === selectedClientId);
  if (!selectedStudent) return;

  setValue("_id", selectedStudent._id);
  setValue("Client_ID", selectedStudent.Client_ID);
  setValue("Full_Name", selectedStudent.Full_Name);

  // Get student's batch and find coaches
  const studentBatch = batches.find((b) => b.batch_id === selectedStudent.Batch);

  if (studentBatch) {
    const mainCoach = studentBatch.coaches?.main;
    const subCoaches = studentBatch.coaches?.sub_coaches || [];
    const allBatchCoaches = [mainCoach, ...subCoaches];

    const coachOptions = allBatchCoaches.map(name => {
      const coachInfo = Coaches.find(c => c.Full_Name === name);
      const status = coachInfo?.status || "Inactive";
      const isActive = status === "Active";
      const statusSymbol = isActive ? "🟢" : "🔴";
      const label = `${statusSymbol} ${name}${name === mainCoach ? " (main)" : ""}`;
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
  const emptyStudent = {
    Client_ID: "",
    Full_Name: "",
    Payment_Details: {
      Currency: "",
      Payment_Amount: 0,
    },
    coach_fees: [
      {
        coach_name: "",
        coach_fee: 0,
      }
    ],
    profit: 0,
    percentage_profit: 0,
  };

  setStudent(emptyStudent);
  setIsEditing(false);
  setSubmitted(false);

  // Set all fields empty
  Object.entries(emptyStudent).forEach(([key, value]) => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        setValue(`${key}.${nestedKey}`, nestedValue);
      });
    } else {
      setValue(key, value);
    }
  });

  // Prepare dropdown options
  const emptyStudents = orgStudents.filter((student) => {
    const payment = student.Payment_Details || {};
    const coachFees = student.coach_fees || [];

    const hasValidPayment =
      payment.Payment_Amount > 0 &&
      typeof payment.Currency === "string" &&
      payment.Currency.trim() !== "";

    const hasValidCoachFees = coachFees.some(
      (c) =>
        c &&
        typeof c.coach_name === "string" &&
        c.coach_name.trim() !== "" &&
        c.coach_fee > 0
    );

    const hasProfit = student.profit > 0;
    const hasPercentageProfit = student.percentage_profit > 0;

    return !(hasValidPayment && hasValidCoachFees && hasProfit && hasPercentageProfit);
  });

  // Set emptyAccounts options
  const dropdownOptions = emptyStudents.map((student) => ({
    Client_ID: student.Client_ID,
    Full_Name: student.Full_Name,
  }));

  setEmptyAccounts(dropdownOptions);

 
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
            deleteStudents();
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
  
    const studentBatch = batches.find(b => b.batch_id === OBatch.Batch);
    const mainCoach = studentBatch?.coaches?.main;
    const subCoaches = studentBatch?.coaches?.sub_coaches || [];
    const allBatchCoaches = [mainCoach, ...subCoaches];
  
    // Map batch coaches with full details from Coaches list
    const coachOptions = allBatchCoaches?.map(name => {
      const coachInfo = Coaches.find(c => c.Full_Name === name);
      const status = coachInfo?.status || "Inactive";
      const isActive = status === "Active";
      const statusSymbol = isActive ? "🟢" : "🔴";
      const label = `${statusSymbol} ${name}${name === mainCoach ? ' (main)' : ''}`;
      return {
        name,
        label,
        isActive,
      };
    });
    
  
    setStudent({ ...OBatch });
    setAvailableCoaches(coachOptions);  // store this in a state to use in dropdown
    setIsEditing(true);
    setStudentDialog(true);
  
    setValue("Client_ID", OBatch.Client_ID);
    setValue("Full_Name", OBatch.Full_Name);
    setValue("Payment_Details.Payment_Amount", OBatch.Payment_Details.Payment_Amount);
    setValue("Payment_Details.Currency", OBatch.Payment_Details.Currency);
    setValue("_id", OBatch._id);
    setValue("coach_fees", OBatch.coach_fees);
   
  
    replace(OBatch.coach_fees || []);
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
        {rowData.Payment_Details.Payment_Amount}
      </div>
    ) : null;
  const CurrencyBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData.Payment_Details.Currency}
      </div>
    ) : null;

  const profitBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>{rowData.profit}</div>
    ) : null;

  const percentageProfitBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalCoachEntries}>
        {rowData.percentage_profit}
      </div>
    ) : null;
  const header = renderHeader();
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
  const [coachFeeFilter, setCoachFeeFilter] = useState(''); // For minimum coach fee (input)
  

// Utility to extract fee number from "coach_name : ₹fee" string
const parseCoachFee = (text) => {
  // input: "Shourya : ₹2500"
  // output: { name: "Shourya", fee: 2500 }
  const [name, feeStr] = text.split(' : ₹');
  return {
    name: name?.trim() || '',
    fee: Number(feeStr?.trim()) || 0,
  };
};
useEffect(() => {
  const noCoachNameFilter = coachNameFilter.length === 0;
  const noCoachFeeFilter = coachFeeFilter === '';

  if (noCoachNameFilter && noCoachFeeFilter) {
    setStudentDetails(getStudentDetails(students)); // show all
  } else {
    const filtered = students.filter((student) =>
      (student.coach_fees || []).some((feeObj) => {
        const matchesName = noCoachNameFilter || coachNameFilter.includes(feeObj.coach_name);
        const matchesFee = noCoachFeeFilter || feeObj.coach_fee >= Number(coachFeeFilter);
        return matchesName && matchesFee;
      })
    );

    const flat = [];
    filtered.forEach((student) => {
      const coachFeesArr = student.coach_fees || [];
      coachFeesArr.forEach((feeObj, idx) => {
        flat.push({
          ...student,
          coach_payment_detail: `${feeObj.coach_name} : ${feeObj.coach_fee}`,
          _rowSpanIndex: idx,
          _totalCoachEntries: coachFeesArr.length,
          unique_key: `${student._id || student.Client_ID}_${idx}`,
        });
      });
    });

    setStudentDetails(flat);
  }
}, [coachNameFilter, coachFeeFilter]);

const coachFeesFilterTemplate = () => {
  const clear = () => {
    setCoachNameFilter([]);
    setCoachFeeFilter('');
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
        onValueChange={(e) => setCoachFeeFilter(e.value || '')}
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

  useEffect(() => {
    const calculateAmounts = async () => {
      if (students.length === 0) {
        setTotalPaymentINR(0);
        setTotalCoachFeesINR(0);
        return;
      }

      setLoading(true);
      let totalPayment = 0;
      let totalCoachFees = 0;

      for (const stu of students) {
        const paymentAmount = stu?.Payment_Details?.Payment_Amount || 0;
        const paymentCurrency = stu?.Payment_Details?.Currency || "INR";

        if (paymentAmount > 0) {
          const convertedPayment = await convertCurrency(paymentAmount, paymentCurrency);
          totalPayment += convertedPayment;
        }

        const coachFees = Array.isArray(stu?.coach_fees) ? stu.coach_fees : [];
        for (const feeObj of coachFees) {
          const coachFee = feeObj?.coach_fee || 0;
          if (coachFee > 0) {
            const convertedCoachFee = await convertCurrency(coachFee, paymentCurrency);
            totalCoachFees += convertedCoachFee;
          }
        }
      }

      setTotalPaymentINR(totalPayment);
      setTotalCoachFeesINR(totalCoachFees);
      setLoading(false);
    };

    if (students.length > 0) {
      calculateAmounts();
    }
  }, [students]);


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
      <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
      <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
    </>
  ) : (
    <>
      <p className="mb-1 stu-context">
        <strong>Total Payment Collected:</strong> ₹{Number(totalPaymentINR).toFixed(2)}
      </p>
      <p className="mb-0 stu-context">
        <strong>Total Coach Fees Paid:</strong> ₹{Number(totalCoachFeesINR).toFixed(2)}
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
      <div className="card s-col d-blcok m-auto" style={{ width: "18rem", height: "10rem" }}>
        <div className="card-body d-flex gap-4">
          <TfiStatsUp className="icon-stu fs-3" />
          <div>
            <h5 className="stu-context">Profit Insights :</h5>

            {/* Net Profit: Total payment - total coach fees */}
            <p className="mb-1 fs-5 stu-context">
              <strong>Net Profit:</strong> ₹
              {loading ? (
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
              ) : (
                Number(totalPaymentINR - totalCoachFeesINR).toFixed(2)
              )}
            </p>

            {/* Profit %: (Profit / Total Payment) * 100 */}
            <p className="mb-0 fs-5 stu-context">
              <strong>Profit %:</strong>{" "}
              {loading ? (
                <Skeleton height="2rem" className="mb-2" borderRadius="16px" />
              ) : (
                totalPaymentINR > 0
                  ? ((totalPaymentINR - totalCoachFeesINR) / totalPaymentINR * 100).toFixed(2) + "%"
                  : "0%"
              )}
            </p>
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
              field="Payment_Details.Payment_Amount"
              header="Fee"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
              body={paymentAmountBody}
            />
            <Column
              field="Payment_Details.Currency"
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
              field="profit"
              header="Profit"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
              body={profitBody}
            />
            <Column
              field="percentage_profit"
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
        visible={studentDialog}
        style={{ width: "80vw" }} // 👈 changed this
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Account Details"
        modal
        className="p-fluid"
        footer={studentDialogFooter}
        onHide={hideDialog}
      >
        <form className="mt-5 ">
          <div className="ecat container">
          <div className="row justify-content-center">
  {/* First Column - Client_ID Dropdown */}
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
    <label htmlFor="Client_ID" className="text-dark">
      Client ID
    </label>
    {errors.Client_ID?.type === "required" && (
      <p className="text-danger">*enter Student full name</p>
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
    <label htmlFor="Client_ID" className="text-dark">
      Client ID
    </label>
    {errors.Client_ID?.type === "required" && (
      <p className="text-danger">*enter Student full name</p>
    )}
  </div>
)}

  </div>

  {/* Second Column - Full Name Input */}
  <div className="col-lg-6">
    <div className="inputbox4 form-floating">
      <i className="fa-regular fa-user"></i>

      <input
        type="text"
        id="Full_Name"
        className="form-control"
        placeholder="xyz"
        disabled // Always disabled (admin should not change name manually)
        {...register("Full_Name", { required: true })}
      />
      <label htmlFor="Full_Name" className="text-dark">
        Full Name
      </label>

      {errors.Full_Name?.type === "required" && (
        <p className="text-danger">*Full name is required</p>
      )}
    </div>
  </div>
</div>



            
            <div className="row justify-content-center ">
              {/* first col */}
              <div className=" col-lg-6  ">
              <div className="inputbox4 form-floating">
              <i className="fa-solid fa-money-bill"></i>

  <input
    type="number"
    id="Payment_Amount"
    className="form-control"
    placeholder="xyz"
    {...register("Payment_Details.Payment_Amount", {
      required: "Fees is required",
      min: { value: 1, message: "Fees must be greater than 0" },
    })}
  />
  <label htmlFor="Payment_Amount" className="text-dark">
    Fees
  </label>

  {/* Error messages */}
  {errors.Payment_Details?.Payment_Amount?.type === "required" && (
    <p className="text-danger">* Enter Fees</p>
  )}
  {errors.Payment_Details?.Payment_Amount?.type === "min" && (
    <p className="text-danger">* Fees must be greater than 0</p>
  )}
</div>

              </div>
              {/* second column */}
              <div className="col-lg-6 mb-5">
              <div className="inputbox4 form-floating">
  <i className="fa-solid fa-coins"></i>

  <select
    id="Payment_Currency"
    className={`form-select ${errors.Payment_Details?.Currency ? "is-invalid" : ""}`}
    {...register("Payment_Details.Currency", {
      required: "Currency is required",
    })}
  >
    <option value="">Select Currency</option>
    {currencies.map((curr) => (
      <option key={curr} value={curr}>
        {curr}
      </option>
    ))}
  </select>

  <label htmlFor="Payment_Currency" className="text-dark">
    Currency
  </label>

  {/* Error Message */}
  {errors.Payment_Details?.Currency && (
    <p className="text-danger">* {errors.Payment_Details.Currency.message}</p>
  )}
</div>

              </div>
            </div>

            <div className="row">
  <h5>Coach Fees</h5>

  {fields.map((item, index) => {
    const watchCoachFees = watch('coach_fees') || [];
    const selectedCoaches = watchCoachFees.map((f) => f.coach_name);

    const selectedCoachesExceptCurrent = selectedCoaches.filter((_, i) => i !== index);

    const dropdownOptions = availableCoaches.filter(
      (c) => !selectedCoachesExceptCurrent.includes(c.name)
    );

    const currentCoach = watchCoachFees[index]?.coach_name || '';

    return (
      <div key={item.id} className="col-md-6 mb-3">
        <div className="input-group">

          {/* Coach Dropdown */}
          <select
            className={`form-select ${errors.coach_fees?.[index]?.coach_name ? "is-invalid" : ""}`}
            {...register(`coach_fees.${index}.coach_name`, {
              required: "Select a coach",
            })}
            value={currentCoach}
            onChange={(e) => {
              setValue(`coach_fees.${index}.coach_name`, e.target.value, { shouldValidate: true });
            }}
          >
            <option value="">Select Coach</option>
            {dropdownOptions.map((c, i) => (
              <option key={i} value={c.name}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Coach Fee Input */}
          <input
            type="number"
            min={0}
            placeholder="Coach Fee"
            className={`form-control ${errors.coach_fees?.[index]?.coach_fee ? "is-invalid" : ""}`}
            {...register(`coach_fees.${index}.coach_fee`, {
              required: "Enter coach fee",
              min: { value: 1, message: "Fee must be greater than 0" },
            })}
          />

          {/* Remove Button */}
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

        {/* Error Messages */}
        {errors.coach_fees?.[index]?.coach_name && (
          <div className="text-danger small mt-1">
            * {errors.coach_fees[index].coach_name.message}
          </div>
        )}
        {errors.coach_fees?.[index]?.coach_fee && (
          <div className="text-danger small">
            * {errors.coach_fees[index].coach_fee.message}
          </div>
        )}
      </div>
    );
  })}

  {/* Add Coach Button */}
  {availableCoaches.length > (watch('coach_fees')?.length || 0) && (
    <div className="col-12 text-center mt-2">
      <button
        type="button"
        className="btn btn-outline-primary"
        onClick={() =>
          append({
            coach_name: "",
            coach_fee: 0,
          })
        }
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
