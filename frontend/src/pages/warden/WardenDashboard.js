import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import {
  registerStudentByWarden,
  registerParentByWarden,
  registerSecurityByWarden
} from "../../services/api";
import "./WardenDashboard.css";

function WardenDashboard() {

  const [activeSection, setActiveSection] = useState("studentParent");

  const [studentForm, setStudentForm] = useState({
    full_name: "",
    student_id: "",
    room_number: "",
    email: "",
    password: ""
  });

  const [parentForm, setParentForm] = useState({
    parent_name: "",
    email: "",
    student_name: "",
    student_id: "",
    phone_number: "",
    password: ""
  });

  const [securityForm, setSecurityForm] = useState({
    full_name: "",
    email: "",
    password: ""
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const showStatus = (type, message) => {
    setStatusType(type);
    setStatusMessage(message);
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitStudentRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await registerStudentByWarden(studentForm);
      showStatus("success", response.message || "Student registered successfully");
      setStudentForm({
        full_name: "",
        student_id: "",
        room_number: "",
        email: "",
        password: ""
      });
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to register student");
    }
  };

  const submitParentRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await registerParentByWarden(parentForm);
      showStatus("success", response.message || "Parent registered successfully");
      setParentForm({
        parent_name: "",
        email: "",
        student_name: "",
        student_id: "",
        phone_number: "",
        password: ""
      });
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to register parent");
    }
  };

  const submitSecurityRegistration = async (e) => {
    e.preventDefault();
    try {
      const response = await registerSecurityByWarden(securityForm);
      showStatus("success", response.message || "Security registered successfully");
      setSecurityForm({
        full_name: "",
        email: "",
        password: ""
      });
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to register security");
    }
  };

  return(

    <div className="warden-page">

      <Navbar />

      <div className="warden-container">

        <h1>Warden Registration Dashboard</h1>
        <p className="warden-subtitle">
          Register students, parents, and securities, then provide their generated login passwords.
        </p>

        {statusMessage && (
          <div className={`status-banner ${statusType}`}>
            {statusMessage}
          </div>
        )}

        <div className="warden-layout">

          <aside className="warden-sidebar">
            <button
              type="button"
              className={`sidebar-btn ${activeSection === "studentParent" ? "active" : ""}`}
              onClick={() => setActiveSection("studentParent")}
            >
              Register Student and Parent
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeSection === "staff" ? "active" : ""}`}
              onClick={() => setActiveSection("staff")}
            >
              Register Staff
            </button>
          </aside>

          <section className="warden-main-content">
            {activeSection === "studentParent" && (
              <div className="registration-grid student-parent-grid">

                <div className="registration-card">
                  <h2>Register Student</h2>
                  <form onSubmit={submitStudentRegistration} className="registration-form">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={studentForm.full_name}
                      onChange={handleStudentChange}
                      placeholder="Enter student full name"
                      required
                    />

                    <label>Student ID Number</label>
                    <input
                      type="text"
                      name="student_id"
                      value={studentForm.student_id}
                      onChange={handleStudentChange}
                      placeholder="Enter student ID"
                      required
                    />

                    <label>Room Number</label>
                    <input
                      type="text"
                      name="room_number"
                      value={studentForm.room_number}
                      onChange={handleStudentChange}
                      placeholder="Enter room number"
                      required
                    />

                    <label>Student Email</label>
                    <input
                      type="email"
                      name="email"
                      value={studentForm.email}
                      onChange={handleStudentChange}
                      placeholder="Enter student email"
                      required
                    />

                    <label>Password (Given by Warden)</label>
                    <input
                      type="password"
                      name="password"
                      value={studentForm.password}
                      onChange={handleStudentChange}
                      placeholder="Set student password"
                      required
                    />

                    <button type="submit" className="primary-btn">Register Student</button>
                  </form>
                </div>

                <div className="registration-card">
                  <h2>Register Parent</h2>
                  <form onSubmit={submitParentRegistration} className="registration-form">
                    <label>Parent Name</label>
                    <input
                      type="text"
                      name="parent_name"
                      value={parentForm.parent_name}
                      onChange={handleParentChange}
                      placeholder="Enter parent name"
                      required
                    />

                    <label>Parent Email</label>
                    <input
                      type="email"
                      name="email"
                      value={parentForm.email}
                      onChange={handleParentChange}
                      placeholder="Enter parent email"
                      required
                    />

                    <label>Student Name</label>
                    <input
                      type="text"
                      name="student_name"
                      value={parentForm.student_name}
                      onChange={handleParentChange}
                      placeholder="Enter student name"
                      required
                    />

                    <label>Student ID</label>
                    <input
                      type="text"
                      name="student_id"
                      value={parentForm.student_id}
                      onChange={handleParentChange}
                      placeholder="Enter student ID"
                      required
                    />

                    <label>Phone Number</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={parentForm.phone_number}
                      onChange={handleParentChange}
                      placeholder="Enter parent phone number"
                      required
                    />

                    <label>Password (Given by Warden)</label>
                    <input
                      type="password"
                      name="password"
                      value={parentForm.password}
                      onChange={handleParentChange}
                      placeholder="Set parent password"
                      required
                    />

                    <button type="submit" className="primary-btn">Register Parent</button>
                  </form>
                </div>

              </div>
            )}

            {activeSection === "staff" && (
              <div className="registration-grid staff-grid">
                <div className="registration-card">
                  <h2>Register Security</h2>
                  <form onSubmit={submitSecurityRegistration} className="registration-form">
                    <label>Security Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={securityForm.full_name}
                      onChange={handleSecurityChange}
                      placeholder="Enter security officer name"
                      required
                    />

                    <label>Security Email</label>
                    <input
                      type="email"
                      name="email"
                      value={securityForm.email}
                      onChange={handleSecurityChange}
                      placeholder="Enter security email"
                      required
                    />

                    <label>Password (Given by Warden)</label>
                    <input
                      type="password"
                      name="password"
                      value={securityForm.password}
                      onChange={handleSecurityChange}
                      placeholder="Set security password"
                      required
                    />

                    <button type="submit" className="primary-btn">Register Security</button>
                  </form>
                </div>
              </div>
            )}
          </section>

        </div>

      </div>

    </div>

  );

}

export default WardenDashboard;