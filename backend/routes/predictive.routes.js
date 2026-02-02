const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const PredictiveService = require('../services/PredictiveService');

// Predict delay for AWB
router.get('/:awb/delay-prediction', (req, res) => {
  try {
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    const prediction = PredictiveService.predictDelay(consignment);
    const deliveryEstimate = PredictiveService.estimateDeliveryTime(consignment);

    res.json({
      success: true,
      data: {
        awb: consignment.awb,
        prediction,
        deliveryEstimate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all predictions
router.get('/analytics/all-predictions', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    const predictions = consignments.map(c => ({
      awb: c.awb,
      status: c.status,
      destination: c.destination,
      prediction: PredictiveService.predictDelay(c),
      deliveryEstimate: PredictiveService.estimateDeliveryTime(c)
    }));

    const atRisk = predictions.filter(p => p.prediction.willBeDelayed);

    res.json({
      success: true,
      data: {
        total: predictions.length,
        atRisk: atRi***REMOVED***length,
        riskPercentage: ((atRi***REMOVED***length / predictions.length) * 100).toFixed(1),
        predictions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical metrics
router.get('/analytics/metrics', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    const metrics = PredictiveService.getHistoricalMetrics(consignments);

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
