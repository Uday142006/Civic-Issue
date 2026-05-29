import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setUser, setToken, setError } from '../redux/authSlice'
import { authService } from '../services/api'
import './Auth.css'

function RegisterPage() {
  const [activeTab, setActiveTab] = useState('google') // 'google' or 'otp'
  const [step, setStep] = useState(1) // Step 1: Phone/Google, Step 2: Profile Info
  const [error, setErrorState] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  
  // OTP Flow
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpTimer, setOtpTimer] = useState(0)
  
  // Google Flow
  const [googleToken, setGoogleToken] = useState(null)
  const [googleData, setGoogleData] = useState(null)
  
  // Profile Info (Step 2)
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'citizen',
    department: '',
    phone: ''
  })
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [otpTimer])

  // Handle Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!phone || phone.length < 10) {
      setErrorState('Enter a valid phone number')
      return
    }

    setLoading(true)
    setErrorState('')
    try {
      await authService.sendOTP(phone)
      setOtpSent(true)
      setOtpTimer(60)
      setSuccess('OTP sent successfully! Check your SMS.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setErrorState(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length !== 6) {
      setErrorState('Enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    setErrorState('')
    try {
      const response = await authService.verifyOTP({
        phone,
        otp,
        role: 'citizen'
      })
      
      if (response.data.token) {
        // Direct registration complete
        dispatch(setToken(response.data.token))
        dispatch(setUser(response.data.user))
        navigate('/dashboard')
      } else {
        // Need profile info
        setProfileData({ ...profileData, phone })
        setStep(2)
      }
    } catch (err) {
      setErrorState(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // Handle Google Login
  const handleGoogleLogin = () => {
    // Mock Google authentication for demo
    // In production, integrate with actual Google OAuth using @react-oauth/google package
    
    setLoading(true)
    setErrorState('')
    
    // Simulate Google login - in production, use actual OAuth flow
    try {
      // For now, show a mock success with demo user data
      const mockGoogleUser = {
        id: 'google_' + Math.random().toString(36).substr(2, 9),
        name: 'Demo User',
        email: 'demo@gmail.com',
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c'
      }

      // Proceed to profile step
      setTimeout(() => {
        setGoogleData(mockGoogleUser)
        setProfileData({
          ...profileData,
          name: mockGoogleUser.name,
          email: mockGoogleUser.email
        })
        setStep(2)
        setLoading(false)
      }, 1500)
    } catch (err) {
      setErrorState('Google authentication failed. Please try again.')
      setLoading(false)
    }
  }

  // Mock Google callback handler (for demo)
  const handleGoogleSuccess = async (googleResponse) => {
    setLoading(true)
    setErrorState('')
    try {
      // In production, send googleResponse.credential to backend for verification
      const response = await authService.googleAuth({
        token: googleResponse.credential || googleResponse.accessToken
      })
      
      if (response.data?.token) {
        dispatch(setToken(response.data.token))
        dispatch(setUser(response.data.user))
        navigate('/dashboard')
      } else {
        setGoogleData(response.data)
        setProfileData({
          ...profileData,
          name: response.data.name || '',
          email: response.data.email || ''
        })
        setStep(2)
      }
    } catch (err) {
      setErrorState(err.response?.data?.message || 'Google authentication failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle Profile Completion
  const handleCompleteProfile = async (e) => {
    e.preventDefault()
    if (!profileData.name) {
      setErrorState('Full name is required')
      return
    }

    setLoading(true)
    setErrorState('')
    try {
      // Simulate successful registration by storing user data
      const userData = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name: profileData.name,
        email: profileData.email || 'user@example.com',
        role: profileData.role,
        department: profileData.department || null,
        createdAt: new Date().toISOString(),
      }

      // Mock token generation
      const mockToken = 'token_' + Math.random().toString(36).substr(2, 50)

      // Store in localStorage
      localStorage.setItem('token', mockToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Update Redux state
      dispatch(setToken(mockToken))
      dispatch(setUser(userData))

      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      setErrorState(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="register-header">
          <h2>Join Us Today 🎉</h2>
          <p className="register-subtitle">Sign up using your preferred method</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'google' ? 'active' : ''}`}
            onClick={() => { setActiveTab('google'); setStep(1) }}
          >
            🔐 Google
          </button>
          <button
            className={`tab-btn ${activeTab === 'otp' ? 'active' : ''}`}
            onClick={() => { setActiveTab('otp'); setStep(1) }}
          >
            📱 Mobile OTP
          </button>
        </div>

        {/* Google Registration */}
        {activeTab === 'google' && step === 1 && (
          <div className="auth-form">
            <div className="oauth-info">
              <p>Sign up using your Google account to get started instantly</p>
            </div>
            <button
              type="button"
              className="btn-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? 'Connecting to Google...' : '✓ Sign Up with Google'}
            </button>
            <p className="auth-note">Your Google account information will only be used for registration</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-md)', padding: 'var(--spacing-md)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              💡 Demo: Click the button to proceed with sample Google account data
            </p>
          </div>
        )}

        {/* OTP Registration - Step 1 */}
        {activeTab === 'otp' && step === 1 && (
          <form onSubmit={handleSendOTP} className="auth-form">
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength="10"
                disabled={otpSent}
                required
              />
              <small>Enter 10-digit mobile number</small>
            </div>

            {!otpSent ? (
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Sending OTP...' : '📤 Send OTP'}
              </button>
            ) : (
              <>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength="6"
                    required
                  />
                  <small>Check your SMS for the 6-digit code</small>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={loading || !otp}
                  className="btn-primary"
                >
                  {loading ? 'Verifying...' : '✓ Verify OTP'}
                </button>

                {otpTimer > 0 ? (
                  <p className="resend-timer">Resend OTP in {otpTimer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    className="btn-link"
                  >
                    Didn't receive? Resend OTP
                  </button>
                )}
              </>
            )}
          </form>
        )}

        {/* Profile Completion - Step 2 */}
        {step === 2 && (
          <form onSubmit={handleCompleteProfile} className="auth-form">
            <h3>Complete Your Profile</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Your Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Registration Type</label>
              <select
                value={profileData.role}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
              >
                <option value="citizen">👤 Citizen</option>
                <option value="department">🏢 Department Staff</option>
              </select>
            </div>

            {profileData.role === 'department' && (
              <div className="form-group">
                <label>Department</label>
                <select
                  value={profileData.department}
                  onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="roads">🛣️ Roads & Highways</option>
                  <option value="sanitation">🧹 Sanitation</option>
                  <option value="utilities">💡 Utilities</option>
                  <option value="public_works">🏗️ Public Works</option>
                </select>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Completing Setup...' : '✓ Complete Registration'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account? <a href="/login">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
