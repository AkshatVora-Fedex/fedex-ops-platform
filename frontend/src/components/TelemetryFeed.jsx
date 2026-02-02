import React, { useState, useEffect } from 'react';
import '../styles/TelemetryFeed.css';

function TelemetryFeed({ awb }) {
  const [telemetryData, setTelemetryData] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLive, setIsLive] = useState(true);
  const [stats, setStats] = useState({
    vehicleSpeed: 0,
    batteryLevel: 100,
    signalStrength: 'Strong',
    temperature: 72
  });

  const dataTypes = [
    { value: 'all', label: 'All Data', icon: 'all_inclusive' },
    { value: 'vehicle', label: 'Vehicle', icon: 'local_shipping' },
    { value: 'handheld', label: 'Handheld', icon: 'smartphone' },
    { value: 'environmental', label: 'Environmental', icon: 'wb_sunny' },
    { value: 'network', label: 'Network', icon: 'signal_cellular_alt' }
  ];

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/telemetry/stream/${awb}`);
        const result = await response.json();
        
        if (result.success) {
          setTelemetryData(prev => {
            const newData = [...prev, ...result.data];
            return newData.slice(-100); // Keep last 100 entries
          });
          
          if (result.stats) {
            setStats(result.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching telemetry:', error);
      }
    };

    if (awb && isLive) {
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 3000); // Update every 3 seconds
      return () => clearInterval(interval);
    }
  }, [awb, isLive]);

  const filteredData = filter === 'all' 
    ? telemetryData 
    : telemetryData.filter(d => d.type === filter);

  const getTypeIcon = (type) => {
    const icons = {
      vehicle: 'local_shipping',
      handheld: 'smartphone',
      environmental: 'wb_sunny',
      network: 'signal_cellular_alt',
      gps: 'location_on',
      scan: 'qr_code_scanner'
    };
    return icons[type] || 'sensors';
  };

  const getTypeColor = (type) => {
    const colors = {
      vehicle: '#3B82F6',
      handheld: '#10B981',
      environmental: '#F59E0B',
      network: '#8B5CF6',
      gps: '#EF4444',
      scan: '#EC4899'
    };
    return colors[type] || '#6B7280';
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getMetricValue = (entry) => {
    if (entry.value !== undefined) return entry.value;
    if (entry.speed !== undefined) return `${entry.speed} mph`;
    if (entry.temperature !== undefined) return `${entry.temperature}°F`;
    if (entry.battery !== undefined) return `${entry.battery}%`;
    if (entry.signal !== undefined) return entry.signal;
    if (entry.coordinates) return `${entry.coordinates.lat.toFixed(4)}, ${entry.coordinates.lng.toFixed(4)}`;
    return 'N/A';
  };

  return (
    <div className="telemetry-feed-container">
      {/* Header */}
      <div className="telemetry-header">
        <div className="header-left">
          <span className="material-icons">sensors</span>
          <div>
            <h3>Live Telemetry Feed</h3>
            <p className="awb-label">AWB: {awb}</p>
          </div>
        </div>
        <div className="header-controls">
          <button 
            className={`live-toggle ${isLive ? 'active' : ''}`}
            onClick={() => setIsLive(!isLive)}
          >
            <span className="material-icons">{isLive ? 'pause' : 'play_arrow'}</span>
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="telemetry-stats">
        <div className="stat-card">
          <span className="material-icons stat-icon" style={{ color: '#3B82F6' }}>speed</span>
          <div className="stat-content">
            <span className="stat-value">{stats.vehicleSpeed}</span>
            <span className="stat-label">Speed (mph)</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon" style={{ color: '#10B981' }}>battery_charging_full</span>
          <div className="stat-content">
            <span className="stat-value">{stats.batteryLevel}%</span>
            <span className="stat-label">Battery</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon" style={{ color: '#8B5CF6' }}>signal_cellular_alt</span>
          <div className="stat-content">
            <span className="stat-value">{stats.signalStrength}</span>
            <span className="stat-label">Signal</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="material-icons stat-icon" style={{ color: '#F59E0B' }}>thermostat</span>
          <div className="stat-content">
            <span className="stat-value">{stats.temperature}°F</span>
            <span className="stat-label">Temperature</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        {dataTypes.map(type => (
          <button
            key={type.value}
            className={`filter-button ${filter === type.value ? 'active' : ''}`}
            onClick={() => setFilter(type.value)}
          >
            <span className="material-icons">{type.icon}</span>
            {type.label}
          </button>
        ))}
      </div>

      {/* Telemetry Stream */}
      <div className="telemetry-stream">
        {filteredData.length === 0 ? (
          <div className="empty-state">
            <span className="material-icons">sensors_off</span>
            <p>No telemetry data available</p>
            <span className="empty-hint">
              {isLive ? 'Waiting for data...' : 'Resume feed to receive updates'}
            </span>
          </div>
        ) : (
          <div className="data-entries">
            {filteredData.map((entry, index) => (
              <div key={index} className="telemetry-entry">
                <div 
                  className="entry-icon" 
                  style={{ backgroundColor: getTypeColor(entry.type) }}
                >
                  <span className="material-icons">{getTypeIcon(entry.type)}</span>
                </div>
                <div className="entry-content">
                  <div className="entry-header">
                    <span className="entry-name">{entry.metric}</span>
                    <span className="entry-time">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  <div className="entry-details">
                    <span className="entry-value">{getMetricValue(entry)}</span>
                    {entry.unit && <span className="entry-unit">{entry.unit}</span>}
                    {entry.status && (
                      <span className={`entry-status ${entry.status.toLowerCase()}`}>
                        {entry.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="telemetry-footer">
        <div className="footer-item">
          <span className="material-icons">update</span>
          <span>Last Update: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="footer-item">
          <span className="material-icons">storage</span>
          <span>Showing {filteredData.length} of {telemetryData.length} entries</span>
        </div>
        {isLive && (
          <div className="footer-item live-indicator">
            <span className="pulse-dot"></span>
            <span>Live Feed Active</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TelemetryFeed;
