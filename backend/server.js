const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const seedMockData = require('./seedData');
const AWBData = require('./models/AWBData');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const awbRoutes = require('./routes/awb.routes');
const trackingRoutes = require('./routes/tracking.routes');
const predictiveRoutes = require('./routes/predictive.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const alertRoutes = require('./routes/alert.routes');
const scanCodesRoutes = require('./routes/scan-codes.routes');
const gpsRoutes = require('./routes/gps.routes');
const commsRoutes = require('./routes/comms.routes');
const telemetryRoutes = require('./routes/telemetry.routes');
const trendsRoutes = require('./routes/trends.routes');
const searchRoutes = require('./routes/search.routes');

// Import services
const AlertService = require('./services/AlertService');

// Routes
app.use('/api/awb', awbRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/scan-codes', scanCodesRoutes);
app.use('/api/gps', gpsRoutes);
app.use('/api/comms', commsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/search', searchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: moment().format('YYYY-MM-DD HH:mm:ss') });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  FedEx Operations Platform Backend                     ║
║  Running on port ${PORT}                               ║
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
╚════════════════════════════════════════════════════════╝
  `);
  
  // Seed mock data on startup
  seedMockData();
  
  // Log historical data stats
  try {
    const stats = await AWBData.getHistoricalStats();
    console.log(`📊 Historical Data Loaded:`);
    console.log(`   Total AWBs: ${stats.total.toLocaleString()}`);
    console.log(`   On-Time: ${(stats.byStatus['OnTime'] || 0).toLocaleString()}`);
    console.log(`   Delayed: ${((stats.byStatus['WDL'] || 0) + (stats.byStatus['EWDL'] || 0)).toLocaleString()}`);
  } catch (error) {
    console.warn('⚠️  Could not load historical stats:', error.message);
  }

  // Seed test alerts from historical data samples
  try {
    const historicalData = await AWBData.getHistoricalData();
    // Sample first 20 records for alert generation
    const sampleSize = Math.min(20, historicalData.length);
    
    for (let i = 0; i < sampleSize; i++) {
      const awb = historicalData[i];
      
      // Generate simple alerts based on status
      if (awb.performance?.bucket === 'EXCLUDE' || awb.status === 'EXCLUDE') {
        // Create a CRITICAL alert for excluded shipments
        const alert = {
          id: require('uuid').v4(),
          awb: awb.awb,
          ruleId: 'NO_MOVEMENT',
          ruleName: 'No Movement',
          severity: 'CRITICAL',
          description: 'Package has not moved in 8+ hours',
          details: { source: 'historical' },
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          assignedTo: null,
          notes: []
        };
        AlertService.alertData.alerts.push(alert);
      } else if (awb.performance?.bucket === 'TRANSIT-Linehaul') {
        // Create HIGH alert for linehaul transit
        const alert = {
          id: require('uuid').v4(),
          awb: awb.awb,
          ruleId: 'DELAY_WARNING',
          ruleName: 'Delivery Delay Warning',
          severity: 'HIGH',
          description: 'Package is behind schedule',
          details: { source: 'historical' },
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          assignedTo: null,
          notes: []
        };
        AlertService.alertData.alerts.push(alert);
      }
    }
    
    console.log(`  ✓ Generated ${AlertService.alertData.alerts.length} alerts from historical AWB data`);
  } catch (error) {
    console.error('  ✗ Error generating alerts:', error.message);
  }

  console.log('\n✅ Server is ready for requests...');
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
