const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const PredictiveService = require('../services/PredictiveService');

// Predict delay for AWB
router.get('/:awb/delay-prediction', async (req, res) => {
  try {
    const consignment = await AWBData.getConsignmentByAWB(req.params.awb);

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

// Get all predictions with pagination and caching
let predictionsCache = null;
let predictionsCacheTime = 0;
const PREDICTIONS_CACHE_TTL = 60000; // 1 minute

router.get('/analytics/all-predictions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    // Use cache for first page
    if (page === 1 && predictionsCache && Date.now() - predictionsCacheTime < PREDICTIONS_CACHE_TTL) {
      return res.json(predictionsCache);
    }
    
    const allConsignments = await AWBData.getAllConsignments();
    const totalCount = allConsignments.length;
    const consignments = allConsignments.slice(skip, skip + limit);
    
    const predictions = consignments.map(c => {
      const prediction = PredictiveService.predictDelay(c);
      const deliveryEstimate = PredictiveService.estimateDeliveryTime(c);

      return {
        awb: c.awb,
        status: c.status,
        origin: c.origin,
        destination: c.destination,
        serviceType: c.serviceType,
        promiseDate: deliveryEstimate?.revisedEstimate || c.estimatedDelivery,
        delayProbability: prediction.delayProbability,
        riskLevel: prediction.riskLevel,
        prediction,
        deliveryEstimate
      };
    });

    const atRisk = predictions.filter(p => p.prediction?.willBeDelayed);

    const response = {
      success: true,
      count: predictions.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: {
        total: predictions.length,
        atRisk: atRi***REMOVED***length,
        riskPercentage: predictions.length
          ? ((atRi***REMOVED***length / predictions.length) * 100).toFixed(1)
          : '0.0',
        predictions
      }
    };
    
    // Cache first page response
    if (page === 1) {
      predictionsCache = response;
      predictionsCacheTime = Date.now();
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical metrics
router.get('/analytics/metrics', async (req, res) => {
  try {
    const consignments = await AWBData.getAllConsignments();
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
