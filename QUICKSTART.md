# FedEx Operations Proactivity Platform - Setup Guide

## 🚀 Quick Start (Choose Your Method)

### Method 1: One-Click Start (Easiest - Windows Only)

**Double-click:** `START_ALL.bat` in the root folder

This will:
- ✅ Start Backend API (Port 5000)
- ✅ Start WebSocket Server (Port 5001)  
- ✅ Start Frontend React App (Port 3000)
- ✅ Open browser automatically

---

### Method 2: Manual Command Line

#### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
✅ Server will run on `http://localhost:5000`
✅ Mock data will be automatically seeded

#### 2. Start Frontend Application
```bash
cd frontend
npm install
npm start
```
✅ Application will open on `http://localhost:3000`

---

### Method 3: Individual Services (Windows)

**Backend only:**  
Double-click `START_BACKEND.bat`

**Frontend only:**  
Double-click `START_FRONTEND.bat`

**Backend + WebSocket:**  
Double-click `START_ALL_BACKEND.bat`

---

## Features Overview

### 📊 Dashboard
Access at: `http://localhost:3000`
- Real-time metrics (Total, In Transit, Delivered, At Risk)
- Alert summary by severity
- Risk distribution visualization
- Operations overview

### 🔍 Search Consignments
Access at: `http://localhost:3000/search`
- Search by AWB number
- View complete consignment details
- Service type and route information
- Shipper and receiver details

### 📈 Detailed Tracking
Access any tracked AWB from the search result to see:
- **Timeline Tab**: Complete scan history with locations and times
- **Checklist Tab**: Expected vs actual scans with discrepancy detection
- **Alerts Tab**: All active alerts related to the consignment
- **Delay Prediction**: Probability and reasons for predicted delays

### ⚠️ Alert Center
Access at: `http://localhost:3000/alerts`
- View all active alerts across the network
- Filter by severity (Critical, High, Medium, Low)
- Acknowledge alerts to mark as reviewed
- Resolve alerts when issues are fixed
- Alert statistics dashboard

### 🌐 Global Command Center
Access at: `http://localhost:3000/global-command`
- **LiveTicker**: Animated network status marquee
- **Interactive Maps**: Leaflet integration with hub markers and routes
- **AI Briefing**: Click "Generate Shift Briefing" for AI insights

### 🏭 Hub Pulse Monitor
Access at: `http://localhost:3000/hub-pulse`
- Real-time hub capacity monitoring (6 major hubs)
- Load bars for inbound/outbound volumes
- Weather conditions at each hub
- **AI Network Balancer**: Load balancing recommendations

### 📦 Shipments List
Access at: `http://localhost:3000/shipments`
- Comprehensive shipment table with filters
- **AI Anomaly Scan**: Pattern detection across shipments
- Export functionality

### 📈 Analytics Dashboard (Admin Only)
Access at: `http://localhost:3000/analytics`
- 4 KPI cards (OTP, Exception Rate, Transit Time, Model Accuracy)
- Trend charts with Chart.js
- Root cause analysis donut chart
- Heatmap for failure distribution
- Time range selector and export

## Test Scenarios

### Pre-populated Test AWBs

1. **7488947329** - On-Track Delivery (NYC → LA)
   - Status: In transit, on schedule
   - Scans: PUX → STAT (2 scans)

2. **7488947330** - Delayed Delivery (Seattle → Miami)
   - Status: PAST estimated delivery time
   - Alert: DELAY_WARNING
   - Good for testing delay prediction

3. **7488947331** - Delivery Exception (Houston → Boston)
   - Status: Delivery exception
   - Alert: DELIVERY_EXCEPTION
   - Demonstrates failed delivery handling

4. **7488947332** - Express Service (Dallas → Phoenix)
   - Status: Out for delivery
   - Scans: PUX → STAT → OTH
   - Nearly complete delivery

## API Testing

### Example: Get Consignment Details
```bash
curl http://localhost:5000/api/awb/7488947329
```

### Example: Get Delay Prediction
```bash
curl http://localhost:5000/api/predictive/7488947329/delay-prediction
```

### Example: Add a Scan
```bash
curl -X POST http://localhost:5000/api/awb/7488947329/scan \
  -H "Content-Type: application/json" \
  -d '{
    "type": "STAT",
    "location": "Las Vegas Distribution Center",
    "latitude": 36.1699,
    "longitude": -115.1398,
    "details": "In transit",
    "facilityCode": "LAS01",
    "courierID": "CUR010"
  }'
```

### Example: Get Alert Statistics
```bash
curl http://localhost:5000/api/alerts/stats/summary
```

## Dashboard Interpretation

### Metrics Cards
- **Total Consignments**: All registered shipments
- **In Transit**: Currently moving
- **Delivered**: Successfully completed
- **At Risk**: Predicted to be delayed

### Alert Severity
- 🔴 **CRITICAL**: Immediate action required (8+ hour stall, missed SLA by hours)
- 🟠 **HIGH**: Urgent attention (4+ hour delay, delivery exception)
- 🟡 **MEDIUM**: Monitor closely (2+ hour wait, missed scan window)
- 🟢 **LOW**: Informational (approaching delivery window)

### Risk Levels
- **CRITICAL** (70-100%): Very high probability of delay
- **HIGH** (50-70%): Significant delay risk
- **MEDIUM** (30-50%): Moderate risk
- **LOW** (0-30%): Low risk, likely on schedule

## Scan Types Reference

| Code | Name | Meaning |
|------|------|---------|
| PUX | Pickup | Package picked up from shipper |
| DEX | Delivery Exception | Delivery attempt failed |
| STAT | Status | Package in transit |
| OTH | Out for Delivery | Package out with courier |
| DX | Delivered | Package successfully delivered |
| RTO | Return to Origin | Package returned to sender |
| CUST | Customs | International customs processing |
| LSP | Last Scan Point | Final scan before delivery |

## Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -an | grep 5000

# Try different port
PORT=5001 npm run dev
```

### Frontend won't connect to backend
- Ensure backend is running on http://localhost:5000
- Check CORS is enabled (it is by default)
- Verify no proxy conflicts in package.json

### No mock data appears
- Restart the backend server
- Data is seeded automatically on startup
- Check browser console for errors

## Next Steps

### Customize for Your Operations
1. Update mock data in `backend/seedData.js` with real facility codes
2. Adjust prediction thresholds in `backend/services/PredictiveService.js`
3. Add your SLA rules in `backend/models/AlertData.js`
4. Customize branding in `frontend/src/App.jsx`

### Production Deployment
1. Replace in-memory store with MongoDB
2. Add authentication (JWT recommended)
3. Implement database backups
4. Set up load balancing
5. Configure monitoring and logging
6. Deploy to cloud (AWS, Azure, GCP)

### Integration Points
1. **Real FedEx APIs**: Replace mock scan data
2. **Email/SMS Notifications**: Integrate alerting
3. **ERP Systems**: Sync with SAP/Oracle
4. **GIS Systems**: Real-time courier location
5. **Customer Portal**: Expose select data

---

For detailed technical documentation, see README.md
