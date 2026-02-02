const moment = require('moment');

// In-memory data store (replace with MongoDB in production)
const consignments = {};
const scans = {};
const alerts = [];

class AWBData {
  static getAllConsignments() {
    return Object.values(consignments);
  }

  static getConsignmentByAWB(awb) {
    return consignments[awb];
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
