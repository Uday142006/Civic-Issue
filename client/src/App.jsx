import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setUser, setToken } from './redux/authSlice'
import './App.css'

// Pages
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/AdminDashboard'
import ProfilePage from './pages/ProfilePage'
import ReportDetailPage from './pages/ReportDetailPage'
import LoginPage from './pages/LoginPage'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Protected Route Component
function ProtectedRoute({ children, requiredRole }) {
  const user = useSelector((state) => state.auth.user)
  const isAuthenticated = !!localStorage.getItem('token')

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" />
  }

  return children
}

function App() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((state) => !!state.auth.token)
  const user = useSelector((state) => state.auth.user)

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        dispatch(setToken(token))
        dispatch(setUser(JSON.parse(storedUser)))
      } catch (error) {
        console.error('Error restoring auth state:', error)
      }
    }
  }, [dispatch])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(setToken(null))
    dispatch(setUser(null))
  }

  return (
    <Router>
      <div className="app">
        <Navbar
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />

        <main className="app-main">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
              }
            />

            {/* Protected Routes - Citizen */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/report/:id"
              element={
                <ProtectedRoute>
                  <ReportDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Admin */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}

export default App

