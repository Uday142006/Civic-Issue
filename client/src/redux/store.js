import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import reportReducer from './reportSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    reports: reportReducer,
  },
})

export default store
