const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const DataService = require('../services/DataService');
const AWBData = require('../models/AWBData');

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Direct AWB search from historical data
router.get('/search/:awb', async (req, res) => {
  try {
    const awb = req.params.awb;
    const record = await DataService.searchAWB(awb);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Consignment not found',
        awb
      });
    }

    res.json({
      success: true,
      data: {
        awb: record.awb,
        masterAWB: record.masterAWB,
        status: record.status || 'IN_TRANSIT',
        shipper: record.shipper || {},
        recipient: record.recipient || {},
        origin: record.origin || {},
        destination: record.destination || {},
        service: record.service || 'Priority',
        shipDate: record.shipDate,
        pickupScanDate: record.pickupScanDate,
        podScanDate: record.podScanDate,
        serviceCommitDate: record.serviceCommitDate,
        weight: Math.random() * 15 + 5,
        isHistorical: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sample AWBs
router.get('/samples/list', async (req, res) => {
  try {
    const data = await DataService.getHistoricalData();
    const samples = data.slice(0, 50).map(record => ({
      awb: record.awb,
      status: record.performance?.bucket || record.status || 'IN_TRANSIT',
      service: (typeof record.service === 'object' ? record.service?.type : record.service) || 'Standard',
      origin: record.origin?.mdName || record.origin?.locationCode || 'Unknown',
      destination: record.destination?.mdName || record.destination?.locationCode || 'Unknown'
    }));

    res.json({
      success: true,
      count: samples.length,
      data: samples
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const records = [];

    // Parse CSV/TXT file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Map IN SPAC NSL.txt columns to our data model
        records.push({
          awb: row.shp_trk_nbr,
          masterAWB: row.mstr_ab_trk_nbr || null,
          shipDate: row.shp_dt,
          pickupScanDate: row.pckup_scan_dt,
          podScanDate: row.pod_scan_dt,
          serviceCommitDate: row.svc_commit_dt,

          shipper: {
            customerNumber: row.shpr_cust_nbr || null,
            companyName: row.shpr_co_nm || 'Unknown',
            postalCode: row.shpr_pstl_cd || null
          },

          recipient: {
            companyName: row.recp_co_nm || 'Unknown',
            postalCode: row.recp_pstl_cd || null
          },

          origin: {
            locationCode: row.orig_loc_cd || null,
            postalCode: row.orig_pstl_cd || null,
            megaRegion: row.orig_mega_region || null,
            region: row.orig_region || null,
            subregion: row.orig_subregion || null,
            market: row.orig_market_cd || null,
            mdName: row.orig_MD_name || null
          },

          destination: {
            locationCode: row.dest_loc_cd || null,
            postalCode: row.dest_pstl_cd || null,
            megaRegion: row.dest_mega_region || null,
            region: row.dest_region || null,
            subregion: row.dest_subregion || null,
            market: row.dest_market_cd || null,
            mdName: row.dest_MD_name || null
          },

          service: {
            type: row.Service || null,
            detail: row.Service_Detail || null,
            product: row.Product || null,
            baseCode: row.svc_bas_cd || null
          },

          performance: {
            pofCause: row.pof_cause || null,
            catCauseCode: row.cat_cause_cd || null,
            pofCatCode: row.pof_cat_cd || null,
            bucket: row.Bucket || 'Other',
            mbgClass: row.MBG_Class || null
          },

          scanInfo: {
            pickupLocation: row.pckup_scan_loc_cd || null,
            podLocation: row.pod_scan_loc_cd || null,
            pickupScanType: row.pkg_pckup_scan_typ_cd || null,
            pickupExceptionType: row.pkg_pckup_excp_typ_cd || null,
            pickupStopType: row.pckup_stop_typ_cd || null
          },

          isHistorical: true
        });
      })
      .on('end', () => {
        try {
          const historicalFilePath = path.join(__dirname, '../data/awb-historical.json');
          let existingData = [];
          let existingMetadata = {};

          if (fs.existsSync(historicalFilePath)) {
            const content = fs.readFileSync(historicalFilePath, 'utf-8');
            const parsedData = JSON.parse(content);

            if (Array.isArray(parsedData)) {
              existingData = parsedData;
            } else if (parsedData.records && Array.isArray(parsedData.records)) {
              existingData = parsedData.records;
              existingMetadata = {
                importDate: parsedData.importDate,
                sourceFile: parsedData.sourceFile,
                statistics: parsedData.statistics
              };
            }
          }

          const allRecords = [...existingData, ...records];
          const uniqueRecords = Array.from(
            new Map(allRecords.map(r => [r.awb, r])).values()
          );

          let dataToSave;
          if (Object.keys(existingMetadata).length > 0) {
            dataToSave = {
              importDate: existingMetadata.importDate || new Date().toISOString(),
              sourceFile: existingMetadata.sourceFile || 'Merged data',
              recordCount: uniqueRecords.length,
              statistics: existingMetadata.statistics || {},
              records: uniqueRecords
            };
          } else {
            dataToSave = uniqueRecords;
          }

          fs.writeFileSync(historicalFilePath, JSON.stringify(dataToSave, null, 2));
          fs.unlinkSync(filePath);

          res.json({
            success: true,
            recordsAdded: records.length,
            totalRecords: uniqueRecords.length,
            message: `Successfully added ${records.length} records from ${fileName}`
          });
        } catch (error) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(500).json({
            success: false,
            error: error.message
          });
        }
      })
      .on('error', (error) => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(500).json({
          success: false,
          error: error.message
        });
      });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Advanced search across historical data with filters
router.post('/advanced', async (req, res) => {
  try {
    const { status, region, service, dateFrom, dateTo } = req.body;
    
    const filters = {
      status,
      region,
      service
    };

    let results = await AWBData.getHistoricalDataWithFilters(filters);

    // Apply date filtering if provided
    if (dateFrom || dateTo) {
      results = results.filter(record => {
        const shipDate = new Date(record.shipDate);
        let inRange = true;

        if (dateFrom) {
          inRange = inRange && shipDate >= new Date(dateFrom);
        }
        if (dateTo) {
          inRange = inRange && shipDate <= new Date(dateTo);
        }

        return inRange;
      });
    }

    res.json({
      success: true,
      count: results.length,
      filters: { status, region, service, dateFrom, dateTo },
      data: results.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search by origin/destination region
router.get('/region/:region', async (req, res) => {
  try {
    const { region } = req.params;
    const results = await AWBData.getHistoricalDataWithFilters({ region });

    res.json({
      success: true,
      region,
      count: results.length,
      data: results.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search by performance bucket/status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const results = await AWBData.getHistoricalDataWithFilters({ status });

    res.json({
      success: true,
      status,
      count: results.length,
      data: results.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Search by service type
router.get('/service/:service', async (req, res) => {
  try {
    const { service } = req.params;
    const results = await AWBData.getHistoricalDataWithFilters({ service });

    res.json({
      success: true,
      service,
      count: results.length,
      data: results.slice(0, 100)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get search statistics and available filters
router.get('/filters/available', async (req, res) => {
  try {
    const statusCounts = await AWBData.getHistoricalGrouped('status');
    const regionCounts = await AWBData.getHistoricalGrouped('region');
    const serviceCounts = await AWBData.getHistoricalGrouped('service');
    const bucketCounts = await AWBData.getHistoricalGrouped('bucket');

    res.json({
      success: true,
      availableFilters: {
        statuses: statusCounts,
        regions: regionCounts,
        services: serviceCounts,
        buckets: bucketCounts
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
