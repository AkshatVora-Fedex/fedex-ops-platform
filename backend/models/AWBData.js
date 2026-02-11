const moment = require('moment');
const fs = require('fs');
const path = require('path');

// In-memory data store (replace with MongoDB in production)
const consignments = {};
const scans = {};
const alerts = [];

// Lazy-load historical AWB data
const historicalDataPath = path.join(__dirname, '../data/awb-historical.json');
let historicalAWBs = null;
let dataLoadingPromise = null;
let historicalMtimeMs = null;

function loadHistoricalData() {
  try {
    if (fs.existsSync(historicalDataPath)) {
      const stats = fs.statSync(historicalDataPath);
      if (historicalAWBs !== null && historicalMtimeMs === stats.mtimeMs) {
        return Promise.resolve(historicalAWBs);
      }
    }
  } catch (error) {
    console.error('Error checking historical data file:', error.message);
  }

  if (dataLoadingPromise) {
    return dataLoadingPromise;
  }

  dataLoadingPromise = new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(historicalDataPath)) {
        console.log('ℹ️  Historical AWB data file not found');
        historicalAWBs = [];
        resolve([]);
        return;
      }

      const stats = fs.statSync(historicalDataPath);
      const rawData = fs.readFileSync(historicalDataPath, 'utf8');
      const parsedData = JSON.parse(rawData);
      
      // Handle both direct array and wrapped object with records property
      historicalAWBs = Array.isArray(parsedData) ? parsedData : (parsedData.records || []);
      historicalMtimeMs = stats.mtimeMs;
      
      console.log(`✅ Loaded ${historicalAWBs.length} historical AWB records`);
      resolve(historicalAWBs);
    } catch (error) {
      console.error('Error loading historical data:', error.message);
      historicalAWBs = [];
      resolve([]);
    }
  });

  return dataLoadingPromise;
}

class AWBData {
  static async getAllConsignments() {
    // Combine in-memory and historical data
    const inMemory = Object.values(consignments);
    
    // Load historical data
    const data = await loadHistoricalData();
    
    // Convert sample of historical records to consignment format for display
    const historicalSample = data.map(historical => {
      const serviceType = typeof historical.service === 'object'
        ? historical.service?.type || 'Priority'
        : historical.service || 'Priority';

      const originLocation = historical.origin?.mdName ||
        historical.origin?.locationCode ||
        historical.origin?.postalCode ||
        'Unknown';

      const destinationLocation = historical.destination?.mdName ||
        historical.destination?.locationCode ||
        historical.destination?.postalCode ||
        'Unknown';

      const status = historical.performance?.bucket || historical.status || 'IN_TRANSIT';

      return {
        awb: historical.awb,
        shipper: historical.shipper?.companyName || 'Unknown',
        receiver: historical.recipient?.companyName || 'Unknown',
        origin: originLocation,
        destination: destinationLocation,
        weight: (Math.random() * 15 + 5).toFixed(1),
        serviceType: serviceType,
        createdAt: historical.shipDate || new Date().toISOString(),
        estimatedDelivery: historical.serviceCommitDate || new Date().toISOString(),
        status: status,
        currentLocation: historical.scanInfo?.pickupLocation || originLocation,
        lastScan: historical.pickupScanDate,
        scans: [],
        isHistorical: true,
        region: historical.origin?.region,
        subregion: historical.origin?.subregion,
        isHistorical: true
      };
    });

    return [...inMemory, ...historicalSample];
  }

  static async getConsignmentByAWB(awb) {
    // First check in-memory consignments
    if (consignments[awb]) {
      return consignments[awb];
    }

    // Load historical data if needed
    const data = await loadHistoricalData();
    
    // Then check historical data
    const historical = data.find(record => record.awb === awb);
    if (historical) {
      // Convert historical record to consignment format
      const serviceType = typeof historical.service === 'object' 
        ? historical.service?.type || 'Priority'
        : historical.service || 'Priority';
        
      const originLocation = historical.origin?.mdName || 
                            historical.origin?.locationCode || 
                            'Unknown';
      const destLocation = historical.destination?.mdName || 
                          historical.destination?.locationCode || 
                          'Unknown';
      
      return {
        awb: historical.awb,
        shipper: historical.shipper?.companyName || 'Unknown',
        receiver: historical.recipient?.companyName || 'Unknown',
        origin: originLocation,
        destination: destLocation,
        weight: (Math.random() * 15 + 5).toFixed(1),
        serviceType: serviceType,
        createdAt: historical.shipDate || new Date().toISOString(),
        estimatedDelivery: historical.serviceCommitDate || new Date().toISOString(),
        status: historical.performance?.bucket || 'IN_TRANSIT',
        currentLocation: originLocation,
        lastScan: historical.pickupScanDate,
        scans: [],
        region: historical.origin?.region,
        subregion: historical.origin?.subregion,
        isHistorical: true
      };
    }

    return null;
  }

  static async getHistoricalStats() {
    const data = await loadHistoricalData();
    
    const stats = {
      total: data.length,
      byStatus: {},
      byService: {},
      byRegion: {}
    };

    data.forEach(record => {
      // Count by status
      const status = record.performance?.bucket || record.status || 'Unknown';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by service
      const service = typeof record.service === 'object'
        ? record.service?.type || 'Unknown'
        : record.service || 'Unknown';
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

  static async getHistoricalData() {
    return loadHistoricalData();
  }

  static async getHistoricalStats() {
    const data = await loadHistoricalData();
    if (!data || data.length === 0) {
      return { total: 0, byStatus: {} };
    }

    const byStatus = {};
    data.forEach(record => {
      const status = record.performance?.bucket || record.status || 'UNKNOWN';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    return { total: data.length, byStatus };
  }

  // Get all historical data with optional filtering
  static async getHistoricalDataWithFilters(filters = {}) {
    const data = await loadHistoricalData();
    if (!data) return [];

    let filtered = data;

    if (filters.status) {
      filtered = filtered.filter(record => 
        (record.performance?.bucket === filters.status) || (record.status === filters.status)
      );
    }

    if (filters.region) {
      filtered = filtered.filter(record => record.origin?.region === filters.region);
    }

    if (filters.service) {
      const serviceType = typeof filters.service === 'string' ? filters.service : null;
      if (serviceType) {
        filtered = filtered.filter(record => {
          const svc = typeof record.service === 'object' ? record.service?.type : record.service;
          return svc === serviceType;
        });
      }
    }

    if (filters.awb) {
      filtered = filtered.filter(record => record.awb.includes(filters.awb));
    }

    return filtered;
  }

  // Get historical data grouped by various dimensions
  static async getHistoricalGrouped(groupBy = 'status') {
    const data = await loadHistoricalData();
    if (!data) return {};

    const grouped = {};

    if (groupBy === 'status') {
      data.forEach(record => {
        const status = record.performance?.bucket || record.status || 'UNKNOWN';
        if (!grouped[status]) grouped[status] = [];
        grouped[status].push(record);
      });
    } else if (groupBy === 'region') {
      data.forEach(record => {
        const region = record.origin?.region || 'UNKNOWN';
        if (!grouped[region]) grouped[region] = [];
        grouped[region].push(record);
      });
    } else if (groupBy === 'service') {
      data.forEach(record => {
        const service = typeof record.service === 'object' ? record.service?.type : record.service;
        const serviceKey = service || 'UNKNOWN';
        if (!grouped[serviceKey]) grouped[serviceKey] = [];
        grouped[serviceKey].push(record);
      });
    } else if (groupBy === 'bucket') {
      data.forEach(record => {
        const bucket = record.performance?.bucket || 'UNKNOWN';
        if (!grouped[bucket]) grouped[bucket] = [];
        grouped[bucket].push(record);
      });
    }

    // Count each group
    const counts = {};
    Object.keys(grouped).forEach(key => {
      counts[key] = grouped[key].length;
    });

    return counts;
  }

  // Get time-based statistics
  static async getTimeBasedStats() {
    const data = await loadHistoricalData();
    if (!data) return {};

    const stats = {
      byMonth: {},
      byService: {},
      byRegion: {},
      byBucket: {},
      performanceMetrics: {
        onTime: 0,
        delayed: 0,
        excluded: 0,
        other: 0
      }
    };

    data.forEach(record => {
      // Month analysis
      if (record.shipDate) {
        const date = new Date(record.shipDate);
        const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
      }

      // Service type
      const service = typeof record.service === 'object' ? record.service?.type : record.service;
      const serviceKey = service || 'Unknown';
      stats.byService[serviceKey] = (stats.byService[serviceKey] || 0) + 1;

      // Region
      const region = record.origin?.region || 'Unknown';
      stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;

      // Performance bucket
      const bucket = record.performance?.bucket || 'Unknown';
      stats.byBucket[bucket] = (stats.byBucket[bucket] || 0) + 1;

      // Performance metrics
      if (bucket === 'OnTime') stats.performanceMetrics.onTime++;
      else if (bucket === 'EXCLUDE' || bucket === 'EWDL') stats.performanceMetrics.excluded++;
      else if (bucket === 'WDL' || bucket === 'Late') stats.performanceMetrics.delayed++;
      else stats.performanceMetrics.other++;
    });

    return stats;
  }

  // Get shipment details by AWB (full historical record)
  static async getFullHistoricalByAWB(awb) {
    const data = await loadHistoricalData();
    if (!data) return null;
    return data.find(record => record.awb === awb) || null;
  }

  // Get regional performance metrics
  static async getRegionalMetrics() {
    const data = await loadHistoricalData();
    if (!data) return {};

    const metrics = {};

    data.forEach(record => {
      const region = record.origin?.region || 'UNKNOWN';
      
      if (!metrics[region]) {
        metrics[region] = {
          region,
          totalShipments: 0,
          onTime: 0,
          delayed: 0,
          excluded: 0,
          avgDeliveryTime: 0,
          deliveryTimes: []
        };
      }

      metrics[region].totalShipments++;

      const bucket = record.performance?.bucket || 'Unknown';
      if (bucket === 'OnTime') metrics[region].onTime++;
      else if (bucket === 'WDL' || bucket === 'Late') metrics[region].delayed++;
      else if (bucket === 'EXCLUDE' || bucket === 'EWDL') metrics[region].excluded++;

      // Calculate delivery time if dates available
      if (record.shipDate && record.deliveryDate) {
        const deliveryTime = new Date(record.deliveryDate) - new Date(record.shipDate);
        metrics[region].deliveryTimes.push(deliveryTime);
      }
    });

    // Calculate averages
    Object.keys(metrics).forEach(region => {
      if (metrics[region].deliveryTimes.length > 0) {
        const total = metrics[region].deliveryTimes.reduce((a, b) => a + b, 0);
        metrics[region].avgDeliveryTime = Math.round(total / metrics[region].deliveryTimes.length / (1000 * 60 * 60 * 24));
      }
      delete metrics[region].deliveryTimes;
    });

    return metrics;
  }

  // Generate realistic scan timeline based on shipment data
  static generateScanTimeline(historicalRecord) {
    const scans = [];
    const shipDate = new Date(historicalRecord.shipDate || new Date());
    const deliveryDate = new Date(historicalRecord.deliveryDate || new Date(shipDate.getTime() + 3 * 24 * 60 * 60 * 1000));
    
    const scanCodes = ['PUX', 'STAT', 'DEX', 'INBS', 'OUTFS', 'OUTA', 'OUTB', 'OUTC', 'OUTD', 'DX'];
    const hubs = ['MEM', 'IND', 'MCI', 'SEA', 'LAX', 'DFW', 'ATL', 'ORD', 'IAD'];
    
    // Pickup scan
    scans.push({
      scanCode: 'PUX',
      timestamp: shipDate,
      location: historicalRecord.origin?.locationCode || hubs[Math.floor(Math.random() * hubs.length)],
      description: 'Package picked up',
      locationType: 'origin'
    });
    
    // In-transit scans
    const transitDaysCount = Math.floor((deliveryDate - shipDate) / (1000 * 60 * 60 * 24));
    for (let i = 1; i < transitDaysCount; i++) {
      const scanTime = new Date(shipDate.getTime() + i * 24 * 60 * 60 * 1000 + Math.random() * 12 * 60 * 60 * 1000);
      scans.push({
        scanCode: scanCodes[Math.floor(Math.random() * (scanCodes.length - 2))],
        timestamp: scanTime,
        location: hubs[Math.floor(Math.random() * hubs.length)],
        description: 'In transit',
        locationType: 'hub'
      });
    }
    
    // Delivery scan
    scans.push({
      scanCode: 'DX',
      timestamp: deliveryDate,
      location: historicalRecord.destination?.locationCode || hubs[Math.floor(Math.random() * hubs.length)],
      description: 'Delivered',
      locationType: 'destination'
    });
    
    return scans.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Generate geospatial route data for maps
  static generateRouteData(historicalRecord) {
    const originCoords = {
      lat: historicalRecord.origin?.latitude || 35.1495 + (Math.random() - 0.5) * 20,
      lng: historicalRecord.origin?.longitude || -90.0490 + (Math.random() - 0.5) * 20
    };
    
    const destinationCoords = {
      lat: historicalRecord.destination?.latitude || 40.7128 + (Math.random() - 0.5) * 20,
      lng: historicalRecord.destination?.longitude || -74.0060 + (Math.random() - 0.5) * 20
    };
    
    // Generate intermediate waypoints
    const waypoints = [];
    for (let i = 1; i <= 3; i++) {
      const progress = i / 4;
      waypoints.push({
        lat: originCoords.lat + (destinationCoords.lat - originCoords.lat) * progress,
        lng: originCoords.lng + (destinationCoords.lng - originCoords.lng) * progress,
        hubName: `Hub ${i}`,
        arrivalTime: new Date(new Date(historicalRecord.shipDate).getTime() + progress * 2 * 24 * 60 * 60 * 1000)
      });
    }
    
    return {
      origin: originCoords,
      destination: destinationCoords,
      waypoints,
      courierLocation: { ...originCoords, timestamp: new Date() }
    };
  }

  // Get comprehensive shipment telemetry
  static async getShipmentTelemetry(awb) {
    const data = await loadHistoricalData();
    const record = data.find(r => r.awb === awb);
    
    if (!record) {
      return null;
    }
    
    const scanTimeline = this.generateScanTimeline(record);
    const routeData = this.generateRouteData(record);
    const currentStatus = record.performance?.bucket || 'IN_TRANSIT';
    
    return {
      awb: record.awb,
      shipDate: record.shipDate,
      deliveryDate: record.deliveryDate,
      status: currentStatus,
      origin: {
        location: record.origin?.mdName || record.origin?.locationCode,
        address: record.origin?.address,
        coordinates: { lat: record.origin?.latitude, lng: record.origin?.longitude }
      },
      destination: {
        location: record.destination?.mdName || record.destination?.locationCode,
        address: record.destination?.address,
        coordinates: { lat: record.destination?.latitude, lng: record.destination?.longitude }
      },
      scanTimeline,
      routeData,
      shipper: record.shipper,
      recipient: record.recipient,
      serviceType: typeof record.service === 'object' ? record.service?.type : record.service,
      weight: record.weight,
      dimensions: record.dimensions
    };
  }
}

module.exports = AWBData;
module.exports.loadHistoricalData = loadHistoricalData;
