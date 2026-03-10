import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { getMyOutings } from "../../services/api";
import "./MyRequests.css";

function MyRequests() {

  const [requests, setRequests] = useState([]);

  useEffect(() => {

    fetchRequests();

  }, []);

  const fetchRequests = async () => {

    try {

      const data = await getMyOutings();
      setRequests(data);

    } catch (err) {

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
                  <th>Reason</th>
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

                    <td>{req.reason}</td>

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