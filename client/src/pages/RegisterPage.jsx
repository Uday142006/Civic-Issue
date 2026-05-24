import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setToken, setError } from '../redux/authSlice'
import { authService } from '../services/api'
import './Auth.css'

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    department: '',
  })
  const [error, setErrorState] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorState('')

    try {
      const response = await authService.register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.department
      )
      dispatch(setToken(response.data.token))
      dispatch(setUser(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      setErrorState(message)
      dispatch(setError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="citizen">Citizen</option>
            <option value="department">Department Staff</option>
          </select>
          
          {formData.role === 'department' && (
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              <option value="roads">Roads & Highways</option>
              <option value="sanitation">Sanitation</option>
              <option value="utilities">Utilities</option>
              <option value="public_works">Public Works</option>
            </select>
          )}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        
        <p>Already have an account? <a href="/login">Login here</a></p>
      </div>
    </div>
  )
}

export default RegisterPage
