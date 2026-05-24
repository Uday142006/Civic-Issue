import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  reports: [],
  selectedReport: null,
  isLoading: false,
  error: null,
  filters: {
    status: null,
    category: null,
    latitude: null,
    longitude: null,
  },
}

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setReports: (state, action) => {
      state.reports = action.payload
    },
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    addReport: (state, action) => {
      state.reports.unshift(action.payload)
    },
    updateReport: (state, action) => {
      const index = state.reports.findIndex(r => r._id === action.payload._id)
      if (index !== -1) {
        state.reports[index] = action.payload
      }
    },
  },
})

export const { setReports, setSelectedReport, setLoading, setError, setFilters, addReport, updateReport } = reportSlice.actions
export default reportSlice.reducer
