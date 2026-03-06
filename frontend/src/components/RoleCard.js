import React from "react";
import "./RoleCard.css";
import { useNavigate } from "react-router-dom";

function RoleCard({title,description,color,route,icon}) {

  const navigate = useNavigate();

  return (

    <div className="role-card">

      <div
        className="role-top"
        style={{background:color}}
      />

      <div className="role-content">

        <div className="role-icon">
          {icon}
        </div>

        <h3>{title}</h3>

        <p>{description}</p>

        <button
          onClick={()=>navigate(route)}
        >
          Continue
        </button>

      </div>

    </div>
  );
}

export default RoleCard;