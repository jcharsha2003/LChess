import * as React from "react";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import Divider from "@mui/material/Divider";
import { FaChess } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

const Studentd = (props) => {
    const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleTheory=()=>{
    navigate("/theory");
    setAnchorEl(null);
  }
  const handlePractice=()=>{
    navigate("/practice");
    setAnchorEl(null);
  }
  return (
    <div>
      <button
        className="nav-link s-link s-bat d-flex gap-2 icon-button horse"
        onClick={handleClick}
        size="small"
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <div>
          <FaChess className="s-icon-1 fs-3 icon-horse" />
          <span></span>
        </div>
      </button>
 {
  props.sidebarRTL?(<Menu
    anchorEl={anchorEl}
    id="account-menu"
    open={open}
    onClose={handleClose}
    onClick={handleClose}
    slotProps={{
      paper: {
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 2.7,
          ml: "-90px",

          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 7,
            right: -5,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateY(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      },
    }}
    transformOrigin={{ horizontal: "right", vertical: "top" }} // Changes how the menu expands
    anchorOrigin={{ horizontal: "right", vertical: "top" }} // Moves anchor point to top-left
  >
    <MenuItem onClick={handleTheory}>Batch Form</MenuItem>
    <Divider />
    <MenuItem onClick={handlePractice}>Theory & Practice Sessions</MenuItem>
  </Menu>):(<Menu
    anchorEl={anchorEl}
    id="account-menu"
    open={open}
    onClose={handleClose}
    onClick={handleClose}
    slotProps={{
      paper: {
        elevation: 0,
        sx: {
          overflow: "visible",
          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
          mt: 2.7,
          ml: "90px",

          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            top: 2,
            left: 0,
            width: 10,
            height: 10,
            bgcolor: "background.paper",
            transform: "translateX(-50%) rotate(45deg)",
            zIndex: 0,
          },
        },
      },
    }}
    transformOrigin={{ horizontal: "left", vertical: "top" }} // Changes how the menu expands
    anchorOrigin={{ horizontal: "left", vertical: "top" }} // Moves anchor point to top-left
  >
    <MenuItem onClick={handleTheory}>Batch Form</MenuItem>
    <Divider />
    <MenuItem onClick={handlePractice}>Theory & Practice Sessions</MenuItem>
  </Menu>)
 }
      
    </div>
  );
};

export default Studentd;
