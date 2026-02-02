import React, { useState } from 'react';
import LiveTicker from './LiveTicker';
import MapView from './MapView';
import AIInsightsPanel from './AIInsightsPanel';

const GlobalCommand = () => {
  const [showAI, setShowAI] = useState(false);
  const kpis = [
    { label: 'Active Volume', value: '14.2M', delta: '+2.4%', color: 'text-green-600' },
    { label: 'Critical Backlog', value: '342', delta: 'ACTION REQ', color: 'text-red-600' },
    { label: 'Predicted Risk', value: '1,205', delta: 'AI Watch', color: 'text-orange-600' },
    { label: 'Network Health', value: '98.2%', delta: 'Target Met', color: 'text-green-600' }
  ];

  const hubs = [
    { code: 'MEM', status: 'Operational', load: 78 },
    { code: 'IND', status: 'Critical', load: 94 },
    { code: 'CDG', status: 'Warning', load: 82 },
    { code: 'DXB', status: 'Operational', load: 65 },
    { code: 'CAN', status: 'Operational', load: 71 },
    { code: 'EWR', status: 'Operational', load: 45 }
  ];

  const getStatusStyle = (status) => {
    if (status === 'Critical') return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-200';
    if (status === 'Warning') return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200';
    return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">public</span>
            Global Command
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Network-level health and risk visibility
          </p>
        </div>
        <button
          onClick={() => setShowAI(true)}
          className="flex items-center px-4 py-2 bg-[#4D148C] hover:bg-[#3e0f73] text-white rounded text-sm font-bold transition-all shadow-md"
        >
          <span className="material-icons text-[#FF6600] text-sm mr-2">auto_awesome</span>
          Generate Shift Briefing
        </button>
      </div>

      <LiveTicker />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{kpi.label}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</span>
              <span className={`text-xs font-semibold ${kpi.color}`}>{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {showAI && <AIInsightsPanel type="briefing" onClose={() => setShowAI(false)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">Global Network Map</h3>
          <div className="mt-4 h-96">
            <MapView
              route={[
                { code: 'MEM', name: 'Memphis', lat: 35.0497, lng: -89.9762, status: 'completed', type: 'hub' },
                { code: 'IND', name: 'Indianapolis', lat: 39.7173, lng: -86.2944, status: 'current', type: 'hub' },
                { code: 'CDG', name: 'Paris CDG', lat: 49.0097, lng: 2.5479, status: 'future', type: 'hub' },
                { code: 'DXB', name: 'Dubai', lat: 25.2532, lng: 55.3657, status: 'future', type: 'hub' },
              ]}
              center={[35, -10]}
              zoom={2}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase">Hub Status</h3>
          <div className="space-y-3 mt-4">
            {hubs.map((hub) => (
              <div key={hub.code} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{hub.code}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Load: {hub.load}%</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(hub.status)}`}>
                  {hub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCommand;
