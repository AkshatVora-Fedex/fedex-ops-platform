const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const PredictiveService = require('../services/PredictiveService');
const AlertService = require('../services/AlertService');

// Cache for dashboard stats (30 second TTL)
let dashboardCache = null;
let dashboardCacheTime = 0;
const CACHE_TTL = 30000; // 30 seconds

// Get dashboard overview
router.get('/overview', async (req, res) => {
  try {
    // Return cached data if fresh
    if (dashboardCache && Date.now() - dashboardCacheTime < CACHE_TTL) {
      return res.json(dashboardCache);
    }
    
    const consignments = await AWBData.getAllConsignments();
    const alerts = AlertService.getActiveAlerts();
    const historicalStats = await AWBData.getHistoricalStats();

    const totalConsignments = consignments.length;
    // Status mapping for IN SPAC NSL data buckets
    const deliveredOrNearDeliveryStatuses = new Set(['DELIVERED', 'DX', 'OnTime', 'DEST', 'CLEARANCE']);
    const inTransitStatuses = new Set(['ORIGIN', 'HUB', 'TRANSIT-Processing', 'TRANSIT-Linehaul']);
    const delayedStatuses = new Set(['DELAYED', 'WDL', 'Late', 'Very Late']);
    const exceptionStatuses = new Set(['EXCEPTION', 'EWDL', 'ERDL', 'EXCLUDE', 'UNASSIGNED']);

    let delivered = 0;
    let delayed = 0;
    let exceptions = 0;
    let atRisk = 0;
    let activeInTransit = 0;
    
    // Alert counters - calculate from predictions
    let criticalAlerts = 0;
    let highAlerts = 0;
    let mediumAlerts = 0;
    let lowAlerts = 0;

    consignments.forEach(c => {
      const status = c.status || 'Other';
      
      // Count by status category
      if (deliveredOrNearDeliveryStatuses.has(status)) {
        delivered++;
      } else if (inTransitStatuses.has(status)) {
        activeInTransit++;
      } else if (delayedStatuses.has(status)) {
        delayed++;
      } else if (exceptionStatuses.has(status)) {
        exceptions++;
      }

      const prediction = PredictiveService.predictDelay(c);
      if (prediction.willBeDelayed) {
        atRisk++;
        
        // Map risk level to alert severity
        if (prediction.riskLevel === 'CRITICAL') {
          criticalAlerts++;
        } else if (prediction.riskLevel === 'HIGH') {
          highAlerts++;
        } else if (prediction.riskLevel === 'MEDIUM') {
          mediumAlerts++;
        } else if (prediction.riskLevel === 'LOW') {
          lowAlerts++;
        }
      }
    });

    // In-transit is everything not delivered/near-delivery
    const inTransit = activeInTransit + (totalConsignments - delivered - activeInTransit - delayed - exceptions);

    // Create alert stats from predictions
    const alertStats = {
      total: atRisk,
      active: atRisk,
      acknowledged: 0,
      resolved: 0,
      bySeverity: {
        CRITICAL: criticalAlerts,
        HIGH: highAlerts,
        MEDIUM: mediumAlerts,
        LOW: lowAlerts
      }
    };

    const response = {
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
    };
    
    // Cache the response
    dashboardCache = response;
    dashboardCacheTime = Date.now();
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cache for metrics (30 second TTL)
let metricsCache = null;
let metricsCacheTime = 0;

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
  try {
    // Return cached data if fresh
    if (metricsCache && Date.now() - metricsCacheTime < CACHE_TTL) {
      return res.json(metricsCache);
    }
    
    const consignments = await AWBData.getAllConsignments();
    const predictions = consignments.map(c => PredictiveService.predictDelay(c));
    const criticalRisk = predictions.filter(p => p.riskLevel === 'CRITICAL').length;
    const highRisk = predictions.filter(p => p.riskLevel === 'HIGH').length;
    const mediumRisk = predictions.filter(p => p.riskLevel === 'MEDIUM').length;

    const historicalMetrics = PredictiveService.getHistoricalMetrics(consignments);

    const response = {
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
    };
    
    // Cache the response
    metricsCache = response;
    metricsCacheTime = Date.now();
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get at-risk consignments with pagination
router.get('/at-risk', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const consignments = await AWBData.getAllConsignments();
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
      .sort((a, b) => b.prediction.delayProbability - a.prediction.delayProbability)
      .slice(0, limit);

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
router.get('/operations-summary', async (req, res) => {
  try {
    const consignments = await AWBData.getAllConsignments();

    // Use the same status mapping as overview
    const deliveredOrNearDeliveryStatuses = new Set(['DELIVERED', 'DX', 'OnTime', 'DEST', 'CLEARANCE']);
    const inTransitStatuses = new Set(['ORIGIN', 'HUB', 'TRANSIT-Processing', 'TRANSIT-Linehaul']);

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
      
      const status = c.status || 'Other';
      if (deliveredOrNearDeliveryStatuses.has(status)) {
        byDestination[c.destination].delivered++;
      } else {
        byDestination[c.destination].inTransit++;
      }
      
      if (PredictiveService.predictDelay(c).willBeDelayed) {
        byDestination[c.destination].atRisk++;
      }

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

// Get regional performance metrics from historical data
router.get('/regional-metrics', async (req, res) => {
  try {
    const metrics = await AWBData.getRegionalMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get performance distribution by status/bucket
router.get('/performance-distribution', async (req, res) => {
  try {
    const distribution = await AWBData.getHistoricalGrouped('bucket');
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time-based performance trends
router.get('/performance-trends', async (req, res) => {
  try {
    const trends = await AWBData.getTimeBasedStats();
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
