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

// Get all consignments
router.get('/all', (req, res) => {
  try {
    const consignments = AWBData.getAllConsignments();
    res.json({
      success: true,
      count: consignments.length,
      data: consignments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get consignment by AWB
router.get('/:awb', (req, res) => {
  try {
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

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
router.post('/:awb/scan', (req, res) => {
  try {
    const { type, location, latitude, longitude, details, facilityCode, courierID } = req.body;
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

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

module.exports = router;
