const moment = require('moment');
const { AlertData, ALERT_RULES } = require('../models/AlertData');

class AlertService {
  constructor() {
    this.alertData = new AlertData();
  }

  /**
   * Check consignment against all alert rules
   */
  checkConsignment(consignment) {
    const alerts = [];

    // Rule 1: Check for delivery exceptions
    const hasException = consignment.scans?.some(s => s.type === 'DEX');
    if (hasException) {
      const alert = this.alertData.createAlert(
        consignment.awb,
        'DELIVERY_EXCEPTION',
        { scanType: 'DEX' }
      );
      alerts.push(alert);
    }

    // Rule 2: Check for no movement
    if (consignment.lastScan) {
      const hoursSinceLastScan = moment().diff(moment(consignment.lastScan.timestamp), 'hours', true);
      if (hoursSinceLastScan > 8) {
        const alert = this.alertData.createAlert(
          consignment.awb,
          'NO_MOVEMENT',
          { hoursSinceLastScan: hoursSinceLastScan.toFixed(1) }
        );
        alerts.push(alert);
      }
    }

    // Rule 3: Check for missed scans
    const expectedScanTime = 2; // hours
    const lastScan = consignment.scans?.[consignment.scans.length - 1];
    if (lastScan) {
      const hoursSinceLastScan = moment().diff(moment(lastScan.timestamp), 'hours', true);
      if (hoursSinceLastScan > expectedScanTime && consignment.status !== 'DELIVERED') {
        const alert = this.alertData.createAlert(
          consignment.awb,
          'MISSED_SCAN',
          { hoursSinceLastScan: hoursSinceLastScan.toFixed(1) }
        );
        alerts.push(alert);
      }
    }

    // Rule 4: Check for delay warning (using predictive data would be ideal)
    const estimatedDelivery = moment(consignment.estimatedDelivery);
    const hoursUntilDelivery = estimatedDelivery.diff(moment(), 'hours', true);
    if (hoursUntilDelivery < 4 && hoursUntilDelivery > 0) {
      const alert = this.alertData.createAlert(
        consignment.awb,
        'DELAY_WARNING',
        { hoursRemaining: hoursUntilDelivery.toFixed(1) }
      );
      alerts.push(alert);
    }

    // Rule 5: Check if delivery window passed
    if (hoursUntilDelivery < 0) {
      const hoursBehind = Math.abs(hoursUntilDelivery);
      const alert = this.alertData.createAlert(
        consignment.awb,
        'DELAY_WARNING',
        { hoursBehind: hoursBehind.toFixed(1), message: 'PAST_ESTIMATED_DELIVERY' }
      );
      alerts.push(alert);
    }

    return alerts;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts() {
    return this.alertData.getActiveAlerts();
  }

  /**
   * Get alerts for a specific AWB
   */
  getAlertsByAWB(awb) {
    return this.alertData.getAlertsByAWB(awb);
  }

  /**
   * Get alerts by severity level
   */
  getAlertsBySeverity(severity) {
    return this.alertData.getAlertsBySeverity(severity);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId, note = '') {
    return this.alertData.updateAlertStatus(alertId, 'ACKNOWLEDGED', note);
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId, note = '') {
    return this.alertData.updateAlertStatus(alertId, 'RESOLVED', note);
  }

  /**
   * Assign alert to operator
   */
  assignAlert(alertId, operatorId) {
    return this.alertData.assignAlert(alertId, operatorId);
  }

  /**
   * Get alert statistics
   */
  getAlertStats() {
    const allAlerts = this.alertData.alerts;
    return {
      total: allAlerts.length,
      active: allAlerts.filter(a => a.status === 'ACTIVE').length,
      acknowledged: allAlerts.filter(a => a.status === 'ACKNOWLEDGED').length,
      resolved: allAlerts.filter(a => a.status === 'RESOLVED').length,
      bySeverity: {
        CRITICAL: allAlerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
        HIGH: allAlerts.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length,
        MEDIUM: allAlerts.filter(a => a.severity === 'MEDIUM' && a.status === 'ACTIVE').length,
        LOW: allAlerts.filter(a => a.severity === 'LOW' && a.status === 'ACTIVE').length
      }
    };
  }
}

module.exports = new AlertService();
