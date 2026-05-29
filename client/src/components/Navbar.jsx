import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../redux/authSlice'
import Notifications from './Notifications'
import ThemeToggle from './ThemeToggle'
import './Navbar.css'

function Navbar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
    onLogout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🏛️ Civic Issue Reporter
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              </li>
              
              {user?.role === 'admin' && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">Admin</Link>
                </li>
              )}
              
              <li className="nav-item">
                <Link to="/profile" className="nav-link">Profile</Link>
              </li>

              <li className="nav-item notification-item">
                <Notifications />
              </li>

              <li className="nav-item theme-item">
                <ThemeToggle />
              </li>
              
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link register-btn">Register</Link>
              </li>
              <li className="nav-item theme-item">
                <ThemeToggle />
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
