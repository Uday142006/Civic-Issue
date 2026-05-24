import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setToken, setError } from '../redux/authSlice'
import { authService } from '../services/api'
import './Auth.css'

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
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
      const response = await authService.login(formData.email, formData.password)
      dispatch(setToken(response.data.token))
      dispatch(setUser(response.data.user))
      navigate('/dashboard')
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setErrorState(message)
      dispatch(setError(message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p>Don't have an account? <a href="/register">Register here</a></p>
      </div>
    </div>
  )
}

export default LoginPage
