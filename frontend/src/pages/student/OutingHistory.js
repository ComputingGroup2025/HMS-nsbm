import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import "./OutingHistory.css";

function OutingHistory() {

  const [history,setHistory] = useState([]);

  useEffect(()=>{

    fetchHistory();

  },[]);

  const fetchHistory = async () => {

    try{

      const res = await axios.get(
        "http://localhost:5000/api/outings/history",
        {
          headers:{
            Authorization:`Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      setHistory(res.data);

    }catch(err){

      console.error(err);

    }

  };

  return (

    <div className="dashboard-page">

      <Navbar/>

      <div className="dashboard-container">

        <Sidebar/>

        <div className="dashboard-content">

          <h1>Outing History Timeline</h1>

          {history.map((request)=>(
            
            <div className="timeline-card" key={request.id}>

              <h3>Request #{request.id}</h3>

              <div className="timeline">

                {request.events.map((event,index)=>(
                  
                  <div className="timeline-item" key={index}>

                    <div className="timeline-dot"></div>

                    <div className="timeline-content">

                      <h4>{event.title}</h4>

                      <p>{event.description}</p>

                      <span>{event.time}</span>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}

export default OutingHistory;