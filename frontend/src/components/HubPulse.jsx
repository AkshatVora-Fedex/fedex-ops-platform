import React, { useState } from 'react';
import AIInsightsPanel from './AIInsightsPanel';

const HubPulse = () => {
  const [showAI, setShowAI] = useState(false);
  const kpis = [
    { label: 'Avg Network Load', value: '72%', icon: 'activity', color: 'text-green-600' },
    { label: 'Total Backlog', value: '42k pkgs', icon: 'warning', color: 'text-red-600' },
    { label: 'Active Staffing', value: '12,405', icon: 'groups', color: 'text-[#4D148C]' },
    { label: 'Weather Risk', value: 'High', icon: 'cloud', color: 'text-orange-500' }
  ];

  const hubs = [
    { code: 'MEM', name: 'Memphis SuperHub', region: 'Americas', status: 'Operational', load: 78, weather: 'Clear', inbound: 'On Time', outbound: 'On Time' },
    { code: 'IND', name: 'Indianapolis Hub', region: 'Americas', status: 'Critical', load: 94, weather: 'Heavy Snow', inbound: 'Delayed (+2h)', outbound: 'Halted' },
    { code: 'CDG', name: 'Paris CDG', region: 'EMEA', status: 'Warning', load: 82, weather: 'Light Rain', inbound: 'Delayed (+15m)', outbound: 'On Time' },
    { code: 'DXB', name: 'Dubai Intl', region: 'MEA', status: 'Operational', load: 65, weather: 'Sunny', inbound: 'On Time', outbound: 'On Time' },
    { code: 'CAN', name: 'Guangzhou', region: 'APAC', status: 'Operational', load: 71, weather: 'Cloudy', inbound: 'On Time', outbound: 'On Time' },
    { code: 'EWR', name: 'Newark', region: 'Americas', status: 'Operational', load: 45, weather: 'Clear', inbound: 'On Time', outbound: 'On Time' }
  ];

  const getStatusStyle = (status) => {
    if (status === 'Critical') return 'border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20';
    if (status === 'Warning') return 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    return 'border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">hub</span>
            Hub Pulse
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hub load, staffing, and operational health
          </p>
        </div>
        <button
          onClick={() => setShowAI(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <span className="material-icons text-sm mr-2">psychology</span>
          AI Network Balancer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
            </div>
            <span className={`material-icons ${kpi.color}`}>{kpi.icon}</span>
          </div>
        ))}
      </div>

      {showAI && <AIInsightsPanel type="balancer" onClose={() => setShowAI(false)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hubs.map((hub) => (
          <div key={hub.code} className={`bg-white dark:bg-gray-800 shadow rounded-lg border-t-4 ${getStatusStyle(hub.status)} p-5`}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{hub.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{hub.code} • {hub.region}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(hub.status)}`}>
                {hub.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Sortation Load</span>
                <span className="font-semibold text-gray-900 dark:text-white">{hub.load}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-[#4D148C] h-2 rounded-full" style={{ width: `${hub.load}%` }}></div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              <p>Weather: <span className="font-semibold">{hub.weather}</span></p>
              <p>Inbound: <span className="font-semibold">{hub.inbound}</span></p>
              <p>Outbound: <span className="font-semibold">{hub.outbound}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubPulse;
