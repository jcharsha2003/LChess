import React, { useState, useEffect, useRef } from "react";
import "./Student.css";
import { FaUsers } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";
import axios from "axios";

import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports
import { BsPersonRaisedHand } from "react-icons/bs";
import { MultiSelect } from "primereact/multiselect";
import { FaFileExport } from "react-icons/fa6";
import { FaUserPlus } from "react-icons/fa";
import { Toolbar } from "primereact/toolbar";
import { GiCancel } from "react-icons/gi";
import { RiDeleteBinFill } from "react-icons/ri";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { MdOutlineEditOff } from "react-icons/md";
import { IoIosSave } from "react-icons/io";

import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useForm, Controller } from "react-hook-form";

const Student = () => {
  const [isEditing, setIsEditing] = useState(false);
  const dt = useRef(null);
  let {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm();
  let emptyStudent = {
    Client_ID: "",
    Full_Name: "",
    Parent: "",
    Batch: "",
    Age: 0,
    Email_Address: "",
    Gender: "",
    Whatsapp: "",
    Enrollment_Date: "",
    Address: "",
    Country: "",
    Coach: "",
    Payment_Details: {
      Payment_Plan_Type: "",
      Currency: "",
      Payment_Amount: 0,
      Payment_Date: "",
      Payment_Method: "",
      Next_Payment_Due_Date: "",
      Total_Paid_to_Date: 0,
      New_Payment_Made: false,
    },
    status: "Active",
  };
  const [studentDialog, setStudentDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState(null);
  const [student, setStudent] = useState(emptyStudent);
  const [submitted, setSubmitted] = useState(false);
  const [deleteStudentDialog, setDeleteStudentDialog] = useState(false);
  const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
  const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
};
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
    Parent: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Age: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
    },
    Batch: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Gender: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Whatsapp: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Email_Address: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },

    Enrollment_Date: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    Country: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Address: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    Coach: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
     status: { value: null, matchMode: FilterMatchMode.IN },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  let [error, setError] = useState("");
  let [students, setStudents] = useState([]);
  let token = sessionStorage.getItem("token");

  const editStudent = (student) => {
    setStudent({ ...student });
    setIsEditing(true);
    setStudentDialog(true);
    console.log(student?.Whatsapp);
    setValue("Client_ID", student?.Client_ID);
    setValue("Full_Name", student?.Full_Name);
    setValue("Parent", student?.Parent);
    setValue("Batch", student?.Batch);
    setValue("Gender", student?.Gender);
    setValue("Age", student?.Age);
    setValue("Whatsapp", student?.Whatsapp);
    setValue("Enrollment_Date", student?.Enrollment_Date);
    setValue("Country", student?.Country);
    setValue("Email_Address", student?.Email_Address);
    setValue("Address", student?.Address);
    setValue("Coach", student?.Coach);
    setValue("status", student?.status);
    setValue("_id", student?._id);
  };
  const confirmDeleteProduct = (student) => {
    setStudent({ ...student });
    setDeleteStudentDialog(true);
  };


 
  // get Batches
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
          console.log(originalData)
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
          console.log(err.response);
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
  // get Coaches
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

          

          // Store original data in Coaches (unchanged)
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
          console.log(err.response);
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

  const saveModifiedUser = () => {
    if (Object.keys(errors).length === 0) {
      let modifiedUser = getValues();
      if (modifiedUser.Enrollment_Date instanceof Date) {
        modifiedUser.Enrollment_Date =
          modifiedUser.Enrollment_Date.toISOString().split("T")[0];
      }
      const raw = getValues("Whatsapp");
      modifiedUser.Whatsapp = raw.startsWith("+") ? raw : "+" + raw;
      console.log(modifiedUser)
      const existing = customers.find(
        (c) => c.Client_ID === modifiedUser.Client_ID && c._id !== modifiedUser._id
      );
 console.log(existing)
if (existing) {
  toast.error("Client ID already exists. Please choose a different one.", {
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
  return; // ⛔ Stop further execution — dialog remains open
}
      axios
        .put(`${process.env.REACT_APP_API_URL}/student-api/update-student`, modifiedUser, {
          headers: { Authorization: "Bearer " + token },
        })
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
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="d-flex gap-2">
          <button
            className="icon-button horse "
            style={{ padding: "1.3rem" }}
            onClick={() => editStudent(rowData)}
          >
            <MdOutlineEdit className="icon-horse" /> <span></span>
          </button>
          <button
            className="icon-button1 horse1 border-danger"
            style={{ padding: "1.3rem" }}
            onClick={() => confirmDeleteProduct(rowData)}
          >
            <MdDelete className="icon-horse1" /> <span></span>
          </button>
        </div>
      </React.Fragment>
    );
  };
  const getStudents = () => {
    
    axios
      .get(`${process.env.REACT_APP_API_URL}/student-api/get-students`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications

          console.log(originalData, modifiedData);

          // Store original data in students (unchanged)
          setStudents(originalData);

          // Store modified data in customers
          setCustomers(getCustomers(modifiedData));
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
          console.log(err.response);
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

  const addNewStudent = () => {
    if (Object.keys(errors).length === 0) {
      let modifiedUser = getValues();
      if (modifiedUser.Enrollment_Date instanceof Date) {
        modifiedUser.Enrollment_Date =
          modifiedUser.Enrollment_Date.toISOString().split("T")[0];
      }
      // Merge filled user data with emptyStudent (ensuring all fields exist)
      let finalStudent = {
        ...emptyStudent, // Default values
        ...modifiedUser, // User input values
        Payment_Details: {
          ...emptyStudent.Payment_Details, // Default payment structure
          ...(modifiedUser.Payment_Details || {}), // User payment details (if any)
        },
      };

      console.log(finalStudent);
      axios
        .post(`${process.env.REACT_APP_API_URL}/student-api/add-student`, finalStudent, {
          headers: { Authorization: "Bearer " + token },
        })
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
            console.log(err.response);
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
  const deleteStudent = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/student-api/delete-student/${student?._id}`, {
        headers: { Authorization: "Bearer " + token },
      })
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
          console.log(err.response);
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
  .post(`${process.env.REACT_APP_API_URL}/student-api/delete-students`, 
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
          console.log(err.response);
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
  // Table part code

  const hideDialog = () => {
    setSubmitted(false);
    setStudentDialog(false);
    reset();
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

  const getCustomers = (data) => {
    return [...(data || [])].map((d) => {
      d.Enrollment_Date = new Date(d.Enrollment_Date);

      return d;
    });
  };
  const hideDeleteProductDialog = () => {
    setDeleteStudentDialog(false);
  };

  const formatDate = (value) => {
    return value.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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
        <h4 className="m-0">Students</h4>
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

  const dateBodyTemplate = (rowData) => {
    return formatDate(rowData.Enrollment_Date);
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
  const balanceFilterTemplate = (options) => {
    return (
      <InputNumber
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        locale="en-US"
      />
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
          if (window.confirm("Are you sure you want to delete this student?")) {
            deleteStudent();
            hideDeleteProductDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );
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
          if (window.confirm("Are you sure you want to delete this student?")) {
            deleteStudents();
            hideDeleteProductsDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );
  const openNew = () => {
    setStudent(emptyStudent);
    setIsEditing(false);
    setSubmitted(false);
    setStudentDialog(true);

    Object.entries(emptyStudent).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // If it's a nested object, iterate over its properties
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          setValue(`${key}.${nestedKey}`, nestedValue);
        });
      } else {
        setValue(key, value);
      }
    });
  };
  const exportCSV = () => {
    dt.current.exportCSV();
  };
  const [statuses] = useState(["Active", "Inactive"]);
    const representativeBodyTemplate = (rowData) => {
      const status = rowData.status;
  
      const badgeClass =
        status === "Active"
          ? "badge bg-success px-3 py-2"
          : "badge bg-danger px-3 py-2";
  
      return (
        <div className="d-flex align-items-center">
          <span className={badgeClass}>{status}</span>
        </div>
      );
    };
    const representativeFilterTemplate = (options) => {
      return (
        <React.Fragment>
          <div className="mb-3 font-bold">Status Picker</div>
          <MultiSelect
            value={options.value}
            options={statuses}
            itemTemplate={representativesItemTemplate}
            onChange={(e) => options.filterCallback(e.value)}
            placeholder="Any"
            className="p-column-filter"
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
          <FaUserPlus className="icon-horse" /> <span></span>
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
      <div>
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

  const header = renderHeader();
  console.log("Currently Selected Customers:", selectedCustomers);
  return (
    <div>
      <link
        rel="stylesheet"
        href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
      ></link>
      <div className="text-center mx-5">
      <div className="row mt-5">
    {/* Total Students */}
    <div className="col-lg-6 my-3">
    <div className="card s-col d-blcok m-auto" style={{width:"18rem"}}>
        <div className="card-body d-flex gap-3">
          <FaUsers className="icon-stu fs-3" />
          <div>
            <h5 className="stu-context">Total Students :</h5>
            <h5 className="stu-context">{students?.length}</h5>
          </div>
          <div className="ag-courses-item_bg"></div>
        </div>
      </div>
    </div>

    {/* Active Students */}
    <div className="col-lg-6 my-3">
    <div className="card s-col d-blcok m-auto" style={{width:"18rem"}}>
        <div className="card-body d-flex gap-3">
          <FaUsers className="icon-stu fs-3" />
          <div>
            <h5 className="stu-context">Active Students :</h5>
            <h5 className="stu-context">
              {students?.filter((stu) => stu?.status === "Active")?.length}
            </h5>
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
            value={customers}
            paginator
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 20]}
            dataKey="_id"
            
            selection={selectedCustomers}
            onSelectionChange={(e) => 
              setSelectedCustomers(e.value)}
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={[
              "Full_Name",
              "Parent",
              "Client_ID",
              "Age",
              "Batch",
              "Gender",
              "Country",
              "Coach",
            ]}
            emptyMessage="No students found.."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              selectionMode="multiple"
              exportable={false}
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="Client_ID"
              header="Client ID"
              sortable
              filter
              filterPlaceholder="Search by Client ID"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Full_Name"
              header="Full Name"
              sortable
              filter
              filterPlaceholder="Search by name"
              style={{ minWidth: "14rem" }}
            />
             <Column
                          field="status"
                          header="Status"
                          sortable
                          filter
                          filterPlaceholder="Search by Status"
                          style={{ minWidth: "14rem" }}
                          body={representativeBodyTemplate}
                          filterElement={representativeFilterTemplate}
                          showFilterMatchModes={false}
                          filterMenuStyle={{ width: "14rem" }}
                        />
            <Column
              field="Parent"
              header="Parent"
              sortable
              filter
              filterPlaceholder="Search by Parent"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Age"
              header="Age"
              sortable
              dataType="numeric"
              style={{ minWidth: "12rem" }}
              filter
              filterElement={balanceFilterTemplate}
            />
            <Column
              field="Batch"
              header="Batch"
              sortable
              filter
              filterPlaceholder="Search by Batch"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Gender"
              header="Gender"
              sortable
              filter
              filterPlaceholder="Search by Gender"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Email_Address"
              header="Email Address"
              sortable
              filter
              filterPlaceholder="Search by Email"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Whatsapp"
              header="Phone number"
              sortable
              filter
              filterPlaceholder="Search by phone number"
              style={{ minWidth: "14rem" }}
            />

            <Column
              field="Enrollment_Date"
              header="Joining Date"
              sortable
              filterField="Enrollment_Date"
              dataType="date"
              style={{ minWidth: "12rem" }}
              body={dateBodyTemplate}
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              field="Country"
              header="Country"
              sortable
              filter
              filterPlaceholder="Search by Batch"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Address"
              header="Address"
              sortable
              filter
              filterPlaceholder="Search by Batch"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="Coach"
              header="Coach"
              sortable
              filter
              filterPlaceholder="Search by Batch"
              style={{ minWidth: "14rem" }}
            />
            <Column
              body={actionBodyTemplate}
              exportable={false}
              style={{ minWidth: "12rem" }}
            ></Column>
          </DataTable>
        </div>
      </div>
      <Dialog
        visible={studentDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Student Details"
        modal
        className="p-fluid"
        footer={studentDialogFooter}
        onHide={hideDialog}
      >
        <form className="mt-5">
          <div className="container ecat">
            <div className="inputbox4 form-floating">
              <i className="fa-regular fa-user"></i>

              <input
                type="text"
                id="Client_ID"
                className="form-control "
                placeholder="xyz"
                {...register("Client_ID", {
                  required: true,
                })}
              ></input>
              <label htmlFor="Client_ID" className="text-dark">
                Client_ID{" "}
              </label>

              {errors.Client_ID?.type === "required" && (
                <p className=" text-danger">*enter Student full name</p>
              )}
            </div>
            <div className="inputbox4 form-floating">
              <i className="fa-regular fa-user"></i>

              <input
                type="text"
                id="Full_Name"
                className="form-control "
                placeholder="xyz"
                {...register("Full_Name", {
                  required: true,
                })}
              ></input>
              <label htmlFor="Full_Name" className="text-dark">
                Full Name
              </label>

              {errors.Full_Name?.type === "required" && (
                <p className=" text-danger">*enter Student full name</p>
              )}
            </div>
             {/* status */}
             <div className="field mb-5">
            <i className="fa-solid fa-battery-full"></i>
  <label htmlFor="status" className="mb-2">Status</label>
  <select
    id="status"
    {...register("status", { required: "Please select a status" })}
    defaultValue={student?.status} // Set from the existing value like "Active" or "Inactive"
    className={`w-75  form-select ${errors.status ? "p-invalid" : ""}`}
  >
   
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
  {errors.status && <small className="p-error">{errors.status.message}</small>}
</div>
            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-person-breastfeeding"></i>

              <input
                type="text"
                id="Parent"
                className="form-control "
                placeholder="xyz"
                {...register("Parent", {
                  required: true,
                })}
              ></input>
              <label htmlFor="Parent" className="text-dark">
                Parent
              </label>

              {errors.Parent?.type === "required" && (
                <p className=" text-danger">*enter Parent name</p>
              )}
            </div>
            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-child"></i>

              <input
                type="number"
                id="Age"
                className="form-control "
                placeholder="xyz"
                {...register("Age", {
                  required: true,
                })}
              ></input>
              <label htmlFor="Age" className="text-dark">
                Age
              </label>

              {errors.Age?.type === "required" && (
                <p className=" text-danger">*enter Age</p>
              )}
            </div>
            <div className="field mb-5">
  <i className="fa-solid fa-layer-group"></i>
  <label htmlFor="Batch" className="mb-2">Batch</label>
  <div style={{ maxHeight: "150px", overflowY: "auto" }}>
  <select
    id="Batch"
    {...register("Batch", { required: "Please select a batch" })}
    defaultValue=""
    className={`w-75 form-select ${errors.Batch ? "p-invalid" : ""}`}
  >
    <option value="" disabled>Select Batch</option>
    {batches.map((b, i) => (
      <option key={i} value={b.batch_id}>{b.batch_id}</option>
    ))}
  </select>
  </div>
  
  {errors.Batch && (
    <small className="p-error">{errors.Batch.message}</small>
  )}
</div>

            {/* Gender Radio */}
            <div className="field mb-5">
              <i className="fa-solid fa-venus-mars"></i>
              <label htmlFor="Gender" className="mb-2">
                Gender
              </label>
              <select
                id="Gender"
                {...register("Gender", { required: "Please select a gender" })}
                defaultValue={student?.Gender || ""}
                className={`w-75 form-select ${
                  errors.Gender ? "p-invalid" : ""
                }`}
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              {errors.Gender && (
                <small className="p-error">{errors.Gender.message}</small>
              )}
            </div>

            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                id="Email_Address"
                className="form-control"
                name="Email_Address"
                {...register("Email_Address", {
                  required: true,
                  pattern: /^\S+@\S+$/,
                })}
                placeholder="xyz"
              />
              <label htmlFor="Email_Address" className="text-dark">
                Email Address
              </label>
              {errors.Email_Address &&
                errors.Email_Address.type === "required" && (
                  <p className="text-danger">*enter your email</p>
                )}
              {errors.Email_Address &&
                errors.Email_Address.type === "pattern" && (
                  <p className="text-danger">*enter valid email address</p>
                )}
            </div>

            <div className="joining-date mb-5">
              <label htmlFor="Enrollment_Date" className="text-dark mb-3">
                Joining Date
              </label>
              <Controller
                name="Enrollment_Date"
                control={control}
                rules={{
                  required: "Joining date is required",
                }}
                render={({ field }) => (
                  <Calendar
                    {...field}
                    inputRef={field.ref}
                    value={field.value} // Ensure controlled value
                    onChange={(e) => field.onChange(e.value)} // Update the state on change
                    dateFormat="dd-mm-yy"
                    showIcon
                    placeholder="Select Date"
                  />
                )}
              />
              <i className="fa-solid fa-calendar-days"></i>
              {errors?.Enrollment_Date && (
                <span className="text-sm text-danger">
                  {errors.Enrollment_Date.message}
                </span>
              )}
            </div>
            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-earth-americas"></i>
              <input
                type="text"
                id="Country"
                className="form-control "
                placeholder="xyz"
                {...register("Country", { required: true })}
              ></input>
              <label htmlFor="Country" className="text-dark">
                Country
              </label>

              {errors.Country?.type === "required" && (
                <p className=" text-danger">*enter Country</p>
              )}
            </div>

            <div className="inputbox4 form-floating">
              <i className="fa-solid fa-location-dot"></i>
              <input
                type="text"
                id="Address"
                className="form-control "
                placeholder="xyz"
                {...register("Address", { required: true })}
              ></input>
              <label htmlFor="Address" className="text-dark">
                Address
              </label>

              {errors.Address?.type === "required" && (
                <p className=" text-danger">*enter Address</p>
              )}
            </div>
            <div className="field mb-5">
  <i className="fa-solid fa-person-chalkboard"></i>
  <label htmlFor="Coach" className="mb-2">Coach</label>
  <div style={{ maxHeight: "150px", overflowY: "auto" }}>
  <select
    id="Coach"
    {...register("Coach", { required: "Please select a coach" })}
    defaultValue=""
    className={`w-75 form-select ${errors.Coach ? "p-invalid" : ""}`}
  >
    <option value="" disabled>Select Coach</option>
    {Coaches.map((c, i) => (
      <option key={i} value={c.Full_Name}>{c.Full_Name}</option>
    ))}
  </select>
  </div>
  
  {errors.Coach && (
    <small className="p-error">{errors.Coach.message}</small>
  )}
</div>

            <div className="mb-5 me-5 d-block">
              <label className="form-label">WhatsApp Number</label>
              <Controller
                name="Whatsapp"
                control={control}
                rules={{
                  required: "Whatsapp number is required",
                  validate: (value) => {
                    const digits = value.replace(/\D/g, "");

                    if (digits.startsWith("91")) {
                      if (digits.length !== 12)
                        return "Indian numbers must be 10 digits after 91";
                    } else if (digits.startsWith("1")) {
                      if (digits.length !== 11)
                        return "US numbers must be 10 digits after 1";
                    } else if (digits.startsWith("81")) {
                      if (digits.length < 11 || digits.length > 12)
                        return "Japan numbers must be 9–10 digits after 81";
                    } else if (digits.startsWith("44")) {
                      if (digits.length < 11 || digits.length > 12)
                        return "UK numbers must be 10–11 digits after 44";
                    } else {
                      return "Unsupported country code or invalid number";
                    }

                    return true;
                  },
                }}
                render={({ field }) => (
                  <PhoneInput
                    country={"in"}
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    enableSearch
                    inputProps={{
                      name: "Whatsapp",
                      ref: (el) => {
                        // ✅ properly assign ref so react-hook-form can focus it on error
                        field.ref({
                          focus: () => el?.focus(),
                        });
                      },
                    }}
                  />
                )}
              />

              {errors?.Whatsapp && (
                <p style={{ color: "red", fontSize: "14px" }}>
                  {errors.Whatsapp.message}
                </p>
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
        <div className="confirmation-content text-danger">
          <i
            className="fa-solid fa-triangle-exclamation"
            style={{ fontSize: "2rem", padding: "2rem" }}
          ></i>
          {student && (
            <span>
              Are you sure you want to delete <b>{student?.Full_Name}</b>?
            </span>
          )}
        </div>
      </Dialog>
      <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {student && <span>Are you sure you want to delete the selected Students?</span>}
                </div>
            </Dialog>
    </div>
  );
};

export default Student;
