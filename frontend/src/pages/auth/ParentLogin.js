import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import "../../components/LoginCard.css";

function ParentLogin() {

  const [studentId, setStudentId] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {
      const deviceId =
        localStorage.getItem("parentDeviceId") || crypto.randomUUID();
      localStorage.setItem("parentDeviceId", deviceId);

      const res = await fetch("http://localhost:5000/api/auth/parent-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: studentId,
          parent_password: parentPassword,
          device_id: deviceId
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();

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

      alert(err.message || "Login failed");

    }

  };

  return(

    <div className="login-wrapper">

      <Navbar />

      <div className="login-page">

        <div className="login-card">

          <div className="login-icon">
            👨‍👩‍👧
          </div>

          <h2>Parent Login</h2>

          <p className="login-desc">
            Access your child's hostel information, complaints, and notifications
          </p>

          <form onSubmit={handleLogin}>

            <label>Student ID</label>

            <input
              type="text"
              placeholder="Enter your child's Student ID (e.g., STU001)"
              value={studentId}
              onChange={(e)=>setStudentId(e.target.value)}
              required
            />

            <label>Parent Password</label>

            <input
              type="password"
              placeholder="********"
              value={parentPassword}
              onChange={(e)=>setParentPassword(e.target.value)}
              required
            />

            <button type="submit">
              Login
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