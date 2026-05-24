import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { reportService } from '../services/api'
import ImageUpload from '../components/ImageUpload'
import './CitizenDashboard.css'

function CitizenDashboard() {
  const user = useSelector((state) => state.auth.user)
  const [reports, setReports] = useState([])
  const [myReports, setMyReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
  })
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('map') // map, my-reports, new-report
  const [selectedReport, setSelectedReport] = useState(null)

  // Fetch location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude])
      })
    }
  }, [])

  // Fetch reports
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await reportService.getReports()
      setReports(response.data.reports)
      // Filter user's reports
      const userReports = response.data.reports.filter(
        (r) => r.submittedBy._id === user?.id
      )
      setMyReports(userReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    }
  }

  const handleSubmitReport = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const reportData = {
        ...formData,
        latitude: userLocation[0],
        longitude: userLocation[1],
        images: uploadedImages, // Include uploaded images
      }
      await reportService.createReport(reportData)
      setFormData({ title: '', description: '', category: 'road_damage' })
      setUploadedImages([]) // Clear uploaded images
      setShowForm(false)
      fetchReports()
      alert('Report submitted successfully!')
    } catch (error) {
      alert('Error submitting report')
    } finally {
      setLoading(false)
    }
  }

  const handleUpvote = async (reportId) => {
    try {
      await reportService.upvoteReport(reportId)
      fetchReports()
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  return (
    <div className="citizen-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Report civic issues and help your community</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-label">My Reports</div>
            <div className="stat-value">{myReports.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Upvotes Received</div>
            <div className="stat-value">{user?.totalUpvotes || 0}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-link ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Live Map
        </button>
        <button
          className={`tab-link ${activeTab === 'my-reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-reports')}
        >
          📋 My Reports
        </button>
        <button
          className={`tab-link ${activeTab === 'new-report' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-report')}
        >
          ➕ New Report
        </button>
      </div>

      <div className="dashboard-content">
        {/* Live Map Tab */}
        {activeTab === 'map' && (
          <div className="tab-content">
            <h2>Live City Issue Map</h2>
            <div className="map-container">
              <MapContainer
                center={userLocation}
                zoom={13}
                style={{ height: '600px', borderRadius: '12px' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {/* User Location */}
                <Marker position={userLocation}>
                  <Popup>Your Location</Popup>
                </Marker>

                {/* All Reports */}
                {reports.map((report) => (
                  <Marker
                    key={report._id}
                    position={[
                      report.location.coordinates[1],
                      report.location.coordinates[0],
                    ]}
                  >
                    <Popup>
                      <div className="popup-content">
                        <h3>{report.title}</h3>
                        <p><strong>Category:</strong> {report.category}</p>
                        <p><strong>Status:</strong> {report.status}</p>
                        <p>{report.description}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Issues List */}
            <div className="issues-list">
              <h3>Recent Issues Near You</h3>
              {reports.length > 0 ? (
                <div className="issues-grid">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      className="issue-card"
                      onClick={() => setSelectedReport(report)}
                    >
                      <div className="issue-header">
                        <h4>{report.title}</h4>
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="issue-category">
                        📍 {report.category.replace('_', ' ')}
                      </p>
                      <p className="issue-description">{report.description}</p>
                      <div className="issue-footer">
                        <button
                          className="upvote-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpvote(report._id)
                          }}
                        >
                          👍 {report.upvotes}
                        </button>
                        <span className="reported-by">
                          By {report.submittedBy.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No issues reported yet</p>
              )}
            </div>
          </div>
        )}

        {/* My Reports Tab */}
        {activeTab === 'my-reports' && (
          <div className="tab-content">
            <h2>My Reports</h2>
            {myReports.length > 0 ? (
              <div className="my-reports-list">
                {myReports.map((report) => (
                  <div key={report._id} className="my-report-card">
                    <div className="report-header">
                      <div>
                        <h3>{report.title}</h3>
                        <p className="report-date">
                          📅 {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`status-badge status-${report.status}`}>
                        {report.status}
                      </span>
                    </div>

                    <div className="report-content">
                      <p>{report.description}</p>
                      {report.image?.url && (
                        <img
                          src={report.image.url}
                          alt="Report"
                          className="report-image"
                        />
                      )}
                    </div>

                    <div className="report-meta">
                      <span>👍 {report.upvotes} upvotes</span>
                      <span>💬 {report.comments?.length || 0} comments</span>
                      <span>📍 {report.category}</span>
                    </div>

                    {report.status === 'resolved' && report.resolutionNotes && (
                      <div className="resolution-box">
                        <h4>✅ Resolution</h4>
                        <p>{report.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't submitted any reports yet</p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('new-report')}
                >
                  Submit Your First Report
                </button>
              </div>
            )}
          </div>
        )}

        {/* New Report Tab */}
        {activeTab === 'new-report' && (
          <div className="tab-content">
            <h2>Report a New Issue</h2>

            <form onSubmit={handleSubmitReport} className="report-form">
              <div className="form-group">
                <label>Issue Title</label>
                <input
                  type="text"
                  placeholder="Brief title of the issue"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="road_damage">🛣️ Road Damage</option>
                  <option value="garbage">🗑️ Garbage</option>
                  <option value="water_leakage">💧 Water Leakage</option>
                  <option value="street_light">💡 Street Light</option>
                  <option value="drainage">🌊 Drainage</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="6"
                  required
                ></textarea>
              </div>

              {/* Image Upload Component */}
              <ImageUpload onImagesChange={setUploadedImages} />

              <div className="form-info">
                <p>
                  📍 <strong>Location:</strong> Your current location will be added
                  to the report
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : '📤 Submit Report'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Selected Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedReport(null)}
            >
              ✕
            </button>
            <h2>{selectedReport.title}</h2>
            {selectedReport.image?.url && (
              <img
                src={selectedReport.image.url}
                alt="Report"
                className="modal-image"
              />
            )}
            <p>{selectedReport.description}</p>
            <div className="modal-meta">
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
              <p><strong>Upvotes:</strong> {selectedReport.upvotes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CitizenDashboard
