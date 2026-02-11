import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const awbService = {
  registerConsignment: (data) => apiClient.post('/awb/register', data),
  getAll: (params = {}) => apiClient.get('/awb/all', { params }),
  getByAWB: (awb) => apiClient.get(`/awb/${awb}`),
  addScan: (awb, scanData) => apiClient.post(`/awb/${awb}/scan`, scanData),
  updateStatus: (awb, status) => apiClient.patch(`/awb/${awb}/status`, { status }),
  
  // Historical data endpoints
  getHistoricalFiltered: (filters) => apiClient.get('/awb/historical/filtered', { params: filters }),
  getHistoricalGrouped: (groupBy) => apiClient.get(`/awb/historical/grouped/${groupBy}`),
  getHistoricalStats: () => apiClient.get('/awb/historical/stats/time'),
  getHistoricalByAWB: (awb) => apiClient.get(`/awb/historical/${awb}`)
};

export const trackingService = {
  getTracking: (awb) => apiClient.get(`/tracking/${awb}`),
  getChecklist: (awb) => apiClient.get(`/tracking/${awb}/checklist`),
  getLocation: (awb) => apiClient.get(`/tracking/${awb}/location`),
  getTelemetry: (awb) => apiClient.get(`/tracking/${awb}/telemetry`)
};

export const predictiveService = {
  getPrediction: (awb) => apiClient.get(`/predictive/${awb}/delay-prediction`),
  getAllPredictions: (params = {}) => apiClient.get('/predictive/analytics/all-predictions', { params }),
  getMetrics: () => apiClient.get('/predictive/analytics/metrics')
};

export const alertService = {
  getAll: () => apiClient.get('/alerts/all'),
  getActive: () => apiClient.get('/alerts/active'),
  getByAWB: (awb) => apiClient.get(`/alerts/${awb}`),
  searchByAWB: (awb) => apiClient.get(`/alerts/search/${awb}`),
  getBySeverity: (severity) => apiClient.get(`/alerts/severity/${severity}`),
  getStats: () => apiClient.get('/alerts/stats/summary'),
  acknowledge: (alertId, note) => apiClient.patch(`/alerts/${alertId}/acknowledge`, { note }),
  resolve: (alertId, note) => apiClient.patch(`/alerts/${alertId}/resolve`, { note }),
  override: (alertId, note) => apiClient.patch(`/alerts/${alertId}/override`, { note }),
  assign: (alertId, operatorId) => apiClient.patch(`/alerts/${alertId}/assign`, { operatorId })
};

export const dashboardService = {
  getOverview: () => apiClient.get('/dashboard/overview'),
  getMetrics: () => apiClient.get('/dashboard/metrics'),
  getAtRisk: () => apiClient.get('/dashboard/at-risk'),
  getOperationsSummary: () => apiClient.get('/dashboard/operations-summary'),
  
  // New real data endpoints
  getRegionalMetrics: () => apiClient.get('/dashboard/regional-metrics'),
  getPerformanceDistribution: () => apiClient.get('/dashboard/performance-distribution'),
  getPerformanceTrends: () => apiClient.get('/dashboard/performance-trends')
};

export const searchService = {
  searchAWB: (awb) => apiClient.get(`/search/search/${awb}`),
  advancedSearch: (filters) => apiClient.post('/search/advanced', filters),
  searchByRegion: (region) => apiClient.get(`/search/region/${region}`),
  searchByStatus: (status) => apiClient.get(`/search/status/${status}`),
  searchByService: (service) => apiClient.get(`/search/service/${service}`),
  getAvailableFilters: () => apiClient.get('/search/filters/available')
};

export default apiClient;
