import React from 'react'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Smart Civic Issue Reporting System</h1>
          <p>Report, Track, and Resolve Local Issues Together</p>
          <a href="/dashboard" className="cta-button">Get Started</a>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h3>📸 Easy Reporting</h3>
          <p>Capture issues with photos, location, and voice notes</p>
        </div>
        <div className="feature-card">
          <h3>🗺️ Live Map</h3>
          <p>View all reported issues on an interactive city map</p>
        </div>
        <div className="feature-card">
          <h3>📊 Track Progress</h3>
          <p>Monitor resolution status in real-time</p>
        </div>
        <div className="feature-card">
          <h3>🔔 Notifications</h3>
          <p>Get updates on your reports and community issues</p>
        </div>
      </section>
    </div>
  )
}

export default HomePage
