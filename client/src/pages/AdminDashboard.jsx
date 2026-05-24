import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { adminService, analyticsService } from '../services/api'
import AnalyticsDashboard from './AnalyticsDashboard'
import './AdminDashboard.css'

function AdminDashboard() {
  const user = useSelector((state) => state.auth.user)
  const [reports, setReports] = useState([])
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalUsers: 0,
  })
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  })
  const [selectedReport, setSelectedReport] = useState(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleAssignReport = async (reportId, departmentStaffId) => {
    try {
      await adminService.assignReport(reportId, departmentStaffId, 'roads') // Default department
      fetchReports()
      alert('Report assigned successfully!')
    } catch (error) {
      alert('Error assigning report')
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
              <button className="action-btn">📧 Send Notifications</button>
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
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="filter-select"
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
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="road_damage">Road Damage</option>
              <option value="garbage">Garbage</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="street_light">Street Light</option>
              <option value="drainage">Drainage</option>
            </select>
          </div>

          {/* Reports Table */}
          <div className="reports-table-container">
            {reports.length > 0 ? (
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Submitted By</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>
                        <strong>{report.title}</strong>
                      </td>
                      <td>{report.category}</td>
                      <td>{report.submittedBy.name}</td>
                      <td>
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="action-link"
                          onClick={() => setSelectedReport(report)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-table">
                <p>No reports found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard />
      )}

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

            <div className="modal-body">
              {selectedReport.image?.url && (
                <img
                  src={selectedReport.image.url}
                  alt="Report"
                  className="modal-image"
                />
              )}

              <div className="report-details">
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p>{selectedReport.description}</p>
                </div>

                <div className="detail-row">
                  <strong>Category:</strong>
                  <span>{selectedReport.category}</span>
                </div>

                <div className="detail-row">
                  <strong>Status:</strong>
                  <span className={`status-badge status-${selectedReport.status}`}>
                    {selectedReport.status}
                  </span>
                </div>

                <div className="detail-row">
                  <strong>Submitted By:</strong>
                  <span>{selectedReport.submittedBy.name}</span>
                </div>

                <div className="detail-row">
                  <strong>Submitted Date:</strong>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>

                <div className="detail-row">
                  <strong>Location:</strong>
                  <span>
                    Lat: {selectedReport.location.coordinates[1]}, Lng:{' '}
                    {selectedReport.location.coordinates[0]}
                  </span>
                </div>

                {selectedReport.status !== 'resolved' && (
                  <div className="resolution-section">
                    <h4>📝 Add Resolution Notes</h4>
                    <textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Enter resolution details..."
                      rows="4"
                    ></textarea>
                    <button
                      className="btn-resolve"
                      onClick={() =>
                        handleResolveReport(selectedReport._id)
                      }
                      disabled={loading}
                    >
                      {loading ? '⏳ Resolving...' : '✅ Mark as Resolved'}
                    </button>
                  </div>
                )}

                {selectedReport.resolutionNotes && (
                  <div className="resolution-details">
                    <h4>✅ Resolution</h4>
                    <p>{selectedReport.resolutionNotes}</p>
                    <p className="resolved-date">
                      Resolved on:{' '}
                      {new Date(selectedReport.resolvedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
