import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Auth API
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Outing API
export const createOuting = async (outingData) => {
  const response = await api.post('/outings', outingData);
  return response.data;
};

export const getMyOutings = async () => {
  const response = await api.get('/outings/my-outings');
  return response.data;
};

export const getAllOutings = async () => {
  const response = await api.get('/outings');
  return response.data;
};

export const approveOuting = async (outingId, approvalData) => {
  const response = await api.put(`/outings/${outingId}/approve`, approvalData);
  return response.data;
};

export const rejectOuting = async (outingId, rejectionData) => {
  const response = await api.put(`/outings/${outingId}/reject`, rejectionData);
  return response.data;
};

export const checkOut = async (outingId) => {
  const response = await api.put(`/outings/${outingId}/checkout`);
  return response.data;
};

export const checkIn = async (outingId) => {
  const response = await api.put(`/outings/${outingId}/checkin`);
  return response.data;
};

// Parent API
export const getChildren = async () => {
  const response = await api.get('/parent/children');
  return response.data;
};

export const getChildrenOutings = async () => {
  const response = await api.get('/parent/children-outings');
  return response.data;
};

// Dashboard API
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Warden Registration API
export const registerStudentByWarden = async (studentData) => {
  const response = await api.post('/warden/register-student', studentData);
  return response.data;
};

export const registerParentByWarden = async (parentData) => {
  const response = await api.post('/warden/register-parent', parentData);
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
