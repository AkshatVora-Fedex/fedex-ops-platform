const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const PredictiveService = require('../services/PredictiveService');
const AlertService = require('../services/AlertService');

// Get dashboard overview
router.get('/overview', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    const alerts = AlertService.getActiveAlerts();
    const historicalStats = AWBData.getHistoricalStats();

    const totalConsignments = historicalStats.total;
    const inTransit = historicalStats.byStatus['IN_TRANSIT'] || 0;
    const delivered = historicalStats.byStatus['DELIVERED'] || historicalStats.byStatus['OnTime'] || 0;
    const delayed = historicalStats.byStatus['DELAYED'] || historicalStats.byStatus['WDL'] || 0;
    const exceptions = historicalStats.byStatus['EXCEPTION'] || historicalStats.byStatus['EWDL'] || 0;
    const atRisk = delayed + exceptions;

    const alertStats = AlertService.getAlertStats();

    res.json({
      success: true,
      data: {
        consignments: {
          total: totalConsignments,
          inTransit,
          delivered,
          atRisk,
          delayed,
          exceptions
        },
        alerts: alertStats,
        historicalStats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard metrics
router.get('/metrics', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    
    const predictions = consignments.map(c => PredictiveService.predictDelay(c));
    const criticalRisk = predictions.filter(p => p.riskLevel === 'CRITICAL').length;
    const highRisk = predictions.filter(p => p.riskLevel === 'HIGH').length;
    const mediumRisk = predictions.filter(p => p.riskLevel === 'MEDIUM').length;

    const historicalMetrics = PredictiveService.getHistoricalMetrics(consignments);

    res.json({
      success: true,
      data: {
        riskDistribution: {
          critical: criticalRisk,
          high: highRisk,
          medium: mediumRisk,
          low: consignments.length - criticalRisk - highRisk - mediumRisk
        },
        historical: historicalMetrics,
        averageDelay: consignments.length > 0 
          ? (predictions.reduce((sum, p) => sum + p.delayProbability, 0) / consignments.length).toFixed(1)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get at-risk consignments
router.get('/at-risk', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    
    const atRiskConsignments = consignments
      .map(c => ({
        awb: c.awb,
        destination: c.destination,
        estimatedDelivery: c.estimatedDelivery,
        prediction: PredictiveService.predictDelay(c),
        lastScan: c.lastScan,
        scansCount: c.scans.length
      }))
      .filter(c => c.prediction.willBeDelayed)
      .sort((a, b) => b.prediction.delayProbability - a.prediction.delayProbability);

    res.json({
      success: true,
      count: atRiskConsignments.length,
      data: atRiskConsignments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get operations summary by region/facility
router.get('/operations-summary', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    
    // Group by destination
    const byDestination = {};
    consignments.forEach(c => {
      if (!byDestination[c.destination]) {
        byDestination[c.destination] = {
          total: 0,
          inTransit: 0,
          delivered: 0,
          atRisk: 0,
          alerts: 0
        };
      }
      byDestination[c.destination].total++;
      if (c.status === 'IN_TRANSIT') byDestination[c.destination].inTransit++;
      if (c.status === 'DELIVERED') byDestination[c.destination].delivered++;
      if (PredictiveService.predictDelay(c).willBeDelayed) byDestination[c.destination].atRisk++;
      
      const consignmentAlerts = AlertService.getAlertsByAWB(c.awb).filter(a => a.status === 'ACTIVE');
      byDestination[c.destination].alerts += consignmentAlerts.length;
    });

    res.json({
      success: true,
      data: byDestination
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
