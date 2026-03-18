import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";
import { FaShieldHalved } from "react-icons/fa6";

function SecurityLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Security Login"
        description="Access your security management tools and surveillance systems"
        role="security"
        icon={FaShieldHalved}
      />

    </div>

  );
}

export default SecurityLogin;