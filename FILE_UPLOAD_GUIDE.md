# File Upload Feature Guide - OpsPulse Platform

## Overview

The OpsPulse platform now supports batch importing of AWB (Air Waybill) shipment data through the file upload feature. This allows you to upload multiple shipments at once and immediately search, track, and analyze them throughout the system.

---

## Quick Start

### 1. Access the Upload Feature
- Navigate to: `http://localhost:3000/consignment-lookup`
- Click the **"📤 Upload File"** button
- Select your CSV/TXT file or drag and drop

### 2. Upload Your Data
- **Supported Formats:** `.txt`, `.csv`, `.xlsb`
- **Standard Format:** IN SPAC NSL CSV format
- **Processing:** Automatic - no additional setup needed

### 3. Verify Success
- Green success message shows "Successfully added X records"
- Message displays total records now in system
- Auto-dismisses after 5 seconds

### 4. Start Using New Data
- Search page now shows uploaded shipments
- View samples shows newly added AWBs
- Click any AWB to view detailed tracking

---

## File Format Requirements

### CSV Structure

The file must be in CSV format with the following columns (minimum required):

```csv
shp_trk_nbr, shpr_co_nm, orig_loc_cd, dest_loc_cd, Service, Bucket, ...
```

### Column Mapping

| CSV Column | System Field | Description |
|---|---|---|
| `shp_trk_nbr` | AWB | Shipment tracking number (unique identifier) |
| `mstr_ab_trk_nbr` | Master AWB | Parent shipment if applicable |
| `shp_dt` | Ship Date | Date shipment was sent |
| `pckup_scan_dt` | Pickup Scan Date | When package was picked up |
| `pod_scan_dt` | POD Scan Date | When package was delivered |
| `svc_commit_dt` | Service Commit Date | Expected delivery date |
| `shpr_cust_nbr` | Shipper Customer Number | Shipper account ID |
| `shpr_co_nm` | Shipper Name | Company name of shipper |
| `shpr_pstl_cd` | Shipper Postal Code | Shipper's postal code |
| `recp_co_nm` | Recipient Name | Company name of recipient |
| `recp_pstl_cd` | Recipient Postal Code | Recipient's postal code |
| `orig_loc_cd` | Origin Location Code | Pickup location code |
| `orig_pstl_cd` | Origin Postal Code | Pickup postal code |
| `dest_loc_cd` | Destination Location Code | Delivery location code |
| `dest_pstl_cd` | Destination Postal Code | Delivery postal code |
| `orig_mega_region` | Origin Mega Region | Regional grouping |
| `orig_region` | Origin Region | Regional identifier |
| `orig_subregion` | Origin Subregion | Sub-regional identifier |
| `orig_market_cd` | Origin Market | Market identifier |
| `orig_MD_name` | Origin MD Name | Management District name |
| `dest_mega_region` | Destination Mega Region | Regional grouping |
| `dest_region` | Destination Region | Regional identifier |
| `dest_subregion` | Destination Subregion | Sub-regional identifier |
| `dest_market_cd` | Destination Market | Market identifier |
| `dest_MD_name` | Destination MD Name | Management District name |
| `Service` | Service Type | Priority, Standard, Ground, Express, etc. |
| `Service_Detail` | Service Detail | Detailed service description |
| `Product` | Product | Product classification |
| `svc_bas_cd` | Service Base Code | Base service code |
| `pof_cause` | POF Cause | Reason for on-time vs late |
| `cat_cause_cd` | Category Cause Code | Cause category |
| `pof_cat_cd` | POF Category Code | Performance category |
| `Bucket` | Performance Bucket | OnTime, Delayed, etc. |
| `MBG_Class` | MBG Class | Message box group class |
| `pckup_scan_loc_cd` | Pickup Location Code | Pickup scan facility |
| `pod_scan_loc_cd` | POD Location Code | Delivery scan facility |
| `pkg_pckup_scan_typ_cd` | Pickup Scan Type | Type of pickup scan |
| `pkg_pckup_excp_typ_cd` | Pickup Exception Type | Exception during pickup |
| `pckup_stop_typ_cd` | Pickup Stop Type | Type of stop |

### Example CSV Content

```csv
"shp_trk_nbr","mstr_ab_trk_nbr","shp_dt","pckup_scan_dt","pod_scan_dt","svc_commit_dt","shpr_cust_nbr","shpr_co_nm","shpr_pstl_cd","recp_co_nm","recp_pstl_cd","orig_loc_cd","orig_pstl_cd","orig_mega_region","orig_region","orig_subregion","orig_market_cd","orig_MD_name","dest_loc_cd","dest_pstl_cd","dest_mega_region","dest_region","dest_subregion","dest_market_cd","dest_MD_name","Service","Service_Detail","Product","svc_bas_cd","pof_cause","cat_cause_cd","pof_cat_cd","Bucket","MBG_Class","pckup_scan_loc_cd","pod_scan_loc_cd","pkg_pckup_scan_typ_cd","pkg_pckup_excp_typ_cd","pckup_stop_typ_cd"
"883775720669",,"2025-08-23","2025-08-22","2025-08-27","2025-08-27",200462045,"ACME CORP","400063","Test Recipient","1550","BOMCL","400059","AMEA","MEISA","IN","IN","Shrikant Nikam","PAGA","1300","AMEA","APAC","SEA","PH","Others","Priority","Priority - IP","Parcel","2P","PICKUP_DELAY","CAT1","PERF","OnTime","A","BOMCL","PAGA","29","23","O"
"887326699596",,"2025-12-23","2025-12-22","2025-12-25","2025-12-29",856283550,"JOTO ABRASIVES","422007","CLSS MARKETING","10230","ISKA","422005","AMEA","MEISA","IN","IN","Shrikant Nikam","BAOA","10210","AMEA","APAC","SEA","TH","Others","Priority","Priority - IP","Parcel","2P","DELIVERY_DELAY","CAT2","PERF","Delayed","A","ISKA","BAOA","29","23","R"
```

---

## Detailed Process Flow

### Step 1: Prepare Your File

1. Export your shipment data from IN SPAC NSL or other source
2. Ensure file is CSV format (`.txt`, `.csv`)
3. Verify all required columns are present
4. Check for proper encoding (UTF-8 recommended)
5. Save file with descriptive name: `shipments_batch_001.csv`

### Step 2: Navigate to Upload Page

```
Home → Consignment Lookup
```

Or directly visit: `http://localhost:3000/consignment-lookup`

### Step 3: Upload File

**Option A - Click Upload:**
1. Scroll down to "Upload File" section
2. Click the file input button
3. Browse and select your CSV file
4. File upload begins automatically

**Option B - Drag & Drop:**
1. Locate the upload area
2. Drag your CSV file onto the box
3. Drop to trigger upload

### Step 4: Monitor Progress

- Loading indicator shows during processing
- File is validated for format
- CSV is parsed for correct structure
- Records are extracted and mapped
- Deduplication check runs against existing data

### Step 5: Confirm Success

A green success message appears:
```
✓ Successfully added 1,234 records from shipments_batch_001.csv
  Total records in system: 58,471
```

---

## What Happens Behind the Scenes

### Backend Processing

1. **Validation:** Check file exists and has .txt/.csv extension
2. **Parsing:** CSV parser reads file line by line
3. **Mapping:** Each column maps to system fields:
   - Shipment IDs (AWB, Master AWB)
   - Date/Time fields
   - Location information (origin/destination)
   - Service and product details
   - Performance metrics
   - Scan information

4. **Structuring:** Data organized into nested objects:
   ```javascript
   {
     awb: "883775720669",
     shipper: {
       customerNumber: "200462045",
       companyName: "ACME CORP",
       postalCode: "400063"
     },
     origin: {
       locationCode: "BOMCL",
       postalCode: "400059",
       megaRegion: "AMEA",
       region: "MEISA",
       mdName: "Shrikant Nikam"
     },
     destination: {
       locationCode: "PAGA",
       postalCode: "1300",
       megaRegion: "AMEA",
       region: "APAC",
       mdName: "Others"
     },
     service: {
       type: "Priority",
       detail: "Priority - IP",
       product: "Parcel"
     },
     performance: {
       bucket: "OnTime",
       catCauseCode: "CAT1",
       pofCatCode: "PERF"
     },
     scanInfo: {
       pickupLocation: "BOMCL",
       podLocation: "PAGA",
       pickupScanType: "29",
       pickupExceptionType: "23"
     },
     isHistorical: true
   }
   ```

5. **Merging:** New records combined with existing data
6. **Deduplication:** Duplicate AWBs replaced with latest data
7. **Persistence:** Updated data saved to `backend/data/awb-historical.json`
8. **Response:** Success message with count returned to frontend

### Frontend Processing

1. **Display Success:** Show green success message
2. **Update State:** Clear file input and reset form
3. **Auto-dismiss:** Message disappears after 5 seconds
4. **Refresh Samples:** Next time "View Samples" is clicked, new data loads
5. **Enable Search:** Newly added AWBs immediately searchable

### Data Integration

Once uploaded, data automatically appears in:

- **Search Results:** Type in any new AWB to find it
- **Sample List:** "View Sample AWBs" shows new shipments
- **Dashboard:** Metrics update with new records
- **Tracking:** Click "View Detailed Tracking" for full history
- **Alerts:** System analyzes new shipments for risks
- **Reports:** Analytics include new data

---

## Features Enabled by Upload

### 1. Immediate Search
```
Search any uploaded AWB number
See complete shipment details
View origin, destination, dates, status
```

### 2. Detailed Tracking
```
Timeline of all scans
Service details and product info
Performance metrics
Delivery confirmation
```

### 3. Sample Discovery
```
Browse recently uploaded shipments
Click to search
Explore data structure
```

### 4. Batch Analysis
```
Upload 1,000s of records at once
System processes all simultaneously
See aggregate metrics
Identify patterns and issues
```

### 5. Data Merging
```
Upload multiple files over time
System automatically deduplicates
Latest data always used
No manual cleanup needed
```

---

## Error Handling

### Common Issues & Solutions

| Error | Cause | Solution |
|---|---|---|
| "No file provided" | No file selected | Click upload and select a file |
| "Please upload a TXT, CSV, or XLSB file" | Wrong file type | Ensure file ends in .txt or .csv |
| "Failed to upload file" | Backend error | Check backend logs, try again |
| "Data not showing" | File format incorrect | Verify CSV matches required structure |
| "Zero records added" | Empty file or wrong columns | Check file has data and correct columns |

### Debug Steps

1. **Check File Format:**
   ```
   Open in text editor
   Verify first line has column headers
   Check for proper comma separation
   Ensure UTF-8 encoding
   ```

2. **Verify Data:**
   ```
   Row 1: Column headers
   Row 2+: Data rows
   Minimum: shp_trk_nbr, shpr_co_nm required
   All special characters escaped
   ```

3. **Check Backend Logs:**
   - Look for error messages in terminal
   - Verify `awb-historical.json` exists
   - Check disk space for file writing

4. **Test with Small File:**
   - Create CSV with 5-10 records
   - Upload and verify success
   - Then try larger file

---

## Performance Tips

### For Large Files (10,000+ records)

1. **Split into batches:**
   ```
   Instead of: 50,000 records in one file
   Try: 5 files of 10,000 records each
   Upload sequentially
   ```

2. **Timing:**
   - Upload during off-peak hours
   - Avoid multiple concurrent uploads
   - Allow 1-2 seconds between uploads

3. **File Size:**
   - Recommended max: 50 MB
   - Typical: 1,000 records = 500 KB
   - 100,000 records ≈ 50 MB

### Monitoring

- Check success message for record count
- Verify total records grows as expected
- Search for newly added AWBs
- Monitor system performance in browser dev tools

---

## Advanced Usage

### API Endpoint

Direct API access for programmatic uploads:

```bash
POST http://localhost:5000/api/search/upload
Content-Type: multipart/form-data

Parameter: file (binary CSV file)

Response:
{
  "success": true,
  "recordsAdded": 1234,
  "totalRecords": 58471,
  "message": "Successfully added 1234 records..."
}
```

### cURL Example

```bash
curl -X POST \
  -F "file=@shipments.csv" \
  http://localhost:5000/api/search/upload
```

### Automation Script

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadShipments(filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await axios.post(
    'http://localhost:5000/api/search/upload',
    form,
    { headers: form.getHeaders() }
  );

  console.log(`Added ${response.data.recordsAdded} records`);
  console.log(`Total: ${response.data.totalRecords}`);
}

uploadShipments('shipments.csv');
```

---

## Troubleshooting

### File Won't Upload

1. Check browser console (F12 → Console tab)
2. Check if backend is running (port 5000)
3. Verify CORS is enabled
4. Try smaller file first

### Records Don't Appear

1. Refresh the page (Ctrl+F5)
2. Clear browser cache
3. Check if AWB format is correct
4. Verify file actually uploaded (check backend)

### Backend Not Responding

1. Check if Node backend is running:
   ```powershell
   Get-Process node
   ```

2. Restart backend:
   ```
   Kill node process
   cd backend
   npm start
   ```

3. Check for port conflicts (5000 in use)

---

## Best Practices

✅ **DO:**
- Validate file before uploading
- Use descriptive file names
- Upload during off-peak hours
- Keep backups of source files
- Monitor success messages
- Test with small files first

❌ **DON'T:**
- Upload huge files without testing
- Modify data after upload without verification
- Delete original files immediately
- Upload duplicate data repeatedly
- Ignore error messages

---

## Support

For issues or questions:

1. Check backend logs in terminal
2. Verify file format matches requirements
3. Test with provided sample file
4. Review this guide for solutions
5. Check browser developer console (F12)

---

## Summary

The file upload feature makes it easy to:
- ✅ Batch import shipment data
- ✅ Instantly search uploaded records
- ✅ Track multi-shipment journeys
- ✅ Analyze performance metrics
- ✅ Monitor operational health

With proper CSV formatting, you can have thousands of new shipments searchable and analyzable in seconds!
