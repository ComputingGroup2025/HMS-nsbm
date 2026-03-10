import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./StudentDashboard.css";

function StudentDashboard(){

  const navigate = useNavigate();

  return(

    <div className="dashboard-page">

      <Navbar/>

      <div className="dashboard-container">

        <Sidebar/>

        <div className="dashboard-content">

          <h1>Student Dashboard</h1>

          <div className="dashboard-cards">

            <div className="card" onClick={() => navigate("/student/create-outing")}>
              <h3>Create Outing</h3>
              <p>Submit a new outing request.</p>
            </div>

            <div className="card" onClick={() => navigate("/student/my-requests")}>
              <h3>My Requests</h3>
              <p>View your outing requests and status.</p>
            </div>

            <div className="card" onClick={() => navigate("/student/outing-history")}>
              <h3>Outing History</h3>
              <p>See your past outing records.</p>
            </div>

            <div className="card">
              <h3>Notifications</h3>
              <p>Latest hostel updates.</p>
            </div>

          </div>

        </div>

      </div>

    </div>

  )

}

export default StudentDashboard;