const moment = require('moment');

// Alert rules for different scenarios
const ALERT_RULES = {
  DELAY_WARNING: {
    id: 'DELAY_WARNING',
    name: 'Delivery Delay Warning',
    threshold: 4, // hours
    severity: 'HIGH',
    description: 'Package is behind schedule by 4+ hours'
  },
  MISSED_SCAN: {
    id: 'MISSED_SCAN',
    name: 'Missed Expected Scan',
    threshold: 2, // hours
    severity: 'MEDIUM',
    description: 'Expected scan has not been recorded within 2 hours'
  },
  DELIVERY_EXCEPTION: {
    id: 'DELIVERY_EXCEPTION',
    name: 'Delivery Exception',
    threshold: 0,
    severity: 'HIGH',
    description: 'Delivery attempt failed'
  },
  NO_MOVEMENT: {
    id: 'NO_MOVEMENT',
    name: 'No Movement',
    threshold: 8, // hours
    severity: 'CRITICAL',
    description: 'Package has not moved in 8+ hours'
  },
  LOCATION_ANOMALY: {
    id: 'LOCATION_ANOMALY',
    name: 'Location Anomaly',
    threshold: 0,
    severity: 'MEDIUM',
    description: 'Package appears to be moving in wrong direction'
  }
};

class AlertData {
  constructor() {
    this.alerts = [];
  }

  createAlert(awb, ruleId, details = {}) {
    const rule = ALERT_RULES[ruleId];
    if (!rule) return null;

    const alert = {
      id: require('uuid').v4(),
      awb,
      ruleId,
      ruleName: rule.name,
      severity: rule.severity,
      description: rule.description,
      details,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: 'ACTIVE', // ACTIVE, ACKNOWLEDGED, RESOLVED
      assignedTo: null,
      notes: []
    };

    this.alerts.push(alert);
    return alert;
  }

  getAlertsByAWB(awb) {
    return this.alerts.filter(a => a.awb === awb);
  }

  getAlertsBySeverity(severity) {
    return this.alerts.filter(a => a.severity === severity && a.status === 'ACTIVE');
  }

  updateAlertStatus(alertId, status, note = null) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (note) {
        alert.notes.push({
          timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
          content: note
        });
      }
      return alert;
    }
    return null;
  }

  getActiveAlerts() {
    return this.alerts.filter(a => a.status === 'ACTIVE');
  }

  assignAlert(alertId, operatorId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.assignedTo = operatorId;
      return alert;
    }
    return null;
  }
}

module.exports = { AlertData, ALERT_RULES };
