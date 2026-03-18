import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  registerStudentByWarden,
  registerParentByWarden,
  registerSecurityByWarden,
  searchStudentAndParentByStudentId,
  searchStaffByName,
  resetStaffPassword,
  removeStaff,
  removeStudentByStudentId,
  resetStudentParentPasswordsByStudentId,
  getWardenDashboard,
  getWardenPastSummariesByDate,
  wardenApproveOuting,
  wardenRejectOuting
} from "../../services/api";
import "./WardenDashboard.css";

function WardenDashboard() {

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("");

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

  const [searchStudentId, setSearchStudentId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState({
    student: null,
    parent: null
  });
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetPasswordForm, setResetPasswordForm] = useState({
    studentPassword: "",
    parentPassword: ""
  });
  const [resetCredentials, setResetCredentials] = useState({
    student_password: null,
    parent_password: null
  });

  const [dashboardData, setDashboardData] = useState({
    today_outings: [],
    today_going_homes: [],
    parent_pending: [],
    warden_pending: [],
    daily_summary: {
      total_students_registered: 0,
      students_outside_hostel: 0,
      students_in_home_today: 0,
      date: ""
    }
  });
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [pastDate, setPastDate] = useState("");
  const [pastLoading, setPastLoading] = useState(false);
  const [pastData, setPastData] = useState({
    past_outings: [],
    past_going_homes: []
  });

  const [staffSearchName, setStaffSearchName] = useState("");
  const [staffSearchLoading, setStaffSearchLoading] = useState(false);
  const [staffResults, setStaffResults] = useState([]);
  const [staffPasswordForm, setStaffPasswordForm] = useState({});
  const [staffActionLoadingId, setStaffActionLoadingId] = useState(null);
  const [staffRemoveConfirmId, setStaffRemoveConfirmId] = useState(null);
  const [recentStaffPasswords, setRecentStaffPasswords] = useState({});
  const staffPasswordTimersRef = useRef({});

  useEffect(() => {
    if (activeSection === "today" || activeSection === "") {
      fetchDashboard();
    }
  }, [activeSection]);

  useEffect(() => {
    return () => {
      Object.values(staffPasswordTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
    };
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await getWardenDashboard();
      setDashboardData({
        today_outings: data.today_outings || [],
        today_going_homes: data.today_going_homes || [],
        parent_pending: data.parent_pending || [],
        warden_pending: data.warden_pending || [],
        daily_summary: data.daily_summary || {
          total_students_registered: 0,
          students_outside_hostel: 0,
          students_in_home_today: 0,
          date: ""
        }
      });
      setLoadingDashboard(false);
    } catch (error) {
      console.error("Error loading warden dashboard", error);
      setLoadingDashboard(false);
    }
  };

  const handleWardenApprove = async (outingId) => {
    try {
      // Optimistic UI: mark as approved
      setDashboardData((prev) => ({
        ...prev,
        today_outings: prev.today_outings.map((o) =>
          o.id === outingId ? { ...o, status: "approved" } : o
        )
      }));
      await wardenApproveOuting(outingId);
      fetchDashboard();
    } catch (error) {
      console.error("Error approving outing as warden", error);
    }
  };

  const handleWardenReject = async (outingId) => {
    try {
      setDashboardData((prev) => ({
        ...prev,
        today_outings: prev.today_outings.map((o) =>
          o.id === outingId ? { ...o, status: "rejected_by_warden" } : o
        )
      }));
      await wardenRejectOuting(outingId);
      fetchDashboard();
    } catch (error) {
      console.error("Error rejecting outing as warden", error);
    }
  };

  const statusLabel = (status) => {
    if (status === "pending_parent") return "Pending (Parent)";
    if (status === "pending_warden") return "Pending (Warden)";
    if (status === "approved") return "Approved";
    if (status === "rejected_by_parent") return "Rejected by Parent";
    if (status === "rejected_by_warden") return "Rejected by Warden";
    if (status === "student_left") return "Student Left";
    if (status === "student_returned") return "Student Returned";
    return status || "";
  };

  const formatDateTime = (date, time) => {
    if (!date) return "";
    try {
      const base = new Date(date);
      if (time) {
        const [h = "0", m = "0"] = String(time).split(":");
        base.setHours(Number(h), Number(m));
      }
      return base.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return `${date} ${time || ""}`;
    }
  };

  const showStatus = (type, message) => {
    setStatusType(type);
    setStatusMessage(message);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    const studentId = searchStudentId.trim();

    if (!studentId) {
      showStatus("error", "Enter a student ID number to search");
      return;
    }

    setSearchLoading(true);

    try {
      const data = await searchStudentAndParentByStudentId(studentId);
      setSearchResult({
        student: data.student || null,
        parent: data.parent || null
      });
      setShowRemoveConfirm(false);
      setResetPasswordForm({ studentPassword: "", parentPassword: "" });
      setResetCredentials({
        student_password: null,
        parent_password: null
      });
      setStatusMessage("");
      setStatusType("");
    } catch (error) {
      setSearchResult({ student: null, parent: null });
      setShowRemoveConfirm(false);
      showStatus("error", error.response?.data?.message || "Failed to search records");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRemoveStudentClick = () => {
    setShowRemoveConfirm(true);
  };

  const handleRemoveStudentCancel = () => {
    setShowRemoveConfirm(false);
  };

  const handleRemoveStudentConfirm = async () => {
    if (!searchResult.student?.student_id) {
      return;
    }

    setRemoveLoading(true);

    try {
      const response = await removeStudentByStudentId(searchResult.student.student_id);
      setSearchResult({ student: null, parent: null });
      setSearchStudentId("");
      setShowRemoveConfirm(false);
      setResetPasswordForm({ studentPassword: "", parentPassword: "" });
      setResetCredentials({
        student_password: null,
        parent_password: null
      });
      showStatus("success", response.message || "Student removed successfully");
      fetchDashboard();
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to remove student");
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleResetPasswords = async () => {
    if (!searchResult.student?.student_id) {
      return;
    }

    if (!resetPasswordForm.studentPassword.trim()) {
      showStatus("error", "Enter a new student password");
      return;
    }

    if (searchResult.parent && !resetPasswordForm.parentPassword.trim()) {
      showStatus("error", "Enter a new parent password");
      return;
    }

    setResetLoading(true);

    try {
      const response = await resetStudentParentPasswordsByStudentId(
        searchResult.student.student_id,
        {
          studentPassword: resetPasswordForm.studentPassword,
          parentPassword: resetPasswordForm.parentPassword
        }
      );
      setResetCredentials({
        student_password: response.credentials?.student_password || null,
        parent_password: response.credentials?.parent_password || null
      });
      showStatus("success", "Passwords updated successfully.");
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to reset passwords");
    } finally {
      setResetLoading(false);
    }
  };

  const handlePastSearch = async (e) => {
    e.preventDefault();

    if (!pastDate) {
      showStatus("error", "Please select a date");
      return;
    }

    setPastLoading(true);

    try {
      const data = await getWardenPastSummariesByDate(pastDate);
      setPastData({
        past_outings: data.past_outings || [],
        past_going_homes: data.past_going_homes || []
      });
      setStatusMessage("");
      setStatusType("");
    } catch (error) {
      setPastData({
        past_outings: [],
        past_going_homes: []
      });
      showStatus("error", error.response?.data?.message || "Failed to load past summaries");
    } finally {
      setPastLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/warden-login");
  };

  const handleSearchStaff = async (e) => {
    e.preventDefault();

    const name = staffSearchName.trim();

    if (!name) {
      showStatus("error", "Enter a staff name to search");
      return;
    }

    setStaffSearchLoading(true);

    try {
      const data = await searchStaffByName(name);
      setStaffResults(data.staffs || []);
      setStaffPasswordForm({});
      setStaffRemoveConfirmId(null);
      setStatusMessage("");
      setStatusType("");
    } catch (error) {
      setStaffResults([]);
      showStatus("error", error.response?.data?.message || "Failed to search staff");
    } finally {
      setStaffSearchLoading(false);
    }
  };

  const handleStaffPasswordChange = (staffId, value) => {
    setStaffPasswordForm((prev) => ({
      ...prev,
      [staffId]: value
    }));
  };

  const handleChangeStaffPassword = async (staffId) => {
    const newPassword = (staffPasswordForm[staffId] || "").trim();

    if (!newPassword) {
      showStatus("error", "Enter a new password for the selected security staff");
      return;
    }

    setStaffActionLoadingId(staffId);

    try {
      const response = await resetStaffPassword(staffId, newPassword);
      showStatus("success", response.message || "Security password updated successfully");

      setRecentStaffPasswords((prev) => ({
        ...prev,
        [staffId]: newPassword
      }));

      if (staffPasswordTimersRef.current[staffId]) {
        clearTimeout(staffPasswordTimersRef.current[staffId]);
      }

      staffPasswordTimersRef.current[staffId] = setTimeout(() => {
        setRecentStaffPasswords((prev) => {
          const updated = { ...prev };
          delete updated[staffId];
          return updated;
        });
        delete staffPasswordTimersRef.current[staffId];
      }, 10000);

      setStaffPasswordForm((prev) => ({
        ...prev,
        [staffId]: ""
      }));
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to update security password");
    } finally {
      setStaffActionLoadingId(null);
    }
  };

  const handleRemoveStaff = async (staffId) => {
    setStaffActionLoadingId(staffId);

    try {
      const response = await removeStaff(staffId);
      setStaffResults((prev) => prev.filter((staff) => staff.id !== staffId));
      setStaffRemoveConfirmId(null);
      setRecentStaffPasswords((prev) => {
        const updated = { ...prev };
        delete updated[staffId];
        return updated;
      });

      if (staffPasswordTimersRef.current[staffId]) {
        clearTimeout(staffPasswordTimersRef.current[staffId]);
        delete staffPasswordTimersRef.current[staffId];
      }

      showStatus("success", response.message || "Security staff removed successfully");
    } catch (error) {
      showStatus("error", error.response?.data?.message || "Failed to remove security staff");
    } finally {
      setStaffActionLoadingId(null);
    }
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

  const todayNewRequests = dashboardData.today_outings.filter(
    (outing) => outing.status === "pending_warden"
  );

  const todayReturnedStudents = dashboardData.today_outings.filter(
    (outing) => outing.status === "student_returned"
  );

  return(

    <div className="warden-page">

      <Navbar />

      <div className="warden-container">

        <h1 className="h1-warden">Warden Dashboard</h1>

        <p className="warden-subtitle">
          Welcome to the Warden Dashboard. Here you can manage student and parent registrations, view and approve outing requests, and monitor daily hostel activities. Use the sidebar to navigate through different sections of the dashboard.
        </p>

        {statusMessage && (
          <div className="status-banner-wrapper">
            <div className={`status-banner ${statusType}`}>
              {statusMessage}
            </div>
          </div>
        )}

        <div className="warden-layout">

          <aside className="warden-sidebar">
            <button
              type="button"
              className={`sidebar-btn ${activeSection === "" ? "active" : ""}`}
              onClick={() => setActiveSection("")}
            >
              Main Dashboard
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeSection === "search" ? "active" : ""}`}
              onClick={() => setActiveSection("search")}
            >
              Search Student and Parent
            </button>

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

            <button
              type="button"
              className={`sidebar-btn ${activeSection === "searchStaff" ? "active" : ""}`}
              onClick={() => setActiveSection("searchStaff")}
            >
              Search Staff
            </button>

            <button
              type="button"
              className={`sidebar-btn today-live-btn ${activeSection === "today" ? "active today-live-active" : ""}`}
              onClick={() => setActiveSection("today")}
            >
              <span className="sidebar-live-label">
                <span className="sidebar-live-dot" aria-hidden="true"></span>
                Today's Movements
              </span>
            </button>

            <button
              type="button"
              className={`sidebar-btn ${activeSection === "past" ? "active" : ""}`}
              onClick={() => setActiveSection("past")}
            >
              Search Past Outings
            </button>

            <button
              type="button"
              className="sidebar-btn sidebar-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </aside>

          <section className="warden-main-content">
            {activeSection === "search" && (
            <div className="registration-card search-card">
                <h2>Search Student and Parent</h2>
                <form onSubmit={handleSearchSubmit} className="search-form">
                  <label>Student ID Number</label>
                  <div className="search-input-row">
                    <input
                      type="text"
                      value={searchStudentId}
                      onChange={(e) => {
                        setSearchStudentId(e.target.value);
                        if (showRemoveConfirm) {
                          setShowRemoveConfirm(false);
                        }
                      }}
                      placeholder="Enter student ID (e.g., STU001)"
                    />
                    <button type="submit" className="primary-btn" disabled={searchLoading}>
                      {searchLoading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </form>

                {(searchResult.student || searchResult.parent) && (
                  <>
                    <div className="search-result-grid">
                      <div className="search-result-card">
                        <h3>Student Details</h3>
                        {searchResult.student ? (
                          <ul>
                            <li><strong>Name:</strong> {searchResult.student.full_name}</li>
                            <li><strong>Student ID:</strong> {searchResult.student.student_id}</li>
                            <li><strong>Room Number:</strong> {searchResult.student.room_number}</li>
                            <li><strong>Email:</strong> {searchResult.student.email}</li>
                          </ul>
                        ) : (
                          <p className="search-empty">No student details found.</p>
                        )}
                      </div>

                      <div className="search-result-card">
                        <h3>Parent Details</h3>
                        {searchResult.parent ? (
                          <ul>
                            <li><strong>Name:</strong> {searchResult.parent.parent_name}</li>
                            <li><strong>Email:</strong> {searchResult.parent.email}</li>
                            <li><strong>Student Name:</strong> {searchResult.parent.student_name}</li>
                            <li><strong>Student ID:</strong> {searchResult.parent.student_id}</li>
                            <li><strong>Phone Number:</strong> {searchResult.parent.phone_number}</li>
                          </ul>
                        ) : (
                          <p className="search-empty">No parent details found.</p>
                        )}
                      </div>
                    </div>

                    {searchResult.student && (
                      <div className="remove-student-section">
                        <div className="reset-password-fields">
                          <input
                            type="text"
                            placeholder="Enter new student password"
                            value={resetPasswordForm.studentPassword}
                            onChange={(e) =>
                              setResetPasswordForm((prev) => ({
                                ...prev,
                                studentPassword: e.target.value
                              }))
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter new parent password"
                            value={resetPasswordForm.parentPassword}
                            onChange={(e) =>
                              setResetPasswordForm((prev) => ({
                                ...prev,
                                parentPassword: e.target.value
                              }))
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="reset-password-btn"
                          onClick={handleResetPasswords}
                          disabled={resetLoading}
                        >
                          {resetLoading ? "Updating..." : "Set New Passwords"}
                        </button>

                        {(resetCredentials.student_password || resetCredentials.parent_password) && (
                          <div className="reset-credentials-box">
                            <p><strong>Student Password:</strong> {resetCredentials.student_password || "Not available"}</p>
                            <p><strong>Parent Password:</strong> {resetCredentials.parent_password || "No parent account linked"}</p>
                          </div>
                        )}

                        {!showRemoveConfirm ? (
                          <button
                            type="button"
                            className="remove-student-btn"
                            onClick={handleRemoveStudentClick}
                          >
                            Remove Student
                          </button>
                        ) : (
                          <div className="remove-student-confirmation">
                            <p>Are you sure you want to remove this student?</p>
                            <div className="remove-student-actions">
                              <button
                                type="button"
                                className="remove-confirm-yes"
                                onClick={handleRemoveStudentConfirm}
                                disabled={removeLoading}
                              >
                                {removeLoading ? "Removing..." : "Yes"}
                              </button>
                              <button
                                type="button"
                                className="remove-confirm-no"
                                onClick={handleRemoveStudentCancel}
                                disabled={removeLoading}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
            </div>
            )}

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

            {activeSection === "searchStaff" && (
              <div className="registration-card search-card">
                <h2>Search Staff</h2>
                <form onSubmit={handleSearchStaff} className="search-form">
                  <label>Staff Name</label>
                  <div className="search-input-row">
                    <input
                      type="text"
                      value={staffSearchName}
                      onChange={(e) => setStaffSearchName(e.target.value)}
                      placeholder="Enter staff name"
                    />
                    <button type="submit" className="primary-btn" disabled={staffSearchLoading}>
                      {staffSearchLoading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </form>

                <div className="staff-search-result">
                  {staffSearchLoading ? (
                    <p>Loading...</p>
                  ) : staffResults.length === 0 ? (
                    <p className="today-empty">No staff records found.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffResults.map((staff) => (
                          <tr key={staff.id}>
                            <td>{staff.name}</td>
                            <td>{staff.email || "-"}</td>
                            <td>{staff.role}</td>
                            <td>
                              <div className="staff-actions-wrap">
                                <input
                                  type="password"
                                  className="staff-password-input"
                                  placeholder="New password"
                                  value={staffPasswordForm[staff.id] || ""}
                                  onChange={(e) => handleStaffPasswordChange(staff.id, e.target.value)}
                                />
                                <button
                                  type="button"
                                  className="staff-update-password-btn staff-mini-btn"
                                  onClick={() => handleChangeStaffPassword(staff.id)}
                                  disabled={staffActionLoadingId === staff.id}
                                >
                                  {staffActionLoadingId === staff.id ? "Updating..." : "Update Password"}
                                </button>

                                {staffRemoveConfirmId === staff.id ? (
                                  <div className="staff-remove-confirm-inline">
                                    <button
                                      type="button"
                                      className="remove-confirm-yes staff-mini-btn"
                                      onClick={() => handleRemoveStaff(staff.id)}
                                      disabled={staffActionLoadingId === staff.id}
                                    >
                                      {staffActionLoadingId === staff.id ? "Removing..." : "Yes"}
                                    </button>
                                    <button
                                      type="button"
                                      className="remove-confirm-no staff-mini-btn"
                                      onClick={() => setStaffRemoveConfirmId(null)}
                                      disabled={staffActionLoadingId === staff.id}
                                    >
                                      No
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="remove-student-btn staff-mini-btn"
                                    onClick={() => setStaffRemoveConfirmId(staff.id)}
                                    disabled={staffActionLoadingId === staff.id}
                                  >
                                    Remove Security
                                  </button>
                                )}

                                {recentStaffPasswords[staff.id] && (
                                  <p className="staff-temp-password">
                                    Updated Password: {recentStaffPasswords[staff.id]} (visible for 10s)
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {(activeSection === "today" || activeSection === "") && (
              <div className="today-grid today-movements-grid">
                <div className="today-card">
                  <h2>New Requests</h2>
                  {loadingDashboard ? (
                    <p>Loading...</p>
                  ) : todayNewRequests.length === 0 ? (
                    <p className="today-empty">No new outing requests for today.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Destination</th>
                          <th>Leaving</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayNewRequests.map((o) => (
                          <tr key={o.id}>
                            <td>{o.name}</td>
                            <td>{o.student_id}</td>
                            <td>{o.destination}</td>
                            <td>{formatDateTime(o.leaving_date, o.leaving_time)}</td>
                            <td>
                              <span className={`today-status-pill today-status-${o.status}`}>
                                {statusLabel(o.status)}
                              </span>
                            </td>
                            <td>
                              <div className="warden-table-actions">
                                <button
                                  type="button"
                                  className="warden-action-btn reject"
                                  onClick={() => handleWardenReject(o.id)}
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  className="warden-action-btn approve"
                                  onClick={() => handleWardenApprove(o.id)}
                                >
                                  Approve
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="today-card">
                  <h2>Today's Going Homes</h2>
                  {loadingDashboard ? (
                    <p>Loading...</p>
                  ) : dashboardData.today_going_homes.length === 0 ? (
                    <p className="today-empty">No going home notifications for today.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Leaving</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.today_going_homes.map((o) => (
                          <tr key={o.id}>
                            <td>{o.name}</td>
                            <td>{o.student_id}</td>
                            <td>{formatDateTime(o.leaving_date, o.leaving_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="today-card returned-students-card">
                  <h2>Returned Students</h2>
                  {loadingDashboard ? (
                    <p>Loading...</p>
                  ) : todayReturnedStudents.length === 0 ? (
                    <p className="today-empty">No returned students for today.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Destination</th>
                          <th>Leaving</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayReturnedStudents.map((o) => (
                          <tr key={o.id}>
                            <td>{o.name}</td>
                            <td>{o.student_id}</td>
                            <td>{o.destination}</td>
                            <td>{formatDateTime(o.leaving_date, o.leaving_time)}</td>
                            <td>
                              <span className={`today-status-pill today-status-${o.status}`}>
                                {statusLabel(o.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {!activeSection && (
              <div className="main-summary-section">
                <h2>Today's Hostel Summary</h2>
                <div className="main-summary-grid">
                  <div className="main-summary-card">
                    <p className="main-summary-label">Total Students Registered</p>
                    <p className="main-summary-value">{dashboardData.daily_summary.total_students_registered}</p>
                  </div>

                  <div className="main-summary-card">
                    <p className="main-summary-label">Students Outside Hostel</p>
                    <p className="main-summary-value">{dashboardData.daily_summary.students_outside_hostel}</p>
                  </div>

                  <div className="main-summary-card">
                    <p className="main-summary-label">Students in Home Today</p>
                    <p className="main-summary-value">{dashboardData.daily_summary.students_in_home_today}</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "past" && (
              <div className="today-grid past-summaries-grid">
                <div className="today-card past-search-card">
                  <h2>Search Past Outings</h2>
                  <form onSubmit={handlePastSearch} className="search-form">
                    <label>Select Date</label>
                    <div className="search-input-row">
                      <input
                        type="date"
                        value={pastDate}
                        onChange={(e) => setPastDate(e.target.value)}
                      />
                      <button type="submit" className="primary-btn" disabled={pastLoading}>
                        {pastLoading ? "Searching..." : "Search"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="today-card">
                  <h2>Past Outing Summaries</h2>
                  {pastLoading ? (
                    <p>Loading...</p>
                  ) : pastData.past_outings.length === 0 ? (
                    <p className="today-empty">No outing summaries found for selected date.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Destination</th>
                          <th>Leaving</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastData.past_outings.map((o) => (
                          <tr key={o.id}>
                            <td>{o.name}</td>
                            <td>{o.student_id}</td>
                            <td>{o.destination}</td>
                            <td>{formatDateTime(o.leaving_date, o.leaving_time)}</td>
                            <td>
                              <span className={`today-status-pill today-status-${o.status}`}>
                                {statusLabel(o.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="today-card">
                  <h2>Past Going Home Summaries</h2>
                  {pastLoading ? (
                    <p>Loading...</p>
                  ) : pastData.past_going_homes.length === 0 ? (
                    <p className="today-empty">No going home summaries found for selected date.</p>
                  ) : (
                    <table className="today-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Student ID</th>
                          <th>Leaving</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastData.past_going_homes.map((o) => (
                          <tr key={o.id}>
                            <td>{o.name}</td>
                            <td>{o.student_id}</td>
                            <td>{formatDateTime(o.leaving_date, o.leaving_time)}</td>
                            <td>
                              <span className={`today-status-pill today-status-${o.status}`}>
                                {statusLabel(o.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
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