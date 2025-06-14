import React, { useState, useEffect, useRef } from "react";
import "./Coach.css";
import { FaUsers } from "react-icons/fa";
import { FaChartLine } from "react-icons/fa";
import { GiSandsOfTime } from "react-icons/gi";
import axios from "axios";

import { toast, Bounce } from "react-toastify";
import { MdOutlineEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// Table related imports
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
import { MultiSelect } from "primereact/multiselect";
import { InputNumber } from "primereact/inputnumber";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { useForm, Controller } from "react-hook-form";
const Coach = () => {
      const [countryCodeRules, setCountryCodeRules] = useState({});
    
      // Fetch countryCodeRules from the static JSON file
      useEffect(() => {
        const fetchCountryCodeRules = async () => {
          try {
            const response = await fetch("./countryCodeRules_full.json");
            const data = await response.json();
            
            setCountryCodeRules(data);
          } catch (error) {
            console.error("Failed to load country code rules:", error);
          }
        };
    
        fetchCountryCodeRules();
      }, []);
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
      let emptyCoach = {
        Full_Name: "",
        Age: 0,
        Email_Address: "",
        Gender: "",
        Whatsapp: "",
        Payment_id: "",
        Address: ""
      };
      let emptyBatch = {
        batch_id: "", // Unique batch identifier
        start_date: "", // Date in YYYY-MM-DD format
        session_days: [], // Array of selected weekdays (e.g., ["Monday", "Thursday"])
        time_slot: {
          from: "", // Start time in 24-hour format (HH:mm)
          to: "", // End time in 24-hour format (HH:mm)
          time_zone: "", // Time zone (e.g., "IST", "CET", "JST")
        },
        status: "Active", // Default status (dropdown: "Active" | "Inactive")
        coaches: {
          main: "", // Selected main coach
          sub_coaches: [], // Array of sub-coaches (optional, dynamically updated)
        },
      };
      const [batch, setBatch] = useState(emptyBatch);
      const [CoachDialog, setCoachDialog] = useState(false);
      const [customers, setCustomers] = useState([]);
      const [selectedCustomers, setSelectedCustomers] = useState([]);
      const [Coach, setCoach] = useState(emptyCoach);
      const [submitted, setSubmitted] = useState(false);
      const [deleteCoachDialog, setDeleteCoachDialog] = useState(false);
      const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        Full_Name: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        Age: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },
        Email_Address: {
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
        Payment_id: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        Address: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
          status: { value: null, matchMode: FilterMatchMode.IN },
        teaching_batches:{
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
        },
        total_batches: {
          operator: FilterOperator.AND,
          constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
        },

      });
      
      const [globalFilterValue, setGlobalFilterValue] = useState("");
      let [error, setError] = useState("");
      let [Coaches, setCoaches] = useState([]);
      let token = sessionStorage.getItem("token");
    
      const editCoach = (Coach) => {
        setCoach({ ...Coach });
        setIsEditing(true);
        setCoachDialog(true);
        
        setValue("Full_Name", Coach?.Full_Name);
        setValue("Age", Coach?.Age);
        setValue("Email_Address", Coach?.Email_Address);
        setValue("Gender", Coach?.Gender);
        setValue("Whatsapp", Coach?.Whatsapp);
        setValue("status", Coach?.status || "Active");
        setValue("Payment_id", Coach?.Payment_id);
        setValue("Address", Coach?.Address);
        setValue("_id", Coach?._id);
      };
      const confirmDeleteProduct = (Coach) => {
        setCoach({ ...Coach });
        setDeleteCoachDialog(true);
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
      const saveModifiedUser = () => {
        if (Object.keys(errors).length === 0) {
          let modifiedUser = getValues();
          const raw = getValues("Whatsapp");
          modifiedUser.Whatsapp = raw.startsWith("+") ? raw : "+" + raw;
         
          axios
            .put(`${process.env.REACT_APP_API_URL}/coach-api/update-coach`, modifiedUser, {
              headers: { Authorization: "Bearer " + token },
            })
            .then((response) => {
              if (response.status === 200) {
                console.log(response.data.message)
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
                getCoaches(batch);
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
      const actionBodyTemplate = (rowData) => {
        return (
          <React.Fragment>
            <div className="d-flex gap-2">
              <button
                className="icon-button horse "
                style={{ padding: "1.3rem" }}
                onClick={() => editCoach(rowData)}
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
      const getBatches = () => {
        return axios
          .get(`${process.env.REACT_APP_API_URL}/batch-api/get-batches`, {
            headers: { Authorization: "Bearer " + token },
          })
          .then((response) => {
            if (response.status === 200) {
              let originalData = JSON.parse(JSON.stringify(response.data.payload));
              let modifiedData = JSON.parse(JSON.stringify(response.data.payload)); // Separate copy for modifications
      
              // Store original data in batches (unchanged)
              setBatch(originalData);
      
              // ✅ return batch data here
              return originalData;
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
      
              // ❌ return empty array on failure
              return [];
            }
          })
          .catch((err) => {
            const errorMessage = err.message;
      
            setError(errorMessage);
            toast.error(errorMessage, {
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
      
            console.log(err.response || err.request || err);
      
            // ❌ return empty array on error
            return [];
          });
      };
      
    
      
    
      const getCustomers = (batches,data) => {
        
        return [...(data || [])].map((coach) => {
          const coachName = coach.Full_Name;
      
          // Find batches where the coach is either main or sub coach
       
          const teachingBatches = batches.filter(b =>
            b.coaches.main === coachName || (b.coaches.sub_coaches || []).includes(coachName)
          );
      
          // Build the display string with role in parentheses
          const teachingBatchStr = teachingBatches.map(b => {
            const role = b.coaches.main === coachName ? 'Main' : 'Sub';
            return `${b.batch_id}(${role})`;
          }).join(', ');
      
          return {
            ...coach,
            teaching_batches: teachingBatchStr,             // Single string with role
            total_batches: teachingBatches.length           // Count of batches
          };
        });
      };
      
      
      const getCoaches = (batches) => {
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
              setCoaches(originalData);
              
              // Store modified data in customers
              setCustomers(getCustomers(batches,modifiedData));
              
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
    
      const addNewCoach = () => {
        if (Object.keys(errors).length === 0) {
          let modifiedUser = getValues();
          
          // Merge filled user data with emptyCoach (ensuring all fields exist)
         
    
          axios
            .post(`${process.env.REACT_APP_API_URL}/coach-api/add-coach`, modifiedUser, {
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
                getCoaches(batch);
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
    
          hideDialog();
        }
      };
      const deleteCoach = () => {
        axios
          .delete(`${process.env.REACT_APP_API_URL}/coach-api/delete-Coach/${Coach?._id}`, {
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
              getCoaches(batch);
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
          const batches = await getBatches();
          console.log(batches);
          await getCoaches(batches); // <- pass directly
        };
      
        fetchData();
      }, []);
    
      // Table part code
    
      const hideDialog = () => {
        setSubmitted(false);
        setCoachDialog(false);
        reset();
      };
      const CoachDialogFooter = (
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
            onClick={handleSubmit(isEditing ? saveModifiedUser : addNewCoach)}
          >
            <IoIosSave className="icon-horse2" /> <span></span>
          </button>
        </React.Fragment>
      );
    
     
      const hideDeleteProductDialog = () => {
        setDeleteCoachDialog(false);
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
            <h4 className="m-0">Coaches</h4>
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
              if (window.confirm("Are you sure you want to delete this Coach?")) {
                deleteCoach();
                hideDeleteProductDialog();
              }
            }}
          >
            <RiDeleteBinFill className="icon-horse1" /> <span></span>
          </button>
        </React.Fragment>
      );
      const openNew = () => {
        setCoach(emptyCoach);
        setIsEditing(false);
        setSubmitted(false);
        setCoachDialog(true);
    
        Object.entries(emptyCoach).forEach(([key, value]) => {
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
  return (
    <div>
          <link
            rel="stylesheet"
            href="https://site-assets.fontawesome.com/releases/v6.4.0/css/all.css"
          ></link>
      <div className="container">
  <div className="d-flex justify-content-center my-5">
    <div
      className="card s-col "
      style={{width:"18rem"}}
    >
      <div className="card-body d-flex gap-3 align-items-center">
        <FaUsers className="icon-stu fs-3" />
        <div>
          <h5 className="stu-context mb-1">Total Coaches:</h5>
          <h5 className="stu-context text-center">{Coaches?.length}</h5>
        </div>
        <div className="ag-courses-item_bg"></div>
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
                selectionMode="checkbox"
                selection={selectedCustomers}
                onSelectionChange={(e) => setSelectedCustomers(e.value)}
                filters={filters}
                filterDisplay="menu"
                globalFilterFields={[
                  "Full_Name",

                  "Age",
                  
                  "Gender",
                  "Payment_id",
                  "Address",
                ]}
                emptyMessage="No Coaches found.."
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
              >
                <Column
                  selectionMode="multiple"
                  headerStyle={{ width: "3rem" }}
                ></Column>
              
                <Column
                  field="Full_Name"
                  header="Full Name"
                  sortable
                  filter
                  filterPlaceholder="Search by name"
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
                  field="Payment_id"
                  header="Payment id"
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
                  filterPlaceholder="Search by Address"
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
                  field="teaching_batches"
                  header="teaching batches"
                  sortable
                  filter
                  filterPlaceholder="Search by teaching batches"
                  style={{ minWidth: "14rem" }}
                />
                 <Column
                  field="total_batches"
                  header="Total Batches"
                  sortable
                  dataType="numeric"
                  style={{ minWidth: "12rem" }}
                  filter
                  filterElement={balanceFilterTemplate}
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
            visible={CoachDialog}
             style={{ width: "80vw" }}
  breakpoints={{ "960px": "75vw", "641px": "90vw" }}
            header="Coach Details"
            modal
            className="p-fluid"
            footer={CoachDialogFooter}
            onHide={hideDialog}
          >
            <form className="mt-5">
              <div className="container ecat">
                 <div className="row justify-content-center">
        <div className="col-lg-6"> <div className="inputbox4 form-floating">
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
                    <p className=" text-danger">*enter Coach full name</p>
                  )}
                </div>
                </div>
        <div className="col-lg-6">  <div className="inputbox4 form-floating">
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
               </div></div>
               
              
                {/* Gender Radio */}
       <div className="row justify-content-center">
        <div className="col-lg-6"><div className="field mb-5">
  <i className="fa-solid fa-venus-mars"></i>
  <label htmlFor="Gender" className="mb-2">Gender</label>
  <select
    id="Gender"
    {...register("Gender", { required: "Please select a gender" })}
    defaultValue={Coach?.Gender || ""}
    className={`w-75 form-select ${errors.Gender ? "p-invalid" : ""}`}
  >
    <option value="" disabled>Select Gender</option>
    <option value="Male">Male</option>
    <option value="Female">Female</option>
  </select>
  {errors.Gender && <small className="p-error">{errors.Gender.message}</small>}
</div></div>
        <div className="col-lg-6"> <div className="inputbox4 form-floating">
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
                </div></div></div>
                
    
               
       <div className="row justify-content-center">
        <div className="col-lg-6">   <div className="field  ">
                <label htmlFor="Address" className="text-dark">
                    Address
                  </label>
                  <i className="fa-solid fa-location-dot"></i>
                  <div>
                  <textarea
                    type="text"
                    id="Address"
                    
                    placeholder="xyz"
                    {...register("Address", { required: true })}
                  ></textarea>
                  </div>
                 
                  
    
                  {errors.Address?.type === "required" && (
                    <p className=" text-danger">*enter Address</p>
                  )}
                </div></div>
        <div className="col-lg-6"> <div className="inputbox4 form-floating">
                  <i className="fa-regular fa-user"></i>
    
                  <input
                    type="text"
                    id="Payment_id"
                    className="form-control "
                    placeholder="xyz"
                    {...register("Payment_id", {
                      required: true,
                    })}
                  ></input>
                  <label htmlFor="Payment_id" className="text-dark">
                   Payment ID
                  </label>
    
                  {errors.Payment_id?.type === "required" && (
                    <p className=" text-danger">*enter Coach  Payment ID</p>
                  )}
                </div></div></div>
    
             

                
                  <div className="row justify-content-center">
        <div className="col-lg-6">  {/* status */}
            <div className="field mb-5">
            <i className="fa-solid fa-battery-full"></i>
  <label htmlFor="status" className="mb-2">Status</label>
  <select
    id="status"
    {...register("status", { required: "Please select a status" })}
    defaultValue={Coach?.status} // Set from the existing value like "Active" or "Inactive"
    className={`w-75  form-select ${errors.status ? "p-invalid" : ""}`}
  >
   
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
  </select>
  {errors.status && <small className="p-error">{errors.status.message}</small>}
</div></div>
        <div className="col-lg-6">   <div className="mb-5 me-5 d-block">
              <label className="form-label">WhatsApp Number</label>
              <Controller
  name="Whatsapp"
  control={control}
  rules={{
    required: "Whatsapp number is required",
    validate: (value) => {
      const digits = value.replace(/\D/g, "");

      const countryCodes = Object.keys(countryCodeRules).sort(
        (a, b) => b.length - a.length
      ); // longest match first

      const matchedCode = countryCodes.find((code) =>
        digits.startsWith(code)
      );

      if (matchedCode) {
        const rule = countryCodeRules[matchedCode];
        if (digits.length < rule.min || digits.length > rule.max) {
          return rule.message;
        }
        return true;
      }

      return "Unsupported or invalid country code";
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
            </div></div></div>
           

             

            {/* batches that coach teaches  */}

              </div>
            </form>
          </Dialog>
    
          {/* delete */}
          <Dialog
            visible={deleteCoachDialog}
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
              {Coach && (
                <span>
                  Are you sure you want to delete <b>{Coach?.Full_Name}</b>?
                </span>
              )}
            </div>
          </Dialog>
        </div>
  )
}

export default Coach