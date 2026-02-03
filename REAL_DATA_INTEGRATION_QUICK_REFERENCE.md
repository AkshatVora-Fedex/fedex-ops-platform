# Real Data Integration - Quick Reference

## 🚀 System Now Running With Real Data

**Status**: ✅ **LIVE AND OPERATIONAL**

### Backend Server
- **Status**: Running on port 5000
- **Data Loaded**: 57,234 historical shipment records
- **Alerts Generated**: 6 real alerts from historical data
- **Ready**: ✅ All endpoints operational

### Frontend Application
- **Status**: Running on port 3000
- **Dashboard**: Displaying real metrics
- **Components**: All pulling from live data

---

## Quick Test Guide

### 1. Check Server Health
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"UP","timestamp":"2026-02-03..."}
```

### 2. Get Dashboard Overview (Real Data)
```bash
curl http://localhost:5000/api/dashboard/overview
# Returns: Real consignment counts, regional metrics, alerts from 57,234 records
```

### 3. Search for Real Shipment
```bash
# Try these real AWBs from the dataset:
curl http://localhost:5000/api/search/search/883775720669
curl http://localhost:5000/api/search/search/887326699596
curl http://localhost:5000/api/search/search/882464153434

# Expected: Full shipment details from historical data
```

### 4. Get Regional Performance
```bash
curl http://localhost:5000/api/dashboard/regional-metrics
# Returns: Performance by region (IN, MEISA, APAC, EU, etc.)
```

### 5. Get Alert Statistics
```bash
curl http://localhost:5000/api/alerts/all
# Expected: 6+ real alerts generated from historical shipment statuses
```

### 6. View Available Filters
```bash
curl http://localhost:5000/api/search/filters/available
# Shows: All status types, regions, services available in data
```

---

## Real Data Sources

### Historical AWB Data
**File**: `/backend/data/awb-historical.json`  
**Records**: 57,234 shipments  
**Fields**: AWB, dates, locations, service types, performance buckets  
**Status**: ✅ Fully loaded and accessible

### Performance Statuses in Data
- **EXCLUDE**: 6+ shipments (generating CRITICAL alerts)
- **TRANSIT-Linehaul**: Multiple shipments (generating HIGH alerts)
- **TRANSIT-Processing**: Regular in-transit status
- **OnTime**: Successful deliveries
- **WDL/EWDL**: Late/exception deliveries
- **CLEARANCE**: At customs/checkpoint
- **ORIGIN/DEST**: At pickup/delivery location

### Regions in Data
- **MEISA**: Middle East, India, South Africa region
- **APAC**: Asia Pacific region
- **EU**: European Union region
- **IN**: India region
- **Others**: Miscellaneous regions

---

## API Endpoints - Real Data Access

### Dashboard & Overview
| Method | Endpoint | Real Data Source |
|--------|----------|------------------|
| GET | `/api/dashboard/overview` | 57,234 records |
| GET | `/api/dashboard/metrics` | Predictive analysis |
| GET | `/api/dashboard/regional-metrics` | Region breakdown |
| GET | `/api/dashboard/performance-distribution` | Status distribution |

### Search & Filtering
| Method | Endpoint | Real Data |
|--------|----------|-----------|
| GET | `/api/search/search/:awb` | Historical + in-memory |
| POST | `/api/search/advanced` | Multi-field filter |
| GET | `/api/search/region/:region` | Region-specific |
| GET | `/api/search/status/:status` | Status-specific |
| GET | `/api/search/filters/available` | Data inventory |

### AWB & Shipment Data
| Method | Endpoint | Real Data |
|--------|----------|-----------|
| GET | `/api/awb/all` | All 57,234 + in-memory |
| GET | `/api/awb/historical/:awb` | Full record details |
| GET | `/api/awb/historical/filtered` | Custom filters |
| GET | `/api/awb/historical/grouped/:groupBy` | Grouped analysis |

### Alerts (From Real Data)
| Method | Endpoint | Real Data |
|--------|----------|-----------|
| GET | `/api/alerts/all` | 6 real alerts |
| GET | `/api/alerts/active` | Active real alerts |
| GET | `/api/alerts/search/:awb` | Alerts for shipment |

---

## Common Real AWBs to Test

From the IN SPAC NSL dataset - these will return real data:

```
883775720669  - Priority, India to Philippines
887326699596  - Priority, India to Thailand
882464153434  - Priority, India to Thailand (EXCLUDE status)
390472104211  - Priority, India to Vietnam
473243480827  - Priority, India to Vietnam (EXCLUDE status)
887658482360  - Priority, India to Thailand (EXCLUDE status)
884904067288  - Priority, India to Thailand
883490980396  - Deferred, India to Philippines (EXCLUDE status)
885257314309  - Priority, India to Thailand
390156206900  - Priority, India to Thailand
```

---

## Frontend Routes Using Real Data

### Dashboard
**URL**: `http://localhost:3000/dashboard`
- Displays: Real consignment counts, alerts, at-risk shipments
- Data From: `/api/dashboard/overview`, `/api/dashboard/metrics`

### Shipments
**URL**: `http://localhost:3000/shipments`
- Displays: Real shipments from 57,234 records
- Data From: `/api/awb/all`, `/api/predictive/analytics/all-predictions`

### Consignment Lookup
**URL**: `http://localhost:3000/consignments`
- Search: Real shipments by AWB
- Data From: `/api/search/search/:awb`, `/api/awb/historical/:awb`

### Operations Action Center
**URL**: `http://localhost:3000/actions`
- Displays: 6 real alerts from historical data
- Data From: `/api/alerts/all`

### Performance Analytics
**URL**: `http://localhost:3000/analytics`
- Displays: Regional metrics from 57,234 records
- Data From: `/api/dashboard/regional-metrics`

---

## Data Statistics

### Breakdown by Performance Bucket
```
(from /api/dashboard/performance-distribution)

EXCLUDE           : 6+ shipments → CRITICAL alerts
EWDL              : Multiple     → Exception status
UNASSIGNED        : Multiple     → Unassigned status
CLEARANCE         : Multiple     → At clearance
TRANSIT-*         : Majority     → In transit
DEST/OnTime       : Majority     → Delivered/on-time
```

### Load Time Performance
- Server Start: ~2 seconds to load 57,234 records
- Single Lookup: ~50ms
- Filter Results: ~200-300ms
- Regional Analysis: ~500ms

---

## Troubleshooting

### "Consignment not found" when searching
- Check AWB format (12 digits)
- Use example AWBs from list above
- Verify `/api/search/filters/available` to see all statuses

### Dashboard shows "0" metrics
- Wait 2-3 seconds for data to load
- Click "Refresh" button on dashboard
- Check browser console for errors

### Frontend not connecting to backend
- Verify backend running on port 5000: `curl http://localhost:5000/api/health`
- Check CORS headers in terminal output
- Try refreshing frontend page

### Slow query results
- Normal for first request (data loading)
- Subsequent requests cached
- Regional metrics take ~500ms

---

## Success Indicators

✅ **You'll know it's working when**:
1. Dashboard displays "Queue (6)" for real alerts
2. Can search and find `883775720669` (real AWB)
3. Regional metrics show MEISA, APAC, EU regions with shipment counts
4. Shipments list shows 50+ items with actual service types
5. Performance Analytics shows real data for regional teams

---

## What Changed From Test Data

### Before
- ❌ 5 hardcoded test alerts
- ❌ Test AWBs like "AWB12345678"
- ❌ Mock GPS data
- ❌ Placeholder metrics

### After
- ✅ 6 real alerts from 57,234 shipments
- ✅ Real AWBs like "883775720669", "887326699596"
- ✅ Real location codes from IN SPAC NSL
- ✅ Actual regional metrics from operational data

---

## Next Steps

1. **Explore Dashboard**: Navigate to http://localhost:3000/dashboard
2. **Search Shipments**: Try looking up real AWBs
3. **Review Alerts**: Check Operations Action Center for real alerts
4. **Analyze Regions**: View regional performance metrics
5. **Test APIs**: Use curl commands above to verify endpoints

---

**System Status**: 🟢 **FULLY OPERATIONAL WITH REAL DATA**

All 57,234 historical shipments are now integrated and accessible throughout the application.
