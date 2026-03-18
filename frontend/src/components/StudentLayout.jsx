import React from "react";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlusCircle, FiList, FiClock, FiLogOut } from "react-icons/fi";
import Navbar from "./Navbar";
import { useAuth } from "../context/AuthContext";
import "../pages/student/StudentDashboard.css";

function StudentLayout({ activeTab, breadcrumb, title, children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    localStorage.removeItem("role");
    navigate("/student-login");
  };

  return (
    <div className="student-page">
      <Navbar />
      <div className="student-container">
        <aside className="student-sidebar">
          <div className="sidebar-title-wrap">
            <h2 className="sidebar-title">Student Panel</h2>
          </div>

          <button
            className={`sidebar-btn ${activeTab === "Dashboard" ? "active" : ""}`}
            onClick={() => navigate("/student")}
          >
            <div className="sidebar-btn-content">
              <FiHome /> Dashboard
            </div>
          </button>

          <button
            className={`sidebar-btn ${activeTab === "Create Outing" ? "active" : ""}`}
            onClick={() => navigate("/student/create-outing")}
          >
            <div className="sidebar-btn-content">
              <FiPlusCircle /> Create Outing
            </div>
          </button>

          <button
            className={`sidebar-btn ${activeTab === "My Requests" ? "active" : ""}`}
            onClick={() => navigate("/student/my-requests")}
          >
            <div className="sidebar-btn-content">
              <FiList /> My Requests
            </div>
          </button>

          <button
            className={`sidebar-btn ${activeTab === "Outing History" ? "active" : ""}`}
            onClick={() => navigate("/student/outing-history")}
          >
            <div className="sidebar-btn-content">
              <FiClock /> Outing History
            </div>
          </button>

          <button className="sidebar-btn sidebar-logout-btn" onClick={handleLogout}>
            <div className="sidebar-btn-content sidebar-logout-content">
              <FiLogOut /> Logout
            </div>
          </button>
        </aside>

        <div className="student-main-content">
          <header className="main-content-header">
            <p className="main-content-breadcrumb">{breadcrumb}</p>
            <h1 className="main-content-title">{title}</h1>
          </header>

          <div className="student-layout">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
