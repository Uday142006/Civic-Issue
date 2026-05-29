/**
 * Analytics Dashboard Component
 * Displays charts and analytics for report statistics
 */

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { analyticsService } from '../services/api';
import '../styles/AnalyticsDashboard.css';

const COLORS = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6', '#1abc9c'];

export default function AnalyticsDashboard() {
  const [reportsByCategory, setReportsByCategory] = useState([]);
  const [reportsByStatus, setReportsByStatus] = useState([]);
  const [reportsByDate, setReportsByDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('category');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [categoryData, statusData, dateData] = await Promise.all([
          analyticsService.getByCategory(),
          analyticsService.getByStatus(),
          analyticsService.getByDate()
        ]);

        // Transform data for charts
        const categoryChart = Object.entries(categoryData || {}).map(([name, count]) => ({
          name: formatCategory(name),
          value: count
        }));

        const statusChart = Object.entries(statusData || {}).map(([name, count]) => ({
          name: capitalizeFirst(name),
          value: count
        }));

        const dateChart = (dateData || [])
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: item.count
          }));

        setReportsByCategory(categoryChart);
        setReportsByStatus(statusChart);
        setReportsByDate(dateChart);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load analytics data');
        // Use mock data for demo
        setReportsByCategory(MOCK_CATEGORY_DATA);
        setReportsByStatus(MOCK_STATUS_DATA);
        setReportsByDate(MOCK_DATE_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCategory = (cat) => {
    return cat
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => capitalizeFirst(word))
      .join(' ');
  };

  const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  if (loading) {
    return <div className="analytics-container loading">📊 Loading analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <h1>📊 Analytics Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}

      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'category' ? 'active' : ''}`}
          onClick={() => setActiveTab('category')}
        >
          📂 By Category
        </button>
        <button 
          className={`tab ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          ✓ By Status
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          📈 Timeline
        </button>
      </div>

      <div className="analytics-content">
        {/* Reports by Category */}
        {activeTab === 'category' && reportsByCategory.length > 0 && (
          <div className="chart-section">
            <h2>Reports by Category</h2>
            <div className="chart-grid">
              <div className="chart-wrapper">
                <h3>Bar Chart</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportsByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3498db" name="Reports" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper">
                <h3>Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {reportsByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="category-stats">
              <h3>Detailed Stats</h3>
              <div className="stats-grid">
                {reportsByCategory.map((item, index) => (
                  <div key={index} className="stat-card">
                    <div 
                      className="stat-color"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="stat-info">
                      <div className="stat-name">{item.name}</div>
                      <div className="stat-value">{item.value} reports</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reports by Status */}
        {activeTab === 'status' && reportsByStatus.length > 0 && (
          <div className="chart-section">
            <h2>Reports by Status</h2>
            <div className="chart-grid">
              <div className="chart-wrapper">
                <h3>Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#e74c3c" name="Reports" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper">
                <h3>Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportsByStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {reportsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="status-stats">
              <h3>Status Summary</h3>
              <div className="stats-grid">
                {reportsByStatus.map((item, index) => (
                  <div key={index} className="stat-card">
                    <div 
                      className="stat-color"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="stat-info">
                      <div className="stat-name">{item.name}</div>
                      <div className="stat-value">{item.value} reports</div>
                      <div className="stat-percentage">
                        {((item.value / reportsByStatus.reduce((sum, s) => sum + s.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && reportsByDate.length > 0 && (
          <div className="chart-section">
            <h2>Reports Over Time</h2>
            <div className="chart-wrapper full-width">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={reportsByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#27ae60" 
                    strokeWidth={2}
                    dot={{ fill: '#27ae60', r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Reports Submitted"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="timeline-stats">
              <h3>Timeline Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-label">Total Reports</div>
                  <div className="insight-value">
                    {reportsByDate.reduce((sum, d) => sum + d.count, 0)}
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-label">Peak Day</div>
                  <div className="insight-value">
                    {reportsByDate.length > 0 
                      ? Math.max(...reportsByDate.map(d => d.count))
                      : 0} reports
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-label">Average/Day</div>
                  <div className="insight-value">
                    {reportsByDate.length > 0
                      ? (reportsByDate.reduce((sum, d) => sum + d.count, 0) / reportsByDate.length).toFixed(1)
                      : 0}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock data for demo/testing
const MOCK_CATEGORY_DATA = [
  { name: 'Road Damage', value: 45 },
  { name: 'Garbage', value: 32 },
  { name: 'Water Leakage', value: 28 },
  { name: 'Street Light', value: 19 },
  { name: 'Pothole', value: 25 }
];

const MOCK_STATUS_DATA = [
  { name: 'Pending', value: 42 },
  { name: 'Acknowledged', value: 35 },
  { name: 'In Progress', value: 28 },
  { name: 'Resolved', value: 44 }
];

const MOCK_DATE_DATA = [
  { date: '2024-01-10', count: 5 },
  { date: '2024-01-11', count: 8 },
  { date: '2024-01-12', count: 6 },
  { date: '2024-01-13', count: 12 },
  { date: '2024-01-14', count: 9 },
  { date: '2024-01-15', count: 14 },
  { date: '2024-01-16', count: 11 }
];
