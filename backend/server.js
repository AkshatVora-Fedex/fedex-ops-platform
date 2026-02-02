const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const moment = require('moment');
const seedMockData = require('./seedData');

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
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║  FedEx Operations Platform Backend                     ║
║  Running on port ${PORT}                               ║
║  Environment: ${process.env.NODE_ENV || 'development'}               ║
╚════════════════════════════════════════════════════════╝
  `);
  
  // Seed mock data on startup
  seedMockData();
  console.log('Server is listening and ready for requests...');
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
