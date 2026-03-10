import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { getChildrenOutings, approveOuting, rejectOuting } from '../../services/api';

const ParentDashboard = () => {
  const [outings, setOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchChildrenOutings();
  }, []);

  const fetchChildrenOutings = async () => {
    try {
      const response = await getChildrenOutings();
      setOutings(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching children outings:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (outingId) => {
    try {
      await approveOuting(outingId, { role: 'parent' });
      fetchChildrenOutings();
    } catch (error) {
      console.error('Error approving outing:', error);
    }
  };

  const handleReject = async (outingId) => {
    try {
      await rejectOuting(outingId, { role: 'parent' });
      fetchChildrenOutings();
    } catch (error) {
      console.error('Error rejecting outing:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Layout user={user}>
      <div className="parent-dashboard">
        <h1>Parent Dashboard</h1>
        
        <div className="pending-requests">
          <h2>Pending Approval Requests</h2>
          {outings.filter(o => o.parentApproval === 'pending').length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <div className="requests-list">
              {outings.filter(o => o.parentApproval === 'pending').map((outing) => (
                <div key={outing._id} className="request-card">
                  <div className="request-header">
                    <h3>{outing.destination}</h3>
                    <span className="student-name">Student: {outing.student?.name}</span>
                  </div>
                  <div className="request-details">
                    <p><strong>Purpose:</strong> {outing.purpose}</p>
                    <p><strong>Outing Date:</strong> {new Date(outing.outingDate).toLocaleString()}</p>
                    <p><strong>Return Date:</strong> {new Date(outing.expectedReturnDate).toLocaleString()}</p>
                  </div>
                  <div className="request-actions">
                    <button onClick={() => handleApprove(outing._id)} className="approve-btn">
                      Approve
                    </button>
                    <button onClick={() => handleReject(outing._id)} className="reject-btn">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="all-requests">
          <h2>All Outing Requests</h2>
          <div className="requests-list">
            {outings.map((outing) => (
              <div key={outing._id} className="request-card">
                <div className="request-header">
                  <h3>{outing.destination}</h3>
                  <span className={`status ${outing.status}`}>{outing.status}</span>
                </div>
                <div className="request-details">
                  <p><strong>Student:</strong> {outing.student?.name}</p>
                  <p><strong>Purpose:</strong> {outing.purpose}</p>
                  <p><strong>Parent Status:</strong> {outing.parentApproval}</p>
                  <p><strong>Warden Status:</strong> {outing.wardenApproval}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
