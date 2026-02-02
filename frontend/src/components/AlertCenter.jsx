import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api';

const AlertCenter = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await alertService.getAll();
      const sortedAlerts = (response.data.data || []).sort((a, b) => {
        const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
      });
      setAlerts(sortedAlerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await alertService.update(alertId, { status: 'ACKNOWLEDGED' });
      loadAlerts();
      setSelectedAlert(null);
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert || !resolutionNotes.trim()) return;
    try {
      await alertService.update(selectedAlert.id, {
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes.trim(),
      });
      loadAlerts();
      setSelectedAlert(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleOverride = async () => {
    if (!selectedAlert || !overrideReason.trim()) return;
    try {
      await alertService.update(selectedAlert.id, {
        status: 'OVERRIDDEN',
        overrideReason: overrideReason.trim(),
      });
      loadAlerts();
      setSelectedAlert(null);
      setOverrideReason('');
      setShowOverrideModal(false);
    } catch (error) {
      console.error('Error overriding alert:', error);
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchSearch =
      searchTerm === '' ||
      alert.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.ruleName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSeverity && matchSearch;
  });

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
      HIGH: 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
      MEDIUM: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      LOW: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20',
    };
    return colors[severity] || 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-600 text-white',
      MEDIUM: 'bg-yellow-600 text-white',
      LOW: 'bg-blue-600 text-white',
    };
    return colors[severity] || 'bg-gray-600 text-white';
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      ACKNOWLEDGED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      OVERRIDDEN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const activeAlerts = alerts.filter((a) => a.status === 'OPEN' || a.status === 'ACKNOWLEDGED');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D148C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">notifications_active</span>
            Operations Action Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {activeAlerts.length} active issues • {filteredAlerts.length} filtered
          </p>
        </div>
        <button
          onClick={loadAlerts}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all"
        >
          <span className="material-icons text-sm mr-2">refresh</span>
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">CRITICAL</p>
          <p className="text-3xl font-bold mt-2">
            {alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">HIGH</p>
          <p className="text-3xl font-bold mt-2">
            {alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">MEDIUM</p>
          <p className="text-3xl font-bold mt-2">
            {alerts.filter((a) => a.severity === 'MEDIUM' && a.status !== 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">RESOLVED</p>
          <p className="text-3xl font-bold mt-2">
            {alerts.filter((a) => a.status === 'RESOLVED').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">TOTAL</p>
          <p className="text-3xl font-bold mt-2">{alerts.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discrepancy Queue */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <span className="material-icons mr-2">inbox</span>
                Queue ({filteredAlerts.length})
              </h2>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Search AWB or rule..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4D148C] text-sm"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C] text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="OVERRIDDEN">Overridden</option>
                </select>
              </div>
              <div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C] text-sm"
                >
                  <option value="all">All Severities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {/* Alert List */}
            <div className="flex-1 overflow-y-auto">
              {filteredAlerts.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`w-full text-left p-4 border-l-4 transition-all ${getSeverityColor(
                        alert.severity
                      )} ${selectedAlert?.id === alert.id ? 'ring-2 ring-[#4D148C]' : 'hover:bg-opacity-75'}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                          {alert.awb}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ml-2 ${getSeverityBadgeColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        {alert.ruleName}
                      </p>
                      <p className={`text-xs mt-1 font-semibold ${getStatusColor(alert.status).replace(/bg-.*text/, 'text')}`}>
                        {alert.status}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <span className="material-icons text-3xl mx-auto block mb-2">inbox</span>
                  <p className="text-sm">No alerts match filters</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2">
          {selectedAlert ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Alert Header */}
              <div className="bg-gradient-to-r from-[#4D148C] to-indigo-700 p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">AWB {selectedAlert.awb}</h2>
                    <div className="flex items-center gap-3 text-sm opacity-90">
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm">flight_takeoff</span>
                        <span>JFK (New York)</span>
                      </div>
                      <span>→</span>
                      <div className="flex items-center gap-1">
                        <span className="material-icons text-sm">flight_land</span>
                        <span>LHR (London)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${getSeverityBadgeColor(selectedAlert.severity)}`}>
                      {selectedAlert.severity} PRIORITY
                    </span>
                    <button onClick={() => setSelectedAlert(null)} className="p-1 hover:bg-white/20 rounded">
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white/10 rounded px-3 py-2 inline-block text-xs font-bold">
                  CURRENT STATUS: MEM HUB (DELAYED)
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Failure Analysis */}
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-600 text-white rounded p-2">
                      <span className="material-icons">report_problem</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-red-900 dark:text-red-200 mb-2">FAILURE ANALYSIS</h3>
                      <p className="text-sm text-red-800 dark:text-red-300">
                        {selectedAlert.description || 'Automated scan logic detected package on belt line B4 (Domestic Sort). At Outbound, potential routing label error or mis-sort. Package is currently idle.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Resolution Workspace */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-icons text-[#4D148C]">build_circle</span>
                      <h3 className="font-bold text-gray-900 dark:text-white">Resolution Workspace</h3>
                    </div>

                    <div className="space-y-3 mb-4">
                      <button className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 hover:border-[#4D148C] dark:hover:border-[#4D148C] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all group">
                        <span className="material-icons text-2xl text-gray-600 group-hover:text-[#4D148C]">alt_route</span>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 dark:text-white">Re-route Courier</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Assign new flight path</div>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all group">
                        <span className="material-icons text-2xl text-gray-600 group-hover:text-orange-600">track_changes</span>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 dark:text-white">Manual Override</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Force update status</div>
                        </div>
                      </button>

                      <button className="w-full flex items-center gap-3 p-4 border-2 border-gray-300 dark:border-gray-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all group">
                        <span className="material-icons text-2xl text-gray-600 group-hover:text-red-600">campaign</span>
                        <div className="text-left">
                          <div className="font-bold text-gray-900 dark:text-white">Escalate to Hub</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Notify floor manager</div>
                        </div>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">REASON CODE</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm">
                          <option>SORT_ERR_01 (Sortation Error)</option>
                          <option>ROUT_ERR_02 (Routing Error)</option>
                          <option>SCAN_MISS_03 (Scan Missed)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">NEW DESTINATION HUB</label>
                        <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm">
                          <option>MEM (Memphis SuperHub)</option>
                          <option>IND (Indianapolis Hub)</option>
                          <option>OAK (Oakland Hub)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">OPERATIONAL NOTES</label>
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Add context for the audit log..."
                          className="w-full h-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm resize-none"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm">
                        Notify Origin Station
                      </button>
                      <button
                        onClick={handleResolve}
                        disabled={!resolutionNotes.trim()}
                        className="flex-1 px-4 py-2 bg-[#4D148C] hover:bg-[#3e0f73] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-bold transition-all text-sm inline-flex items-center justify-center gap-2"
                      >
                        <span className="material-icons text-sm">check_circle</span>
                        Submit Resolution
                      </button>
                    </div>
                  </div>

                  {/* Package Specifications & History */}
                  <div className="space-y-6">
                    {/* Package Specs */}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">PACKAGE SPECIFICATIONS</h3>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Weight</span>
                          <span className="font-bold text-gray-900 dark:text-white">12.4 kg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Dimensions</span>
                          <span className="font-bold text-gray-900 dark:text-white">40×30×25 cm</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Service</span>
                          <span className="font-bold text-[#FF6600]">FedEx Intl Priority</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Content Type</span>
                          <span className="font-bold text-gray-900 dark:text-white">Medical Supplies</span>
                        </div>
                      </div>
                    </div>

                    {/* Resolution History */}
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">RESOLUTION HISTORY</h3>
                      <div className="space-y-3">
                        <div className="border-l-2 border-green-500 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">System Alert Triggered</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Route deviation detected at node MEM-C4</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">TODAY, 08:42 AM • AUTOMATED</p>
                        </div>

                        <div className="border-l-2 border-blue-500 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Opened by Sarah Jenkins</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Status changed to 'Investigating'</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">TODAY, 08:15 AM</p>
                        </div>

                        <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            <span className="font-bold text-sm text-gray-900 dark:text-white">Scan Event</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Arrived at Sort Facility</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">TODAY, 06:30 AM • SCANNER ID 4492</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Override Modal */}
              {showOverrideModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Override Alert
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      This will suppress this alert. Provide a reason for the override.
                    </p>
                    <textarea
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Enter override reason..."
                      className="w-full h-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4D148C] mb-4"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowOverrideModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleOverride}
                        disabled={!overrideReason.trim()}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
                      >
                        Override
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <span className="material-icons text-5xl text-gray-400 mx-auto mb-4">
                  inbox
                </span>
                <p className="text-gray-500 dark:text-gray-400">
                  Select an alert from the queue to view details and take action
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertCenter;
