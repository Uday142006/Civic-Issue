import React from 'react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>About</h3>
          <p>Empowering citizens to report and resolve civic issues in their communities.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
            <li><a href="#terms">Terms of Service</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Email: info@civicissue.com</p>
          <p>Phone: +1-800-CIVIC-1</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} Civic Issue Reporter. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
