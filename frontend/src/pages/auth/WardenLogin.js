import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import LoginCard from "../../components/LoginCard";

function WardenLogin(){

  const navigate = useNavigate();

  return(

    <div className="login-wrapper">

      <Navbar />

      <LoginCard
        title="Warden Login"
        description="Access your hostel management tools and student records"
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

export default WardenLogin;