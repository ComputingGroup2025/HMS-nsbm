import React from "react";
import "./Home.css";
import {
  FiUser,
  FiUsers,
  FiUserCheck,
  FiShield,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import RoleCard from "../../components/RoleCard";

function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="home">
      <Navbar />

      <main className="home-main">
        <section className="home-hero">
          <p className="hero-tag">NSBM Hostel Portal</p>
          <h1>Select your role</h1>
          <p className="subtitle">
            Access the hostel management system with role-based tools and a
            secure workflow.
          </p>

          <div className="roles">
          <RoleCard
            title="Student"
            description="Access hostel info and requests"
            color="linear-gradient(90deg,#3b82f6,#06b6d4)"
            route="/student-login"
            icon={FiUser}
          />

          <RoleCard
            title="Parent"
            description="Track your ward's hostel activity"
            color="linear-gradient(90deg,#9333ea,#ec4899)"
            route="/parent-login"
            icon={FiUsers}
          />

          <RoleCard
            title="Warden"
            description="Manage operations and approvals"
            color="linear-gradient(90deg,#f59e0b,#ea580c)"
            route="/warden-login"
            icon={FiUserCheck}
          />

          <RoleCard
            title="Security"
            description="Monitor entry and exit"
            color="linear-gradient(90deg,#ef4444,#e11d48)"
            route="/security-login"
            icon={FiShield}
          />
          </div>
        </section>

        <footer>© {currentYear} Hostel Management System. All rights reserved.</footer>
      </main>
    </div>
  );
}

export default Home;