import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

import logo from "../assets/images/NSBM-LOGO.png";

function Navbar({ showBackHome = false }) {

  const navigate = useNavigate();

  return (

    <div className="navbar">

      {showBackHome && (
        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>
      )}

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

    </div>

  );
}

export default Navbar;