import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function StudentLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Student Login"
        description="Access your hostel information, complaints, and notifications"
        icon="👨‍🎓"
      />

    </div>

  );
}

export default StudentLogin;