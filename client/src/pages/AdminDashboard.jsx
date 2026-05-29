import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { adminService, analyticsService, reportService, messageService } from '../services/api'
import AnalyticsDashboard from './AnalyticsDashboard'
import './AdminDashboard.css'

function AdminDashboard() {
  const user = useSelector((state) => state.auth.user)
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    acknowledgedReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
    byPriority: [],
    byDepartment: [],
  })
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    department: '',
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [messageText, setMessageText] = useState('')
  const [reportPriority, setReportPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard, reports, analytics

  // Fetch data
  useEffect(() => {
    fetchStats()
    fetchReports()
  }, [filters])

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats()
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchReports = async () => {
    try {
      const response = await adminService.getAllReports(filters)
      setReports(response.data.reports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleResolveReport = async (reportId) => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes')
      return
    }

    setLoading(true)
    try {
      await adminService.resolveReport(reportId, resolutionNotes)
      setSelectedReport(null)
      setResolutionNotes('')
      fetchReports()
      fetchStats()
      alert('Report resolved successfully!')
    } catch (error) {
      alert('Error resolving report')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (reportId) => {
    if (!messageText.trim()) {
      alert('Please enter a message')
      return
    }

    setSendingMessage(true)
    try {
      const report = selectedReport || reports.find(r => r._id === reportId)
      await messageService.sendMessage(
        reportId,
        report.submittedBy._id,
        messageText
      )
      setMessageText('')
      alert('Message sent successfully!')
      fetchReports()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleUpdatePriority = async (reportId, newPriority) => {
    try {
      await reportService.updateReportPriority(reportId, newPriority)
      setReportPriority(newPriority)
      fetchReports()
      alert('Priority updated!')
    } catch (error) {
      console.error('Error updating priority:', error)
    }
  }

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await adminService.updateReportStatus(reportId, newStatus)
      fetchReports()
      fetchStats()
      alert('Status updated!')
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <h1>Municipal Administration Dashboard 🏛️</h1>
          <p>Manage citizen reports and track resolution progress</p>
        </div>
        <div className="admin-user-info">
          <span className="admin-badge">👨‍💼 ADMIN</span>
          <span className="user-name">{user?.name}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`tab-link ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📋 All Reports
        </button>
        <button
          className={`tab-link ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-label">Total Reports</div>
                <div className="stat-number">{stats.totalReports}</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <div className="stat-label">Pending</div>
                <div className="stat-number">{stats.pendingReports}</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">🔄</div>
              <div className="stat-info">
                <div className="stat-label">In Progress</div>
                <div className="stat-number">{stats.inProgressReports}</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <div className="stat-label">Resolved</div>
                <div className="stat-number">{stats.resolvedReports}</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-label">Total Citizens</div>
                <div className="stat-number">{stats.totalUsers}</div>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          {stats.byPriority && stats.byPriority.length > 0 && (
            <div className="dashboard-card">
              <h3>Reports by Priority</h3>
              <div className="priority-breakdown">
                {stats.byPriority.map((item) => (
                  <div key={item._id} className="priority-item">
                    <span className={`priority-label priority-${item._id}`}>
                      {item._id.toUpperCase()}
                    </span>
                    <span className="priority-count">{item.count} reports</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution Rate */}
          <div className="dashboard-card">
            <h3>Resolution Overview</h3>
            <div className="resolution-chart">
              <div className="progress-item">
                <div className="progress-label">Resolution Rate</div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width:
                        stats.totalReports > 0
                          ? `${(stats.resolvedReports / stats.totalReports) * 100}%`
                          : '0%',
                    }}
                  ></div>
                </div>
                <div className="progress-percent">
                  {stats.totalReports > 0
                    ? `${Math.round((stats.resolvedReports / stats.totalReports) * 100)}%`
                    : '0%'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <button
                className="action-btn"
                onClick={() => setActiveTab('reports')}
              >
                🔍 View All Reports
              </button>
              <button className="action-btn">📊 View Analytics</button>
              <button className="action-btn">📋 Export Report</button>
              <button className="action-btn">⚙️ Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* All Reports Tab */}
      {activeTab === 'reports' && (
        <div className="admin-content">
          {/* Filters */}
          <div className="filters-section">
            <h3>Filters</h3>
            <div className="filters-grid">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">All Categories</option>
                <option value="road_damage">Road Damage</option>
                <option value="garbage">Garbage</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="street_light">Street Light</option>
                <option value="drainage">Drainage</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={filters.department}
                onChange={(e) =>
                  setFilters({ ...filters, department: e.target.value })
                }
              >
                <option value="">All Departments</option>
                <option value="roads">Roads</option>
                <option value="sanitation">Sanitation</option>
                <option value="utilities">Utilities</option>
                <option value="public_works">Public Works</option>
              </select>
            </div>
          </div>

          {/* Reports List */}
          <div className="reports-section">
            <h3>Reports ({reports.length})</h3>
            {reports.length > 0 ? (
              <div className="reports-table">
                {reports.map((report) => (
                  <div key={report._id} className="report-row">
                    <div className="report-col-left">
                      <h4>{report.title}</h4>
                      <p className="report-category">{report.category}</p>
                    </div>
                    <div className="report-col-mid">
                      <span className={`status-badge status-${report.status}`}>
                        {report.status}
                      </span>
                      <span className={`priority-badge priority-${report.priority}`}>
                        {report.priority}
                      </span>
                    </div>
                    <div className="report-col-right">
                      <button
                        className="view-btn"
                        onClick={() => {
                          setSelectedReport(report)
                          setReportPriority(report.priority)
                        }}
                      >
                        👁️ View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No reports found</p>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && <AnalyticsDashboard />}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="modal-content large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              onClick={() => setSelectedReport(null)}
            >
              ✕
            </button>

            <h2>{selectedReport.title}</h2>

            <div className="modal-badges">
              <span className={`status-badge status-${selectedReport.status}`}>
                {selectedReport.status}
              </span>
              <span className={`priority-badge priority-${selectedReport.priority}`}>
                {selectedReport.priority}
              </span>
            </div>

            <p className="report-description">{selectedReport.description}</p>

            {selectedReport.images && selectedReport.images.length > 0 && (
              <div className="modal-images">
                <h4>Images ({selectedReport.images.length})</h4>
                {selectedReport.images.map((img, idx) => (
                  <img key={idx} src={img.url} alt={`Report ${idx + 1}`} />
                ))}
              </div>
            )}

            {selectedReport.voiceNotes && selectedReport.voiceNotes.length > 0 && (
              <div className="modal-voice">
                <h4>Voice Notes ({selectedReport.voiceNotes.length})</h4>
                {selectedReport.voiceNotes.map((note, idx) => (
                  <audio key={idx} controls style={{ width: '100%', marginBottom: '8px' }}>
                    <source src={note.url} />
                  </audio>
                ))}
              </div>
            )}

            <div className="modal-meta">
              <p><strong>Submitted By:</strong> {selectedReport.submittedBy?.name}</p>
              <p><strong>Department:</strong> {selectedReport.department}</p>
              <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
            </div>

            {/* Status Update */}
            <div className="action-section">
              <h4>Update Status</h4>
              <div className="status-buttons">
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, 'acknowledged')}
                  className="btn-secondary"
                >
                  ✓ Acknowledge
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, 'in_progress')}
                  className="btn-secondary"
                >
                  🔄 In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                  className="btn-primary"
                >
                  ✅ Resolved
                </button>
              </div>
            </div>

            {/* Priority Update */}
            <div className="action-section">
              <h4>Update Priority</h4>
              <select
                value={reportPriority}
                onChange={(e) => handleUpdatePriority(selectedReport._id, e.target.value)}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
                <option value="critical">⚫ Critical</option>
              </select>
            </div>

            {/* Send Message */}
            <div className="action-section">
              <h4>Send Message to Citizen</h4>
              <textarea
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows="3"
              />
              <button
                onClick={() => handleSendMessage(selectedReport._id)}
                disabled={sendingMessage}
                className="btn-primary"
              >
                {sendingMessage ? 'Sending...' : '📧 Send Message'}
              </button>
            </div>

            {/* Resolution Notes */}
            {selectedReport.status === 'resolved' && selectedReport.resolutionNotes && (
              <div className="resolution-box">
                <h4>Resolution Notes</h4>
                <p>{selectedReport.resolutionNotes}</p>
              </div>
            )}

            {selectedReport.status !== 'resolved' && (
              <div className="action-section">
                <h4>Resolve Report</h4>
                <textarea
                  placeholder="Enter resolution notes..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows="3"
                />
                <button
                  onClick={() => handleResolveReport(selectedReport._id)}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Resolving...' : '✅ Resolve Report'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard

