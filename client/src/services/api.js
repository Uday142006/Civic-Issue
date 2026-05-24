import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth Services
export const authService = {
  // Phone OTP
  sendOTP: (phone) =>
    api.post('/auth/send-otp', { phone }),
  
  verifyOTP: (data) =>
    api.post('/auth/verify-otp', data),

  // Google OAuth
  googleAuth: (googleData) =>
    api.post('/auth/google-auth', googleData),

  // Traditional Email/Password
  register: (name, email, password, phone) =>
    api.post('/auth/register', { name, email, password, phone }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  // Admin Login
  adminLogin: (email, password) =>
    api.post('/auth/admin-login', { email, password }),

  // Verify Token
  verify: () =>
    api.get('/auth/verify'),

  // Logout
  logout: () =>
    api.post('/auth/logout'),
}

// Report Services
export const reportService = {
  createReport: (reportData) =>
    api.post('/reports', reportData),
  
  getReports: (filters) =>
    api.get('/reports', { params: filters }),
  
  getReportById: (id) =>
    api.get(`/reports/${id}`),
  
  updateReportStatus: (id, status) =>
    api.patch(`/reports/${id}/status`, { status }),
  
  upvoteReport: (id) =>
    api.post(`/reports/${id}/upvote`),
  
  addComment: (id, comment) =>
    api.post(`/reports/${id}/comments`, { comment }),
}

// User Services
export const userService = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (userData) =>
    api.put('/users/profile', userData),
}

// Admin Services
export const adminService = {
  getAllReports: (filters) =>
    api.get('/admin/reports', { params: filters }),
  
  assignReport: (id, assignedTo, department) =>
    api.patch(`/admin/reports/${id}/assign`, { assignedTo, department }),
  
  resolveReport: (id, resolutionNotes) =>
    api.patch(`/admin/reports/${id}/resolve`, { resolutionNotes }),
  
  getStats: () =>
    api.get('/admin/stats'),

  // Create admin credentials (for initial setup)
  createAdminCredentials: (credentials) =>
    api.post('/auth/admin/create-credentials', credentials),
}

// Analytics Services
export const analyticsService = {
  getByCategory: () =>
    api.get('/analytics/by-category'),
  
  getByStatus: () =>
    api.get('/analytics/by-status'),

  getByDate: () =>
    api.get('/analytics/by-date'),
  
  getResponseTimes: () =>
    api.get('/analytics/response-times'),
}

export const apiService = {
  authService,
  reportService,
  userService,
  adminService,
  analyticsService,
}

export default api

