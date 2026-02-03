import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [overviewRes, metricsRes] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getMetrics()
      ]);
      console.log('Raw overview response:', overviewRes);
      console.log('Raw metrics response:', metricsRes);
      console.log('Overview data to set:', overviewRes.data.data);
      console.log('Metrics data to set:', metricsRes.data.data);
      setOverview(overviewRes.data.data);
      setMetrics(metricsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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

  // Ensure we always have overview and metrics objects
  if (!overview || !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 font-bold">
          Error: Unable to load dashboard data. Please refresh the page.
        </div>
      </div>
    );
  }

  const totalConsignments = overview?.consignments?.total || 0;
  const deliveredFallback =
    (overview?.historicalStats?.byStatus?.DELIVERED || 0) +
    (overview?.historicalStats?.byStatus?.OnTime || 0);
  const deliveredCount = overview?.consignments?.delivered || deliveredFallback;
  const inTransitCount = overview?.consignments?.inTransit || Math.max(0, totalConsignments - deliveredCount);
  const atRiskFallback = metrics
    ? (metrics.riskDistribution?.critical || 0) + (metrics.riskDistribution?.high || 0)
    : 0;
  const atRiskCount = overview?.consignments?.atRisk || atRiskFallback;

  // Debug logging
  if (totalConsignments > 0) {
    console.log('Display values - Total:', totalConsignments, 'InTransit:', inTransitCount, 'Delivered:', deliveredCount, 'AtRisk:', atRiskCount);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Operations Health Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Real-time monitoring and predictive analytics
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D148C]"
        >
          <span className="material-icons text-sm mr-2">refresh</span>
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
                  <span className="material-icons text-blue-600 dark:text-blue-400">inventory_2</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Consignments
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {totalConsignments}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md">
                  <span className="material-icons text-green-600 dark:text-green-400">local_shipping</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    In Transit
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {inTransitCount}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span className="material-icons text-xs">trending_up</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-md">
                  <span className="material-icons text-purple-600 dark:text-purple-400">check_circle</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Delivered
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {deliveredCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-red-200 dark:border-red-900">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-md">
                  <span className="material-icons text-red-600 dark:text-red-400">warning</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    At Risk
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                      {atRiskCount}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <span className="material-icons text-xs animate-pulse">error</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            <span className="material-icons align-middle mr-2">notifications_active</span>
            Active Alerts by Severity
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-600 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Critical</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {overview?.alerts?.bySeverity?.CRITICAL || 0}
                  </p>
                </div>
                <span className="material-icons text-4xl text-red-600 dark:text-red-400">emergency</span>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-600 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">High</p>
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {overview?.alerts?.bySeverity?.HIGH || 0}
                  </p>
                </div>
                <span className="material-icons text-4xl text-orange-600 dark:text-orange-400">error</span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-600 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Medium</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {overview?.alerts?.bySeverity?.MEDIUM || 0}
                  </p>
                </div>
                <span className="material-icons text-4xl text-yellow-600 dark:text-yellow-400">warning</span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Low</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {overview?.alerts?.bySeverity?.LOW || 0}
                  </p>
                </div>
                <span className="material-icons text-4xl text-blue-600 dark:text-blue-400">info</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Distribution Chart */}
      {metrics && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              <span className="material-icons align-middle mr-2">analytics</span>
              Risk Distribution Analysis
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Critical Risk</span>
                <span className="text-sm font-semibold text-red-600">{metrics.riskDistribution.critical} consignments</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.riskDistribution.critical / (overview?.consignments?.total || 1) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Risk</span>
                <span className="text-sm font-semibold text-orange-600">{metrics.riskDistribution.high} consignments</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.riskDistribution.high / (overview?.consignments?.total || 1) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Risk</span>
                <span className="text-sm font-semibold text-yellow-600">{metrics.riskDistribution.medium} consignments</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-yellow-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.riskDistribution.medium / (overview?.consignments?.total || 1) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Risk</span>
                <span className="text-sm font-semibold text-green-600">{metrics.riskDistribution.low} consignments</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.riskDistribution.low / (overview?.consignments?.total || 1) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
