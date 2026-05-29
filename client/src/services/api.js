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
  sendOTP: (phone) =>
    api.post('/auth/send-otp', { phone }),
  
  verifyOTP: (data) =>
    api.post('/auth/verify-otp', data),

  googleAuth: (googleData) =>
    api.post('/auth/google-auth', googleData),

  register: (name, email, password, phone) =>
    api.post('/auth/register', { name, email, password, phone }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  adminLogin: (email, password) =>
    api.post('/auth/admin-login', { email, password }),

  verify: () =>
    api.get('/auth/verify'),

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
  
  updateReportPriority: (id, priority) =>
    api.patch(`/reports/${id}/priority`, { priority }),
  
  upvoteReport: (id) =>
    api.post(`/reports/${id}/upvote`),
  
  addComment: (id, text) =>
    api.post(`/reports/${id}/comments`, { text }),
  
  addVoiceNote: (id, voiceUrl, duration) =>
    api.post(`/reports/${id}/voice-notes`, { voiceUrl, duration }),
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
  
  updateReportStatus: (id, status) =>
    api.patch(`/admin/reports/${id}/status`, { status }),
  
  resolveReport: (id, resolutionNotes) =>
    api.patch(`/admin/reports/${id}/resolve`, { resolutionNotes }),
  
  getStats: () =>
    api.get('/admin/stats'),

  createAdminCredentials: (credentials) =>
    api.post('/auth/admin/create-credentials', credentials),
}

// Analytics Services
export const analyticsService = {
  getByCategory: () =>
    api.get('/analytics/by-category'),
  
  getByStatus: () =>
    api.get('/analytics/by-status'),
  
  getResponseTimes: () =>
    api.get('/analytics/response-times'),

  getByDate: (days = 30) =>
    api.get('/analytics/by-date', { params: { days } }),
}

// Notification Services
export const notificationService = {
  getNotifications: (page = 1, limit = 20, unreadOnly = false) =>
    api.get('/notifications', { params: { page, limit, unreadOnly } }),
  
  getUnreadCount: () =>
    api.get('/notifications/count/unread'),
  
  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/all/read'),
  
  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`),
}

// Message Services
export const messageService = {
  getMessagesForReport: (reportId, page = 1, limit = 50) =>
    api.get(`/messages/report/${reportId}`, { params: { page, limit } }),
  
  sendMessage: (reportId, recipientId, content, attachments = []) =>
    api.post('/messages', { reportId, recipientId, content, attachments }),
  
  markMessageAsRead: (id) =>
    api.patch(`/messages/${id}/read`),
  
  getUnreadMessageCount: () =>
    api.get('/messages/count/unread'),
}

export default api

