import React from "react";
import "./Home.css";

import Navbar from "../../components/Navbar";
import RoleCard from "../../components/RoleCard";

function Home() {

  return (

    <div className="home">

      <Navbar/>

      <div className="home-body">

        <h1>Select Your Role</h1>

        <p className="subtitle">
          Choose your role to access the hostel management system.
        </p>

        <div className="roles">

          <RoleCard
            title="Student"
            description="Access your hostel information and requests"
            color="linear-gradient(90deg,#3b82f6,#06b6d4)"
            route="/student-login"
            icon="👩‍🎓"
          />

          <RoleCard
            title="Parent"
            description="Monitor your ward's hostel activities"
            color="linear-gradient(90deg,#9333ea,#ec4899)"
            route="/parent-login"
            icon="👨‍👩‍👧"
          />

          <RoleCard
            title="Warden"
            description="Manage hostel operations and approvals"
            color="linear-gradient(90deg,#f59e0b,#ea580c)"
            route="/warden-login"
            icon="🛡"
          />

          <RoleCard
            title="Security"
            description="Monitor entry and exit activities"
            color="linear-gradient(90deg,#ef4444,#e11d48)"
            route="/security-login"
            icon="🔒"
          />

        </div>

      </div>

      <div className="about-section">

        <h2>About This System</h2>

        <div className="about-grid">

          <div>
            <h4>🔒 Secure & Private</h4>
            <p>Your data is protected with modern security.</p>
          </div>

          <div>
            <h4>⚡ Real-time Updates</h4>
            <p>Instant notifications for hostel activities.</p>
          </div>

          <div>
            <h4>📱 Easy to Use</h4>
            <p>Simple interface for all users.</p>
          </div>

          <div>
            <h4>💬 24/7 Support</h4>
            <p>Support team available anytime.</p>
          </div>

        </div>

      </div>

      <footer>

        © 2024 Hostel Management System. All rights reserved.

      </footer>

    </div>
  );
}

export default Home;