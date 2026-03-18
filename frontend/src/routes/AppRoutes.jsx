import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";


/* Pages */
import Home from "../pages/home/Home";

import StudentLogin from "../pages/auth/StudentLogin";
import ParentLogin from "../pages/auth/ParentLogin";
import WardenLogin from "../pages/auth/WardenLogin";
import SecurityLogin from "../pages/auth/SecurityLogin";

import StudentDashboard from "../pages/student/StudentDashboard";
import ParentDashboard from "../pages/parent/ParentDashboard";
import WardenDashboard from "../pages/warden/WardenDashboard";
import SecurityDashboard from "../pages/security/SecurityDashboard";

import CreateOuting from '../pages/student/CreateOuting';
import MyRequests from "../pages/student/MyRequests";
import OutingHistory from "../pages/student/OutingHistory";



/* Protected Route */

const ProtectedRoute = ({ children, allowedRoles }) => {

  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};


/* App Routes */
const AppRoutes = () => {

  return (

    <Routes>

      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Login Routes */}
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/parent-login" element={<ParentLogin />} />
      <Route path="/warden-login" element={<WardenLogin />} />
      <Route path="/security-login" element={<SecurityLogin />} />
      


      {/* ================= STUDENT ================= */}

      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
 path="/student/create-outing"
 element={
   <ProtectedRoute allowedRoles={['student']}>
     <CreateOuting/>
   </ProtectedRoute>
 }
/>

      <Route
 path="/student/my-requests"
 element={
   <ProtectedRoute allowedRoles={['student']}>
     <MyRequests/>
   </ProtectedRoute>
 }
/>

<Route
 path="/student/outing-history"
 element={
   <ProtectedRoute allowedRoles={['student']}>
     <OutingHistory/>
   </ProtectedRoute>
 }
/>


      {/* ================= PARENT ================= */}

      <Route
        path="/parent"
        element={
          <ProtectedRoute allowedRoles={["parent"]}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />


      {/* ================= WARDEN ================= */}

      <Route
        path="/warden"
        element={
          <ProtectedRoute allowedRoles={["warden"]}>
            <WardenDashboard />
          </ProtectedRoute>
        }
      />


      {/* ================= SECURITY ================= */}

      <Route
        path="/security"
        element={
          <ProtectedRoute allowedRoles={["security"]}>
            <SecurityDashboard />
          </ProtectedRoute>
        }
      />


      {/* 404 Page */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>

  );
};

export default AppRoutes;