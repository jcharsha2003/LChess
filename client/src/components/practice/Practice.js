import React, { useState, useEffect, useRef } from "react";
import "./Practice.css";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { MdScheduleSend } from "react-icons/md";

import axios from "axios";

import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports

import { Button } from "primereact/button";

import { Checkbox } from "primereact/checkbox";
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
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "time_slots.slots", // We’re editing nested slots here
  });
  let emptyBatch = {
    batch_id: "",
    start_date: "",
    time_slots: {
      time_zone: "",
      slots: [
        {
          class_type: "",
          weekday: "",
          time_sloat: {
            slot: [
              { from: "", to: "" }
            ]
          }
        }
      ]
    },
    status: "Active",
    coaches: {
      main: "",
      sub_coaches: []
    },
    batch_type: ""
  };
  

  const [Coach, setCoach] = useState([]);
  const [batchDialog, setBatchDialog] = useState(false);
  const [batchDetails, setBatchDetails] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
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
    batch_type: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },
    "time_slots.time_zone": {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
    },

    start_date: {
      operator: FilterOperator.AND,
      constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
    },

    status: { value: null, matchMode: FilterMatchMode.IN },
    "slot.class_type": { value: null },
    "slot.weekday": { value: null },
    "slot.time_sloat.slot": { value: null },
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
    // Find the original batch object using the _id
    const OBatch = batches.find((b) => b._id === batch._id);
    if (!OBatch) return;
  
    setBatch({ ...OBatch });
    setIsEditing(true);
    setBatchDialog(true);
  
    // Set flat values
    setValue("batch_id", OBatch.batch_id);
    setValue("start_date", OBatch.start_date);
    setValue("status", OBatch.status || "Active");
    setValue("coaches.main", OBatch.coaches.main);
    setValue("coaches.sub_coaches", OBatch.coaches.sub_coaches);
    setValue("_id", OBatch._id);
    setValue("batch_type", OBatch.batch_type);
    setValue("time_slots.time_zone", OBatch.time_slots.time_zone);
    setValue("time_slots", OBatch?.time_slots);
  
    // Replace nested slots array
    replace(OBatch.time_slots.slots || []);

    console.log(getValues())
  };
  
  const selectedMainCoach = watch("coaches.main");
  const selectedSubCoaches = watch("coaches.sub_coaches") || [];

  // Convert fetched coaches to dropdown options
  const coachOptions = Coach?.map((c) => ({
    label: c.Full_Name,
    value: c.Full_Name,
  }));

  // Filter sub-coach options to exclude main coach
  const subCoachOptions = coachOptions.filter(
    (coach) => coach.value !== selectedMainCoach
  );
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
    const flat = [];

    [...(data || [])].forEach((batch) => {
      const slots = batch.time_slots?.slots || [];

      slots.forEach((slot, idx) => {
        flat.push({
          ...batch,
          slot,
          _rowSpanIndex: idx,
          _totalSlots: slots.length,
          sub_coaches_combine: batch.coaches?.sub_coaches?.join(", ") || "",
          start_date: batch.start_date ? new Date(batch.start_date) : null,
          unique_key: `${batch._id}_${idx}`,
        });
      });
    });
    console.log(flat,batches);
    return flat;
  };
  const deleteBatches = () => {
    axios
      .post(
        `${process.env.REACT_APP_API_URL}/batch-api/delete-batches`,
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
  const actionBodyTemplate = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div className="d-flex gap-2" rowSpan={rowData._totalSlots}>
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

  const getCoaches = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/coach-api/get-coaches`, {
        headers: { Authorization: "Bearer " + token },
      })
      .then((response) => {
        if (response.status === 200) {
          let originalData = JSON.parse(JSON.stringify(response.data.payload));
          let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications

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
          console.log(originalData)
          // Store modified data if needed (e.g., filtered or formatted data)
          setBatchDetails(getBatchDetails(modifiedData));
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
        modifiedUser.start_date = modifiedUser.start_date
          .toISOString()
          .split("T")[0];
      }

      axios
        .put(
          `${process.env.REACT_APP_API_URL}/batch-api/update-batch`,
          modifiedUser,
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

      hideDialog();
    }
  };

  const addNewBatch = () => {
    if (Object.keys(errors).length === 0) {
      let modifiedBatch = getValues();
 
      if (modifiedBatch.start_date instanceof Date) {
        modifiedBatch.start_date = modifiedBatch.start_date
          .toISOString()
          .split("T")[0];
      }
      

      // Merge user input with default values carefully to preserve nested structure
      let finalBatch = {
        ...emptyBatch,              // Default values
        ...modifiedBatch,           // Shallow merge user values (e.g. batch_id, status, batch_type)
      
        time_slots: {
          time_zone: modifiedBatch?.time_slots?.time_zone || emptyBatch.time_slots.time_zone,
          slots: (modifiedBatch?.time_slots?.slots || []).map((slot, index) => {
            return {
              class_type: slot.class_type || emptyBatch.time_slots.slots?.[index]?.class_type || "",
              weekday: slot.weekday || emptyBatch.time_slots.slots?.[index]?.weekday || "",
              time_sloat: {
                slot: (slot?.time_sloat?.slot || []).map((s, i) => ({
                  from: s.from || "",
                  to: s.to || ""
                }))
              }
            };
          })
        },
      
        coaches: {
          main: modifiedBatch?.coaches?.main || emptyBatch.coaches.main || "",
          sub_coaches: modifiedBatch?.coaches?.sub_coaches || emptyBatch.coaches.sub_coaches || []
        }
      };
      
      console.log(finalBatch);

      axios
        .post(`${process.env.REACT_APP_API_URL}/batch-api/add-batch`, finalBatch,{
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

            getBatches(); // Refresh batch list
          }
        })
        .catch((err) => {
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

          console.log(err.response || err.request || err.message);
        });

      hideDialog();
    }
  };
  const watchSlots = watch("time_slots.slots");
  const deleteBatch = () => {
    axios
      .delete(
        `${process.env.REACT_APP_API_URL}/batch-api/delete-batch/${batch?._id}`,
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
  const [classTypeFilter, setClassTypeFilter] = useState([]);
  const [weekdayFilter, setWeekdayFilter] = useState([]);
  const [timeRangeFilter, setTimeRangeFilter] = useState({ from: '', to: '' });
// Utility to convert "HH:mm" to minutes
const timeStrToMinutes = (str) => {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
};

useEffect(() => {
  const noClassFilter = classTypeFilter.length === 0;
  const noWeekdayFilter = weekdayFilter.length === 0;
  const noTimeFilter = timeRangeFilter.from === '' && timeRangeFilter.to === '';

  const fromMin = timeStrToMinutes(timeRangeFilter.from || '00:00');
  const toMin = timeStrToMinutes(timeRangeFilter.to || '23:59');

  if (noClassFilter && noWeekdayFilter && noTimeFilter) {
    setBatchDetails(getBatchDetails(batches)); // Show all if no filter
  } else {
    const filtered = batches.filter((batch) =>
      batch.time_slots?.slots?.some((slot) => {
        const matchesClass = noClassFilter || classTypeFilter.includes(slot.class_type);
        const matchesWeekday = noWeekdayFilter || weekdayFilter.includes(slot.weekday);

        let matchesTime = true;
        if (!noTimeFilter) {
          matchesTime = slot.time_sloat?.slot?.some((s) => {
            const sFrom = timeStrToMinutes(s.from);
            const sTo = timeStrToMinutes(s.to);
            // Check if any overlap exists with filter time range
            return sFrom < toMin && sTo > fromMin;
          });
        }

        return matchesClass && matchesWeekday && matchesTime;
      })
    );

    const flat = [];
    filtered.forEach((batch) => {
      const slots = batch.time_slots?.slots || [];
      slots.forEach((slot, idx) => {
        flat.push({
          ...batch,
          _rowSpanIndex: idx,
          _totalSlots: slots.length,
          slot,
          unique_key: `${batch._id}_${idx}`,
        });
      });
    });

    setBatchDetails(flat);
  }
}, [classTypeFilter, weekdayFilter, timeRangeFilter]);

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
        onClick={handleSubmit(isEditing ? saveModifiedUser : addNewBatch)}
      >
        <IoIosSave className="icon-horse2" /> <span></span>
      </button>
    </React.Fragment>
  );

  const hideDeleteProductDialog = () => {
    setDeleteBatchDialog(false);
  };
  const formatDate = (value) => {
    if (!value) return ""; // handle null or undefined
    const date = new Date(value); // ensure it's a Date object
    if (isNaN(date)) return ""; // not a valid date
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const batchTypeBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{rowData.batch_type}</div>
    ) : null;

  const batchIdBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{rowData.batch_id}</div>
    ) : null;

  const timeZoneBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{rowData.time_slots.time_zone}</div>
    ) : null;

  const mainCoachBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{rowData.coaches?.main || ""}</div>
    ) : null;

  const subCoachBody = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{rowData.sub_coaches_combine}</div>
    ) : null;

  const dateBodyTemplate = (rowData) =>
    rowData._rowSpanIndex === 0 ? (
      <div rowSpan={rowData._totalSlots}>{formatDate(rowData.start_date)}</div>
    ) : null;
  const classTypeBody = (rowData) => rowData.slot?.class_type;
  const weekdayBody = (rowData) => rowData.slot?.weekday;
  const timeSlotBody = (rowData) =>
    rowData.slot?.time_sloat?.slot
      ?.map((s) => `${s.from} to ${s.to}`)
      .join(" / ");

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

    let sessionCandidate = null;
    let minTimeDiff = Infinity;

    batchDetails.forEach((batch) => {
      if (batch.status !== "Active") return;

      // Only consider batches with a start_date on or after today
      const batchStartDate = new Date(batch.start_date);
      if (!batchStartDate || batchStartDate < today) return;

      const { slots, time_zone } = batch.time_slots;

      // Iterate over each slot in the batch's time_slots
      slots.forEach((slot) => {
        const targetDay = slot.weekday;
        const targetDayIndex = dayIndex[targetDay];

        // Find the next date matching this slot's weekday, starting from batchStartDate
        let nextSessionDate = new Date(batchStartDate);
        while (nextSessionDate.getDay() !== targetDayIndex) {
          nextSessionDate.setDate(nextSessionDate.getDate() + 1);
        }

        // For each time range defined in time_sloat.slot array
        slot.time_sloat.slot.forEach((timeRange) => {
          // Create a Date object combining nextSessionDate and the time from timeRange.from
          const [hours, minutes] = timeRange.from.split(":");
          const nextSessionDateTime = new Date(nextSessionDate);
          nextSessionDateTime.setHours(Number(hours), Number(minutes), 0, 0);

          const timeDiff = nextSessionDateTime - today;
          if (timeDiff > 0 && timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            sessionCandidate = {
              batch_id: batch.batch_id,
              day_time: `${slot.weekday}, ${timeRange.from} - ${timeRange.to} ${time_zone}`,
              coach: batch.coaches.main,
              status: batch.status,
            };
          }
        });
      });
    });

    setNextSession(sessionCandidate);
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
          <MdAlarmAdd className="icon-horse" /> <span></span>
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
  const [statuses] = useState(["Active", "Inactive"]);
  const [classTypes] = useState(["Theory", "Practical", "Theory & Practical"]);
  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const batchTypes = ["Group", "1:1", "Private"];
  const representativeBodyTemplate = (rowData) => {
    const status = rowData.status;
    const badgeClass =
      status === "Active"
        ? "badge bg-success px-3 py-2"
        : "badge bg-danger px-3 py-2";

    return rowData._rowSpanIndex === 0 ? (
      <div className="d-flex align-items-center" rowSpan={rowData._totalSlots}>
        <span className={badgeClass}>{status}</span>
      </div>
    ) : null;
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
  const classTypeFilterTemplate = () => {
    const clear = () => {
      setClassTypeFilter([]); // Clear the selected filter
    };

    return (
      <div className="p-2">
        <div className="mb-3 font-bold">Class Type Picker</div>
        <MultiSelect
          value={classTypeFilter}
          options={classTypes}
          itemTemplate={classTypeItemTemplate}
          onChange={(e) => setClassTypeFilter(e.value)} // Update the filter value
          placeholder="Any"
          className="p-column-filter w-full"
        />

        {/* Custom Clear Button */}
        <div className="flex justify-end gap-2 mt-3">
          <Button
            label="Clear"
            outlined
            size="small"
            onClick={clear} // On click, clear the filter
          />
        </div>
      </div>
    );
  };

  const weekdayFilterTemplate = () => (
    <>
      <div className="mb-3 font-bold">Weekday Picker</div>
      <MultiSelect
        value={weekdayFilter}
        options={weekdays}
        itemTemplate={weekdayItemTemplate}
        onChange={(e) => setWeekdayFilter(e.value)}
        placeholder="Any"
        className="p-column-filter"
      />
      <div className="mt-2 flex gap-2">
        <Button
          label="Clear"
          outlined
          size="small"
          onClick={() => setWeekdayFilter([])}
        />
      </div>
    </>
  );

  const timeSlotFilterTemplate = () => (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-bold">Time Range Filter</div>
      <InputText
        type="time"
        value={timeRangeFilter.from}
        onChange={(e) => setTimeRangeFilter((prev) => ({ ...prev, from: e.target.value }))}
        placeholder="From"
      />
      <InputText
        type="time"
        value={timeRangeFilter.to}
        onChange={(e) => setTimeRangeFilter((prev) => ({ ...prev, to: e.target.value }))}
        placeholder="To"
      />
      <Button
        label="Clear"
        outlined
        size="small"
        onClick={() => setTimeRangeFilter({ from: '', to: '' })}
      />
    </div>
  );
  

  const representativesItemTemplate = (option) => {
    return (
      <div className="flex align-items-center ">
        <span>{option}</span>
      </div>
    );
  };
  const classTypeItemTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option}</span>
      </div>
    );
  };
  const weekdayItemTemplate = (option) => {
    return (
      <div className="flex align-items-center">
        <span>{option}</span>
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
              "Are you sure you want to delete the Selected Batches?"
            )
          ) {
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
      <div rowSpan={rowData._totalSlots}>
        <Checkbox
          inputId={rowData._id}
          checked={isSelected}
          onChange={onCheckboxChange}
        />
      </div>
    );
  };

  const selectAllCheckboxHeader = () => {
    const topRows = batchDetails.filter((row) => row._rowSpanIndex === 0);
    const allSelected =
      topRows.length > 0 && selectedCustomers?.length === topRows.length;

    const onHeaderCheckboxChange = (e) => {
      const checked = e.target.checked;

      if (checked) {
        // Group by original _id and take the first row from each group
        const selectedDocs = groupByOriginal(batchDetails).map(
          (group) => group[0]
        );
        setSelectedCustomers(selectedDocs);
      } else {
        setSelectedCustomers([]);
      }
    };

    return <Checkbox checked={allSelected} onChange={onHeaderCheckboxChange} />;
  };

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
              className="card s-col d-blcok m-auto"
              style={{ width: "18rem" }}
            >
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
            <div
              className="card s-col d-blcok m-auto "
              style={{ width: "18rem" }}
            >
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
              <p className="text-lg  mx-2 ">
                <b>Status:</b> {nextSession?.status}
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
            dataKey="unique_key"
            selection={selectedCustomers}
            onSelectionChange={(e) => setSelectedCustomers(e.value)}
            filters={filters}
            filterDisplay="menu"
            globalFilterFields={[
              "batch_id",
              "start_date",
              "batch_type",
              "time_slots.time_zone",
              "status",
              "coaches.main",
              "sub_coaches_combine",
            ]}
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
              field="batch_id"
              header="Batch Name"
              sortable
              filter
              filterPlaceholder="Search by Batch Name"
              style={{ minWidth: "14rem" }}
              body={batchIdBody}
            />
            <Column
              field="batch_type"
              header="Batch Type"
              sortable
              filter
              filterPlaceholder="Search by Batch Type"
              style={{ minWidth: "14rem" }}
              body={batchTypeBody}
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
              field="status"
              header="Status"
              sortable
              filter
              
              style={{ minWidth: "14rem" }}
              body={representativeBodyTemplate}
              filterElement={representativeFilterTemplate}
              showFilterMatchModes={false}
              filterMenuStyle={{ width: "14rem" }}
            />
            <Column
              field="slot.class_type"
              header="Class Type"
              body={classTypeBody}
              filter
              filterElement={classTypeFilterTemplate}
              showFilterMatchModes={false}
              
              style={{ minWidth: "14rem" }}
              filterMenuStyle={{ "--class-type-filter": 1 }} // 👈 custom inline marker
            />
            <Column
              field="slot.weekday"
              header="Weekday"
              body={weekdayBody}
              filter
              filterElement={weekdayFilterTemplate}
              showFilterMatchModes={false}
              
              style={{ minWidth: "14rem" }}
              filterMenuStyle={{ "--class-type-filter": 1 }} // 👈 for targeted CSS to hide default footer
            />

<Column
  field="slot.time_sloat.slot"
  header="Time Slot"
  body={timeSlotBody}
  filter
  filterElement={timeSlotFilterTemplate}
  showFilterMatchModes={false}
  style={{ minWidth: "18rem" }}
  filterMenuStyle={{ '--class-type-filter': 1 }}
/>


            <Column
              field="time_slots.time_zone"
              header="Time Zone"
              sortable
              filter
              filterPlaceholder="Search by Time Zone"
              style={{ minWidth: "14rem" }}
              body={timeZoneBody}
            />
            <Column
              field="coaches.main"
              header="Main Coach"
              sortable
              filter
              filterPlaceholder="search by Main Coach"
              style={{ minWidth: "14rem" }}
              body={mainCoachBody}
            />
            <Column
              field="sub_coaches_combine"
              header="Sub Coach"
              sortable
              filter
              filterPlaceholder="Search by Sub Coach"
              style={{ minWidth: "14rem" }}
              body={subCoachBody}
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
  style={{ width: "80vw" }}  // 👈 changed this
  breakpoints={{ "960px": "75vw", "641px": "90vw" }}
  header="Batch Details"
  modal
  className="p-fluid"
  footer={batchDialogFooter}
  onHide={hideDialog}
>

        <form className="mt-5 ">
          <div className="ecat container">
          <div className="row justify-content-center ">
              {/* first col */}
              <div className="col-lg-6   ">
              <p className="lead fs-6 text-dark">Batch Name</p>
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

           
              </div>
              {/* second column */}
             
              <div className="col-lg-6   ">
              <div className="joining-date mb-5">
             <p className="lead fs-6 text-dark">Start Date</p>
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
      value={field.value ? new Date(field.value) : null}
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
              </div>
            </div>
          

            <div className="row ">
  {fields.map((item, index) => {
    const slotPath = `time_slots.slots.${index}.time_sloat.slot`;
    const slotArray = watch(slotPath) || [];

    return (
      <div key={item.id} className="col-lg-6 mb-3 ">
        <div className="card h-100" style={{ maxWidth: "100%" }}>
          <div className="card-body">
            {/* Class Type & Weekday */}
            <div className="d-flex gap-3 mb-3 flex-column flex-md-row">
              {/* Class Type */}
              <div className="form-floating flex-fill">
                <select
                  className={`form-select ${errors?.time_slots?.slots?.[index]?.class_type ? "is-invalid" : ""}`}
                  id={`class_type_${index}`}
                  {...register(`time_slots.slots.${index}.class_type`, { required: "Please select class type" })}
                  defaultValue=""
                >
                  <option value="" disabled>Select Class Type</option>
                  {classTypes.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
                <label htmlFor={`class_type_${index}`}>Class Type</label>
                {errors?.time_slots?.slots?.[index]?.class_type && (
                  <small className="text-danger">{errors.time_slots.slots[index].class_type.message}</small>
                )}
              </div>

              {/* Weekday */}
              <div className="form-floating flex-fill">
                <select
                  className={`form-select ${errors?.time_slots?.slots?.[index]?.weekday ? "is-invalid" : ""}`}
                  id={`weekday_${index}`}
                  {...register(`time_slots.slots.${index}.weekday`, { required: "Please select a weekday" })}
                  defaultValue=""
                >
                  <option value="" disabled>Select Weekday</option>
                  {weekdays.map((day, idx) => (
                    <option key={idx} value={day}>{day}</option>
                  ))}
                </select>
                <label htmlFor={`weekday_${index}`}>Weekday</label>
                {errors?.time_slots?.slots?.[index]?.weekday && (
                  <small className="text-danger">{errors.time_slots.slots[index].weekday.message}</small>
                )}
              </div>
            </div>

            {/* Time Ranges */}
            {slotArray.map((slot, tIndex) => (
              <div key={tIndex} className="d-flex gap-2 mb-2 align-items-center">
                <input
                  type="time"
                  className="form-control"
                  {...register(`${slotPath}.${tIndex}.from`, { required: true })}
                />
                <input
                  type="time"
                  className="form-control"
                  {...register(`${slotPath}.${tIndex}.to`, { required: true })}
                />
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to remove this time slot?")) {
                      const updated = slotArray.filter((_, i) => i !== tIndex);
                      setValue(slotPath, updated);
                    }
                  }}
                >
                  Remove
                </button>
              </div>
            ))}

            {/* Add / Remove Buttons */}
            <div className="d-flex flex-column align-items-center mt-3">
              <button
                type="button"
                className="btn btn-outline-dark mb-2"
                onClick={() => {
                  setValue(slotPath, [...slotArray, { from: "", to: "" }]);
                }}
              >
                Add Time Slot
              </button>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => {
                  if (window.confirm("Are you sure you want to remove this entire slot?")) {
                    remove(index);
                  }
                }}
              >
                Remove Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  })}
</div>





{/* Add Slot */}
<button
  type="button"
  className="btn btn-outline-primary  d-block m-auto p-3 my-3" 
  onClick={() =>
    append({
      class_type: "",
      weekday: "",
      time_sloat: {
        slot: [{ from: "", to: "" }]
      }
    })
  }
>
  Add Slot
</button>

<div className="row justify-content-center ">
              {/* first col */}
              <div className=" col-lg-6  ">
              <p className="lead fs-6 text-dark">Time Zone</p>
             
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
              <label htmlFor="status" className="mb-2">
                Status
              </label>
              <select
                id="status"
                {...register("status", { required: "Please select a status" })}
                defaultValue={batch?.status} // Set from the existing value like "Active" or "Inactive"
                className={`w-75  form-select ${
                  errors.status ? "p-invalid" : ""
                }`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <small className="p-error">{errors.status.message}</small>
              )}
            </div>


            <div className="field mb-5">
  <i className="fa-solid fa-layer-group"></i>
  <label htmlFor="batch_type" className="mb-2">
    Batch Type
  </label>
  <select
    id="batch_type"
    {...register("batch_type", { required: "Please select a batch type" })}
    defaultValue={batch?.batch_type} // Pre-fill if editing
    className={`w-75 form-select ${errors.batch_type ? "p-invalid" : ""}`}
  >
    <option value="" disabled>Select Batch Type</option>
    {batchTypes.map((type, index) => (
      <option key={index} value={type}>
        {type}
      </option>
    ))}
  </select>
  {errors.batch_type && (
    <small className="p-error">{errors.batch_type.message}</small>
  )}
</div>

              </div>
              {/* second column */}
             
              <div className="col-lg-6   ">
            

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
                    value={field.value || null}
                    onChange={(e) => {
                      field.onChange(e.value);
                      setValue(
                        "coaches.sub_coaches",
                        selectedSubCoaches.filter((sc) => sc !== e.value)
                      ); // Remove new main from subs
                    }}
                    options={coachOptions}
                    placeholder="Select Main Coach"
                    className={`w-15rem ${
                      errors.coaches?.main ? "p-invalid" : ""
                    }`}
                  />
                )}
              />
              <FaChalkboardTeacher className="i" />
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
                    className={`w-15rem ${
                      errors.coaches?.sub_coaches ? "p-invalid" : ""
                    }`}
                    display="chip"
                  />
                )}
              />
              <HiUserGroup className="i" />
            </div>
              </div>
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
      <Dialog
        visible={deleteProductsDialog}
        style={{ width: "32rem" }}
        breakpoints={{ "960px": "75vw", "641px": "90vw" }}
        header="Confirm"
        modal
        footer={deleteProductsDialogFooter}
        onHide={hideDeleteProductsDialog}
      >
        <div className="confirmation-content">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {batch && (
            <span>Are you sure you want to delete the selected Batches?</span>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default Practice;
