# FedEx Operations Platform - System Architecture

## Overview

The FedEx Operations Proactivity Platform is built using a **modern, scalable microservices-ready architecture** with clear separation of concerns.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Search │ Tracking │ Alerts │ Analytics         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                    │
├─────────────────────────────────────────────────────────────┤
│  API Routes                                                 │
│  ├─ AWB Routes (registration, management)                  │
│  ├─ Tracking Routes (live tracking, checklists)            │
│  ├─ Predictive Routes (delay predictions, analytics)       │
│  ├─ Dashboard Routes (metrics, summaries)                  │
│  └─ Alert Routes (alert management, statistics)            │
├─────────────────────────────────────────────────────────────┤
│  Services (Business Logic)                                  │
│  ├─ PredictiveService (delay prediction algorithm)         │
│  ├─ AlertService (alert generation and management)         │
│  └─ Utilities (validation, helpers)                        │
├─────────────────────────────────────────────────────────────┤
│  Models (Data Layer)                                        │
│  ├─ AWBData (consignment management)                       │
│  ├─ ScanData (scan validation and sequencing)              │
│  └─ AlertData (alert storage and retrieval)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
           ┌───────────┴────────────┐
           ▼                        ▼
    ┌─────────────┐         ┌─────────────┐
    │In-Memory    │         │  (Future)   │
    │Data Store   │         │  MongoDB    │
    └─────────────┘         └─────────────┘
```

## Component Architecture

### Backend Layers

#### 1. Routes Layer (`/routes`)
**Responsibility**: HTTP endpoint handling and request validation

```
awb.routes.js
├─ POST /register       → Register new consignment
├─ GET /all            → Retrieve all consignments
├─ GET /:awb           → Get specific consignment
├─ POST /:awb/scan     → Add scan record
└─ PATCH /:awb/status  → Update status

tracking.routes.js
├─ GET /:awb           → Get tracking details
├─ GET /:awb/checklist → Get scan validation
└─ GET /:awb/location  → Get live location

predictive.routes.js
├─ GET /:awb/delay-prediction      → Predict delay
├─ GET /analytics/all-predictions  → All predictions
└─ GET /analytics/metrics          → Historical metrics

alert.routes.js
├─ GET /active         → Get active alerts
├─ GET /:awb           → Get alerts for consignment
├─ PATCH /:alertId/... → Manage alerts
└─ GET /stats/summary  → Alert statistics

dashboard.routes.js
├─ GET /overview         → Dashboard overview
├─ GET /metrics          → Risk metrics
├─ GET /at-risk          → At-risk consignments
└─ GET /operations-summary  → By destination
```

#### 2. Services Layer (`/services`)
**Responsibility**: Business logic and algorithms

**PredictiveService**
```javascript
- predictDelay(consignment)
  └─ Analyzes: elapsed time, scans, exceptions, progression
  └─ Returns: probability, risk level, reasons
  
- estimateDeliveryTime(consignment)
  └─ Calculates revised delivery estimate
  
- getHistoricalMetrics(consignments)
  └─ Aggregates delay statistics
```

**AlertService**
```javascript
- checkConsignment(consignment)
  └─ Validates against all alert rules
  └─ Creates alerts for violations
  
- getActiveAlerts()
  └─ Returns all unresolved alerts
  
- updateAlertStatus()
  └─ Manages alert lifecycle
```

#### 3. Models Layer (`/models`)
**Responsibility**: Data management and validation

**AWBData**
```javascript
- getAllConsignments()
- getConsignmentByAWB(awb)
- createConsignment(awb, data)
- addScan(awb, scanData)
- updateConsignmentStatus(awb, status)
```

**ScanData**
```javascript
- getScanType(code)
- getExpectedSequence(serviceType)
- validateScans(awb, scans, serviceType)
```

**AlertData**
```javascript
- createAlert(awb, ruleId, details)
- getAlertsByAWB(awb)
- updateAlertStatus(alertId, status)
```

### Frontend Layers

#### 1. Pages/Components (`/src/components`)

**Dashboard.jsx**
- Fetches overview and metrics
- Displays KPI cards
- Shows alert summary
- Risk distribution visualization

**ConsignmentLookup.jsx**
- AWB search form
- Consignment detail display
- Navigation to detailed tracking

**TrackingDetails.jsx**
- Tabbed interface (Timeline, Checklist, Alerts)
- Scan timeline visualization
- Scan validation checklist
- Prediction alert banner
- Associated alerts

**AlertCenter.jsx**
- Alert list with filtering
- Severity-based color coding
- Acknowledge/Resolve actions
- Statistics dashboard

#### 2. Services (`/src/services/api.js`)
- Centralized API client (Axios)
- Service modules for each backend feature
- Error handling and response mapping

#### 3. Styles (`/src/styles`)
- Component-scoped CSS
- Color scheme and themes
- Responsive design patterns
- Animation and transitions

## Data Flow

### Consignment Registration Flow
```
User Input (AWB Form)
    │
    ▼
POST /api/awb/register
    │
    ▼
awb.routes.js (validate input)
    │
    ▼
AWBData.createConsignment() (store in memory)
    │
    ▼
Response: Consignment Object
```

### Scan Addition & Alert Generation
```
Scan Data Input
    │
    ▼
POST /api/awb/:awb/scan
    │
    ▼
awb.routes.js (validate scan)
    │
    ▼
AWBData.addScan() (add to scans array)
    │
    ▼
AlertService.checkConsignment() (run alert rules)
    │
    ├─ Check delivery exceptions
    ├─ Check for no movement
    ├─ Check missed scans
    ├─ Check delay warnings
    └─ Create alerts if thresholds met
    │
    ▼
Response: Scan + Created Alerts
```

### Prediction Flow
```
User requests prediction for AWB
    │
    ▼
GET /api/predictive/:awb/delay-prediction
    │
    ▼
predictive.routes.js
    │
    ▼
PredictiveService.predictDelay()
    ├─ Calculate elapsed/remaining hours
    ├─ Analyze scan frequency
    ├─ Check for exceptions
    ├─ Evaluate progression
    ├─ Calculate delay probability
    ├─ Determine risk level
    └─ Compile reasons
    │
    ▼
Response: Prediction Object + Delivery Estimate
```

### Dashboard Metrics Flow
```
Dashboard Component Loads
    │
    ├─ GET /api/dashboard/overview
    ├─ GET /api/dashboard/metrics
    └─ GET /api/alerts/stats/summary (parallel)
    │
    ▼
dashboard.routes.js
    │
    ├─ Calculate KPIs
    ├─ Count consignments by status
    ├─ Get alert statistics
    └─ Analyze predictions
    │
    ▼
Display Dashboard UI
```

## Data Model

### Consignment Object
```javascript
{
  awb: "7488947329",
  shipper: "ABC Manufacturing",
  receiver: "XYZ Retail",
  origin: "New York, NY",
  destination: "Los Angeles, CA",
  weight: 25.5,
  serviceType: "FedEx Express",
  createdAt: "2026-01-21 10:30:00",
  estimatedDelivery: "2026-01-23 15:00:00",
  status: "IN_TRANSIT",
  currentLocation: "Chicago Distribution Hub",
  lastScan: {...},
  scans: [...]
}
```

### Scan Object
```javascript
{
  id: "uuid",
  timestamp: "2026-01-21 12:45:30",
  type: "STAT",
  location: "Chicago Distribution Hub",
  latitude: 41.8781,
  longitude: -87.6298,
  details: "Package in transit",
  facilityCode: "CHI01",
  courierID: "CUR002"
}
```

### Alert Object
```javascript
{
  id: "uuid",
  awb: "7488947329",
  ruleId: "DELAY_WARNING",
  ruleName: "Delivery Delay Warning",
  severity: "HIGH",
  description: "Package is behind schedule by 4+ hours",
  details: {hoursRemaining: 1.5},
  createdAt: "2026-01-21 14:00:00",
  status: "ACTIVE|ACKNOWLEDGED|RESOLVED",
  assignedTo: "operator_id",
  notes: [...]
}
```

### Prediction Object
```javascript
{
  willBeDelayed: true,
  delayProbability: 75,
  riskLevel: "HIGH",
  reasons: [
    "Only 1.5 hours remaining for delivery",
    "Behind expected scan progression by 1 scan"
  ],
  metrics: {
    elapsedHours: 22.5,
    expectedHours: 24,
    remainingHours: 1.5,
    scansRecorded: 2,
    expectedScans: 3,
    progressPercentage: 93.8
  }
}
```

## Scalability Architecture

### Current (MVP)
- In-memory data store
- Single Node.js process
- Suitable for: < 10,000 active consignments

### Phase 2 (Scale)
```
┌─────────────┐
│  React SPA  │
├─────────────┤
│ Load Balancer (NGINX)
├─────────────────────────┬──────────────────┐
│ Node.js Instance 1      │ Node.js Instance 2│
│ Port 5001               │ Port 5002        │
└─────────────────────────┴──────────────────┘
              │
              ▼
          MongoDB
```

### Phase 3 (Enterprise)
```
┌────────────────────────────────────────┐
│  React SPA (CDN Cached)                │
└───────────────────┬────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    API Gateway         WebSocket Server
   (Load Balancer)    (Real-time updates)
        │                       │
    ┌───┴──────┬────────┬───────┴────┐
    │          │        │            │
    ▼          ▼        ▼            ▼
  AWB      Tracking  Predictive    Alert
  Service  Service   Service       Service
  
    └──────────────────┬─────────────────┘
                       │
         ┌─────────────┼──────────────┐
         ▼             ▼              ▼
      MongoDB      Redis Cache    Event Queue
      (Primary)    (Hot Data)     (RabbitMQ)
```

## Integration Points

### Real FedEx Integration
Replace mock data with:
- **Scan API**: Get real-time scan data
- **Location API**: Real courier GPS tracking
- **Package API**: Package details and dimensions
- **Rating API**: Delivery timeframes

### External Services
- **Email/SMS Service**: Alert notifications
- **Map Service**: Leaflet for location visualization
- **Analytics**: Segment/Mixpanel
- **Monitoring**: New Relic/DataDog
- **Logging**: ELK Stack

## Security Architecture

```
┌─────────────────────────────────────────┐
│        HTTPS/TLS Layer                  │
├─────────────────────────────────────────┤
│     JWT Authentication                  │
├─────────────────────────────────────────┤
│     RBAC (Role-Based Access)            │
├─────────────────────────────────────────┤
│     API Key Validation                  │
├─────────────────────────────────────────┤
│     Rate Limiting                       │
├─────────────────────────────────────────┤
│     Input Validation & Sanitization     │
├─────────────────────────────────────────┤
│     Data Encryption at Rest             │
├─────────────────────────────────────────┤
│     Audit Logging                       │
└─────────────────────────────────────────┘
```

## Performance Optimizations

1. **API Response Caching**
   - Dashboard data cached for 30 seconds
   - Consignment data cached for 60 seconds

2. **Database Indexing** (Future)
   - Index on AWB (unique)
   - Index on status (frequently filtered)
   - Index on estimatedDelivery (time-based queries)

3. **Frontend Optimization**
   - Code splitting by route
   - Lazy loading of components
   - Image optimization
   - CSS minification

4. **Backend Optimization**
   - Parallel API requests
   - Efficient algorithms (O(n) complexity)
   - Connection pooling
   - Gzip compression

## Deployment

### Development
```bash
npm run dev          # Backend with nodemon
npm start           # Frontend with create-react-app
```

### Production
```bash
npm install --production
npm run build       # Frontend
node server.js      # Backend with PM2
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --production
EXPOSE 5000
CMD ["node", "server.js"]
```

## Monitoring & Logging

```javascript
// Key metrics to track
- Response time (p95, p99)
- Error rate
- Alert generation rate
- Prediction accuracy
- User sessions
- API endpoint usage
```

---

This architecture provides a solid foundation for a production-grade operations platform while maintaining flexibility for future enhancements and integrations.
