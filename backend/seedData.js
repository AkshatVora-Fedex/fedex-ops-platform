const AWBData = require('./models/AWBData');
const AlertService = require('./services/AlertService');
const moment = require('moment');

function seedMockData() {
  console.log('Seeding mock consignment data...');

  // Mock Consignment 1 - On Track
  AWBData.createConsignment('7488947329', {
    shipper: 'ABC Manufacturing Inc.',
    receiver: 'XYZ Retail Corp',
    origin: 'New York, NY',
    destination: 'Los Angeles, CA',
    weight: 25.5,
    serviceType: 'FedEx Express',
    estimatedDelivery: moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss')
  });

  AWBData.addScan('7488947329', {
    type: 'PUX',
    location: 'New York Facility',
    latitude: 40.7128,
    longitude: -74.0060,
    details: 'Package picked up from shipper',
    facilityCode: 'NYC01',
    courierID: 'CUR001'
  });

  AWBData.addScan('7488947329', {
    type: 'STAT',
    location: 'Chicago Distribution Hub',
    latitude: 41.8781,
    longitude: -87.6298,
    details: 'Package in transit',
    facilityCode: 'CHI01',
    courierID: 'CUR002'
  });

  // Mock Consignment 2 - Delayed
  AWBData.createConsignment('7488947330', {
    shipper: 'Tech Solutions Ltd',
    receiver: 'Global Electronics',
    origin: 'Seattle, WA',
    destination: 'Miami, FL',
    weight: 15.2,
    serviceType: 'FedEx Ground',
    estimatedDelivery: moment().subtract(2, 'hours').format('YYYY-MM-DD HH:mm:ss')
  });

  AWBData.addScan('7488947330', {
    type: 'PUX',
    location: 'Seattle Facility',
    latitude: 47.6062,
    longitude: -122.3321,
    details: 'Package picked up',
    facilityCode: 'SEA01',
    courierID: 'CUR003'
  });

  AWBData.addScan('7488947330', {
    type: 'STAT',
    location: 'Denver Distribution Center',
    latitude: 39.7392,
    longitude: -104.9903,
    details: 'In transit',
    facilityCode: 'DEN01',
    courierID: 'CUR004'
  });

  // Mock Consignment 3 - Delivery Exception
  AWBData.createConsignment('7488947331', {
    shipper: 'Fashion Plus',
    receiver: 'Style Boutique',
    origin: 'Houston, TX',
    destination: 'Boston, MA',
    weight: 8.7,
    serviceType: 'FedEx Overnight',
    estimatedDelivery: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  });

  AWBData.addScan('7488947331', {
    type: 'PUX',
    location: 'Houston Facility',
    latitude: 29.7604,
    longitude: -95.3698,
    details: 'Package picked up',
    facilityCode: 'HOU01',
    courierID: 'CUR005'
  });

  AWBData.addScan('7488947331', {
    type: 'STAT',
    location: 'Atlanta Hub',
    latitude: 33.7490,
    longitude: -84.3880,
    details: 'In transit',
    facilityCode: 'ATL01',
    courierID: 'CUR006'
  });

  AWBData.addScan('7488947331', {
    type: 'DEX',
    location: 'Boston Facility',
    latitude: 42.3601,
    longitude: -71.0589,
    details: 'Delivery attempt failed - Address issue',
    facilityCode: 'BOS01',
    courierID: 'CUR007'
  });

  // Mock Consignment 4 - On Schedule
  AWBData.createConsignment('7488947332', {
    shipper: 'Food Distributors Co',
    receiver: 'Restaurant Group',
    origin: 'Dallas, TX',
    destination: 'Phoenix, AZ',
    weight: 45.0,
    serviceType: 'FedEx Express',
    estimatedDelivery: moment().add(1, 'days').add(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
  });

  AWBData.addScan('7488947332', {
    type: 'PUX',
    location: 'Dallas Facility',
    latitude: 32.7767,
    longitude: -96.7970,
    details: 'Package picked up',
    facilityCode: 'DAL01',
    courierID: 'CUR008'
  });

  AWBData.addScan('7488947332', {
    type: 'STAT',
    location: 'Fort Worth Hub',
    latitude: 32.7555,
    longitude: -97.3308,
    details: 'In transit',
    facilityCode: 'FTW01',
    courierID: 'CUR008'
  });

  AWBData.addScan('7488947332', {
    type: 'OTH',
    location: 'Phoenix Delivery Station',
    latitude: 33.4484,
    longitude: -112.0742,
    details: 'Out for delivery',
    facilityCode: 'PHX01',
    courierID: 'CUR009'
  });

  // Check and generate alerts
  [7488947329, 7488947330, 7488947331, 7488947332].forEach(awb => {
    const consignment = AWBData.getConsignmentByAWB(awb.toString());
    if (consignment) {
      AlertService.checkConsignment(consignment);
    }
  });

  console.log('✓ Mock data seeded successfully');
}

module.exports = seedMockData;
