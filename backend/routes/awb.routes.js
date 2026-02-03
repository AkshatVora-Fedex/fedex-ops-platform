const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const ScanData = require('../models/ScanData');
const AlertService = require('../services/AlertService');
const PredictiveService = require('../services/PredictiveService');

// Create/Register new consignment
router.post('/register', (req, res) => {
  try {
    const { awb, shipper, receiver, origin, destination, weight, serviceType, estimatedDelivery } = req.body;

    if (!awb) {
      return res.status(400).json({ error: 'AWB is required' });
    }

    const consignment = AWBData.createConsignment(awb, {
      shipper,
      receiver,
      origin,
      destination,
      weight,
      serviceType,
      estimatedDelivery
    });

    res.status(201).json({
      success: true,
      message: 'Consignment registered successfully',
      data: consignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all consignments with pagination
router.get('/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    const allConsignments = await AWBData.getAllConsignments();
    const totalCount = allConsignments.length;
    const consignments = allConsignments.slice(skip, skip + limit);
    
    res.json({
      success: true,
      count: consignments.length,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      data: consignments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consignment by AWB
router.get('/:awb', async (req, res) => {
  try {
    const consignment = await AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    // Get related data
    const scanValidation = ScanData.validateScans(
      consignment.awb,
      consignment.scans,
      consignment.serviceType
    );
    const prediction = PredictiveService.predictDelay(consignment);
    const alerts = AlertService.getAlertsByAWB(req.params.awb);

    res.json({
      success: true,
      data: consignment,
      scanValidation,
      prediction,
      alerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add scan to consignment
router.post('/:awb/scan', async (req, res) => {
  try {
    const { type, location, latitude, longitude, details, facilityCode, courierID } = req.body;
    const consignment = await AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    const scan = AWBData.addScan(req.params.awb, {
      type,
      location,
      latitude,
      longitude,
      details,
      facilityCode,
      courierID
    });

    // Check alerts after adding scan
    const newAlerts = AlertService.checkConsignment(consignment);

    res.json({
      success: true,
      message: 'Scan added successfully',
      data: scan,
      newAlerts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update consignment status
router.patch('/:awb/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = AWBData.updateConsignmentStatus(req.params.awb, status);

    if (!updated) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical data with filters
router.get('/historical/filtered', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      region: req.query.region,
      service: req.query.service,
      awb: req.query.awb
    };
    
    const data = await AWBData.getHistoricalDataWithFilters(filters);
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical data grouped by dimension
router.get('/historical/grouped/:groupBy', async (req, res) => {
  try {
    const { groupBy } = req.params;
    const grouped = await AWBData.getHistoricalGrouped(groupBy);
    res.json({
      success: true,
      groupedBy: groupBy,
      data: grouped
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get time-based statistics
router.get('/historical/stats/time', async (req, res) => {
  try {
    const stats = await AWBData.getTimeBasedStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get full historical record by AWB
router.get('/historical/:awb', async (req, res) => {
  try {
    const data = await AWBData.getFullHistoricalByAWB(req.params.awb);
    if (!data) {
      return res.status(404).json({ error: 'Historical record not found' });
    }
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
