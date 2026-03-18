import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import "./Navbar.css";

import logo from "../assets/images/NSBM-LOGO.png";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <header className="navbar">
      <div className="navbar-center">
        <img
          src={logo}
          alt="NSBM"
          className="navbar-logo"
        />
        <div className="navbar-branding">
          <h2 className="navbar-title">
            Hostel Management System
          </h2>
          <p className="navbar-subtitle">
            NSBM Campus Portal
          </p>
        </div>
      </div>

      <div className="navbar-actions">
        {!isHome && (
          <button
            className="back-home-btn"
            onClick={() => navigate("/")}
          >
            <FiHome aria-hidden="true" />
            <span className="back-home-label">Back to Home</span>
          </button>
        )}
      </div>
    </header>

  );
}

export default Navbar;