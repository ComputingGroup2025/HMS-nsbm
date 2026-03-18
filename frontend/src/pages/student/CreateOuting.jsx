import React, { useState } from "react";
import StudentLayout from "../../components/StudentLayout";
import { createOuting } from "../../services/api";
import "./StudentDashboard.css";
import "./CreateOuting.css";

function CreateOuting() {

  const [type, setType] = useState("outing");
  const [destination, setDestination] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [leavingDate, setLeavingDate] = useState("");
  const [leavingTime, setLeavingTime] = useState("");
  const [emergency, setEmergency] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createOuting({
        student_id: studentId,
        room_number: roomNumber,
        destination,
        reason: type === "home" ? "going_home" : "outing",
        leaving_date: leavingDate,
        leaving_time: leavingTime,
        return_date: type === "home" ? null : returnDate,
        return_time: type === "home" ? null : returnTime,
        emergency,
        vehicle_number: vehicleNumber
      });

      setStatusType("success");
      setStatusMessage("Outing request submitted!");

      setDestination("");
      setVehicleNumber("");
      setLeavingDate("");
      setLeavingTime("");
      setEmergency(false);
      setStudentId("");
      setRoomNumber("");
      setReturnDate("");
      setReturnTime("");

    } catch (err) {

      console.error("Create outing error:", err.response || err);
      const message =
        err.response?.data?.message || "Failed to create request";
      setStatusType("error");
      setStatusMessage(message);

    }

  };

  return(
    <StudentLayout
      activeTab="Create Outing"
      breadcrumb="STUDENT / CREATE OUTING"
      title="Create Outing Request"
    >

          {statusMessage && (
            <div className={`outing-status-banner ${statusType}`}>
              {statusMessage}
            </div>
          )}

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


              {type === "outing" && (
                <>
                  <label>Destination</label>

                  <input
                    type="text"
                    placeholder="Enter destination"
                    value={destination}
                    onChange={(e)=>setDestination(e.target.value)}
                  />
                </>
              )}

              


              <label>Vehicle Number (Optional)</label>

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


              {type === "outing" && (
                <>
                  <label>Expected Return Date</label>

                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e)=>setReturnDate(e.target.value)}
                  />

                  <label>Expected Return Time</label>

                  <input
                    type="time"
                    value={returnTime}
                    onChange={(e)=>setReturnTime(e.target.value)}
                  />
                </>
              )}

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
    </StudentLayout>

  );

}

export default CreateOuting;