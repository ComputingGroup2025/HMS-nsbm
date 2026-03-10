import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar(){

  const navigate = useNavigate();

  return(

    <div className="sidebar">

      <h2>Student</h2>

      <button onClick={()=>navigate("/student")}>
        Dashboard
      </button>

      <button onClick={()=>navigate("/student/create-outing")}>
        Create Outing
      </button>

      <button onClick={()=>navigate("/student/my-requests")}>
        My Requests
      </button>

      <button onClick={()=>navigate("/student/outing-history")}>
        Outing History
      </button>

      <button className="logout">
        Logout
      </button>

    </div>

  )

}

export default Sidebar;