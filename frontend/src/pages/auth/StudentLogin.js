import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function StudentLogin(){

  const navigate = useNavigate();

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Student Login"
        description="Access your hostel information, complaints, and notifications"
        icon="👨‍🎓"
      />

      <button
        className="back-home-floating"
        onClick={()=>navigate("/")}
      >
        ← Back to Home
      </button>

    </div>

  );
}

export default StudentLogin;