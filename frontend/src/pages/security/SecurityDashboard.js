import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  getTodayOutingsForSecurity
} from '../../services/api';
import api from '../../services/api';
import './SecurityDashboard.css';

const SecurityDashboard = () => {
  const [todayOutings, setTodayOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [searchId, setSearchId] = useState('');
  const [searchTouched, setSearchTouched] = useState(false);

  useEffect(() => {
    fetchOutings();
  }, []);

  const formatDateTime = (date, time) => {
    if (!date && !time) return 'N/A';

    try {
      // Combine date and time if both are available
      let dateTimeString;

      if (date && time) {
        dateTimeString = `${date}T${time}`;
      } else {
        dateTimeString = date || time;
      }

      const d = new Date(dateTimeString);

      if (Number.isNaN(d.getTime())) return 'N/A';

      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  const fetchOutings = async () => {
    try {
      const data = await getTodayOutingsForSecurity();
      setTodayOutings(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outings:', error);
      setLoading(false);
    }
  };

  const markExit = async (outingId) => {
    try {
      await api.put(`/security/exit/${outingId}`);
      fetchOutings();
    } catch (error) {
      console.error('Error marking exit:', error);
      alert('Failed to mark student as left');
    }
  };

  const markReturn = async (outingId) => {
    try {
      await api.put(`/security/return/${outingId}`);
      fetchOutings();
    } catch (error) {
      console.error('Error marking return:', error);
      alert('Failed to mark student as returned');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const filteredOutings = searchId
    ? todayOutings.filter((o) => {
        if (o.student_id === undefined || o.student_id === null) return false;
        const idString = String(o.student_id);
        return idString.toLowerCase().includes(searchId.toLowerCase());
      })
    : todayOutings;

  const readyForExit = filteredOutings.filter(o => o.status === 'approved');
  const currentlyOut = filteredOutings.filter(o => o.status === 'student_left');
  const hasAnyResult = readyForExit.length > 0 || currentlyOut.length > 0;

  return (
    <Layout user={user}>
      <div className="security-dashboard">
        <div className="security-top">
          <div>
            <h1>Security Dashboard</h1>
          </div>
          <div className="security-summary">
            <div className="security-summary-card">
              <h3>Ready for Exit</h3>
              <p>{readyForExit.length}</p>
            </div>
            <div className="security-summary-card">
              <h3>Currently Out</h3>
              <p>{currentlyOut.length}</p>
            </div>
          </div>
          <div className="search-section">
            <h2>Search by Student ID</h2>
            <input
              type="text"
              placeholder="Enter student ID"
              value={searchId}
              onChange={(e) => {
                setSearchId(e.target.value);
                if (!searchTouched) setSearchTouched(true);
              }}
            />
            {searchId && searchTouched && !hasAnyResult && (
              <p className="security-empty search-feedback">
                No approved or active outing found for this student ID.
              </p>
            )}
          </div>
        </div>

        <div className="security-content">
          <div className="security-card">
            <h2>Approved Outings - Ready for Exit</h2>
            {readyForExit.length === 0 ? (
              <p className="security-empty">No approved outings awaiting exit.</p>
            ) : (
              <div className="outings-list">
                {readyForExit.map((outing) => (
                  <div key={outing.id} className="outing-card">
                    <div className="outing-header">
                      <h3>{outing.student_id}</h3>
                      <span className="student-id">
                        Room {outing.room_number}
                      </span>
                    </div>
                    <div className="outing-details">
                      {outing.student_name && (
                        <p>
                          <strong>Name:</strong> {outing.student_name}
                        </p>
                      )}
                      {outing.vehicle_number && (
                        <p>
                          <strong>Vehicle:</strong> {outing.vehicle_number}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => markExit(outing.id)}
                      className="checkout-btn"
                    >
                      Mark Left
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="security-card">
            <h2>Students Currently Out - Mark Return</h2>
            {currentlyOut.length === 0 ? (
              <p className="security-empty">No students currently out.</p>
            ) : (
              <div className="outings-list">
                {currentlyOut.map((outing) => (
                  <div key={outing.id} className="outing-card">
                    <div className="outing-header">
                      <h3>{outing.student_id}</h3>
                      <span className="student-id">
                        Room {outing.room_number}
                      </span>
                    </div>
                    <div className="outing-details">
                      {outing.student_name && (
                        <p>
                          <strong>Name:</strong> {outing.student_name}
                        </p>
                      )}
                      <p>
                        <strong>Left At:</strong>{' '}
                        {formatDateTime(outing.left_time, null)}
                      </p>
                      {outing.vehicle_number && (
                        <p>
                          <strong>Vehicle:</strong> {outing.vehicle_number}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => markReturn(outing.id)}
                      className="checkin-btn"
                    >
                      Mark Arrived
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SecurityDashboard;
