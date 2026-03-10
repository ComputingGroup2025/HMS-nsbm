import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

import logo from "../assets/images/NSBM-LOGO.png";

function Navbar() {

  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (

    <div className="navbar">

      <div className="navbar-center">

        <img
          src={logo}
          alt="NSBM"
          className="navbar-logo"
        />

        <div>

          <h2 className="navbar-title">
            Hostel Management System
          </h2>

          <p className="navbar-subtitle">
            Welcome to your hostel hub
          </p>

        </div>

      </div>

      <div className="navbar-actions">
        {!isHome && (
          <button
            className="back-home-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        )}

      </div>

    </div>

  );
}

export default Navbar;