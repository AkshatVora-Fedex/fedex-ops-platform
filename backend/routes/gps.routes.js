const express = require('express');
const router = express.Router();

// Mock GPS data for demonstration
const gpsData = {
  'AWB12345678': {
    position: {
      coordinates: [-90.048981, 35.149534], // Memphis
      speed: 55,
      timestamp: new Date().toISOString(),
      driver: 'John Smith',
      vehicleId: 'V-1234'
    },
    route: {
      plannedRoute: [
        [-90.048981, 35.149534], // Memphis
        [-90.055, 35.152],
        [-90.065, 35.160],
        [-90.075, 35.170],
        [-90.085, 35.180],
        [-86.781602, 36.162664]  // Nashville
      ],
      actualRoute: [
        [-90.048981, 35.149534],
        [-90.055, 35.152],
        [-90.065, 35.160]
      ],
      origin: {
        coordinates: [-90.048981, 35.149534],
        city: 'Memphis',
        country: 'USA',
        code: 'MEM'
      },
      destination: {
        coordinates: [-86.781602, 36.162664],
        city: 'Nashville',
        country: 'USA',
        code: 'BNA'
      },
      scanLocations: [
        {
          type: 'PUX',
          code: 'PU01',
          coordinates: [-90.048981, 35.149534],
          facility: 'FedEx Memphis Hub',
          timestamp: '2026-02-02T08:00:00Z'
        },
        {
          type: 'STAT',
          code: 'ST02',
          coordinates: [-90.065, 35.160],
          facility: 'Memphis Sorting Facility',
          timestamp: '2026-02-02T09:30:00Z'
        },
        {
          type: 'DEX',
          code: 'DL01',
          coordinates: [-86.781602, 36.162664],
          facility: 'Nashville Distribution Center',
          timestamp: '2026-02-02T12:00:00Z'
        }
      ]
    }
  },
  'AWB87654321': {
    position: {
      coordinates: [-86.148003, 39.790942], // Indianapolis
      speed: 45,
      timestamp: new Date().toISOString(),
      driver: 'Sarah Johnson',
      vehicleId: 'V-5678'
    },
    route: {
      plannedRoute: [
        [-86.148003, 39.790942], // Indianapolis
        [-86.135, 39.795],
        [-86.120, 39.800],
        [-87.650200, 41.881832]  // Chicago
      ],
      actualRoute: [
        [-86.148003, 39.790942],
        [-86.135, 39.795]
      ],
      origin: {
        coordinates: [-86.148003, 39.790942],
        city: 'Indianapolis',
        country: 'USA',
        code: 'IND'
      },
      destination: {
        coordinates: [-87.650200, 41.881832],
        city: 'Chicago',
        country: 'USA',
        code: 'ORD'
      },
      scanLocations: [
        {
          type: 'PUX',
          code: 'PU02',
          coordinates: [-86.148003, 39.790942],
          facility: 'FedEx Indianapolis Hub',
          timestamp: '2026-02-02T07:00:00Z'
        }
      ]
    }
  }
};

// GET /api/gps/position/:awb - Get current GPS position
router.get('/position/:awb', (req, res) => {
  try {
    const { awb } = req.params;
    const data = gpsData[awb];
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'GPS data not found for this AWB'
      });
    }

    res.json({
      success: true,
      data: data.position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/gps/route/:awb - Get planned and actual route
router.get('/route/:awb', (req, res) => {
  try {
    const { awb } = req.params;
    const data = gpsData[awb];
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Route data not found for this AWB'
      });
    }

    res.json({
      success: true,
      data: data.route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/gps/breadcrumb/:awb - Get GPS history/breadcrumb trail
router.get('/breadcrumb/:awb', (req, res) => {
  try {
    const { awb } = req.params;
    const data = gpsData[awb];
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Breadcrumb data not found for this AWB'
      });
    }

    res.json({
      success: true,
      data: {
        awb,
        trail: data.route.actualRoute,
        lastUpdate: data.position.timestamp
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
