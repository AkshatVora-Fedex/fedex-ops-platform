const express = require('express');
const router = express.Router();
const AWBData = require('../models/AWBData');
const ScanData = require('../models/ScanData');

// Get tracking details for AWB
router.get('/:awb', (req, res) => {
  try {
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    const scanValidation = ScanData.validateScans(
      consignment.awb,
      consignment.scans,
      consignment.serviceType
    );

    res.json({
      success: true,
      data: {
        awb: consignment.awb,
        status: consignment.status,
        currentLocation: consignment.currentLocation,
        lastUpdate: consignment.lastScan?.timestamp,
        scans: consignment.scans.map(s => ({
          timestamp: s.timestamp,
          type: s.type,
          typeName: ScanData.getScanType(s.type).name,
          location: s.location,
          latitude: s.latitude,
          longitude: s.longitude,
          details: s.details,
          facilityCode: s.facilityCode
        })),
        scanValidation,
        route: {
          origin: consignment.origin,
          destination: consignment.destination,
          estimatedDelivery: consignment.estimatedDelivery
        }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get scan checklist for specific AWB
router.get('/:awb/checklist', (req, res) => {
  try {
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    const expectedChecklist = ScanData.getExpectedChecklist(consignment);
    const actualScans = consignment.scans.map(s => s.type);

    const checklist = expectedChecklist.map((item, index) => {
      const expectedType = item.expected.type;
      return {
        ...item,
        actual: actualScans[index] ? {
          type: actualScans[index],
          name: ScanData.getScanType(actualScans[index]).name,
          scan: consignment.scans[index]
        } : null,
        status: actualScans[index] === expectedType ? 'COMPLETED' : actualScans[index] ? 'DISCREPANCY' : 'PENDING',
        discrepancyNote: actualScans[index] && actualScans[index] !== expectedType 
          ? `Expected ${expectedType}, got ${actualScans[index]}`
          : null
      };
    });

    res.json({
      success: true,
      data: {
        awb: consignment.awb,
        serviceType: consignment.serviceType,
        totalExpected: expectedChecklist.length,
        totalCompleted: actualScans.filter((actual, idx) => actual === expectedChecklist[idx]?.expected?.type).length,
        checklist
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get live location
router.get('/:awb/location', (req, res) => {
  try {
    const consignment = AWBData.getConsignmentByAWB(req.params.awb);

    if (!consignment) {
      return res.status(404).json({ error: 'Consignment not found' });
    }

    const lastScan = consignment.lastScan;

    res.json({
      success: true,
      data: {
        awb: consignment.awb,
        currentLocation: consignment.currentLocation,
        latitude: lastScan?.latitude || 0,
        longitude: lastScan?.longitude || 0,
        lastUpdate: lastScan?.timestamp,
        accuracy: 'HIGH'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
