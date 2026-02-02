const express = require('express');
const router = express.Router();

// Mock message storage
const messages = {};

// GET /api/comms/thread/:awb - Get message thread for AWB
router.get('/thread/:awb', (req, res) => {
  try {
    const { awb } = req.params;
    const thread = messages[awb] || [];

    res.json({
      success: true,
      data: thread
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/comms/send - Send message to courier
router.post('/send', (req, res) => {
  try {
    const { awb, text, sender, priority } = req.body;

    if (!awb || !text) {
      return res.status(400).json({
        success: false,
        error: 'AWB and message text are required'
      });
    }

    const message = {
      awb,
      text,
      sender: sender || 'operations',
      timestamp: new Date().toISOString(),
      priority: priority || 'normal',
      delivered: true
    };

    if (!messages[awb]) {
      messages[awb] = [];
    }

    messages[awb].push(message);

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/comms/courier/:awb - Get courier info for AWB
router.get('/courier/:awb', (req, res) => {
  try {
    const { awb } = req.params;

    // Mock courier data
    const courierInfo = {
      name: 'John Smith',
      id: 'C-1234',
      vehicle: 'V-5678',
      status: 'active',
      phone: '+1-555-0100'
    };

    res.json({
      success: true,
      data: courierInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
