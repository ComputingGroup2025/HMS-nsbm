import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import axios from "axios";
import "../../components/LoginCard.css";

function ParentLogin(){

  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/parent-login", {
        student_id: studentId,
        parent_password: parentPassword
      });

      /* Save token */
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      /* Redirect to parent dashboard */
      navigate("/parent");

    } catch (err) {

      alert(err.response?.data?.message || "Login failed");

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

      <button
        className="back-home-floating"
        onClick={()=>navigate("/")}
      >
        ← Back to Home
      </button>

    </div>

  );
}

export default ParentLogin;