# FedEx Operations Proactivity Platform - User Guide

## Quick Navigation

### 🏠 Dashboard
**URL:** http://localhost:3000/
**Purpose:** Command center with real-time operational overview

**What You'll See:**
- Total shipments being tracked
- In-transit shipments count
- Successfully delivered count  
- At-risk shipments (require attention)
- Alert severity breakdown (Critical/High/Medium/Low)
- Risk distribution by status

**Actions:**
- Click "Refresh" to reload latest metrics
- Click any metric card to drill down (feature-ready)

---

### 🔍 Search AWB (Consignment Lookup)
**URL:** http://localhost:3000/search
**Purpose:** Find and view detailed information about a specific shipment

**How to Use:**
1. Enter an AWB number (e.g., "7483921948")
2. Click "Search" or press Enter
3. View consignment details:
   - Route information (Origin → Current Location → Destination)
   - Service type (Overnight, 2Day, Ground, Express)
   - Weight and estimated delivery date
   - Shipper and receiver information
4. Click "View Detailed Tracking" to see full telemetry

**📁 Upload AWB Data Feature:**
The ConsignmentLookup page also includes a powerful file upload feature to batch import shipment data:

1. **Access Upload:**
   - Click the "📤 Upload File" button on the ConsignmentLookup page
   - Supported file formats: `.txt`, `.csv`, `.xlsb`

2. **Prepare Your File:**
   - Use CSV format matching the IN SPAC NSL standard structure
   - Required columns: shp_trk_nbr, shpr_co_nm, orig_loc_cd, dest_loc_cd, Service, etc.
   - Each row represents one shipment (AWB)
   - File can contain hundreds or thousands of records

3. **Upload Process:**
   - Click the file input or drag-and-drop your file
   - System validates file format
   - Backend parses CSV and extracts all fields:
     - Shipment tracking info (AWB, Master AWB, dates)
     - Shipper/Recipient details
     - Origin/Destination locations and regions
     - Service type and product information
     - Performance metrics and scan information

4. **Success Confirmation:**
   - Green success message appears with records added count
   - Message shows total records now in the system
   - Message auto-dismisses after 5 seconds
   - All newly added records immediately become searchable
   - Sample AWBs list updates to include new shipments

5. **Data Integration:**
   - Uploaded records merge with existing historical data
   - Automatic deduplication by AWB prevents duplicates
   - Data is immediately available across all app pages:
     - Search results show new shipments
     - Dashboard metrics update with new data
     - Tracking pages display new routes
     - Alerts system analyzes new shipments

6. **Example Data Structure:**
   The system expects data in this format:
   ```
   shp_trk_nbr, mstr_ab_trk_nbr, shp_dt, orig_loc_cd, dest_loc_cd, Service, Bucket, ...
   883775720669, , 2025-08-23, BOMCL, PAGA, Priority, OnTime, ...
   ```

---

### 📍 Shipment Telemetry & Tracking Details
**URL:** http://localhost:3000/tracking/:awb
**Purpose:** Deep dive into shipment status with predictive insights

**4 Tabs Available:**

#### Timeline Tab
- Visual scan history in chronological order
- Scan type badges with color coding
- Location, timestamp, facility code, and courier info
- Helpful for understanding shipment journey

#### Checklist Tab  
- Expected vs. Actual scans comparison
- Shows what SHOULD happen vs what DID happen
- Highlights discrepancies with red flags
- Useful for identifying delivery issues

#### Alerts Tab
- All active alerts for this shipment
- Severity indicators (Critical/High/Medium/Low)
- Alert creation time and status
- Shows rule violations triggering the alert

#### Notes Tab
- Add operational notes during handling
- Documents ground conditions
- Records manual overrides or reroutes
- Audit trail with timestamps for accountability

**Prediction Banner:**
- Displayed if delay is predicted
- Shows delay probability percentage
- Lists root causes identified by AI
- Helps operators decide on intervention

---

### 🚨 Operations Action Center (Alerts)
**URL:** http://localhost:3000/alerts
**Purpose:** Manage and resolve operational issues

**Left Sidebar - Queue:**
1. **Search:** Find alerts by AWB or rule name
2. **Status Filter:** Choose Open/Acknowledged/Resolved/Overridden
3. **Severity Filter:** Focus on Critical, High, Medium, or Low

**Right Panel - Details:**
When you select an alert:
1. **View Information:**
   - Alert title and description
   - Created and last updated times
   - Category and impact (# of shipments affected)

2. **Take Action:**
   - **Acknowledge:** Mark as "in progress"
   - **Resolve:** Close with documented notes explaining fix
   - **Override:** Suppress if you're accepting the risk

3. **Document:**
   - Always add resolution notes before closing
   - Notes explain what action was taken
   - Audit trail helps with performance reviews

**Status Flow:**
```
OPEN → ACKNOWLEDGED → RESOLVED
              ↓
           OVERRIDDEN (alternative path)
```

---

### 📊 Predictive Risk Analytics
**URL:** http://localhost:3000/prediction
**Purpose:** Proactively identify and manage at-risk shipments

**Top Cards:**
- **CRITICAL RISK:** Highest probability of delay
- **HIGH RISK:** Likely to miss delivery window
- **MEDIUM RISK:** May encounter issues
- **LOW RISK:** On track for on-time delivery

---

### 🌐 Global Command Center
**URL:** http://localhost:3000/global-command
**Purpose:** Network-level operational oversight

**Features:**
- **LiveTicker:** Animated network status with color-coded alerts
- **Interactive Map:** Leaflet map with hub markers and route visualization
  - Toggle layers: Routes, Weather, Incidents
  - Click markers for hub details
  - View shipment routes with polylines
- **AI Shift Briefing:** Click "Generate Shift Briefing" for AI insights
  - Network status summary
  - Critical issues requiring attention
  - Recommended actions

**Actions:**
- Monitor real-time network health
- Track shipments geographically
- Get AI-generated operational briefings

---

### 🏭 Hub Pulse Monitor
**URL:** http://localhost:3000/hub-pulse
**Purpose:** Hub-level capacity and load management

**Features:**
- **Hub Cards:** 6 major hubs with real-time status
  - MEM (Memphis), IND (Indianapolis), LAX (Los Angeles)
  - ORD (Chicago), ATL (Atlanta), DFW (Dallas)
- **Load Bars:** Visual capacity meters (Inbound/Outbound)
- **Weather Integration:** Current conditions at each hub
- **AI Network Balancer:** Click for load balancing recommendations

**Actions:**
- Monitor hub capacity in real-time
- Identify bottlenecks
- Get AI-powered load balancing suggestions

---

### 📦 Shipments List View
**URL:** http://localhost:3000/shipments
**Purpose:** Manage active shipments with AI anomaly detection

**Features:**
- **Shipment Table:** All active shipments with filters
- **AI Anomaly Scan:** Pattern detection across shipments
  - Unusual routing patterns
  - Scan anomalies
  - Time-based irregularities
- **Export Function:** Download shipment data

**Actions:**
- Search and filter shipments
- Run AI anomaly detection
- Export data for analysis

---

### 📈 Analytics Dashboard
**URL:** http://localhost:3000/analytics (Admin Only)
**Purpose:** Performance metrics and trend analysis

**Features:**
- **KPI Cards:**
  - On-Time Performance (OTP): 96.4%
  - Exception Rate: 3.2%
  - Average Transit Time: 42h
  - Model Accuracy: 89%
- **Trend Chart:** Performance over time (Chart.js line chart)
- **Root Cause Analysis:** Donut chart breakdown
- **Heatmap:** Failure distribution by hour and day of week
- **Time Range Selector:** Last 7 days, 30 days, 90 days
- **Export Function:** Download analytics data

**Actions:**
- Monitor performance trends
- Identify root causes of failures
- Analyze patterns by time of day/week
- Export reports for stakeholders
- **AT RISK:** Combined count of Critical + High + Medium

**Left Panel - Filters:**
1. **Region:** Select origin hub (Memphis, Indianapolis, LA, Chicago, Atlanta)
2. **Service Type:** Choose delivery speed (Overnight, 2Day, Ground, Express)
3. **Risk Level:** Focus on specific risk categories
4. **Quick Stats:** View averages and percentages

**Center Panel - Heatmap:**
- Lists all at-risk shipments matching filters
- Shows AWB, route, probability, and delay estimate
- Click any shipment to see details

**Right Panel - Details (when selected):**
- Risk level and delay probability
- Service type and package weight
- **Contributing Factors:** Why the system predicts delay
- **Recommended Actions:** Suggested interventions (reroute, notify shipper, etc.)

**Use Cases:**
- Identify delays BEFORE they happen
- Prevent customer complaints
- Optimize routing decisions
- Allocate resources proactively

---

### ⚙️ Alert Rules Configuration
**URL:** http://localhost:3000/rules
**Purpose:** Define and manage alert triggers

**Left Panel - Rules List:**
- All configured rules displayed
- Green dot = Enabled rule
- Gray dot = Disabled rule
- Click any rule to see details

**Create New Rule:**
1. Click "New Rule" button
2. Fill in form:
   - **Name:** What to call this rule
   - **Description:** When it triggers
   - **Category:** Type of alert (Delay, Missed Scan, etc.)
   - **Severity:** How urgent (Critical/High/Medium/Low)
   - **Threshold:** Number + Unit (Hours/Minutes/Events)
3. Click "Create"

**Right Panel - Rule Details:**
- View configuration
- See current impact (# active alerts)
- **Disable:** Turn off without deleting
- **Enable:** Reactivate disabled rule
- **Delete:** Permanently remove

**Rule Categories:**
1. **Delay Detection** - Exceeds time threshold
2. **Missed Scan** - No update for X hours
3. **Operational Exception** - System-detected issue
4. **No Movement** - Shipment stalled
5. **Location Anomaly** - Unexpected position
6. **Custom Threshold** - Your own criteria

**Best Practices:**
- Start with High/Critical for important thresholds
- Adjust Medium/Low to reduce false alerts
- Monitor impact to fine-tune sensitivity
- Review weekly to ensure rules stay relevant

---

### 📈 Performance & Resolution Analytics
**URL:** http://localhost:3000/analytics
**Purpose:** Track operational performance and team effectiveness

**Top KPI Cards:**
- **Resolution Rate %** - % of alerts closed (target: >90%)
- **MTTR** - Mean Time to Resolve in hours (target: <3h)
- **Alert Accuracy %** - Precision of predictions (target: >85%)
- **False Positive Rate %** - Unnecessary alerts (target: <10%)

**Time Period Selection:**
- Choose: Last 7 Days, 30 Days, 90 Days, or Year-to-Date
- Metrics automatically update
- Click "Export" for reports

**Predicted vs. Actual:**
- Shows how accurately AI predicted delays
- Purple bar = delays predicted by AI
- Orange bar = actual delays that occurred
- Measures model effectiveness

**Top Alert Types:**
- Lists most common alert triggers
- Shows count and trend (↑ up, ↓ down)
- Helps identify systemic issues

**Team Leaderboard:**
- Ranks operators by performance
- **Alerts Resolved** - Total tickets closed
- **On-Time %** - % resolved within SLA
- **Rating** - Quality score (0-5 stars)
- Gold/Silver/Bronze for top 3

**Strategic Insights:**
- Auto-generated recommendations
- Next priorities to focus on
- Best practices from high performers
- Goals to achieve

---

### 📚 Scan Code Reference
**URL:** http://localhost:3000/scan-codes
**Purpose:** Reference guide for all FedEx operational scan codes

**3 Tabs:**

#### Scan Types
- All 8 FedEx code types displayed
- Quick overview with icons
- Jump to any type for details

#### Categories
- Browse by category
- See all codes in each category
- Full descriptions for understanding

#### Critical Codes
- High-priority codes only
- Red-coded for urgent attention
- Useful for troubleshooting

**FedEx Code Types:**
- **PUX** - Pickup/Consolidation codes
- **STAT** - Operational status codes
- **DEX** - Delivery exception codes
- **RTO** - Return-to-origin codes
- **CONS** - Consolidation codes
- **DDEX** - Detailed delivery exception
- **HEX** - Hub exception codes
- **SEP** - Special event codes

**How to Use:**
1. When troubleshooting, search for scan code
2. Find description and severity
3. Understand what triggered it
4. Take appropriate action
5. Reference in notes for documentation

---

## Common Workflows

### Workflow 1: Responding to a Critical Alert
1. **Dashboard** → See CRITICAL count jumped
2. **Action Center** (Alerts) → Filter by CRITICAL
3. **Select Alert** → Read description
4. **Tracking Details** → Understand shipment status
5. **Prediction** → See if AI predicted this
6. **Action Center** → Resolve with documented notes

**Time to Resolution:** 5-10 minutes

---

### Workflow 2: Preventing a Delay
1. **Prediction Analytics** → Review AT-RISK shipments
2. **Filter by Region/Service** → Focus on problem areas
3. **Select Shipment** → See contributing factors
4. **Review Recommendations** → AI suggests actions
5. **Take Action:**
   - Contact shipper (speed up pickup)
   - Reroute through faster hub
   - Escalate to field team
   - Override rule if acceptable

**Proactive Impact:** Prevents customer complaints, saves costs

---

### Workflow 3: Tuning Alert Sensitivity
1. **Analytics** → Check False Positive Rate
2. **Rules Configuration** → Review all rules
3. **For Over-Alerting Rules:**
   - Increase threshold (e.g., 2 hrs → 4 hrs)
   - Raise severity to reduce noise
   - Consider disabling if not valuable
4. **Monitor Impact** → Check next period

**Result:** Better signal-to-noise ratio, higher team efficiency

---

### Workflow 4: Team Performance Review
1. **Analytics** → Review Leaderboard
2. **Check Trends:** MTTR improvement, resolution rate
3. **Identify Top Performers** → Consider for mentoring
4. **Coaching Opportunities** → Lower performers
5. **Adjust Rules/Process** → Support improvement

**Monthly Review:** Usually 15-20 minutes

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `/` | Focus search box |
| `Esc` | Close modal/panel |
| `Tab` | Navigate between elements |
| `Enter` | Submit form/select item |

---

## Dark Mode

- **Toggle:** Click moon/sun icon in top-right
- **Applies to:** All pages and components
- **Persists:** During session
- **Best for:** Night shift operations, eye comfort

---

## Mobile Support

The platform is optimized for:
- **Desktop (Primary):** 1280px+ width - Full features
- **Tablet:** 768px+ width - Stacked layouts
- **Mobile:** 320px+ width - Single-column view

**Note:** Some complex views better on larger screens

---

## Tips & Tricks

1. **Bulk Operations Ready:**
   - Current: One alert at a time
   - Future: Multi-select and bulk actions

2. **API Integration:**
   - Export data via API for custom reports
   - All endpoints RESTful and documented

3. **Performance:**
   - Auto-refresh every 30-60 seconds
   - Can't be manually turned off (by design)
   - Keeps you current with latest data

4. **Alerts:**
   - Always document resolution notes
   - Build knowledge base for future reference
   - Override only when you fully understand risk

5. **Predictions:**
   - More data = more accurate predictions
   - System learns from operator decisions
   - Feedback loop improves over time

---

## Troubleshooting

### "No results found" on search
- Check AWB number format (should be 10-15 digits)
- Verify the shipment has been registered
- Try a different date range or region filter

### Alerts not showing
- Check alert rules are enabled
- Verify shipment has active alerts
- Try refreshing the page
- Check status filter (may be filtering them out)

### Prediction seems wrong
- Remember: predictions are probabilistic (not 100% accurate)
- Check contributing factors for context
- Model improves with more data over time
- Override if you have better information

### Dark mode looks odd
- Clear browser cache and reload
- Try toggling dark mode off and on
- Check browser console for errors

---

## Contact & Support

For issues or questions:
- Check the README.md for project setup
- Review ARCHITECTURE.md for system design
- See DEPLOYMENT.md for deployment help

---

**Happy Operating! 🚀**

The FedEx Operations Proactivity Platform is designed to help you shift from reactive (responding to problems) to proactive (preventing problems). Use it wisely and you'll see operational improvements in days, not weeks.

---
