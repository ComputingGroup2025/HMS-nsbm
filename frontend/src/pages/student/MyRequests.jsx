import React, { useEffect, useState } from "react";
import StudentLayout from "../../components/StudentLayout";
import { cancelMyOuting, getMyOutings } from "../../services/api";
import "./StudentDashboard.css";
import "./MyRequests.css";

function MyRequests() {

  const [requests, setRequests] = useState([]);
  const [cancelLoadingId, setCancelLoadingId] = useState(null);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const REFRESH_INTERVAL_MS = 5000;

  const isCancelable = (status) => {
    return ["pending_parent", "pending_warden", "approved"].includes(status);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const raw = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    if (raw.includes("T")) {
      return raw.split("T")[0];
    }

    return raw;
  };

  useEffect(() => {
    fetchRequests();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchRequests();
      }
    }, REFRESH_INTERVAL_MS);

    const handleWindowFocus = () => {
      fetchRequests();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchRequests();
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

  const fetchRequests = async () => {

    try {

      const data = await getMyOutings();
      setRequests(data);

    } catch (err) {

      console.error(err);
      setStatusType("error");
      setStatusMessage("Failed to load requests");

    }

  };

  const handleCancel = async (requestId) => {
    setCancelLoadingId(requestId);

    try {
      await cancelMyOuting(requestId);
      await fetchRequests();
      setStatusType("success");
      setStatusMessage("Request cancelled successfully");
    } catch (err) {
      console.error(err);
      setStatusType("error");
      setStatusMessage(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelLoadingId(null);
      setPendingCancelId(null);
    }
  };

  return(
    <StudentLayout
      activeTab="My Requests"
      breadcrumb="STUDENT / REQUESTS"
      title="My Outing Requests"
    >

          {statusMessage && (
            <div className={`request-status-banner ${statusType}`}>
              {statusMessage}
            </div>
          )}

          {pendingCancelId && (
            <div className="cancel-confirm-box">
              <p>Cancel this request?</p>
              <div className="cancel-confirm-actions">
                <button
                  className="cancel-confirm-btn cancel-confirm-btn-danger"
                  onClick={() => handleCancel(pendingCancelId)}
                  disabled={cancelLoadingId === pendingCancelId}
                >
                  {cancelLoadingId === pendingCancelId ? "Cancelling..." : "Yes, Cancel"}
                </button>
                <button
                  className="cancel-confirm-btn"
                  onClick={() => setPendingCancelId(null)}
                  disabled={cancelLoadingId === pendingCancelId}
                >
                  Keep Request
                </button>
              </div>
            </div>
          )}

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
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {requests.map((req)=>(
                  <tr key={req.id}>

                    <td>{req.id}</td>

                    <td>{req.reason}</td>

                    <td>{req.destination}</td>

                    <td>{formatDate(req.leaving_date)}</td>

                    <td>{req.leaving_time}</td>

                    <td>
                      <span className={`status ${req.status}`}>
                        {req.status}
                      </span>
                    </td>

                    <td>
                      {req.emergency ? "Yes" : "No"}
                    </td>

                    <td>
                      {isCancelable(req.status) ? (
                        <button
                          className="cancel-request-btn"
                          onClick={() => {
                            setPendingCancelId(req.id);
                            setStatusMessage("");
                            setStatusType("");
                          }}
                          disabled={cancelLoadingId === req.id}
                        >
                          {cancelLoadingId === req.id ? "Cancelling..." : "Cancel"}
                        </button>
                      ) : (
                        <span className="action-muted">-</span>
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
    </StudentLayout>

  );

}

export default MyRequests;