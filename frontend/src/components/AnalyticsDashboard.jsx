import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7days');
  const [metrics] = useState({
    otp: 96.4,
    otpChange: 1.2,
    exceptionRate: 3.2,
    exceptionChange: -0.5,
    avgTransit: 42,
    modelAccuracy: 89,
  });

  // Performance Trend Data
  const trendData = {
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    datasets: [
      {
        label: 'Actual',
        data: [94.2, 95.1, 96.4, 95.8, 97.2, 96.1, 96.4],
        borderColor: '#4D148C',
        backgroundColor: 'rgba(77, 20, 140, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Target',
        data: [95, 95, 95, 95, 95, 95, 95],
        borderColor: '#D1D5DB',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 90,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  // Root Cause Donut Data
  const rootCauseData = {
    labels: ['Hub Capacity', 'Weather', 'Customs', 'Other'],
    datasets: [
      {
        data: [42, 28, 18, 12],
        backgroundColor: ['#EF4444', '#60A5FA', '#FBBF24', '#9CA3AF'],
        borderWidth: 0,
      },
    ],
  };

  const rootCauseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  // Heatmap Data
  const heatmapData = [
    { day: 'Mon', hours: [2, 5, 8, 12, 15, 18, 22, 14, 9, 6, 3, 1] },
    { day: 'Tue', hours: [1, 4, 7, 10, 14, 20, 25, 16, 11, 7, 4, 2] },
    { day: 'Wed', hours: [3, 6, 9, 11, 16, 19, 23, 15, 10, 5, 2, 1] },
    { day: 'Thu', hours: [2, 5, 8, 13, 17, 21, 24, 17, 12, 8, 5, 3] },
    { day: 'Fri', hours: [4, 7, 10, 14, 18, 22, 26, 18, 13, 9, 6, 4] },
    { day: 'Sat', hours: [1, 3, 5, 7, 9, 11, 13, 10, 7, 4, 2, 1] },
    { day: 'Sun', hours: [0, 2, 4, 5, 6, 8, 10, 7, 5, 3, 1, 0] },
  ];

  const getHeatColor = (value) => {
    if (value === 0) return 'bg-gray-100';
    if (value < 5) return 'bg-green-100';
    if (value < 10) return 'bg-yellow-100';
    if (value < 15) return 'bg-orange-200';
    if (value < 20) return 'bg-orange-400 text-white';
    return 'bg-red-500 text-white';
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Export functionality would download CSV/PDF report');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics & Insights</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Performance trends and predictive analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-[#4D148C] text-white text-xs rounded focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="qtd">Quarter to Date</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-white text-[#4D148C] rounded text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <span className="material-icons text-lg mr-2">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold">On-Time Performance</p>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-3xl font-black text-gray-800">{metrics.otp}%</h2>
            <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
              <span className="material-icons text-xs mr-1">trending_up</span>
              {metrics.otpChange}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold">Exception Rate</p>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-3xl font-black text-gray-800">{metrics.exceptionRate}%</h2>
            <span className="text-xs font-bold text-green-600 mb-1 flex items-center">
              <span className="material-icons text-xs mr-1">trending_down</span>
              {Math.abs(metrics.exceptionChange)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold">Avg Transit Time</p>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-3xl font-black text-gray-800">{metrics.avgTransit}h</h2>
            <span className="text-xs font-bold text-gray-400 mb-1">Global Avg</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm">
          <p className="text-xs text-gray-500 uppercase font-bold">Model Accuracy</p>
          <div className="flex items-end justify-between mt-1">
            <h2 className="text-3xl font-black text-gray-800">{metrics.modelAccuracy}%</h2>
            <span className="text-xs font-bold text-green-600 mb-1">High Confidence</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm uppercase">Performance Trend (7 Days)</h3>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-[#4D148C] mr-1"></span> Actual
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-gray-300 mr-1"></span> Target
              </span>
            </div>
          </div>
          <div className="h-64">
            <Line data={trendData} options={trendOptions} />
          </div>
        </div>

        {/* Root Cause Donut */}
        <div className="lg:col-span-1 bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm uppercase mb-4">Primary Delay Drivers</h3>
          <div className="h-48 relative">
            <Doughnut data={rootCauseData} options={rootCauseOptions} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Hub Capacity
              </span>
              <span className="font-bold text-gray-700">42%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-400 mr-2"></span>Weather
              </span>
              <span className="font-bold text-gray-700">28%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></span>Customs
              </span>
              <span className="font-bold text-gray-700">18%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>Other
              </span>
              <span className="font-bold text-gray-700">12%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Heatmap */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm uppercase mb-4">Risk Heatmap: Failures by Hour/Day</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="text-gray-400 font-medium">
                <th className="p-2 text-left">Day</th>
                <th className="p-2">00-02</th>
                <th className="p-2">02-04</th>
                <th className="p-2">04-06</th>
                <th className="p-2">06-08</th>
                <th className="p-2">08-10</th>
                <th className="p-2">10-12</th>
                <th className="p-2">12-14</th>
                <th className="p-2">14-16</th>
                <th className="p-2">16-18</th>
                <th className="p-2">18-20</th>
                <th className="p-2">20-22</th>
                <th className="p-2">22-00</th>
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="p-2 text-left font-medium text-gray-700">{row.day}</td>
                  {row.hours.map((value, hourIndex) => (
                    <td key={hourIndex} className="p-2">
                      <div className={`w-full h-8 flex items-center justify-center rounded ${getHeatColor(value)} font-bold`}>
                        {value > 0 ? value : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-4 text-xs text-gray-500">
          <span>Legend:</span>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-100 border border-gray-200 mr-1"></div>
              <span>0</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-gray-200 mr-1"></div>
              <span>1-4</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-gray-200 mr-1"></div>
              <span>5-9</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-200 border border-gray-200 mr-1"></div>
              <span>10-14</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 border border-gray-200 mr-1"></div>
              <span>15-19</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 border border-gray-200 mr-1"></div>
              <span>20+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
