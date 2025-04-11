import React, { useState, useEffect, useRef } from "react";
import "./Practice.css";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { MdScheduleSend } from "react-icons/md";

import axios from "axios";

import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports
import { FaPersonBiking } from "react-icons/fa6";
import { IoToday } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { FaFileExport } from "react-icons/fa6";
import { MdAlarmAdd } from "react-icons/md";
import { Toolbar } from "primereact/toolbar";
import { GiCancel } from "react-icons/gi";
import { RiDeleteBinFill } from "react-icons/ri";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";

import { MdOutlineEditOff } from "react-icons/md";
import { IoIosSave } from "react-icons/io";

// import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useForm, Controller ,useFieldArray} from "react-hook-form";
const Practice = () => {
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
  const { fields, append, remove ,replace} = useFieldArray({
    control,
    name: "time_slots.slots"
  });
  let emptyBatch = {
    batch_id: "", // Unique batch identifier
    start_date: "", // Date in YYYY-MM-DD format
    session_days: [], // Array of selected weekdays (e.g., ["Monday", "Thursday"])
    time_slots: {
      slots: [
        {
          from: "", // Start time in 24-hour format (HH:mm)
          to: ""    // End time in 24-hour format (HH:mm)
        }
        // You can add a second slot if needed
      ],
      time_zone: "" // Time zone (e.g., "IST", "CET", "JST")
    },
    status: "Active", // Default status (dropdown: "Active" | "Inactive")
    coaches: {
      main: "", // Selected main coach
      sub_coaches: [], // Array of sub-coaches (optional, dynamically updated)
    },
  };
   const [Coach, setCoach] = useState([]);
  const [batchDialog, setBatchDialog] = useState(false);
  const [batchDetails, setBatchDetails] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState(null);
  const [batch, setBatch] = useState(emptyBatch);
  const [submitted, setSubmitted] = useState(false);
  const [deleteBatchDialog, setDeleteBatchDialog] = useState(false);
   const [deleteProductsDialog, setDeleteProductsDialog] = useState(false);
   const hideDeleteProductsDialog = () => {
    setDeleteProductsDialog(false);
};
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    batch_id: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    start_date: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },
    days_combine: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    time_slot_combined: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },

    status: { value: null, matchMode: FilterMatchMode.IN },
    "coaches.main": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    sub_coaches_combine: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState("");
  let [error, setError] = useState("");
  let [batches, setBatches] = useState([]);
  let token = sessionStorage.getItem("token");
  const editBatch = (batch) => {
    setBatch({ ...batch }); // Setting the batch details in state
    setIsEditing(true); // Indicating that the batch is being edited
    setBatchDialog(true); // Opening the dialog for batch editing

    // Setting values in the form fields using setValue from React Hook Form
  
    setValue("batch_id", batch?.batch_id);
    setValue("start_date", batch?.start_date);
    setValue("session_days", batch?.session_days);
    setValue("time_slots", batch?.time_slots);
    setValue("status", batch?.status || "Active");
    setValue("coaches.main", batch?.coaches.main);
    setValue("coaches.sub_coaches", batch?.coaches.sub_coaches);
    setValue("_id", batch?._id);
   
    replace(batch?.time_slots?.slots || []); 
  };
  const selectedMainCoach = watch("coaches.main");
const selectedSubCoaches = watch("coaches.sub_coaches") || [];

 // Convert fetched coaches to dropdown options
 const coachOptions = Coach?.map((c) => ({
  label: c.Full_Name,
  value: c.Full_Name,
}));

// Filter sub-coach options to exclude main coach
const subCoachOptions = coachOptions.filter((coach) => coach.value !== selectedMainCoach);
  const confirmDeleteBatch = (batch) => {
    setBatch({ ...batch }); // Setting the batch data in state
    setDeleteBatchDialog(true); // Opening the batch deletion confirmation dialog
  };
  const hideDialog = () => {
    setSubmitted(false);
    setBatchDialog(false);
    reset();
  };
  const getBatchDetails = (data) => {
    return [...(data || [])].map((batch) => ({
      ...batch,
      days_combine: batch.session_days ? batch.session_days.join(", ") : "",
      time_slot_combined: batch.time_slots
      ? `${batch.time_slots.slots.map(ts => `${ts.from}-${ts.to}`).join(' & ')} (${batch.time_slots.time_zone})`
      : "",
      sub_coaches_combine: batch.coaches?.sub_coaches
        ? batch.coaches.sub_coaches.join(", ")
        : "",
      start_date: batch.start_date ? new Date(batch.start_date) : null,
    }));
  };

   const deleteBatches = () => {
      axios
    .post(`${process.env.REACT_APP_API_URL}/batch-api/delete-batches`, 
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
            getBatches();
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
  const actionBodyTemplate = (rowData) => {
    return (
      <React.Fragment>
        <div className="d-flex gap-2">
          <button
            className="icon-button horse "
            style={{ padding: "1.3rem" }}
            onClick={() => editBatch(rowData)}
          >
            <MdOutlineEdit className="icon-horse" /> <span></span>
          </button>
          <button
            className="icon-button1 horse1 border-danger"
            style={{ padding: "1.3rem" }}
            onClick={() => confirmDeleteBatch(rowData)}
          >
            <MdDelete className="icon-horse1" /> <span></span>
          </button>
        </div>
      </React.Fragment>
    );
  };

   const getCoaches = () => {
          axios
            .get(`${process.env.REACT_APP_API_URL}/coach-api/get-coaches`, {
              headers: { Authorization: "Bearer " + token },
            })
            .then((response) => {
              if (response.status === 200) {
                let originalData = JSON.parse(JSON.stringify(response.data.payload));
                let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications
      
                console.log(originalData, modifiedData);
      
                // Store original data in Coaches (unchanged)
                setCoach(originalData);
                
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
  const getBatches = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/batch-api/get-batches`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications

          // Store original data in batches (unchanged)
          setBatches(originalData);

          // Store modified data if needed (e.g., filtered or formatted data)
          setBatchDetails(getBatchDetails(modifiedData));
          console.log(originalData, getBatchDetails(modifiedData));
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

  const saveModifiedUser = () => {
    if (Object.keys(errors).length === 0) {
      let modifiedUser = getValues();
      if (modifiedUser.start_date instanceof Date) {
        modifiedUser.start_date =
          modifiedUser.start_date.toISOString().split("T")[0];
      }
 console.log(modifiedUser);
      axios
        .put(`${process.env.REACT_APP_API_URL}/batch-api/update-batch`, modifiedUser, {
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
            getBatches();
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

  // const addNewBatch = () => {
  //   if (Object.keys(errors).length === 0) {
  //     let modifiedBatch = getValues();
      

  //     if (modifiedBatch.start_date instanceof Date) {
  //       modifiedBatch.start_date = modifiedBatch.start_date
  //         .toISOString()
  //         .split("T")[0];
  //     }
  //    console.log(modifiedBatch)
  //     // Merge filled batch data with emptyBatch (ensuring all fields exist)
  //     let finalBatch = {
  //       ...emptyBatch, // Default values
  //       ...modifiedBatch, // User input values
  //       time_slots: {
  //         ...emptyBatch.time_slots, // Default time slot structure
  //         ...(modifiedBatch.time_slots || {}), // User-defined time slot details
  //       },
  //       coaches: {
  //         ...emptyBatch.coaches, // Default coach structure
  //         ...(modifiedBatch.coaches || {}), // User-defined coaches
  //       },
  //     };

  //     console.log(finalBatch);

  //     axios
  //       .post(`${process.env.REACT_APP_API_URL}/batch-api/add-batch`, finalBatch, {
  //         headers: { Authorization: "Bearer " + token },
  //       })
  //       .then((response) => {
  //         if (response.status === 200) {
  //           toast.success(response.data.message, {
  //             position: "top-right",
  //             autoClose: 5000,
  //             hideProgressBar: false,
  //             closeOnClick: false,
  //             pauseOnHover: true,
  //             draggable: true,
  //             progress: undefined,
  //             theme: "light",
  //             transition: Bounce,
  //           });

  //           getBatches(); // Refresh batch list
  //         }
  //       })
  //       .catch((err) => {
  //         setError(err.message);
  //         toast.error(err.response.data.message, {
  //                       position: "top-right",
  //                       autoClose: 5000,
  //                       hideProgressBar: false,
  //                       closeOnClick: false,
  //                       pauseOnHover: true,
  //                       draggable: true,
  //                       progress: undefined,
  //                       theme: "colored",
  //                       transition: Bounce,
  //                     });

  //         console.log(err.response || err.request || err.message);
  //       });

  //     hideDialog();
  //   }
  // };

  const deleteBatch = () => {
    axios
      .delete(`${process.env.REACT_APP_API_URL}/batch-api/delete-batch/${batch?._id}`, {
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

          getBatches(); // Refresh batch list after deletion
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

 
     useEffect(() => {
          const fetchData = async () => {
            await getCoaches(); 
            await getBatches();
           // <- pass directly
          };
        
          fetchData();
        }, []);

  useEffect(() => {
    if (batchDetails.length > 0) {
      getNextSession(batchDetails);
    }
  }, [batchDetails]);
  const batchDialogFooter = (
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
        onClick={handleSubmit( saveModifiedUser )}
      >
        <IoIosSave className="icon-horse2" /> <span></span>
      </button>
    </React.Fragment>
  );

  const hideDeleteProductDialog = () => {
    setDeleteBatchDialog(false);
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
        <h4 className="m-0">Theory & Practice session</h4>
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
    return formatDate(rowData.start_date);
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
          if (window.confirm("Are you sure you want to delete this batch?")) {
            deleteBatch();
            hideDeleteProductDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );

  const openNew = () => {
    setBatch(emptyBatch); // Reset form with default emptyBatch values
    setIsEditing(false); // Indicate that we are creating a new batch
    setSubmitted(false); // Reset submission status
    setBatchDialog(true); // Open the batch creation dialog

    // Set default values in the form
    Object.entries(emptyBatch).forEach(([key, value]) => {
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
  // Function to find the next session
  let [nextSession, setNextSession] = useState({});
  const getNextSession = (batchDetails) => {
    const today = new Date();
    const dayIndex = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
  
    let Session = null;
    let minTimeDiff = Infinity;
  
    batchDetails.forEach((batch) => {
      if (batch.status !== "Active") return;
  
      const batchStartDate = new Date(batch.start_date);
      if (!batchStartDate || batchStartDate < today) return;
  
      batch.session_days.forEach((day) => {
        const batchDayIndex = dayIndex[day];
  
        // Find the next occurrence of this session day from batch start date
        let nextSessionDate = new Date(batchStartDate);
        while (nextSessionDate.getDay() !== batchDayIndex) {
          nextSessionDate.setDate(nextSessionDate.getDate() + 1);
        }
  
        // Time zone info and slots
        const { slots, time_zone } = batch.time_slots;
  
        slots.forEach((slot) => {
          const timeDiff = nextSessionDate - today;
          if (timeDiff > 0 && timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            Session = {
              batch_id: batch.batch_id,
              day_time: `${day}, ${slot.from} - ${slot.to} ${time_zone}`,
              coach: batch.coaches.main,
              status: batch.status,
            };
          }
        });
      });
    });
  
    setNextSession(Session);
  };
  const confirmDeleteSelected = () => {
    setDeleteProductsDialog(true);
};

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap gap-2">
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
  const [selectedCountries, setSelectedCountries] = useState(null);
  const allDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const countryTemplate = (option) => {
    return (
        <div className="flex align-items-center">
           
            <div>{option}</div>
        </div>
    );
};

const panelFooterTemplate = () => {
    const length = selectedCountries ? selectedCountries.length : 0;

    return (
        <div className="py-2 px-3">
            <b>{length}</b> item{length > 1 ? 's' : ''} selected.
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
          if (window.confirm("Are you sure you want to delete this student?")) {
            deleteBatches();
            hideDeleteProductsDialog();
          }
        }}
      >
        <RiDeleteBinFill className="icon-horse1" /> <span></span>
      </button>
    </React.Fragment>
  );

  const header = renderHeader();

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
              <div className="card s-col d-blcok m-auto" style={{width:"18rem"}}>
                <div className="card-body d-flex gap-4">
                <RiCalendarScheduleFill className="icon-stu fs-3" />
                  <div>
                    <h5 className="stu-context">Total Batches :</h5>
                    <h5 className="stu-context">{batches?.length}</h5>
                  </div>
                  <div className="ag-courses-item_bg"></div>
                </div>
              </div>
            </div>
        
            {/* Active Students */}
            <div className="col-lg-6 my-3">
              <div className="card s-col d-blcok m-auto " style={{width:"18rem"}}>
                <div className="card-body d-flex gap-4">
                  <FaPersonBiking className="icon-stu fs-3" />
                  <div>
                    <h5 className="stu-context ">Active Batches :</h5>
                    <h5 className="stu-context">
                      {batches?.filter((stu) => stu?.status === "Active")?.length}
                    </h5>
                  </div>
                  <div className="ag-courses-item_bg"></div>
                </div>
              </div>
            </div>
          </div>
       

        <div
          className="card   d-block  m-auto  next-session  "
          style={{ maxWidth: "48rem" }}
        >
          <div className="card-body row p-3">
            <div className="col-1">
              <MdScheduleSend className=" fs-3 " />
            </div>

            <div className=" col-11 d-flex ">
              <h5 className="text-xl fw-bold me-2 ">Next Session: </h5>

              <p className="text-lg  mx-2 ">
                {" "}
                <b>Batch:</b> {nextSession?.batch_id}
              </p>
              <p className="text-lg  mx-2 ">
                <b>Day & Time: </b>
                {nextSession?.day_time}
              </p>
              <p className="text-lg  mx-2 ">
                <b>Coach:</b> {nextSession?.coach}
              </p>
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
            value={batchDetails}
            paginator
            header={header}
            rows={10}
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[5, 10, 20]}
            dataKey="_id"
            selectionMode="checkbox"
            selection={selectedCustomers}
            onSelectionChange={(e) => setSelectedCustomers(e.value)}
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={[
              "batch_id",
              "start_date",
              "days_combine",
              "time_slot_combined",
              "status",
              "coaches.main",
              "sub_coaches_combine",
            ]}
            emptyMessage="No batches found.."
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          >
            <Column
              selectionMode="multiple"
              headerStyle={{ width: "3rem" }}
            ></Column>
            <Column
              field="batch_id"
              header="Batch Name"
              sortable
              filter
              filterPlaceholder="Search by Batch Name"
              style={{ minWidth: "14rem" }}
              
            />

            <Column
              field="start_date"
              header="Start Date"
              sortable
              filterField="start_date"
              dataType="date"
              style={{ minWidth: "12rem" }}
              body={dateBodyTemplate}
              filter
              filterElement={dateFilterTemplate}
            />
            <Column
              field="days_combine"
              header="Session Days"
              sortable
              filter
              filterPlaceholder="Search by Session Days"
              style={{ minWidth: "14rem" }}
            />

            <Column
              field="time_slot_combined"
              header="Ttime Slot"
              sortable
              filter
              filterPlaceholder="Search by Time Slot"
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
              field="coaches.main"
              header="Main Coach"
              sortable
              filter
              filterPlaceholder="search by Main Coach"
              style={{ minWidth: "14rem" }}
            />
            <Column
              field="sub_coaches_combine"
              header="Sub Coach"
              sortable
              filter
              filterPlaceholder="Search by Sub Coach"
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
       visible={batchDialog}
       style={{ width: "32rem" }}
       breakpoints={{ "960px": "75vw", "641px": "90vw" }}
       header="Batch Details"
       modal
       className="p-fluid"
       footer={batchDialogFooter}
       onHide={hideDialog}
     >
       <form className="mt-5">
         <div className="container ecat">
           <div className="inputbox4 form-floating">
             <i className="fa-regular fa-user"></i>

             <input
               type="text"
               id="batch_id"
               className="form-control "
               placeholder="xyz"
               {...register("batch_id", {
                 required: true,
               })}
             ></input>
             <label htmlFor="batch_id" className="text-dark">
               batch ID{" "}
             </label>

             {errors.batch_id?.type === "required" && (
               <p className=" text-danger">*enter Student full name</p>
             )}
           </div>

           <div className="joining-date mb-5">
             <label htmlFor="start_date" className="text-dark mb-3">
               Starting Date
             </label>
             <Controller
               name="start_date"
               control={control}
               rules={{
                 required: "Starting date is required",
               }}
               render={({ field }) => (
                 <Calendar
                   {...field}
                   inputRef={field.ref}
                   value={field.value}
                   onChange={(e) => field.onChange(e.value)}
                   dateFormat="dd-mm-yy"
                   showIcon
                   placeholder="Select Date"
                 />
               )}
             />
             <i className="fa-solid fa-calendar-days"></i>
             {errors?.start_date && (
               <span className="text-sm text-danger">
                 {errors.start_date.message}
               </span>
             )}
           </div>

           <div className="field mb-5">
     <label className="mb-2">Select Session Days</label>
     <Controller
       name="session_days"
       control={control}
       rules={{ required: "Please select at least one session day" }}
       render={({ field }) => (
         <MultiSelect
         {...field}
         value={field.value || []} // Ensure it's always an array
         options={allDays} // Directly use string array
         onChange={(e) => field.onChange(e.value)}
         placeholder="Select Days"
         itemTemplate={countryTemplate} 
         
         className={`w-15rem ${errors.session_days ? "p-invalid" : ""}`}
         display="chip" // Shows selected items as chips
       />        )}
     /><IoToday className="i" />
     {errors.session_days && <small className="p-error">{errors.session_days.message}</small>}
   </div>
{/* time thanks */}
{fields.map((item, index) => (
 <div key={item.id} className="d-flex gap-2 align-items-start mb-3 w-100">
   <div className="inputbox4 form-floating flex-fill">
    
     <input
       type="time"
       className="form-control"
       placeholder="from"
       {...register(`time_slots.slots.${index}.from`, { required: true })}
     />
     <label className="text-dark">from</label>
     {errors?.time_slots?.slots?.[index]?.from && (
       <p className="text-danger">*enter from time</p>
     )}
   </div>

   <div className="inputbox4 form-floating flex-fill">
    
     <input
       type="time"
       className="form-control"
       placeholder="to"
       {...register(`time_slots.slots.${index}.to`, { required: true })}
     />
     <label className="text-dark">to</label>
     {errors?.time_slots?.slots?.[index]?.to && (
       <p className="text-danger">*enter to time</p>
     )}
   </div>

   {/* Remove Button */}
   <button
     type="button"
     className="btn btn-danger mt-2"
     onClick={() => remove(index)}
   >
     Remove
   </button>
 </div>
))}

{/* Add Slot Button */}
<div className="mb-3">
 <button
   type="button"
   className="btn btn-primary"
   onClick={() => append({ from: "", to: "" })}
 >
   Add Time Slot
 </button>
</div>

           <div className="inputbox4 form-floating">
           <i className="fa-solid fa-earth-americas"></i>

             <input
               type="text"
               id="time_slots.time_zone"
               className="form-control "
               placeholder="xyz"
               {...register("time_slots.time_zone", {
                 required: true,
               })}
             ></input>
             <label htmlFor="time_slots.time_zone" className="text-dark">
               time zone{" "}
             </label>

             {errors.time_slots?.time_zone?.type === "required" && (
               <p className=" text-danger">*enter time_zone</p>
             )}
           </div>

           {/* status */}
           <div className="field mb-5">
           <i className="fa-solid fa-battery-full"></i>
 <label htmlFor="status" className="mb-2">Status</label>
 <select
   id="status"
   {...register("status", { required: "Please select a status" })}
   defaultValue={batch?.status} // Set from the existing value like "Active" or "Inactive"
   className={`w-75  form-select ${errors.status ? "p-invalid" : ""}`}
 >
  
   <option value="Active">Active</option>
   <option value="Inactive">Inactive</option>
 </select>
 {errors.status && <small className="p-error">{errors.status.message}</small>}
</div>


{/* Main Coach Dropdown */}
<div className="field mb-5">
       <label className="mb-2">Main Coach</label>
       <Controller
         name="coaches.main"
         control={control}
         rules={{ required: "Please select a main coach" }}
         render={({ field }) => (
           <Dropdown
             {...field}
             value={field.value|| null}
             onChange={(e) => {
               field.onChange(e.value);
               setValue(
                 "coaches.sub_coaches",
                 selectedSubCoaches.filter((sc) => sc !== e.value)
               ); // Remove new main from subs
             }}
             options={coachOptions}
             placeholder="Select Main Coach"
             className={`w-15rem ${errors.coaches?.main ? "p-invalid" : ""}`}
           />
         )}
       /><FaChalkboardTeacher className="i"/>
       {errors.coaches?.main && (
         <small className="p-error">{errors.coaches.main.message}</small>
       )}
     </div>

     {/* Sub Coaches MultiSelect */}
     <div className="field mb-5">
       <label className="mb-2">Sub Coaches</label>
       <Controller
         name="coaches.sub_coaches"
         control={control}
         render={({ field }) => (
           <MultiSelect
             {...field}
             value={field.value || []}
             onChange={(e) => field.onChange(e.value)}
             options={subCoachOptions}
             placeholder="Select Sub Coaches"
             className={`w-15rem ${errors.coaches?.sub_coaches ? "p-invalid" : ""}`}
             display="chip"
           />
         )}
       />
       <HiUserGroup className="i" />
     </div>


         </div>
       </form>
     </Dialog>
      {/* delete */}
      <Dialog
      visible={deleteBatchDialog}
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
        {batch && (
          <span>
            Are you sure you want to delete <b>{batch?.batch_id}</b>?
          </span>
        )}
      </div>
    </Dialog>
       <Dialog visible={deleteProductsDialog} style={{ width: '32rem' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }} header="Confirm" modal footer={deleteProductsDialogFooter} onHide={hideDeleteProductsDialog}>
                    <div className="confirmation-content">
                        <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                        {batch && <span>Are you sure you want to delete the selected Students?</span>}
                    </div>
                </Dialog>
    </div>
  );
};

export default Practice;
