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
  getAll: () => apiClient.get('/awb/all'),
  getByAWB: (awb) => apiClient.get(`/awb/${awb}`),
  addScan: (awb, scanData) => apiClient.post(`/awb/${awb}/scan`, scanData),
  updateStatus: (awb, status) => apiClient.patch(`/awb/${awb}/status`, { status })
};

export const trackingService = {
  getTracking: (awb) => apiClient.get(`/tracking/${awb}`),
  getChecklist: (awb) => apiClient.get(`/tracking/${awb}/checklist`),
  getLocation: (awb) => apiClient.get(`/tracking/${awb}/location`)
};

export const predictiveService = {
  getPrediction: (awb) => apiClient.get(`/predictive/${awb}/delay-prediction`),
  getAllPredictions: () => apiClient.get('/predictive/analytics/all-predictions'),
  getMetrics: () => apiClient.get('/predictive/analytics/metrics')
};

export const alertService = {
  getActive: () => apiClient.get('/alerts/active'),
  getByAWB: (awb) => apiClient.get(`/alerts/${awb}`),
  getBySeverity: (severity) => apiClient.get(`/alerts/severity/${severity}`),
  getStats: () => apiClient.get('/alerts/stats/summary'),
  acknowledge: (alertId, note) => apiClient.patch(`/alerts/${alertId}/acknowledge`, { note }),
  resolve: (alertId, note) => apiClient.patch(`/alerts/${alertId}/resolve`, { note }),
  assign: (alertId, operatorId) => apiClient.patch(`/alerts/${alertId}/assign`, { operatorId })
};

export const dashboardService = {
  getOverview: () => apiClient.get('/dashboard/overview'),
  getMetrics: () => apiClient.get('/dashboard/metrics'),
  getAtRisk: () => apiClient.get('/dashboard/at-risk'),
  getOperationsSummary: () => apiClient.get('/dashboard/operations-summary')
};

export default apiClient;
