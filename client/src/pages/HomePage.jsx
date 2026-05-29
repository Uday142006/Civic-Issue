import React from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="hero-orb hero-orb-1"></div>
          <div className="hero-orb hero-orb-2"></div>
          <div className="hero-grid"></div>
        </div>

        <div className="hero-content">
          <div className="hero-label">🚀 NEXT GENERATION CITIZEN ENGAGEMENT</div>
          <h1 className="hero-title">Smart Civic Issue Reporting System</h1>
          <p className="hero-subtitle">Report, Track, and Resolve Local Issues Together with Real-Time Updates and AI-Powered Analytics</p>
          
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              ✨ Get Started Now
            </button>
            <button className="btn-outline" onClick={() => navigate('/register')}>
              📝 Create Account
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Issues Resolved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">5K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Cities</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-header">
          <h2>Powerful Features</h2>
          <p>Everything You Need to Report and Resolve Issues</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Rich Media Reporting</h3>
            <p>Capture issues with multiple photos, videos, and voice notes for complete documentation</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Live Interactive Map</h3>
            <p>Visualize all reported issues on an interactive city map with real-time updates</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Advanced Analytics</h3>
            <p>Track resolution status, response times, and generate detailed performance reports</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Real-Time Notifications</h3>
            <p>Receive instant updates on your reports and community issues with live notifications</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Messaging</h3>
            <p>Communicate directly with administrative staff for issue resolution and updates</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Priority Management</h3>
            <p>Set and track issue priorities from low to critical for effective resource allocation</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Smart Routing</h3>
            <p>Automatic categorization and routing to appropriate departments for faster resolution</p>
            <div className="feature-accent"></div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure & Private</h3>
            <p>Military-grade encryption and privacy protection for all user data and reports</p>
            <div className="feature-accent"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2>By The Numbers</h2>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">98.5%</div>
            <p>Resolution Rate</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">24hrs</div>
            <p>Avg Response Time</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <p>System Uptime</p>
          </div>
          <div className="stat-card">
            <div className="stat-number">4.9/5</div>
            <p>User Rating</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Make a Difference?</h2>
        <p>Join thousands of citizens and administrative staff in building a better community</p>
        
        <button className="btn-primary btn-lg" onClick={() => navigate('/register')}>
          🚀 Start Reporting Now
        </button>
      </section>
    </div>
  )
}

export default HomePage
