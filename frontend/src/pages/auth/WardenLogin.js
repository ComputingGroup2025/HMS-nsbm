import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function WardenLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Warden Login"
        description="Access your hostel management tools and student records"
        role="warden"
        icon="👨‍💼"
      />

    </div>

  );
}

export default WardenLogin;