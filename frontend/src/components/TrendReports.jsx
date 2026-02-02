import React, { useState, useEffect } from 'react';
import '../styles/TrendReports.css';

function TrendReports() {
  const [timePeriod, setTimePeriod] = useState('30');
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  const timePeriods = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: '365', label: 'Year to Date' }
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const [recurringRes, regionalRes] = await Promise.all([
          fetch(`http://localhost:5000/api/trends/recurring?days=${timePeriod}`),
          fetch(`http://localhost:5000/api/trends/regional?days=${timePeriod}`)
        ]);

        const recurring = await recurringRes.json();
        const regional = await regionalRes.json();

        if (recurring.success && regional.success) {
          setTrends({
            recurring: recurring.data,
            regional: regional.data
          });
        }
      } catch (error) {
        console.error('Error fetching trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [timePeriod]);

  const getSeverityColor = (severity) => {
    const colors = {
      'CRITICAL': '#EF4444',
      'HIGH': '#F59E0B',
      'MEDIUM': '#3B82F6',
      'LOW': '#10B981'
    };
    return colors[severity] || '#6B7280';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return { icon: 'trending_up', color: '#EF4444' };
    if (trend < 0) return { icon: 'trending_down', color: '#10B981' };
    return { icon: 'trending_flat', color: '#6B7280' };
  };

  const exportReport = () => {
    const data = JSON.stringify(trends, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="trends-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading trend analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trends-container">
      {/* Header */}
      <div className="trends-header">
        <div className="header-left">
          <span className="material-icons">analytics</span>
          <div>
            <h2>Trend Reports & Analysis</h2>
            <p>Identify recurring failure patterns and improvement opportunities</p>
          </div>
        </div>
        <div className="header-controls">
          <select 
            className="period-selector"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            {timePeriods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button className="export-button" onClick={exportReport}>
            <span className="material-icons">file_download</span>
            Export
          </button>
        </div>
      </div>

      <div className="trends-content">
        {/* Top Recurring Failures */}
        <div className="trends-section">
          <div className="section-header">
            <h3>
              <span className="material-icons">repeat</span>
              Top 10 Recurring Failure Locations
            </h3>
            <span className="section-subtitle">
              Locations with highest failure frequency
            </span>
          </div>
          <div className="recurring-list">
            {trends?.recurring?.locations?.map((location, index) => (
              <div key={index} className="recurring-item">
                <div className="rank-badge" style={{ 
                  background: index < 3 ? getSeverityColor('CRITICAL') : getSeverityColor('MEDIUM') 
                }}>
                  #{index + 1}
                </div>
                <div className="location-info">
                  <div className="location-name">
                    <span className="material-icons">place</span>
                    {location.facility} - {location.city}, {location.country}
                  </div>
                  <div className="location-stats">
                    <span className="stat-item">
                      <span className="material-icons">error</span>
                      {location.failureCount} failures
                    </span>
                    <span className="stat-item">
                      <span className="material-icons">schedule</span>
                      Avg delay: {location.avgDelay}h
                    </span>
                    <span className="stat-item">
                      <span className="material-icons">local_shipping</span>
                      {location.affectedShipments} shipments
                    </span>
                  </div>
                </div>
                <div className="trend-indicator">
                  <span 
                    className="material-icons" 
                    style={{ color: getTrendIcon(location.trend).color }}
                  >
                    {getTrendIcon(location.trend).icon}
                  </span>
                  <span className="trend-value">{Math.abs(location.trend)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Type Performance */}
        <div className="trends-section">
          <div className="section-header">
            <h3>
              <span className="material-icons">insights</span>
              Service Type Performance Comparison
            </h3>
            <span className="section-subtitle">
              Failure rates by service level
            </span>
          </div>
          <div className="service-grid">
            {trends?.recurring?.serviceTypes?.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-header">
                  <span className="service-name">{service.name}</span>
                  <span 
                    className="failure-rate"
                    style={{ color: service.failureRate > 10 ? '#EF4444' : '#10B981' }}
                  >
                    {service.failureRate}%
                  </span>
                </div>
                <div className="service-bar">
                  <div 
                    className="service-fill"
                    style={{ 
                      width: `${service.failureRate}%`,
                      background: service.failureRate > 10 ? '#EF4444' : '#10B981'
                    }}
                  ></div>
                </div>
                <div className="service-stats">
                  <span>{service.totalShipments.toLocaleString()} shipments</span>
                  <span>{service.failures.toLocaleString()} failures</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Analysis */}
        <div className="trends-section">
          <div className="section-header">
            <h3>
              <span className="material-icons">public</span>
              Regional Performance Analysis
            </h3>
            <span className="section-subtitle">
              Territory-level trends and insights
            </span>
          </div>
          <div className="regional-grid">
            {trends?.regional?.territories?.map((territory, index) => (
              <div key={index} className="regional-card">
                <div className="regional-header">
                  <h4>{territory.name}</h4>
                  <span className={`health-badge ${territory.health.toLowerCase()}`}>
                    {territory.health}
                  </span>
                </div>
                <div className="regional-metrics">
                  <div className="metric-row">
                    <span className="metric-label">On-Time Rate</span>
                    <span className="metric-value">{territory.onTimeRate}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Avg Delay</span>
                    <span className="metric-value">{territory.avgDelay}h</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Total Shipments</span>
                    <span className="metric-value">{territory.totalShipments.toLocaleString()}</span>
                  </div>
                </div>
                <div className="regional-hubs">
                  <span className="hubs-label">Top Hubs:</span>
                  <div className="hub-tags">
                    {territory.topHubs.map((hub, i) => (
                      <span key={i} className="hub-tag">{hub}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Root Cause Analysis */}
        <div className="trends-section">
          <div className="section-header">
            <h3>
              <span className="material-icons">psychology</span>
              Root Cause Frequency Analysis
            </h3>
            <span className="section-subtitle">
              Most common reasons for delays
            </span>
          </div>
          <div className="root-causes-chart">
            {trends?.recurring?.rootCauses?.map((cause, index) => (
              <div key={index} className="cause-row">
                <div className="cause-info">
                  <span className="cause-rank">#{index + 1}</span>
                  <span className="cause-name">{cause.reason}</span>
                </div>
                <div className="cause-bar-container">
                  <div 
                    className="cause-bar"
                    style={{ 
                      width: `${cause.percentage}%`,
                      background: getSeverityColor(cause.severity)
                    }}
                  >
                    <span className="cause-percentage">{cause.percentage}%</span>
                  </div>
                </div>
                <div className="cause-count">{cause.count} occurrences</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="trends-section recommendations">
          <div className="section-header">
            <h3>
              <span className="material-icons">lightbulb</span>
              Recommended Preventive Actions
            </h3>
            <span className="section-subtitle">
              Data-driven recommendations to reduce failures
            </span>
          </div>
          <div className="recommendations-list">
            {trends?.recurring?.recommendations?.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="rec-header">
                  <span 
                    className="rec-priority"
                    style={{ background: getSeverityColor(rec.priority) }}
                  >
                    {rec.priority}
                  </span>
                  <span className="rec-impact">Impact: {rec.estimatedImprovement}</span>
                </div>
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                <div className="rec-footer">
                  <span className="rec-effort">
                    <span className="material-icons">schedule</span>
                    {rec.effort}
                  </span>
                  <button className="implement-button">
                    <span className="material-icons">play_arrow</span>
                    Implement
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendReports;
