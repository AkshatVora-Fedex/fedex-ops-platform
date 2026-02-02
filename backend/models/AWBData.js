const moment = require('moment');
const fs = require('fs');
const path = require('path');

// In-memory data store (replace with MongoDB in production)
const consignments = {};
const scans = {};
const alerts = [];

// Load historical AWB data
const historicalDataPath = path.join(__dirname, '../data/awb-historical.json');
let historicalAWBs = [];

try {
  if (fs.existsSync(historicalDataPath)) {
    const rawData = fs.readFileSync(historicalDataPath, 'utf8');
    historicalAWBs = JSON.parse(rawData);
    console.log(`✅ Loaded ${historicalAWBs.length} historical AWB records`);
  }
} catch (error) {
  console.log('ℹ️  Historical AWB data not available');
}

class AWBData {
  static getAllConsignments() {
    // Combine in-memory and historical data
    const inMemory = Object.values(consignments);
    
    // Convert sample of historical records to consignment format for display
    const historicalSample = historicalAWBs.slice(0, 500).map(historical => ({
      awb: historical.awb,
      shipper: historical.shipper?.companyName || 'Unknown',
      receiver: historical.recipient?.companyName || 'Unknown',
      origin: `${historical.origin?.location || 'N/A'} (${historical.origin?.postalCode || 'N/A'})`,
      destination: `${historical.destination?.location || 'N/A'} (${historical.destination?.postalCode || 'N/A'})`,
      weight: (Math.random() * 15 + 5).toFixed(1),
      serviceType: historical.service || 'Priority',
      createdAt: historical.shipDate || new Date().toISOString(),
      estimatedDelivery: historical.serviceCommitDate || new Date().toISOString(),
      status: historical.status || 'IN_TRANSIT',
      currentLocation: historical.pickupScanLocation || historical.origin?.location || 'Unknown',
      lastScan: historical.pickupScanDate,
      scans: [],
      region: historical.origin?.region,
      subregion: historical.origin?.subregion,
      isHistorical: true
    }));

    return [...inMemory, ...historicalSample];
  }

  static getConsignmentByAWB(awb) {
    // First check in-memory consignments
    if (consignments[awb]) {
      return consignments[awb];
    }

    // Then check historical data
    const historical = historicalAWBs.find(record => record.awb === awb);
    if (historical) {
      // Convert historical record to consignment format
      return {
        awb: historical.awb,
        shipper: historical.shipper?.companyName || 'Unknown',
        receiver: historical.recipient?.companyName || 'Unknown',
        origin: `${historical.origin?.location || 'N/A'} (${historical.origin?.postalCode || 'N/A'})`,
        destination: `${historical.destination?.location || 'N/A'} (${historical.destination?.postalCode || 'N/A'})`,
        weight: (Math.random() * 15 + 5).toFixed(1),
        serviceType: historical.service || 'Priority',
        createdAt: historical.shipDate || new Date().toISOString(),
        estimatedDelivery: historical.serviceCommitDate || new Date().toISOString(),
        status: historical.status || 'IN_TRANSIT',
        currentLocation: historical.pickupScanLocation || historical.origin?.location || 'Unknown',
        lastScan: historical.pickupScanDate,
        scans: [],
        region: historical.origin?.region,
        subregion: historical.origin?.subregion,
        isHistorical: true
      };
    }

    return null;
  }

  static getHistoricalStats() {
    const stats = {
      total: historicalAWBs.length,
      byStatus: {},
      byService: {},
      byRegion: {}
    };

    historicalAWBs.forEach(record => {
      // Count by status
      const status = record.status || 'Unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by service
      const service = record.service || 'Unknown';
      stats.byService[service] = (stats.byService[service] || 0) + 1;

      // Count by region
      const region = record.origin?.region || 'Unknown';
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
    });

    return stats;
  }

  static createConsignment(awb, data) {
    consignments[awb] = {
      awb,
      shipper: data.shipper,
      receiver: data.receiver,
      origin: data.origin,
      destination: data.destination,
      weight: data.weight,
      serviceType: data.serviceType, // FedEx Express, Ground, etc.
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      estimatedDelivery: data.estimatedDelivery,
      status: 'IN_TRANSIT',
      currentLocation: data.origin,
      lastScan: null,
      scans: []
    };
    return consignments[awb];
  }

  static addScan(awb, scanData) {
    if (consignments[awb]) {
      const scan = {
        id: require('uuid').v4(),
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
        type: scanData.type, // PUX, DEX, STAT, OTH, etc.
        location: scanData.location,
        latitude: scanData.latitude,
        longitude: scanData.longitude,
        details: scanData.details,
        facilityCode: scanData.facilityCode,
        courierID: scanData.courierID
      };
      
      consignments[awb].scans.push(scan);
      consignments[awb].lastScan = scan;
      consignments[awb].currentLocation = scan.location;
      
      scans[scan.id] = scan;
      return scan;
    }
    return null;
  }

  static updateConsignmentStatus(awb, status) {
    if (consignments[awb]) {
      consignments[awb].status = status;
      return consignments[awb];
    }
    return null;
  }
}

module.exports = AWBData;
