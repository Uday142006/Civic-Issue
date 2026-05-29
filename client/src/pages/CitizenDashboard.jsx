import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { reportService } from '../services/api'
import ImageUpload from '../components/ImageUpload'
import VoiceRecorder from '../components/VoiceRecorder'
import './CitizenDashboard.css'

function CitizenDashboard() {
  const user = useSelector((state) => state.auth.user)
  const [reports, setReports] = useState([])
  const [myReports, setMyReports] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [voiceNotes, setVoiceNotes] = useState([])
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road_damage',
    priority: 'medium',
  })
  const [userLocation, setUserLocation] = useState([22.5726, 88.3639])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('map') // map, my-reports, new-report
  const [selectedReport, setSelectedReport] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState(null)

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

  const handleVoiceRecorded = async (recording) => {
    setUploadingVoice(true)
    try {
      const formData = new FormData()
      formData.append('file', recording.blob)
      formData.append('upload_preset', 'civic_reports')
      formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_NAME)

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/video/upload`,
        formData
      )

      setVoiceNotes([
        ...voiceNotes,
        {
          url: response.data.secure_url,
          duration: recording.duration,
        },
      ])
    } catch (error) {
      console.error('Voice upload failed:', error)
      alert('Failed to upload voice note')
    } finally {
      setUploadingVoice(false)
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
        images: uploadedImages,
        voiceNotes: voiceNotes,
      }
      await reportService.createReport(reportData)
      setFormData({ title: '', description: '', category: 'road_damage', priority: 'medium' })
      setUploadedImages([])
      setVoiceNotes([])
      setShowForm(false)
      fetchReports()
      alert('Report submitted successfully!')
    } catch (error) {
      console.error('Error:', error)
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

  const handleAddComment = async (reportId) => {
    if (!commentText.trim()) {
      alert('Please enter a comment')
      return
    }

    setAddingComment(true)
    try {
      await reportService.addComment(reportId, commentText)
      setCommentText('')
      // Refresh selected report
      const updated = myReports.find(r => r._id === reportId)
      if (updated) setSelectedReport(updated)
      fetchReports()
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setAddingComment(false)
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
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                  mapContainerStyle={{
                    height: '600px',
                    borderRadius: '12px',
                    width: '100%'
                  }}
                  center={{ lat: userLocation[0], lng: userLocation[1] }}
                  zoom={13}
                  options={{
                    mapTypeControl: true,
                    zoomControl: true,
                    streetViewControl: false,
                    fullscreenControl: true,
                  }}
                >
                  {/* User Location Marker */}
                  <Marker
                    position={{ lat: userLocation[0], lng: userLocation[1] }}
                    title="Your Location"
                    icon={{
                      path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                      scale: 8,
                      fillColor: '#3b82f6',
                      fillOpacity: 1,
                      strokeColor: '#1e40af',
                      strokeWeight: 2,
                    }}
                    onClick={() => setSelectedMarker({ type: 'user', data: null })}
                  />

                  {/* Report Markers */}
                  {reports.map((report) => (
                    <Marker
                      key={report._id}
                      position={{
                        lat: report.location.coordinates[1],
                        lng: report.location.coordinates[0],
                      }}
                      title={report.title}
                      icon={{
                        path: window.google?.maps?.SymbolPath?.CIRCLE || 0,
                        scale: 6,
                        fillColor: 
                          report.status === 'resolved' ? '#10b981' :
                          report.status === 'in_progress' ? '#f59e0b' : '#ef4444',
                        fillOpacity: 0.8,
                        strokeColor: '#ffffff',
                        strokeWeight: 2,
                      }}
                      onClick={() => setSelectedMarker({ type: 'report', data: report })}
                    />
                  ))}

                  {/* Info Window for User Location */}
                  {selectedMarker?.type === 'user' && (
                    <InfoWindow
                      position={{ lat: userLocation[0], lng: userLocation[1] }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="info-window-content">
                        <h3>📍 Your Location</h3>
                        <p>Lat: {userLocation[0].toFixed(4)}</p>
                        <p>Lng: {userLocation[1].toFixed(4)}</p>
                      </div>
                    </InfoWindow>
                  )}

                  {/* Info Window for Report Markers */}
                  {selectedMarker?.type === 'report' && selectedMarker?.data && (
                    <InfoWindow
                      position={{
                        lat: selectedMarker.data.location.coordinates[1],
                        lng: selectedMarker.data.location.coordinates[0],
                      }}
                      onCloseClick={() => setSelectedMarker(null)}
                    >
                      <div className="info-window-content">
                        <h3>{selectedMarker.data.title}</h3>
                        <p><strong>Category:</strong> {selectedMarker.data.category}</p>
                        <p><strong>Status:</strong> {selectedMarker.data.status}</p>
                        <p><strong>Priority:</strong> {selectedMarker.data.priority}</p>
                        <p>{selectedMarker.data.description.substring(0, 80)}...</p>
                        <button
                          onClick={() => {
                            setSelectedReport(selectedMarker.data)
                            setSelectedMarker(null)
                          }}
                          className="btn-view-details"
                        >
                          View Details
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </LoadScript>
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
                        <div className="badges">
                          <span className={`status-badge status-${report.status}`}>
                            {report.status}
                          </span>
                          <span className={`priority-badge priority-${report.priority}`}>
                            {report.priority}
                          </span>
                        </div>
                      </div>
                      <p className="issue-category">
                        📍 {report.category.replace('_', ' ')}
                      </p>
                      <p className="issue-description">{report.description}</p>
                      <div className="issue-media">
                        {report.images && report.images.length > 0 && (
                          <span>📸 {report.images.length} image{report.images.length > 1 ? 's' : ''}</span>
                        )}
                        {report.voiceNotes && report.voiceNotes.length > 0 && (
                          <span>🎙️ {report.voiceNotes.length} note{report.voiceNotes.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
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
                      <div className="report-badges">
                        <span className={`status-badge status-${report.status}`}>
                          {report.status}
                        </span>
                        <span className={`priority-badge priority-${report.priority}`}>
                          {report.priority}
                        </span>
                      </div>
                    </div>

                    <div className="report-content">
                      <p>{report.description}</p>
                      {report.images && report.images.length > 0 && (
                        <div className="report-images">
                          {report.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt={`Report ${idx + 1}`}
                              className="report-image"
                            />
                          ))}
                        </div>
                      )}
                      {report.voiceNotes && report.voiceNotes.length > 0 && (
                        <div className="report-voice-notes">
                          <p><strong>Voice Notes:</strong></p>
                          {report.voiceNotes.map((note, idx) => (
                            <audio key={idx} controls style={{ width: '100%', marginBottom: '8px' }}>
                              <source src={note.url} />
                              Your browser does not support the audio element.
                            </audio>
                          ))}
                        </div>
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
                <label>Issue Title <span style={{ color: 'red' }}>*</span></label>
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

              <div className="form-row">
                <div className="form-group">
                  <label>Category <span style={{ color: 'red' }}>*</span></label>
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
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description <span style={{ color: 'red' }}>*</span></label>
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

              {/* Voice Recorder Component */}
              <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />

              <div className="form-info">
                <p>
                  📍 <strong>Location:</strong> Your current location will be added to the report
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingVoice}
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
            <div className="modal-badges">
              <span className={`status-badge status-${selectedReport.status}`}>
                {selectedReport.status}
              </span>
              <span className={`priority-badge priority-${selectedReport.priority}`}>
                {selectedReport.priority}
              </span>
            </div>
            
            {selectedReport.images && selectedReport.images.length > 0 && (
              <div className="modal-images">
                {selectedReport.images.map((img, idx) => (
                  <img key={idx} src={img.url} alt={`Report ${idx + 1}`} />
                ))}
              </div>
            )}
            
            <p>{selectedReport.description}</p>
            
            {selectedReport.voiceNotes && selectedReport.voiceNotes.length > 0 && (
              <div className="modal-voice">
                <p><strong>Voice Notes:</strong></p>
                {selectedReport.voiceNotes.map((note, idx) => (
                  <audio key={idx} controls style={{ width: '100%' }}>
                    <source src={note.url} />
                  </audio>
                ))}
              </div>
            )}
            
            <div className="modal-meta">
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Upvotes:</strong> {selectedReport.upvotes}</p>
            </div>

            {selectedReport.status === 'resolved' && selectedReport.resolutionNotes && (
              <div className="modal-resolution">
                <h4>✅ Resolution</h4>
                <p>{selectedReport.resolutionNotes}</p>
              </div>
            )}

            {selectedReport.comments && selectedReport.comments.length > 0 && (
              <div className="modal-comments">
                <h4>Comments ({selectedReport.comments.length})</h4>
                {selectedReport.comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <p><strong>{comment.userId?.name}:</strong> {comment.text}</p>
                    <small>{new Date(comment.timestamp).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}

            {user?.id === selectedReport.submittedBy._id && (
              <div className="modal-comment-form">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="2"
                />
                <button
                  onClick={() => handleAddComment(selectedReport._id)}
                  disabled={addingComment}
                  className="btn-primary"
                >
                  {addingComment ? 'Adding...' : '💬 Add Comment'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CitizenDashboard
