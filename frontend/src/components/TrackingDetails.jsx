import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { awbService, trackingService, predictiveService, alertService } from '../services/api';
import GeospatialMap from './GeospatialMap';
import CourierComms from './CourierComms';
import TelemetryFeed from './TelemetryFeed';

const TrackingDetails = () => {
  const { awb } = useParams();
  const [tracking, setTracking] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [notes, setNotes] = useState('');
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadTrackingData();
    const interval = setInterval(loadTrackingData, 30000);
    return () => clearInterval(interval);
  }, [awb]);

  const loadTrackingData = async () => {
    try {
      const [trackRes, predRes, alertRes, checklistRes, telemetryRes] = await Promise.all([
        awbService.getByAWB(awb),
        predictiveService.getPrediction(awb),
        alertService.getByAWB(awb),
        trackingService.getChecklist(awb),
        trackingService.getTelemetry(awb)
      ]);
      setTracking(trackRes.data.data);
      setPrediction(predRes.data.data.prediction);
      setAlerts(alertRes.data.data);
      setChecklist(checklistRes.data.data);
      setTelemetry(telemetryRes.data.data);
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setNotes(notes + '\n' + new Date().toLocaleString() + ': ' + newNote);
      setNewNote('');
    }
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      CRITICAL: 'from-red-500 to-red-600',
      HIGH: 'from-orange-500 to-orange-600',
      MEDIUM: 'from-yellow-500 to-yellow-600',
      LOW: 'from-green-500 to-green-600',
    };
    return colors[riskLevel] || 'from-gray-500 to-gray-600';
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.locationCode) parts.push(location.locationCode);
      if (location.postalCode) parts.push(location.postalCode);
      if (location.megaRegion) parts.push(location.megaRegion);
      return parts.length > 0 ? parts.join(', ') : 'Unknown';
    }
    return 'Unknown';
  };

  const getScanBadgeColor = (scanType) => {
    const colors = {
      PUX: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      STAT: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      DEX: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      RTO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      OTH: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      DX: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    };
    return colors[scanType] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D148C]"></div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-700 dark:text-red-300">Consignment not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/search"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all"
          >
            <span className="material-icons">arrow_back</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="material-icons mr-2 text-[#FF6600]">local_shipping</span>
              Shipment Telemetry
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AWB: <span className="font-mono font-bold">{awb}</span>
            </p>
          </div>
        </div>
        <button
          onClick={loadTrackingData}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all"
        >
          <span className="material-icons text-sm mr-2">refresh</span>
          Refresh
        </button>
      </div>

      {/* Prediction Alert Banner */}
      {prediction && prediction.willBeDelayed && (
        <div className={`bg-gradient-to-r ${getRiskColor(prediction.riskLevel)} rounded-lg p-6 text-white shadow-lg`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="material-icons text-3xl">warning</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">⚠️ Delay Risk Detected</h3>
              <p className="text-white/90 mb-3">
                Delay Probability: <span className="text-2xl font-bold">{prediction.delayProbability}%</span>
              </p>
              <div className="bg-white/20 rounded-lg p-3">
                <p className="font-semibold mb-2">Root Cause Analysis:</p>
                <ul className="space-y-1">
                  {prediction.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-sm text-white/80">
                Risk Level: <span className="font-bold">{prediction.riskLevel}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Route Information Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="material-icons mr-2">route</span>
          Route Progress
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="material-icons text-green-600 dark:text-green-400 text-3xl">flight_takeoff</span>
            <p className="mt-2 font-semibold text-gray-900 dark:text-white">{formatLocation(tracking.origin)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Origin</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="material-icons text-blue-600 dark:text-blue-400 text-3xl">location_on</span>
            <p className="mt-2 font-semibold text-gray-900 dark:text-white">{formatLocation(tracking.currentLocation)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Current</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-[#FF6600]"></div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="material-icons text-[#FF6600] text-3xl">flight_land</span>
            <p className="mt-2 font-semibold text-gray-900 dark:text-white">{formatLocation(tracking.destination)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'timeline', label: 'Timeline', icon: 'schedule' },
            { id: 'map', label: 'Live Map', icon: 'map' },
            { id: 'checklist', label: 'Checklist', icon: 'checklist' },
            { id: 'alerts', label: `Alerts (${alerts.length})`, icon: 'notifications' },
            { id: 'comms', label: 'Courier Comms', icon: 'forum' },
            { id: 'telemetry', label: 'Telemetry', icon: 'sensors' },
            { id: 'notes', label: 'Notes', icon: 'note' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#4D148C] text-[#4D148C]'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              <span className="material-icons text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Scan Timeline</h3>
          <div className="space-y-4">
            {telemetry?.scanTimeline && telemetry.scanTimeline.length > 0 ? (
              telemetry.scanTimeline.map((scan, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-[#4D148C] rounded-full border-4 border-white dark:border-gray-800"></div>
                    {idx < telemetry.scanTimeline.length - 1 && (
                      <div className="w-1 h-16 bg-gray-300 dark:bg-gray-600"></div>
                    )}
                  </div>
                  <div className="pb-8 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScanBadgeColor(scan.scanCode)}`}>
                        {scan.scanCode}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(scan.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      <span className="material-icons text-lg align-middle mr-2">location_on</span>
                      {formatLocation(scan.location)}
                    </p>
                    {scan.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">{scan.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No scans available</p>
            )}
          </div>
        </div>
      )}

      {/* Checklist Tab */}
      {activeTab === 'checklist' && checklist && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Expected vs. Actual Scans
          </h3>
          <div className="space-y-3">
            {checklist.checklist.map((item, idx) => (
              <div
                key={idx}
                className={`border-l-4 p-4 rounded-r-lg ${
                  item.status === 'COMPLETED'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : item.status === 'PENDING'
                    ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#4D148C] text-white font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {item.expected.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.expected.description}
                      </p>
                      {item.expected.appliesAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Applies at: {item.expected.appliesAt.stage} • {formatLocation(item.expected.appliesAt.location)}
                        </p>
                      )}
                      {item.expected.routingRules && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Routing rules: {item.expected.routingRules}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'COMPLETED'
                        ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200'
                        : item.status === 'PENDING'
                        ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200'
                        : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                {item.actual ? (
                  <div className="ml-11 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-semibold">Actual:</span> {item.actual.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500">
                      {new Date(item.actual.scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="ml-11 text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                    Awaiting scan...
                  </div>
                )}
                {item.discrepancyNote && (
                  <div className="ml-11 mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded text-sm text-red-700 dark:text-red-300">
                    ⚠️ {item.discrepancyNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Active Alerts</h3>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 p-4 rounded-r-lg ${
                    alert.severity === 'CRITICAL'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : alert.severity === 'HIGH'
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {alert.ruleName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Created: {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 ${
                        alert.severity === 'CRITICAL'
                          ? 'bg-red-600 text-white'
                          : 'bg-orange-600 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-green-500 mx-auto">check_circle</span>
              <p className="text-gray-600 dark:text-gray-400 mt-2">No active alerts</p>
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Operational Notes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add a note
              </label>
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record ground conditions, manual overrides, or observations..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                  rows="3"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-[#4D148C] hover:bg-[#3e0f73] text-white rounded-lg font-semibold transition-all h-fit"
                >
                  <span className="material-icons">add</span>
                </button>
              </div>
            </div>

            {notes && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Audit Trail
                </p>
                <div className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 space-y-2">
                  {notes.split('\n').map((line, idx) => (
                    line.trim() && <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Map Tab */}
      {activeTab === 'map' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '600px' }}>
          <GeospatialMap awb={awb} telemetry={telemetry} />
        </div>
      )}

      {/* Courier Communications Tab */}
      {activeTab === 'comms' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '600px' }}>
          <CourierComms awb={awb} />
        </div>
      )}

      {/* Telemetry Feed Tab */}
      {activeTab === 'telemetry' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700" style={{ height: '600px' }}>
          <TelemetryFeed awb={awb} />
        </div>
      )}
    </div>
  );
};

export default TrackingDetails;
