import React, { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "./StudentDashboard.css";
import "./CreateOuting.css";

function CreateOuting() {

  const [type,setType] = useState("outing");
  const [destination,setDestination] = useState("");
  const [vehicleNumber,setVehicleNumber] = useState("");
  const [leavingDate,setLeavingDate] = useState("");
  const [leavingTime,setLeavingTime] = useState("");
  const [emergency,setEmergency] = useState(false);
  const [studentId,setStudentId] = useState("");
  const [roomNumber,setRoomNumber] = useState("");

  const handleSubmit = async(e) => {

    e.preventDefault();

    try{

      await axios.post(
        "http://localhost:5000/api/outings/create",
        {
          type,
          destination,
          vehicle_number: vehicleNumber,
          leaving_date: leavingDate,
          leaving_time: leavingTime,
          emergency
        },
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      alert("Outing request submitted!");

      setDestination("");
      setVehicleNumber("");
      setLeavingDate("");
      setLeavingTime("");
      setEmergency(false);
      setStudentId("");
      setRoomNumber("");

    }
    catch(err){

      alert("Failed to create request");

    }

  };

  return(

    <div className="dashboard-page">

      <Navbar/>

      <div className="dashboard-container">

        <Sidebar/>

        <div className="dashboard-content">

          <h1>Create Outing Request</h1>

          <div className="outing-card">

            <form onSubmit={handleSubmit}>

              <label>Type</label>

              <div className="type-options" role="radiogroup" aria-label="Outing type">
                <button
                  type="button"
                  className={`type-option ${type === "outing" ? "active" : ""}`}
                  onClick={() => setType("outing")}
                >
                  Outing
                </button>
                <button
                  type="button"
                  className={`type-option ${type === "home" ? "active" : ""}`}
                  onClick={() => setType("home")}
                >
                  Home
                </button>
              </div>

              <label>Student ID</label>

              <input
 type="text"
 placeholder="Student ID"
 value={studentId}
 onChange={(e)=>setStudentId(e.target.value)}
/>

                <label>Room Number</label>

<input
 type="text"
 placeholder="Room Number"
 value={roomNumber}
 onChange={(e)=>setRoomNumber(e.target.value)}
/>


              <label>Destination</label>

              <input
                type="text"
                placeholder="Enter destination"
                value={destination}
                onChange={(e)=>setDestination(e.target.value)}
              />

              


              <label>Vehicle Number(Optional)</label>

              <input
                type="text"
                placeholder="Enter vehicle number"
                value={vehicleNumber}
                onChange={(e)=>setVehicleNumber(e.target.value)}
              />


              <label>Leaving Date</label>

              <input
                type="date"
                value={leavingDate}
                onChange={(e)=>setLeavingDate(e.target.value)}
              />


              <label>Leaving Time</label>

              <input
                type="time"
                value={leavingTime}
                onChange={(e)=>setLeavingTime(e.target.value)}
              />


              <div className="checkbox-row">

                <input
                  type="checkbox"
                  checked={emergency}
                  onChange={(e)=>setEmergency(e.target.checked)}
                />

                <span>Emergency</span>

              </div>


              <button type="submit" className="submit-btn">
                Submit Request
              </button>

            </form>

          </div>

        </div>

      </div>

    </div>

  );

}

export default CreateOuting;