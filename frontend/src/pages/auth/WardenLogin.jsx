import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";
import { FaUserShield } from "react-icons/fa6";

function WardenLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Warden Login"
        description="Access your hostel management tools and student records"
        role="warden"
        icon={FaUserShield}
      />

    </div>

  );
}

export default WardenLogin;