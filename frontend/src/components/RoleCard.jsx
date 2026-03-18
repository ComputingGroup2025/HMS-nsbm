import React from "react";
import "./RoleCard.css";
import { useNavigate } from "react-router-dom";

function RoleCard({ title, description, color, route, icon: Icon }) {
  const navigate = useNavigate();

  const goToRoute = () => {
    navigate(route);
  };

  return (
    <div className="role-card-shell" style={{ "--role-accent": color }}>
      <div
        className="role-card"
        role="button"
        tabIndex={0}
        onClick={goToRoute}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            goToRoute();
          }
        }}
        aria-label={`Open ${title} login`}
      >
        <div className="role-content">
          <div className="role-badge" aria-hidden="true">
            {Icon ? <Icon /> : null}
          </div>

          <h3>{title}</h3>

          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default RoleCard;