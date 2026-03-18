import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa6";
import Navbar from "../../components/Navbar";
import { parentLogin } from "../../services/api";
import "../../components/LoginCard.css";

function ParentLogin() {

  const [studentId, setStudentId] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();
    setErrorMessage("");

    try {
      const deviceId =
        localStorage.getItem("parentDeviceId") || crypto.randomUUID();
      localStorage.setItem("parentDeviceId", deviceId);

      const data = await parentLogin({
        student_id: studentId,
        parent_password: parentPassword,
        device_id: deviceId
      });

      /* Save token and role */
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "parent");
      localStorage.setItem(
        "user",
        JSON.stringify(
          data.user || {
            role: "parent",
            student_id: studentId
          }
        )
      );

      /* Redirect to parent dashboard */
      navigate("/parent");

    } catch (err) {

      setErrorMessage(err.response?.data?.message || err.message || "Login failed");

    }

  };

  return(

    <div className="login-wrapper">

      <Navbar />

      <div className="login-page">

        {errorMessage && (
          <div className="login-top-error-message" role="alert" aria-live="polite">
            <p className="login-top-error-title">Login failed</p>
            <p className="login-top-error-text">{errorMessage}</p>
          </div>
        )}

        <div className="login-card">

          <div className="login-icon" aria-hidden="true">
            <FaUsers />
          </div>

          <h2>Parent Login</h2>

          <p className="login-desc">
            Access your child's hostel information, complaints, and notifications
          </p>

          <form onSubmit={handleLogin}>

            <label htmlFor="parent-student-id">Student ID</label>

            <input
              id="parent-student-id"
              type="text"
              placeholder="Enter your child's Student ID (e.g., STU001)"
              autoComplete="username"
              value={studentId}
              onChange={(e)=>{
                setStudentId(e.target.value);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              required
            />

            <label htmlFor="parent-password">Parent Password</label>

            <input
              id="parent-password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              value={parentPassword}
              onChange={(e)=>{
                setParentPassword(e.target.value);
                if (errorMessage) {
                  setErrorMessage("");
                }
              }}
              required
            />

            <button type="submit">
              Sign in
            </button>

          </form>

          <div className="login-help">
            Need help? Contact <span>support</span>
          </div>

        </div>

      </div>

    </div>

  );
}

export default ParentLogin;