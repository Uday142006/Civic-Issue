import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import CitizenDashboard from './CitizenDashboard'

function DashboardPage() {
  const user = useSelector((state) => state.auth.user)

  // Redirect based on role
  if (!user) {
    return <Navigate to="/login" />
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" />
  }

  if (user.role === 'department_staff') {
    return <Navigate to="/admin" />
  }

  return <CitizenDashboard />
}

export default DashboardPage
