const express = require('express');
const router = express.Router();
const AlertService = require('../services/AlertService');

// Get all active alerts
router.get('/active', (req, res) => {
  try {
    const alerts = AlertService.getActiveAlerts();

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all alerts
router.get('/all', (req, res) => {
  try {
    const alerts = AlertService.getAllAlerts();
    // Sort by severity and creation date
    const sorted = alerts.sort((a, b) => {
      const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      if (a.severity !== b.severity) {
        return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({
      success: true,
      count: sorted.length,
      data: sorted
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search alerts by AWB
router.get('/search/:awb', (req, res) => {
  try {
    const alerts = AlertService.searchByAWB(req.params.awb);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts for specific AWB
router.get('/:awb', (req, res) => {
  try {
    const alerts = AlertService.getAlertsByAWB(req.params.awb);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alerts by severity
router.get('/severity/:level', (req, res) => {
  try {
    const alerts = AlertService.getAlertsBySeverity(req.params.level);

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get alert statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = AlertService.getAlertStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge alert
router.patch('/:alertId/acknowledge', (req, res) => {
  try {
    const { note } = req.body;
    const alert = AlertService.acknowledgeAlert(req.params.alertId, note);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert acknowledged',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Resolve alert
router.patch('/:alertId/resolve', (req, res) => {
  try {
    const { note } = req.body;
    const alert = AlertService.resolveAlert(req.params.alertId, note);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert resolved',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Override alert
router.patch('/:alertId/override', (req, res) => {
  try {
    const { note } = req.body;
    const alert = AlertService.overrideAlert(req.params.alertId, note);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert overridden',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign alert
router.patch('/:alertId/assign', (req, res) => {
  try {
    const { operatorId } = req.body;
    const alert = AlertService.assignAlert(req.params.alertId, operatorId);

    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({
      success: true,
      message: 'Alert assigned',
      data: alert
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
