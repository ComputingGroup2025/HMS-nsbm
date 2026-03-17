import React, { useState } from "react";
import "./LoginCard.css";
import { useNavigate } from "react-router-dom";
import { login as loginRequest } from "../services/api";

function LoginCard({ title, description, role, icon }) {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();
    setErrorMessage("");

    try {
      const res = await loginRequest({ email, password, role });

      /* Save token */
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.user.role);
      localStorage.setItem("user", JSON.stringify(res.user));

      const userRole = res.user.role;

      /* Redirect to dashboard */

      if (userRole === "student") {
        navigate("/student");
      }

      if (userRole === "parent") {
        navigate("/parent");
      }

      if (userRole === "warden") {
        navigate("/warden");
      }

      if (userRole === "security") {
        navigate("/security");
      }

    } catch (err) {

      setErrorMessage(err.response?.data?.message || "Login failed");

    }

  };

  return (

    <div className="login-page">

      {errorMessage && (
        <div className="login-top-error-message" role="alert" aria-live="polite">
          <p className="login-top-error-title">Login failed</p>
          <p className="login-top-error-text">{errorMessage}</p>
        </div>
      )}

      <div className="login-card">

        <div className="login-icon">
          {icon}
        </div>

        <h2>{title}</h2>

        <p className="login-desc">
          {description}
        </p>

        <form onSubmit={handleLogin}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="your.email@example.com"
            value={email}
            onChange={(e)=>{
              setEmail(e.target.value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="********"
            value={password}
            onChange={(e)=>{
              setPassword(e.target.value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
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

  );
}

export default LoginCard;