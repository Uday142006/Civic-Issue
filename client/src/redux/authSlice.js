import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setUser: (state, action) => {
      state.user = action.payload
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload))
      }
    },
    setToken: (state, action) => {
      state.token = action.payload
      if (action.payload) {
        localStorage.setItem('token', action.payload)
      }
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
  },
})

export const { setLoading, setUser, setToken, setError, logout } = authSlice.actions
export default authSlice.reducer
