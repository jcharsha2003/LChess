import Studentd from "./Studentd";

import { useState } from "react";

import { Menu, Sidebar, MenuItem } from "react-pro-sidebar";
import { useProSidebar } from "react-pro-sidebar";
import "./MyProSidebar.css";
import { useSidebarContext } from "./sidebarContext";
import { MdAccountBalance } from "react-icons/md";
import { GiReceiveMoney } from "react-icons/gi";

import { NavLink } from "react-router-dom";
import { FaChess } from "react-icons/fa6";
import { Box, Typography, IconButton } from "@mui/material";
import { BiSolidChess } from "react-icons/bi";
import { SiChessdotcom } from "react-icons/si";
import { IoReorderThreeOutline } from "react-icons/io5";
import { LiaChessKingSolid } from "react-icons/lia";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";


import SwitchRightOutlinedIcon from "@mui/icons-material/SwitchRightOutlined";
import SwitchLeftOutlinedIcon from "@mui/icons-material/SwitchLeftOutlined";

const MyProSidebar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { sidebarRTL, setSidebarRTL, sidebarImage } = useSidebarContext();
  const { collapseSidebar, toggleSidebar, collapsed, broken } = useProSidebar();

  
  return (
    <Box
      sx={{
        position: "sticky",
        display: "flex",
        height: "100vh",
        top: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      <Sidebar breakPoint="md" rtl={sidebarRTL} className="s-glass ">
        <Menu>
          <MenuItem
            icon={
              collapsed ? (
                <ul className="navbar-nav s-menu text-decoration-none px-2 pt-3">
                  <li className={`nav-item ${collapsed ? "collapsed" : ""}`}>
                    <a
                      onClick={() => collapseSidebar()}
                      className=" nav-link icon-button horse"
                    >
                      <IoReorderThreeOutline className="s-icon-1 fs-3 icon-horse" />

                      <span></span>
                    </a>
                  </li>
                </ul>
              ) : sidebarRTL ? (
                <SwitchLeftOutlinedIcon
                  onClick={() => setSidebarRTL(!sidebarRTL)}
                />
              ) : !broken ? (
                <SwitchRightOutlinedIcon
                  onClick={() => setSidebarRTL(!sidebarRTL)}
                />
              ) : (
                <div></div>
              )
            }
            style={{
              margin: "10px 0 20px 0",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <h5 className="s-t pt-2">ADMINIS</h5>

                <IconButton
                  onClick={
                    broken ? () => toggleSidebar() : () => collapseSidebar()
                  }
                >
                  <CloseOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          <Box
            paddingLeft={
              collapsed ? undefined : !sidebarRTL ? "12%" : undefined
            }
            paddingRight={
              collapsed ? undefined : sidebarRTL ? "12%" : undefined
            }
          >
            <ul className={`navbar-nav s-menu text-decoration-none px-1 `}>
              <li className={`nav-item ${collapsed ? "collapsed" : ""} my-2`}>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `nav-link s-link d-flex gap-2 ${
                      collapsed ? "icon-button horse s-das mb-2" : ""
                    } ${isActive ? "active" : ""}`
                  }
                >
                  {collapsed ? (
                    <div>
                      <BiSolidChess className="s-icon-1 fs-3 icon-horse" />
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <BiSolidChess className="s-icon fs-3" />
                      </div>
                      <div>
                        <p className="s-p">Dashboard</p>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
              {/* <li className={`nav-item ${collapsed ? "collapsed" : ""} my-2`}>
                {collapsed ? (
                  <Studentd sidebarRTL={sidebarRTL} />
                ) : (
                  <button
                    className="nav-link s-link s-btn d-flex gap-2"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseExample"
                    aria-expanded="false"
                    aria-controls="collapseExample"
                  >
                    <div>
                      <FaChess className="s-icon fs-3" />
                    </div>
                    <div>
                      <p className="s-p">Batches</p>
                    </div>
                  </button>
                )}
              </li> */}
              {/* <div className="collapse" id="collapseExample">
                <li className={`nav-item ${collapsed ? "d-none" : ""} my-2`}>
                  <Link
                    className={`nav-link s-link d-flex gap-2 ${
                      collapsed ? "" : ""
                    }`}
                    to="/theory"
                  >
                    <>
                      <div>
                        <GiTeacher className="s-icon fs-3" />
                      </div>
                      <div>
                        <p className="s-p">Batch Form</p>
                      </div>
                    </>
                  </Link>
                </li>
                <li className={`nav-item ${collapsed ? "d-none" : ""} my-2`}>
                  <Link
                    className={`nav-link s-link d-flex gap-2 ${
                      collapsed ? "" : ""
                    }`}
                    to="/practice"
                  >
                    <>
                      <div>
                        <GiTabletopPlayers className="s-icon fs-2" />
                      </div>
                      <div>
                        <p className="s-p">Theory & Practice </p>
                      </div>
                    </>
                  </Link>
                </li>
              </div> */}
              <li className={`nav-item ${collapsed ? "collapsed" : ""} my-3`}>
                <NavLink
                  to="/practice"
                  className={({ isActive }) =>
                    `nav-link s-link d-flex gap-2 ${
                      collapsed ? "icon-button horse s-bat mb-2" : ""
                    } ${isActive && !collapsed ? "active" : ""}`
                  }
                >
                  {collapsed ? (
                    <div>
                      <FaChess className="s-icon-1 fs-3 icon-horse" />
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <FaChess className="s-icon fs-3" />
                      </div>
                      <div>
                        <p className="s-p">Batches</p>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
              <li className={`nav-item ${collapsed ? "collapsed" : ""} my-3`}>
                <NavLink
                  to="/student"
                  className={({ isActive }) =>
                    `nav-link s-link d-flex gap-2 ${
                      collapsed ? "icon-button horse s-stu mb-2" : ""
                    } ${isActive && !collapsed ? "active" : ""}`
                  }
                >
                  {collapsed ? (
                    <div>
                      <SiChessdotcom className="s-icon-1 fs-3 icon-horse" />
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <SiChessdotcom className="s-icon fs-3" />
                      </div>
                      <div>
                        <p className="s-p">Students</p>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>

              <li className={`nav-item ${collapsed ? "collapsed" : ""} my-3`}>
                <NavLink
                  to="/coach"
                  className={({ isActive }) =>
                    `nav-link s-link d-flex gap-2 ${
                      collapsed ? "icon-button horse s-coac mb-2" : ""
                    } ${isActive && !collapsed ? "active" : ""}`
                  }
                >
                  {collapsed ? (
                    <div>
                      <LiaChessKingSolid className="s-icon-1 fs-3 icon-horse" />
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <div>
                        <LiaChessKingSolid className="s-icon fs-2" />
                      </div>
                      <div>
                        <p className="s-p">Coaches</p>
                      </div>
                    </>
                  )}
                </NavLink>
              </li>
              <li className={`nav-item ${collapsed ? "collapsed" : ""} my-3`}>
  <NavLink
    to="/account"
    className={({ isActive }) =>
      `nav-link s-link d-flex gap-2 ${
        collapsed ? "icon-button horse s-acc mb-2" : ""
      } ${isActive && !collapsed ? "active" : ""}`
    }
  >
    {collapsed ? (
      <div>
        <MdAccountBalance className="s-icon-1 fs-3 icon-horse" />
        <span></span>
      </div>
    ) : (
      <>
        <div>
          <MdAccountBalance className="s-icon fs-2" />
        </div>
        <div>
          <p className="s-p">Accounts</p>
        </div>
      </>
    )}
  </NavLink>
</li>
<li className={`nav-item ${collapsed ? "collapsed" : ""} my-3`}>
  <NavLink
    to="/due"
    className={({ isActive }) =>
      `nav-link s-link d-flex gap-2 ${
        collapsed ? "icon-button horse s-due mb-2" : ""
      } ${isActive && !collapsed ? "active" : ""}`
    }
  >
    {collapsed ? (
      <div>
        <GiReceiveMoney className="s-icon-1 fs-3 icon-horse" />
        <span></span>
      </div>
    ) : (
      <>
        <div>
          <GiReceiveMoney className="s-icon fs-2" />
        </div>
        <div>
          <p className="s-p">Due</p>
        </div>
      </>
    )}
  </NavLink>
</li>

            </ul>
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default MyProSidebar;
