import React from "react";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function SecurityLogin(){

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Security Login"
        description="Access your security management tools and surveillance systems"
        role="security"
        icon="👨‍💼"
      />

    </div>

  );
}

export default SecurityLogin;