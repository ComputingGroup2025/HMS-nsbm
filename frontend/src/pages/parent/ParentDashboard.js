import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  getParentOutings,
  parentApproveOuting,
  parentRejectOuting
} from '../../services/api';
import './ParentDashboard.css';

const ParentDashboard = () => {
  const [outings, setOutings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchOutings();
  }, []);

  const fetchOutings = async () => {
    try {
      const data = await getParentOutings();
      setOutings(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching child outings:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (outingId) => {
    try {
      // Optimistic UI update
      setOutings((prev) =>
        prev.map((o) =>
          o.id === outingId ? { ...o, status: 'pending_warden' } : o
        )
      );
      await parentApproveOuting(outingId);
      fetchOutings(); // ensure sync with backend state
    } catch (error) {
      console.error('Error approving outing:', error);
    }
  };

  const handleReject = async (outingId) => {
    try {
      // Optimistic UI update
      setOutings((prev) =>
        prev.map((o) =>
          o.id === outingId ? { ...o, status: 'rejected_by_parent' } : o
        )
      );
      await parentRejectOuting(outingId);
      fetchOutings();
    } catch (error) {
      console.error('Error rejecting outing:', error);
    }
  };

  if (loading) {
    return (
      <Layout user={user}>
        <div className="parent-dashboard loading-state">
          <div className="spinner" />
          <p>Loading your child's outing requests...</p>
        </div>
      </Layout>
    );
  }

  const pending = outings.filter(o => o.status === 'pending_parent');

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'Not specified';

    try {
      // date from API may already be ISO with time portion
      const base = new Date(date);

      if (time) {
        const [h = '0', m = '0'] = String(time).split(':');
        base.setHours(Number(h), Number(m));
      }

      return base.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return `${date} ${time}`;
    }
  };

  const capitalize = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ') : '';

  const statusLabel = (status) => {
    if (status === 'pending_parent') return 'Pending (Parent)';
    if (status === 'pending_warden') return 'Pending (Warden)';
    if (status === 'approved') return 'Approved';
    if (status === 'rejected_by_parent') return 'Rejected by Parent';
    if (status === 'rejected_by_warden') return 'Rejected by Warden';
    return capitalize(status);
  };

  return (
    <Layout user={user}>
      <div className="parent-dashboard">
        <header className="parent-header">
          <div>
            <h1>Parent Dashboard</h1>
            <p className="parent-subtitle">
              Review and manage your child's outing and home-going requests.
            </p>
          </div>
          <div className="parent-summary">
            <div className="summary-item">
              <span className="summary-label">Pending</span>
              <span className="summary-value">{pending.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Requests</span>
              <span className="summary-value">{outings.length}</span>
            </div>
          </div>
        </header>

        <section className="card-section">
          <div className="section-header">
            <h2>Pending Approval Requests</h2>
            <p>These requests are waiting for your decision.</p>
          </div>

          {pending.length === 0 ? (
            <div className="empty-state">
              <p>No pending requests at the moment.</p>
            </div>
          ) : (
            <div className="requests-grid">
              {pending.map((outing) => (
                <article key={outing.id} className="request-card">
                  <div className="request-top">
                    <div>
                      <h3>{outing.destination || 'Going Home'}</h3>
                      <p className="student-label">
                        Student: <span>{outing.student_name || outing.student_id}</span>
                      </p>
                    </div>
                    <span className={`pill pill-${outing.reason}`}>
                      {outing.reason === 'outing' ? 'Outing' : 'Going Home'}
                    </span>
                  </div>

                  <div className="request-meta">
                    <div>
                      <span className="meta-label">📅 Leaving</span>
                      <span className="meta-value">
                        {formatDateTime(outing.leaving_date, outing.leaving_time)}
                      </span>
                    </div>
                    {outing.return_date && (
                      <div>
                        <span className="meta-label">⏰ Expected Return</span>
                        <span className="meta-value">
                          {formatDateTime(outing.return_date, outing.return_time)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="request-actions">
                    <button
                      onClick={() => handleReject(outing.id)}
                      className="btn btn-outline"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(outing.id)}
                      className="btn btn-primary"
                    >
                      Approve
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card-section">
          <div className="section-header">
            <h2>All Outing Requests</h2>
            <p>History of all requests submitted by your child.</p>
          </div>

          {outings.length === 0 ? (
            <div className="empty-state">
              <p>No outing history available yet.</p>
            </div>
          ) : (
            <div className="requests-table-wrapper">
              <table className="requests-table">
                <thead>
                  <tr>
                    <th>Destination / Type</th>
                    <th>Student ID</th>
                    <th>Leaving</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {outings.map((outing) => (
                    <tr key={outing.id}>
                      <td>
                        <div className="table-main">
                          <span className="table-title">
                            {outing.destination || 'Going Home'}
                          </span>
                          <span className={`pill pill-xs pill-${outing.reason}`}>
                            {outing.reason === 'outing' ? 'Outing' : 'Going Home'}
                          </span>
                        </div>
                      </td>
                      <td>{outing.student_name || outing.student_id}</td>
                      <td>{formatDateTime(outing.leaving_date, outing.leaving_time)}</td>
                      <td>
                        <span className={`status-pill status-${outing.status}`}>
                          {statusLabel(outing.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default ParentDashboard;
