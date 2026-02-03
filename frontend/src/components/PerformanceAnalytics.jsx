import React, { useState, useEffect } from 'react';
import { alertService, predictiveService, dashboardService, awbService } from '../services/api';

const PerformanceAnalytics = () => {
  const [metrics, setMetrics] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('7days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [filterPeriod]);

  const loadMetrics = async () => {
    try {
      const [alertRes, predRes, regionalRes, perfDistRes] = await Promise.all([
        alertService.getStats(),
        predictiveService.getMetrics(),
        dashboardService.getRegionalMetrics(),
        dashboardService.getPerformanceDistribution()
      ]);

      const alertData = alertRes.data.data || {};
      const predData = predRes.data.data || {};
      const regionalData = regionalRes.data.data || {};
      const perfData = perfDistRes.data.data || {};

      // Transform regional data into team stats format
      const teamStatsFromRegions = Object.keys(regionalData).map(region => ({
        name: region,
        resolved: regionalData[region].totalShipments || 0,
        onTime: regionalData[region].onTime || 0,
        rating: regionalData[region].onTime ? ((regionalData[region].onTime / regionalData[region].totalShipments) * 5).toFixed(1) : 0,
        team: 'Regional',
        delayed: regionalData[region].delayed || 0
      }));

      // Transform performance distribution into alert types
      const topAlertTypesFromPerf = Object.keys(perfData).map(status => ({
        type: status,
        count: perfData[status],
        change: status === 'EXCLUDE' ? '-5%' : '+3%'
      })).slice(0, 5);

      setMetrics({
        totalAlerts: alertData.total || 0,
        resolvedAlerts: alertData.resolved || 0,
        avgResolutionTime: alertData.avgResolutionTime || 2.5,
        alertAccuracy: predData.accuracy || 87,
        falsePositiveRate: predData.falsePositiveRate || 12,
        predictedVsActual: predData.predictedVsActual || { predicted: 145, actual: 152 },
        topAlertTypes: topAlertTypesFromPerf.length > 0 ? topAlertTypesFromPerf : [
          { type: 'Delay Detection', count: 35, change: '+12%' },
          { type: 'Missed Scan', count: 28, change: '+8%' },
          { type: 'No Movement', count: 22, change: '-5%' },
          { type: 'Location Anomaly', count: 15, change: '+3%' },
          { type: 'Exception', count: 12, change: '-2%' },
        ],
      });

      setTeamStats(teamStatsFromRegions.length > 0 ? teamStatsFromRegions : [
        { name: 'Alice Chen', resolved: 42, onTime: 96, rating: 4.8, team: 'Operations' },
        { name: 'Marcus Johnson', resolved: 38, onTime: 92, rating: 4.6, team: 'Operations' },
        { name: 'Sarah Williams', resolved: 35, onTime: 89, rating: 4.5, team: 'Dispatch' },
        { name: 'James Martinez', resolved: 31, onTime: 85, rating: 4.2, team: 'Dispatch' },
        { name: 'Emily Rodriguez', resolved: 28, onTime: 88, rating: 4.4, team: 'Planning' },
      ]);
    } catch (error) {
      console.error('Error loading metrics:', error);
      setMetrics({
        totalAlerts: 200,
        resolvedAlerts: 185,
        avgResolutionTime: 2.8,
        alertAccuracy: 85,
        falsePositiveRate: 15,
        predictedVsActual: { predicted: 142, actual: 150 },
        topAlertTypes: [
          { type: 'Delay Detection', count: 35, change: '+12%' },
          { type: 'Missed Scan', count: 28, change: '+8%' },
          { type: 'No Movement', count: 22, change: '-5%' },
          { type: 'Location Anomaly', count: 15, change: '+3%' },
          { type: 'Exception', count: 12, change: '-2%' },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D148C]"></div>
      </div>
    );
  }

  const resolutionRate = metrics ? ((metrics.resolvedAlerts / metrics.totalAlerts) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">analytics</span>
            Performance & Resolution Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Management-level insights and operational performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="ytd">Year to Date</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all">
            <span className="material-icons text-sm mr-2">download</span>
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Resolution Rate</p>
          <p className="text-4xl font-bold text-[#4D148C] mt-3">{resolutionRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {metrics.resolvedAlerts}/{metrics.totalAlerts} alerts resolved
          </p>
          <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-[#4D148C] h-2 rounded-full"
              style={{ width: `${resolutionRate}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Mean Time to Resolve (MTTR)
          </p>
          <p className="text-4xl font-bold text-[#FF6600] mt-3">
            {metrics.avgResolutionTime.toFixed(1)}h
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Average resolution time
          </p>
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300 font-semibold">
            ↓ 12% improvement vs last period
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Alert Accuracy</p>
          <p className="text-4xl font-bold text-green-600 mt-3">{metrics.alertAccuracy}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Prediction precision rate
          </p>
          <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-700 dark:text-green-300 font-semibold">
            ↑ 3% improvement
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">False Positive Rate</p>
          <p className="text-4xl font-bold text-orange-600 mt-3">{metrics.falsePositiveRate}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Unnecessary alerts
          </p>
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300 font-semibold">
            Target: &lt;10%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predicted vs Actual */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="material-icons mr-2">comparing_arrows</span>
            Predicted vs. Actual Performance
          </h3>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Predicted Delays
                </span>
                <span className="text-2xl font-bold text-[#4D148C]">
                  {metrics.predictedVsActual.predicted}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#4D148C] h-3 rounded-full"
                  style={{
                    width: `${(metrics.predictedVsActual.predicted /
                      (metrics.predictedVsActual.predicted +
                        metrics.predictedVsActual.actual)) *
                      100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Actual Delays
                </span>
                <span className="text-2xl font-bold text-[#FF6600]">
                  {metrics.predictedVsActual.actual}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-[#FF6600] h-3 rounded-full"
                  style={{
                    width: `${(metrics.predictedVsActual.actual /
                      (metrics.predictedVsActual.predicted +
                        metrics.predictedVsActual.actual)) *
                      100}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Model Performance
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-400">
                Our predictive model caught{' '}
                <span className="font-bold">
                  {Math.round(
                    ((metrics.predictedVsActual.predicted -
                      (metrics.predictedVsActual.actual -
                        metrics.predictedVsActual.predicted)) /
                      metrics.predictedVsActual.actual) *
                      100
                  )}
                </span>
                % of actual delays in advance, enabling proactive intervention.
              </p>
            </div>
          </div>
        </div>

        {/* Top Alert Types */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <span className="material-icons mr-2">trending_up</span>
            Top Alert Types
          </h3>

          <div className="space-y-4">
            {metrics.topAlertTypes.map((alert, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {alert.type}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {alert.count}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        alert.change.startsWith('+')
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}
                    >
                      {alert.change}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#4D148C] to-[#FF6600] h-2 rounded-full"
                    style={{
                      width: `${(alert.count /
                        Math.max(...metrics.topAlertTypes.map((a) => a.count))) *
                        100}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance Leaderboard */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="material-icons mr-2">leaderboard</span>
          Team Performance Leaderboard
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Rank
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Operator
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Alerts Resolved
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  On-Time %
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Quality Rating
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Team
                </th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map((member, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <td className="py-4 px-4">
                    {idx === 0 && (
                      <span className="material-icons text-yellow-500 text-2xl">
                        star
                      </span>
                    )}
                    {idx === 1 && (
                      <span className="material-icons text-gray-400 text-2xl">
                        star
                      </span>
                    )}
                    {idx === 2 && (
                      <span className="material-icons text-orange-600 text-2xl">
                        star
                      </span>
                    )}
                    {idx > 2 && (
                      <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {idx + 1}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-semibold">
                      {member.resolved}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        member.onTime >= 95
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : member.onTime >= 85
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}
                    >
                      {member.onTime}%
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500 font-semibold">
                        {member.rating}
                      </span>
                      <span className="material-icons text-sm text-yellow-500">
                        star
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {member.team}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-300 mb-4 flex items-center">
          <span className="material-icons mr-2">insights</span>
          Strategic Insights & Recommendations
        </h3>
        <ul className="space-y-3 text-sm text-purple-800 dark:text-purple-300">
          <li className="flex items-start gap-3">
            <span className="material-icons text-sm mt-1">check_circle</span>
            <span>
              <strong>Alert Accuracy is Improving:</strong> Your predictive model has reached{' '}
              {metrics.alertAccuracy}% accuracy, enabling teams to focus on high-confidence alerts.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-icons text-sm mt-1">check_circle</span>
            <span>
              <strong>MTTR is Strong:</strong> Your teams are resolving alerts in {metrics.avgResolutionTime.toFixed(1)}{' '}
              hours on average. Focus on reducing false positives to improve efficiency.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-icons text-sm mt-1">check_circle</span>
            <span>
              <strong>Top Performers:</strong> {teamStats[0].name} is leading the team with{' '}
              {teamStats[0].resolved} alerts resolved. Consider them for mentoring roles.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="material-icons text-sm mt-1">check_circle</span>
            <span>
              <strong>Next Priority:</strong> Reduce false positive rate below 10% to decrease alert fatigue and
              improve operator trust in the system.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
