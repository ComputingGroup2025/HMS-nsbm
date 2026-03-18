import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/StudentLayout";
import { getOutingHistory } from "../../services/api";
import "./StudentDashboard.css";
import "./OutingHistory.css";

function OutingHistory() {

  const [history, setHistory] = useState([]);
  const REFRESH_INTERVAL_MS = 5000;

  useEffect(() => {
    fetchHistory();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchHistory();
      }
    }, REFRESH_INTERVAL_MS);

    const handleWindowFocus = () => {
      fetchHistory();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchHistory();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const fetchHistory = async () => {

    try {

      const data = await getOutingHistory();
      setHistory(data);

    } catch (err) {

      console.error(err);

    }

  };

  return (
    <StudentLayout
      activeTab="Outing History"
      breadcrumb="STUDENT / HISTORY"
      title="Outing History Timeline"
    >

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
    </StudentLayout>

  );

}

export default OutingHistory;