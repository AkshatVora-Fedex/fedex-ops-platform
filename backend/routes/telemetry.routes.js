const express = require('express');
const router = express.Router();

// Mock telemetry data generator
const generateTelemetryData = (awb) => {
  const types = ['vehicle', 'handheld', 'environmental', 'network', 'gps'];
  const data = [];

  for (let i = 0; i < 10; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    let entry = {
      type,
      timestamp: new Date(Date.now() - i * 5000).toISOString()
    };

    switch (type) {
      case 'vehicle':
        entry.metric = Math.random() > 0.5 ? 'Speed' : 'Fuel Level';
        entry.value = entry.metric === 'Speed' ? Math.floor(Math.random() * 70) : Math.floor(Math.random() * 100);
        entry.unit = entry.metric === 'Speed' ? 'mph' : '%';
        entry.status = entry.value > 50 ? 'NORMAL' : 'WARNING';
        break;
      
      case 'handheld':
        entry.metric = Math.random() > 0.5 ? 'Battery Level' : 'Scan Rate';
        entry.value = Math.floor(Math.random() * 100);
        entry.unit = entry.metric === 'Battery Level' ? '%' : 'scans/min';
        entry.status = entry.value > 30 ? 'NORMAL' : 'WARNING';
        break;
      
      case 'environmental':
        entry.metric = Math.random() > 0.5 ? 'Temperature' : 'Humidity';
        entry.value = entry.metric === 'Temperature' ? Math.floor(Math.random() * 40 + 50) : Math.floor(Math.random() * 100);
        entry.unit = entry.metric === 'Temperature' ? '°F' : '%';
        entry.status = 'NORMAL';
        break;
      
      case 'network':
        entry.metric = 'Signal Strength';
        entry.value = ['Excellent', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 4)];
        entry.status = entry.value === 'Excellent' || entry.value === 'Good' ? 'NORMAL' : 'WARNING';
        break;
      
      case 'gps':
        entry.metric = 'GPS Coordinates';
        entry.coordinates = {
          lat: 35.149534 + (Math.random() - 0.5) * 0.1,
          lng: -90.048981 + (Math.random() - 0.5) * 0.1
        };
        entry.status = 'NORMAL';
        break;
    }

    data.push(entry);
  }

  return data;
};

// GET /api/telemetry/stream/:awb - Get telemetry data stream
router.get('/stream/:awb', (req, res) => {
  try {
    const { awb } = req.params;
    const data = generateTelemetryData(awb);

    const stats = {
      vehicleSpeed: Math.floor(Math.random() * 70),
      batteryLevel: Math.floor(Math.random() * 100),
      signalStrength: ['Strong', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
      temperature: Math.floor(Math.random() * 30 + 60)
    };

    res.json({
      success: true,
      data,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/telemetry/subscribe - Subscribe to telemetry updates
router.post('/subscribe', (req, res) => {
  try {
    const { awb, types } = req.body;

    res.json({
      success: true,
      data: {
        awb,
        subscribed: types || ['all'],
        interval: 3000
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
