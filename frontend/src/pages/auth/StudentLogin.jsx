import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";
import { FaUserGraduate } from "react-icons/fa6";

function StudentLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Student Login"
        description="Access your hostel information, complaints, and notifications"
        role="student"
        icon={FaUserGraduate}
      />

    </div>

  );
}

export default StudentLogin;