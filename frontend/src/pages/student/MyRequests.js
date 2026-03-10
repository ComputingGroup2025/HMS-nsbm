import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import axios from "axios";
import "./MyRequests.css";

function MyRequests() {

  const [requests,setRequests] = useState([]);

  useEffect(() => {

    fetchRequests();

  }, []);

  const fetchRequests = async () => {

    try{

      const res = await axios.get(
        "http://localhost:5000/api/outings/my-requests",
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setRequests(res.data);

    }
    catch(err){

      console.error(err);

    }

  };

  return(

    <div className="dashboard-page">

      <Navbar/>

      <div className="dashboard-container">

        <Sidebar/>

        <div className="dashboard-content">

          <h1>My Outing Requests</h1>

          <div className="requests-table">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Destination</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Emergency</th>
                </tr>

              </thead>

              <tbody>

                {requests.map((req)=>(
                  <tr key={req.id}>

                    <td>{req.id}</td>

                    <td>{req.type}</td>

                    <td>{req.destination}</td>

                    <td>{req.leaving_date}</td>

                    <td>{req.leaving_time}</td>

                    <td>
                      <span className={`status ${req.status}`}>
                        {req.status}
                      </span>
                    </td>

                    <td>
                      {req.emergency ? "Yes" : "No"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default MyRequests;