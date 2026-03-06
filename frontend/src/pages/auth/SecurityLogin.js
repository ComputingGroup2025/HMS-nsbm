import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function SecurityLogin(){

  const navigate = useNavigate();

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Security Login"
        description="Access your security management tools and surveillance systems"
        icon="👨‍💼"
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

export default SecurityLogin;