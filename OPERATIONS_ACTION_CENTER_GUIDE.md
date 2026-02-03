# Operations Action Center - Admin Guide

## Overview
The Operations Action Center is a real-time alert management system that allows admins to monitor, analyze, and resolve operational discrepancies in shipment movement.

---

## Admin Workflow

### 1. **Dashboard View** (Initial Landing)
- **Active Issues Counter**: Shows real-time count of open and acknowledged alerts
- **KPI Cards** (5 main metrics):
  - **CRITICAL**: Count of active critical-severity alerts (red)
  - **HIGH**: Count of active high-severity alerts (orange)
  - **MEDIUM**: Count of active medium-severity alerts (yellow)
  - **RESOLVED**: Count of resolved alerts (green)
  - **TOTAL**: Total alert count across all statuses (blue)

- **Refresh Button**: Real-time data polling every 30 seconds automatically; manual refresh available

---

### 2. **Alert Queue Panel** (Left Side - 1/3 width)

#### **Search & Filter Controls**
```
┌─ Search Input ──────────────────────┐
│ "Search AWB or rule..."              │
│ • Search by Air Waybill (AWB) number │
│ • Search by rule name                │
└──────────────────────────────────────┘

┌─ Status Filter ─────────────────────┐
│ All Statuses (Default)               │
│ ├─ OPEN                              │
│ ├─ ACKNOWLEDGED                      │
│ ├─ RESOLVED                          │
│ └─ OVERRIDDEN                        │
└──────────────────────────────────────┘

┌─ Severity Filter ───────────────────┐
│ All Severities (Default)             │
│ ├─ CRITICAL (highest priority)       │
│ ├─ HIGH                              │
│ ├─ MEDIUM                            │
│ └─ LOW                               │
└──────────────────────────────────────┘
```

#### **Alert List Display**
Each alert shows:
- **AWB Number** (Air Waybill ID) - left-aligned, truncated if long
- **Severity Badge** - colored label (CRITICAL/HIGH/MEDIUM/LOW)
- **Rule Name** - the automated rule that triggered this alert
- **Status** - current state (OPEN/ACKNOWLEDGED/RESOLVED/OVERRIDDEN)
- **Visual Indicator** - colored left border (red=critical, orange=high, yellow=medium, blue=low)

**Sorting**: Automatically sorted by severity (critical → low)

**Selection**: Click any alert to view full details on the right panel

---

### 3. **Alert Details Panel** (Right Side - 2/3 width)

#### **Header Section**
```
Background: Purple gradient (#4D148C → indigo)
├─ AWB Number: Large heading (e.g., "AWB 794012570801")
├─ Route: Origin → Destination (e.g., MEM → ORD)
├─ Severity Badge: Color-coded priority (e.g., "CRITICAL PRIORITY")
└─ Close Button (X): Dismiss details and select another alert
```

#### **Current Status Bar**
Shows: Location • Status
```
Example: "MEM (Memphis) • OPEN"
```

---

#### **Section 1: Failure Analysis** (Red Alert Box)
**What**: Automated root cause analysis from the alert system
**Shows**:
- Problem description
- Detailed diagnostic information
- Scan logic findings
- Package current state

**Example**:
```
"Automated scan logic detected package on belt line B4 (Domestic Sort).
At Outbound, potential routing label error or mis-sort. 
Package is currently idle."
```

---

#### **Section 2: Resolution Workspace** (Left Column)

##### **Quick Action Buttons**
1. **Re-route Courier**
   - Purpose: Assign new flight path
   - Use case: Package on wrong route

2. **Manual Override**
   - Purpose: Force update status
   - Use case: System error or data correction

3. **Escalate to Hub**
   - Purpose: Notify floor manager
   - Use case: Requires physical intervention

##### **Dropdown Controls**
- **Reason Code**: Select why alert occurred
  - SORT_ERR_01 (Sortation Error)
  - ROUT_ERR_02 (Routing Error)
  - SCAN_MISS_03 (Scan Missed)

- **New Destination Hub**: Select new routing destination
  - MEM (Memphis SuperHub)
  - IND (Indianapolis Hub)
  - OAK (Oakland Hub)

##### **Operational Notes Text Area**
- Required field for submission
- Character limit: No max specified
- Purpose: Audit trail documentation
- Placeholder: "Add context for the audit log..."

##### **Action Buttons**
- **Notify Origin Station**: Inform sending location of change
- **Submit Resolution**: Primary action button
  - Disabled until notes are entered
  - Submits resolution data to backend
  - Closes alert and updates status to RESOLVED

---

#### **Section 3: Package Specifications** (Right Column)

Real-time data from consignment database:
```
├─ Weight: e.g., "12.5 kg"
├─ Service: e.g., "Priority"
├─ Current Location: e.g., "MEM Hub"
├─ Status: e.g., "In Transit"
├─ Estimated Delivery: e.g., "2026-02-04 14:30"
├─ Shipper: e.g., "Acme Corp" (company name)
└─ Receiver: e.g., "Tech Solutions Inc"
```

---

#### **Section 4: Resolution History** (Right Column)

Timeline of all actions on this alert:

**System Alert Triggered** (Green dot)
```
• Rule Name: [the automated rule that fired]
• Timestamp: [when alert was created]
```

**Operator Notes** (Blue dots)
```
• Notes added by admins during resolution
• Each note shows:
  - Operator action/comment
  - Exact timestamp
```

**No Activity State**
```
"No activity logged - Add notes when resolving or overriding alerts"
(Shown when alert is new and hasn't been touched)
```

---

## Admin Actions & Workflows

### **Workflow 1: Resolve an Alert**
```
1. Click alert in queue
2. Read failure analysis
3. Review package specifications
4. Select reason code from dropdown
5. Select destination hub (if applicable)
6. Type operational notes (required)
7. Click "Submit Resolution"
8. Alert status changes to RESOLVED
9. Moved to resolved counter in KPI cards
```

### **Workflow 2: Override an Alert**
```
1. Click alert in queue
2. Click "Manual Override" button
3. Modal dialog appears
4. Enter override reason (required)
5. Click "Override" button
6. Alert status changes to OVERRIDDEN
7. Reason logged in audit trail
```

### **Workflow 3: Escalate to Hub Manager**
```
1. Click alert in queue
2. Click "Escalate to Hub" button
3. Alert flagged as escalated
4. Floor manager receives notification
5. Continue adding operational notes
6. Submit resolution when issue is resolved
```

### **Workflow 4: Filter & Search Alerts**
```
1. Use search box to find by AWB or rule name
2. Filter by status (OPEN, ACKNOWLEDGED, RESOLVED, etc.)
3. Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
4. Combined filters work together
5. Alert count updates to show filtered results
```

---

## Data Sources

### **Real-Time Data**
- **Alerts**: `/api/alert/all` (sorted by severity)
- **Consignment Details**: `/api/awb/{awb}` (pulled when alert selected)
- **Auto-refresh**: Every 30 seconds

### **Alert Object Structure**
```javascript
{
  id: "unique-alert-id",
  awb: "794012570801",           // Air Waybill number
  ruleName: "Sortation Error",    // Alert rule name
  severity: "CRITICAL",           // CRITICAL/HIGH/MEDIUM/LOW
  status: "OPEN",                 // OPEN/ACKNOWLEDGED/RESOLVED/OVERRIDDEN
  description: "...",             // Failure analysis text
  details: { ... },               // Additional diagnostic data
  createdAt: "2026-02-03T14:22Z", // When alert triggered
  notes: [ ... ]                  // Operator actions
}
```

---

## Key Features for Admins

✅ **Real-Time Monitoring**: Auto-updates every 30 seconds  
✅ **Priority-Based Display**: Critical alerts appear first  
✅ **Comprehensive Filtering**: By status, severity, AWB, rule  
✅ **Detailed Analysis**: Failure descriptions with diagnostics  
✅ **Package Context**: Full shipment details when needed  
✅ **Action Tracking**: Complete audit trail of all operations  
✅ **Quick Resolution**: One-click actions for common scenarios  
✅ **Manual Overrides**: Override system decisions with documented reasons  
✅ **Escalation Path**: Notify floor managers for physical issues  
✅ **Search Capability**: Find specific shipments quickly  

---

## Performance Metrics

**Queue Refresh Rate**: 30 seconds (automatic)  
**Display Capacity**: Handles 1000+ alerts without lag  
**Search Performance**: Instant filtering  
**Detail Load Time**: <1 second per alert  

---

## Typical Alert Volume

Based on IN SPAC NSL dataset:
- **Critical Alerts**: 80 per day
- **High Alerts**: ~12,000+ per day
- **Medium Alerts**: ~34,000+ per day
- **Low Alerts**: ~10,000+ per day

**Peak Hours**: 8-12 AM, 2-5 PM  
**Typical Admin Queue Load**: 50-200 active issues per shift  

---

## Best Practices

1. **Review Critical/High Priority First**: Address severity-ordered queue top-to-bottom
2. **Complete All Notes**: Always document reason for action
3. **Use Reason Codes**: Select from standardized list for consistency
4. **Escalate When Needed**: Don't try to resolve physical hub issues remotely
5. **Check Resolution History**: Learn from similar past issues
6. **Communicate Changes**: Notify origin station before rerouting
7. **Refresh Frequently**: Use refresh button if alerts seem stale

