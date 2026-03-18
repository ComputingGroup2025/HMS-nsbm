import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar(){

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/student-login");
  };

  return(

    <div className="sidebar">

      <h2>Student</h2>

      <button
        className={isActive("/student") ? "active" : ""}
        onClick={()=>navigate("/student")}
      >
        Dashboard
      </button>

      <button
        className={isActive("/student/create-outing") ? "active" : ""}
        onClick={()=>navigate("/student/create-outing")}
      >
        Create Outing
      </button>

      <button
        className={isActive("/student/my-requests") ? "active" : ""}
        onClick={()=>navigate("/student/my-requests")}
      >
        My Requests
      </button>

      <button
        className={isActive("/student/outing-history") ? "active" : ""}
        onClick={()=>navigate("/student/outing-history")}
      >
        Outing History
      </button>

      <button className="logout" onClick={handleLogout}>
        Logout
      </button>

    </div>

  )

}

export default Sidebar;