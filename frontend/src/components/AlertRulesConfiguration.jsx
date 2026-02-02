import React, { useState, useEffect } from 'react';
import { alertService } from '../services/api';

const AlertRulesConfiguration = () => {
  const [rules, setRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [showNewRule, setShowNewRule] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'DELAY',
    threshold: 1,
    unit: 'HOURS',
    severity: 'MEDIUM',
    enabled: true,
  });

  const ruleCategories = [
    { id: 'DELAY', name: 'Delay Detection', icon: 'schedule', color: 'orange' },
    { id: 'MISSED_SCAN', name: 'Missed Scan', icon: 'sync_problem', color: 'red' },
    { id: 'EXCEPTION', name: 'Operational Exception', icon: 'warning', color: 'red' },
    { id: 'NO_MOVEMENT', name: 'No Movement', icon: 'pause', color: 'yellow' },
    { id: 'LOCATION_ANOMALY', name: 'Location Anomaly', icon: 'location_off', color: 'purple' },
    { id: 'THRESHOLD', name: 'Custom Threshold', icon: 'tune', color: 'blue' },
  ];

  const loadRules = async () => {
    try {
      const response = await alertService.getRules();
      setRules(response.data.data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      // Set default rules if API fails
      setRules(getDefaultRules());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultRules = () => [
    {
      id: '1',
      name: 'High Delay Probability Alert',
      description: 'Alert when delay probability exceeds 70%',
      category: 'DELAY',
      threshold: 70,
      unit: '%',
      severity: 'HIGH',
      enabled: true,
      affectedShipments: 3,
      conditions: [
        'Delay Probability (%) ≥ 70'
      ],
      channels: ['toast', 'email'],
      assignedTeam: 'Operations Hub'
    },
    {
      id: '2',
      name: 'Critical Delay Threshold',
      description: 'Critical alert when estimated delay exceeds 120 minutes',
      category: 'DELAY',
      threshold: 120,
      unit: 'MINUTES',
      severity: 'CRITICAL',
      enabled: true,
      affectedShipments: 1,
      conditions: [
        'Estimated Delay (minutes) ≥ 120'
      ],
      channels: ['toast', 'email', 'sms'],
      assignedTeam: 'Priority Response Team'
    },
    {
      id: '3',
      name: 'Missing DEP Scan Alert',
      description: 'Alert when departure scan is missing after expected time',
      category: 'MISSED_SCAN',
      threshold: 1,
      unit: 'EVENTS',
      severity: 'HIGH',
      enabled: true,
      affectedShipments: 2,
      conditions: [
        'Missing Scan Type = DEP'
      ],
      channels: ['toast'],
      assignedTeam: 'Hub Supervisors'
    },
    {
      id: '4',
      name: 'Exception Alert',
      description: 'Immediate alert on any exception scan',
      category: 'EXCEPTION',
      threshold: 1,
      unit: 'EVENTS',
      severity: 'CRITICAL',
      enabled: true,
      affectedShipments: 1,
      conditions: [
        'Exception Detected = 1'
      ],
      channels: ['toast', 'email', 'sms'],
      assignedTeam: 'Exception Handling Team'
    },
    {
      id: '5',
      name: 'Moderate Delay Warning',
      description: 'Warning when delay probability is between 40-70%',
      category: 'DELAY',
      threshold: 40,
      unit: '%',
      severity: 'MEDIUM',
      enabled: true,
      affectedShipments: 4,
      conditions: [
        'Delay Probability (%) ≥ 40',
        'Delay Probability (%) < 70'
      ],
      channels: ['toast'],
      assignedTeam: 'Operations Hub'
    }
  ];

  const handleCreateRule = async () => {
    if (!newRule.name.trim()) return;
    try {
      // In a real app, this would POST to the backend
      const createdRule = {
        ...newRule,
        id: Date.now().toString(),
        affectedShipments: 0,
      };
      setRules([...rules, createdRule]);
      setShowNewRule(false);
      setNewRule({
        name: '',
        description: '',
        category: 'DELAY',
        threshold: 1,
        unit: 'HOURS',
        severity: 'MEDIUM',
        enabled: true,
      });
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      const updatedRules = rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      );
      setRules(updatedRules);
      setSelectedRule(selectedRule?.id === ruleId ? { ...selectedRule, enabled: !selectedRule.enabled } : selectedRule);
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      setRules(rules.filter((r) => r.id !== ruleId));
      if (selectedRule?.id === ruleId) {
        setSelectedRule(null);
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      LOW: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    const cat = ruleCategories.find((c) => c.id === category);
    return cat?.icon || 'settings';
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">tune</span>
            Alert Rules Configuration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {rules.filter((r) => r.enabled).length} active rules • {rules.length} total
          </p>
        </div>
        <button
          onClick={() => setShowNewRule(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all"
        >
          <span className="material-icons text-sm mr-2">add</span>
          New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <span className="material-icons mr-2">list</span>
                Rules
              </h2>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {rules.length > 0 ? (
                rules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`w-full text-left p-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 ${
                      rule.enabled
                        ? 'border-l-green-500'
                        : 'border-l-gray-300 dark:border-l-gray-600 opacity-60'
                    } ${selectedRule?.id === rule.id ? 'ring-2 ring-[#4D148C] bg-gray-50 dark:bg-gray-700' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {rule.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {rule.category}
                        </p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {rule.description}
                    </p>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">No rules configured</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rule Details */}
        <div className="lg:col-span-2">
          {selectedRule ? (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <span className="material-icons text-[#FF6600]">
                      {getCategoryIcon(selectedRule.category)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedRule.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedRule.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>

              {/* Rule Configuration */}
              <div className="space-y-6">
                {/* Basic Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Rule Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Category
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold">
                        {selectedRule.category}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Severity
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getSeverityColor(selectedRule.severity)}`}>
                        {selectedRule.severity}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Threshold
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold">
                        {selectedRule.threshold} {selectedRule.unit}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                          selectedRule.enabled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}
                      >
                        {selectedRule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Impact */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
                    <span className="material-icons text-sm mr-2">info</span>
                    Current Impact
                  </p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-300">
                    {selectedRule.affectedShipments || 0} active alerts
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mt-2">
                    This rule is currently triggering {selectedRule.affectedShipments || 0} alert(s)
                  </p>
                </div>

                {/* Conditions */}
                {selectedRule.conditions && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="material-icons text-sm mr-2">rule</span>
                      Conditions
                    </p>
                    <div className="space-y-2">
                      {selectedRule.conditions.map((condition, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="material-icons text-xs text-[#FF6600]">check_circle</span>
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notification Channels */}
                {selectedRule.channels && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <span className="material-icons text-sm mr-2">notifications</span>
                      Notification Channels
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRule.channels.map((channel) => (
                        <span key={channel} className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Team */}
                {selectedRule.assignedTeam && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="material-icons text-sm mr-2">groups</span>
                      Assigned Team
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedRule.assignedTeam}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleToggleRule(selectedRule.id)}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-all ${
                      selectedRule.enabled
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <span className="material-icons text-sm mr-2">
                      {selectedRule.enabled ? 'pause' : 'play_arrow'}
                    </span>
                    {selectedRule.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDeleteRule(selectedRule.id)}
                    className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-semibold transition-all"
                  >
                    <span className="material-icons text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <span className="material-icons text-5xl text-gray-400 mx-auto mb-4">
                  rule
                </span>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a rule to view details and manage settings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rule Categories Reference */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="material-icons mr-2">category</span>
          Available Rule Categories
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {ruleCategories.map((category) => (
            <div key={category.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <span className="material-icons text-2xl text-[#FF6600] mx-auto mb-2 block">
                {category.icon}
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* New Rule Modal */}
      {showNewRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Create New Alert Rule
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Rule Name
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Overtime Detection"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  placeholder="Describe when this rule triggers..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newRule.category}
                  onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                >
                  {ruleCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Severity
                </label>
                <select
                  value={newRule.severity}
                  onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Threshold
                  </label>
                  <input
                    type="number"
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={newRule.unit}
                    onChange={(e) => setNewRule({ ...newRule, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                  >
                    <option value="HOURS">Hours</option>
                    <option value="MINUTES">Minutes</option>
                    <option value="EVENTS">Events</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNewRule(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRule}
                disabled={!newRule.name.trim()}
                className="flex-1 px-4 py-2 bg-[#4D148C] hover:bg-[#3e0f73] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-all"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertRulesConfiguration;
