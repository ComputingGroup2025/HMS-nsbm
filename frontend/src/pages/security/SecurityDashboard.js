import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getAllOutings, checkOut, checkIn } from '../../services/api';

const SecurityDashboard = () => {
  const [approvedOutings, setApprovedOutings] = useState([]);
  const [activeOutings, setActiveOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOutings();
  }, []);

  const fetchOutings = async () => {
    try {
      const response = await getAllOutings();
      const allOutings = response.data || [];
      
      // Filter approved outings ready for checkout
      const approved = allOutings.filter(o => o.status === 'approved');
      setApprovedOutings(approved);
      
      // Filter active outings (checked out)
      const active = allOutings.filter(o => o.status === 'checked_out');
      setActiveOutings(active);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching outings:', error);
      setLoading(false);
    }
  };

  const handleCheckOut = async (outingId) => {
    try {
      await checkOut(outingId);
      fetchOutings();
    } catch (error) {
      console.error('Error checking out student:', error);
      alert('Failed to check out student');
    }
  };

  const handleCheckIn = async (outingId) => {
    try {
      await checkIn(outingId);
      fetchOutings();
    } catch (error) {
      console.error('Error checking in student:', error);
      alert('Failed to check in student');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Layout user={user}>
      <div className="security-dashboard">
        <h1>Security Dashboard</h1>
        
        <div className="stats-summary">
          <div className="stat-card">
            <h3>Ready for Checkout</h3>
            <p className="stat-number">{approvedOutings.length}</p>
          </div>
          <div className="stat-card">
            <h3>Currently Out</h3>
            <p className="stat-number">{activeOutings.length}</p>
          </div>
        </div>

        <div className="checkout-section">
          <h2>Approved Outings - Ready for Checkout</h2>
          {approvedOutings.length === 0 ? (
            <p>No approved outings awaiting checkout</p>
          ) : (
            <div className="outings-list">
              {approvedOutings.map((outing) => (
                <div key={outing._id} className="outing-card">
                  <div className="outing-header">
                    <h3>{outing.student?.name}</h3>
                    <span className="student-id">{outing.student?.studentId}</span>
                  </div>
                  <div className="outing-details">
                    <p><strong>Destination:</strong> {outing.destination}</p>
                    <p><strong>Purpose:</strong> {outing.purpose}</p>
                    <p><strong>Departure:</strong> {new Date(outing.outingDate).toLocaleString()}</p>
                    <p><strong>Expected Return:</strong> {new Date(outing.expectedReturnDate).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleCheckOut(outing._id)} className="checkout-btn">
                    Check Out
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="checkin-section">
          <h2>Students Currently Out - Ready for Check-in</h2>
          {activeOutings.length === 0 ? (
            <p>No students currently out</p>
          ) : (
            <div className="outings-list">
              {activeOutings.map((outing) => (
                <div key={outing._id} className="outing-card active">
                  <div className="outing-header">
                    <h3>{outing.student?.name}</h3>
                    <span className="student-id">{outing.student?.studentId}</span>
                  </div>
                  <div className="outing-details">
                    <p><strong>Destination:</strong> {outing.destination}</p>
                    <p><strong>Checked Out:</strong> {outing.actualDepartureDate ? new Date(outing.actualDepartureDate).toLocaleString() : 'N/A'}</p>
                    <p><strong>Expected Return:</strong> {new Date(outing.expectedReturnDate).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleCheckIn(outing._id)} className="checkin-btn">
                    Check In
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SecurityDashboard;
