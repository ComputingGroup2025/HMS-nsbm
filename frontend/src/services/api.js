import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRedirectingForAuthError = false;

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    const message = String(error.response?.data?.message || '').toLowerCase();

    const isTokenError =
      statusCode === 401 ||
      (statusCode === 403 && message.includes('token'));

    if (isTokenError && !isRedirectingForAuthError) {
      isRedirectingForAuthError = true;

      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');

      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const parentLogin = async (credentials) => {
  const response = await api.post('/auth/parent-login', credentials);
  return response.data;
};

// Outing API
export const createOuting = async (outingData) => {
  const response = await api.post('/outings/create', outingData);
  return response.data;
};

export const getMyOutings = async () => {
  const response = await api.get('/outings/my-requests');
  return response.data;
};

export const getOutingHistory = async () => {
  const response = await api.get('/outings/history');
  return response.data;
};

export const cancelMyOuting = async (outingId) => {
  const response = await api.delete(`/outings/cancel/${outingId}`);
  return response.data;
};

// Parent approval API
export const parentApproveOuting = async (outingId) => {
  const response = await api.put(`/parent/approve/${outingId}`);
  return response.data;
};

export const parentRejectOuting = async (outingId) => {
  const response = await api.put(`/parent/reject/${outingId}`);
  return response.data;
};

// Parent API
export const getParentOutings = async () => {
  const response = await api.get('/parent/requests');
  return response.data;
};

// Warden Registration & approvals API
export const registerStudentByWarden = async (studentData) => {
  const response = await api.post('/warden/register-student', studentData);
  return response.data;
};

export const registerParentByWarden = async (parentData) => {
  const response = await api.post('/warden/register-parent', parentData);
  return response.data;
};

export const wardenApproveOuting = async (outingId) => {
  const response = await api.put(`/warden/approve/${outingId}`);
  return response.data;
};

export const wardenRejectOuting = async (outingId) => {
  const response = await api.put(`/warden/reject/${outingId}`);
  return response.data;
};

export const registerSecurityByWarden = async (securityData) => {
  try {
    const response = await api.post('/warden/register-security', securityData);
    return response.data;
  } catch (error) {
    // Fallback for setups where security registration is handled by auth/register
    if (error.response?.status === 404) {
      const fallbackResponse = await api.post('/auth/register', {
        name: securityData.full_name,
        email: securityData.email,
        password: securityData.password,
        role: 'security'
      });
      return fallbackResponse.data;
    }
    throw error;
  }
};

export const searchStudentAndParentByStudentId = async (studentId) => {
  const response = await api.get(`/warden/search/${encodeURIComponent(studentId)}`);
  return response.data;
};

export const removeStudentByStudentId = async (studentId) => {
  const response = await api.delete(`/warden/remove-student/${encodeURIComponent(studentId)}`);
  return response.data;
};

export const resetStudentParentPasswordsByStudentId = async (studentId, payload) => {
  const response = await api.post(`/warden/reset-passwords/${encodeURIComponent(studentId)}`, payload);
  return response.data;
};

export const searchStaffByName = async (name) => {
  const response = await api.get('/warden/search-staff', {
    params: { name }
  });
  return response.data;
};

export const resetStaffPassword = async (staffId, newPassword) => {
  const response = await api.post(`/warden/reset-staff-password/${staffId}`, { newPassword });
  return response.data;
};

export const removeStaff = async (staffId) => {
  const response = await api.delete(`/warden/remove-staff/${staffId}`);
  return response.data;
};

// Warden dashboard API
export const getWardenDashboard = async () => {
  const response = await api.get('/dashboard/warden');
  return response.data;
};

export const getWardenPastSummariesByDate = async (date) => {
  const response = await api.get('/dashboard/warden/past-summaries', {
    params: { date }
  });
  return response.data;
};

// Security API
export const getTodayOutingsForSecurity = async () => {
  const response = await api.get('/security/today');
  return response.data;
};

// User API
export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export default api;
