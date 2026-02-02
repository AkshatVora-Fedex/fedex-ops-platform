// FedEx Operational Scan Codes Database
// Comprehensive reference for all scan code types and their meanings

const scanCodes = {
  // PUX - Pickup Exception Codes
  PUX: {
    code: 'PUX',
    name: 'Pickup Exception',
    description: 'Package pickup-related exceptions',
    subcodes: {
      'PUX03': { description: 'Incorrect Address', severity: 'medium', category: 'Address Issue' },
      'PUX05': { description: 'Customer Security Delay', severity: 'medium', category: 'Delay' },
      'PUX08': { description: 'Not In / Business Closed', severity: 'medium', category: 'Location Issue' },
      'PUX15': { description: 'Business Closed Due To Strike', severity: 'high', category: 'External' },
      'PUX16': { description: 'Payment Received', severity: 'low', category: 'Payment' },
      'PUX17': { description: 'Future Delivery Requested', severity: 'low', category: 'Customer Request' },
      'PUX20': { description: 'DG Commodity Unacceptable/Incompatible', severity: 'high', category: 'Safety' },
      'PUX23': { description: 'Pkg Received After A/C & Shuttle Departure', severity: 'medium', category: 'Timing' },
      'PUX24': { description: 'Customer Delay', severity: 'medium', category: 'Delay' },
      'PUX26': { description: 'Tendered by Cartage Agent & Consolidator', severity: 'low', category: 'Handling' },
      'PUX30': { description: 'Attempted After Close Time', severity: 'medium', category: 'Timing' },
      'PUX35': { description: 'Third Party Call In - No Package', severity: 'medium', category: 'Verification' },
      'PUX39': { description: 'Customer Did Not Wait', severity: 'medium', category: 'Delay' },
      'PUX40': { description: 'Multiple Pickups Scheduled', severity: 'low', category: 'Scheduling' },
      'PUX42': { description: 'Holiday - Business Closed', severity: 'low', category: 'Holiday' },
      'PUX43': { description: 'No Package', severity: 'high', category: 'Missing Package' },
      'PUX46': { description: 'Mass Pickup Scan', severity: 'low', category: 'Bulk' },
      'PUX47': { description: 'Mass Routing Scan', severity: 'low', category: 'Bulk' },
      'PUX50': { description: 'Improper/Missing Regulatory Paperwork', severity: 'high', category: 'Documentation' },
      'PUX78': { description: 'Country/City Not In Service Area', severity: 'high', category: 'Service' },
      'PUX79': { description: 'Uplift Not Available', severity: 'medium', category: 'Resource' },
      'PUX81': { description: 'COMAIL Stop / Received from Convenience Location', severity: 'low', category: 'Handling' },
      'PUX84': { description: 'Delay Caused Beyond Our Control', severity: 'high', category: 'External' },
      'PUX86': { description: 'Pre-Routed Meter Package', severity: 'low', category: 'Processing' },
      'PUX91': { description: 'Exceeds Service Limits', severity: 'high', category: 'Service' },
      'PUX92': { description: 'Pickup Not Ready', severity: 'medium', category: 'Readiness' },
      'PUX93': { description: 'Unable to Collect Payment or Bill Charges', severity: 'high', category: 'Payment' },
      'PUX94': { description: 'No Credit Approval - Bulk Shipment', severity: 'high', category: 'Payment' },
      'PUX95': { description: 'Package Retrieval', severity: 'low', category: 'Handling' },
      'PUX96': { description: 'Incorrect Pickup Info', severity: 'medium', category: 'Information' },
      'PUX97': { description: 'No Pickup Attempt Made', severity: 'high', category: 'Attempt' },
      'PUX98': { description: 'Courier Attempted - Pkg Left Behind', severity: 'medium', category: 'Handling' },
    }
  },

  // STAT - Status/Transition Codes
  STAT: {
    code: 'STAT',
    name: 'Status Update',
    description: 'Package status updates during transit',
    subcodes: {
      'STAT13': { description: 'Received from Non-Express Access Location', severity: 'low', category: 'Handling' },
      'STAT14': { description: 'Undeliverable Package', severity: 'critical', category: 'Delivery' },
      'STAT15': { description: 'Business Closed Due To Strike', severity: 'high', category: 'External' },
      'STAT18': { description: 'Missort', severity: 'medium', category: 'Sorting' },
      'STAT19': { description: 'Transfer of Custodial Control', severity: 'low', category: 'Handling' },
      'STAT20': { description: 'DG Commodity Unacceptable / Incompatible', severity: 'high', category: 'Safety' },
      'STAT21': { description: 'Bulk Aircraft/Truck', severity: 'low', category: 'Bulk' },
      'STAT22': { description: 'Pkg Missed Aircraft/Truck at Sta/Hub/Ramp', severity: 'high', category: 'Timing' },
      'STAT27': { description: 'Re-expedite', severity: 'medium', category: 'Expedite' },
      'STAT28': { description: 'Removed from Cold Storage', severity: 'low', category: 'Storage' },
      'STAT29': { description: 'Reroute Requested', severity: 'medium', category: 'Routing' },
      'STAT31': { description: 'Arrived after Couriers Dispatched', severity: 'medium', category: 'Timing' },
      'STAT32': { description: 'Plane Arrived Late at Hub or Ramp', severity: 'high', category: 'Timing' },
      'STAT33': { description: 'Vendor Transportation Delay', severity: 'high', category: 'External' },
      'STAT36': { description: 'Holding in Overgoods', severity: 'medium', category: 'Storage' },
      'STAT37': { description: 'Observed Package Damage', severity: 'critical', category: 'Damage' },
      'STAT41': { description: 'Commitment Not Due/Not Attempted', severity: 'medium', category: 'Scheduling' },
      'STAT42': { description: 'Business Closed/Delivery Not Attempted', severity: 'medium', category: 'Location' },
      'STAT44': { description: 'Package Movement Exception', severity: 'medium', category: 'Exception' },
      'STAT45': { description: 'Positive Pull/Early Pull', severity: 'low', category: 'Routing' },
      'STAT48': { description: 'Package Arrival Past Cutoff Time', severity: 'high', category: 'Timing' },
      'STAT50': { description: 'Improper/Missing Regulatory Paperwork', severity: 'high', category: 'Documentation' },
      'STAT51': { description: 'Pkg Sent to Expedite Department', severity: 'medium', category: 'Expedite' },
      'STAT52': { description: 'Held, Package Cleared After Sort Down', severity: 'low', category: 'Storage' },
      'STAT53': { description: 'Part of an Incomplete Shipment', severity: 'medium', category: 'Shipment' },
      'STAT54': { description: 'Possible Delay - Next Day in 2 to 3-Day Lane', severity: 'medium', category: 'Delay' },
      'STAT55': { description: 'Regulatory Agency Clearance Delay', severity: 'high', category: 'Regulatory' },
      'STAT56': { description: 'Removed from CAGE', severity: 'low', category: 'Storage' },
      'STAT57': { description: 'PKG Manifested But Not Received', severity: 'critical', category: 'Verification' },
      'STAT58': { description: 'Unable to Contact Recipient for Broker Info', severity: 'medium', category: 'Contact' },
      'STAT59': { description: 'Hold at Location', severity: 'medium', category: 'Storage' },
      'STAT60': { description: 'Still in Bond Cage', severity: 'medium', category: 'Storage' },
      'STAT61': { description: 'Broker Notification', severity: 'low', category: 'Notification' },
      'STAT62': { description: 'Customs Paperwork Transit', severity: 'medium', category: 'Customs' },
      'STAT63': { description: 'Package Held for Taxes', severity: 'medium', category: 'Customs' },
      'STAT64': { description: 'Non-FedEx Clearance', severity: 'medium', category: 'Customs' },
      'STAT65': { description: 'Commercial Customs Release', severity: 'low', category: 'Customs' },
      'STAT66': { description: 'Customs Release/Intl SIPS', severity: 'low', category: 'Customs' },
      'STAT67': { description: 'Received from / Released to an ODA Agent', severity: 'low', category: 'Handling' },
      'STAT68': { description: 'In Country Transit', severity: 'low', category: 'Transit' },
      'STAT69': { description: 'Batch Received at Imaging Loc', severity: 'low', category: 'Processing' },
      'STAT70': { description: 'Transit In', severity: 'low', category: 'Transit' },
      'STAT71': { description: 'Commercial/Dutiable Received at Port of Entry', severity: 'low', category: 'Customs' },
      'STAT72': { description: 'Documents/Non-Commercial/Non-Dutiable at Destination', severity: 'low', category: 'Customs' },
      'STAT73': { description: 'Extra Regulatory Processing', severity: 'medium', category: 'Regulatory' },
      'STAT74': { description: 'Overage', severity: 'low', category: 'Inventory' },
      'STAT75': { description: 'FEC Brokerage', severity: 'low', category: 'Customs' },
      'STAT76': { description: 'Customs Entry & FedEx Broker', severity: 'medium', category: 'Customs' },
      'STAT77': { description: 'Transit Out', severity: 'low', category: 'Transit' },
      'STAT78': { description: 'Not Served', severity: 'high', category: 'Service' },
      'STAT79': { description: 'Uplift Available', severity: 'low', category: 'Resource' },
      'STAT80': { description: 'Paperwork Ready for Broker', severity: 'low', category: 'Documentation' },
      'STAT84': { description: 'Delay Beyond Our Control', severity: 'high', category: 'External' },
      'STAT85': { description: 'Mechanical Delay', severity: 'high', category: 'Equipment' },
      'STAT88': { description: 'Missing CI FAX', severity: 'medium', category: 'Documentation' },
      'STAT89': { description: 'Transport Accident & May Delay', severity: 'critical', category: 'Emergency' },
      'STAT90': { description: 'Customs Paperwork Outbound', severity: 'medium', category: 'Customs' },
      'STAT91': { description: 'Pickup Exception - Exceeds Service Limit', severity: 'high', category: 'Service' },
    }
  },

  // DEX - Delivery Exception Codes
  DEX: {
    code: 'DEX',
    name: 'Delivery Exception',
    description: 'Package delivery-related exceptions',
    subcodes: {
      'DEX01': { description: 'Package Not Delivered/Not Attempted', severity: 'high', category: 'Delivery' },
      'DEX03': { description: 'Incorrect Address', severity: 'medium', category: 'Address' },
      'DEX05': { description: 'Customer Security Delay', severity: 'medium', category: 'Delay' },
      'DEX07': { description: 'Shipment Refused by Recipient', severity: 'medium', category: 'Refusal' },
      'DEX08': { description: 'Recipient Not In / Business Closed', severity: 'medium', category: 'Location' },
      'DEX10': { description: 'Damaged - Delivery Not Completed', severity: 'critical', category: 'Damage' },
      'DEX12': { description: 'Package Sorted to Wrong Route', severity: 'high', category: 'Sorting' },
      'DEX15': { description: 'Business Closed Due to Strike', severity: 'high', category: 'External' },
      'DEX17': { description: 'Customer Requested Future Delivery', severity: 'low', category: 'Customer Request' },
      'DEX25': { description: 'Package Received without Package Tracking #', severity: 'high', category: 'Verification' },
      'DEX38': { description: 'Package Tracking # Received without Package', severity: 'high', category: 'Verification' },
      'DEX81': { description: 'COMAIL Stop / Delivered to Convenience Location', severity: 'low', category: 'Delivery' },
      'DEX84': { description: 'Delay Caused Beyond Our Control', severity: 'high', category: 'External' },
      'DEX93': { description: 'Unable To Collect Payment or Bill Charges', severity: 'high', category: 'Payment' },
    }
  },

  // RTO - Return to Origin Codes
  RTO: {
    code: 'RTO',
    name: 'Return to Origin',
    description: 'Package returned to sender',
    subcodes: {
      'RTO01': { description: 'Undeliverable - Bad Address', severity: 'high', category: 'Address' },
      'RTO02': { description: 'Refused by Customer', severity: 'medium', category: 'Refusal' },
      'RTO03': { description: 'Cannot Locate Recipient', severity: 'high', category: 'Location' },
      'RTO04': { description: 'Recipient Closed/Out of Business', severity: 'medium', category: 'Location' },
      'RTO05': { description: 'Damaged Package', severity: 'high', category: 'Damage' },
    }
  },

  // CONS - Consolidation Codes
  CONS: {
    code: 'CONS',
    name: 'Consolidation',
    description: 'Consolidation-related operations',
    subcodes: {
      'CONS01': { description: 'Consolidated Shipment', severity: 'low', category: 'Consolidation' },
      'CONS02': { description: 'Deconsolidation at Hub', severity: 'low', category: 'Consolidation' },
    }
  },

  // DDEX - Domestic Delivery Exception
  DDEX: {
    code: 'DDEX',
    name: 'Domestic Delivery Exception',
    description: 'Domestic delivery-specific exceptions',
    subcodes: {
      'DDEX01': { description: 'Address Issue', severity: 'medium', category: 'Address' },
      'DDEX02': { description: 'Delivery Attempt - Customer Not Available', severity: 'medium', category: 'Attempt' },
      'DDEX03': { description: 'No Authorization to Deliver', severity: 'high', category: 'Authorization' },
    }
  },

  // HEX - Hub Exception
  HEX: {
    code: 'HEX',
    name: 'Hub Exception',
    description: 'Hub/facility-related exceptions',
    subcodes: {
      'HEX01': { description: 'Missorted Package', severity: 'medium', category: 'Sorting' },
      'HEX02': { description: 'Package Damage at Hub', severity: 'critical', category: 'Damage' },
      'HEX03': { description: 'Lost Package', severity: 'critical', category: 'Lost Package' },
    }
  },

  // SEP - Special Exception
  SEP: {
    code: 'SEP',
    name: 'Special Exception',
    description: 'Special circumstance exceptions',
    subcodes: {
      'SEP01': { description: 'Hazardous Material Issue', severity: 'critical', category: 'Safety' },
      'SEP02': { description: 'Customs Hold', severity: 'high', category: 'Customs' },
      'SEP03': { description: 'Security Issue', severity: 'critical', category: 'Security' },
    }
  },

  // Standard codes (commonly used)
  'Standard': {
    'PUX': { description: 'Package picked up from shipper', severity: 'low' },
    'STAT': { description: 'Package in transit', severity: 'low' },
    'DEX': { description: 'Delivery exception occurred', severity: 'high' },
    'DX': { description: 'Package successfully delivered', severity: 'low' },
    'OTH': { description: 'Out for delivery', severity: 'low' },
    'RTO': { description: 'Package returned to sender', severity: 'high' },
  }
};

// Helper functions
function getScanCode(type, subcode = null) {
  if (subcode) {
    const scanType = scanCodes[type];
    if (scanType && scanType.subcodes && scanType.subcodes[subcode]) {
      return {
        type,
        subcode,
        ...scanType.subcodes[subcode]
      };
    }
  }
  return scanCodes[type] || null;
}

function isCriticalCode(type, subcode = null) {
  const code = getScanCode(type, subcode);
  return code && (code.severity === 'critical' || code.severity === 'high');
}

function getCriticalCodes() {
  const critical = [];
  for (const [type, typeData] of Object.entries(scanCodes)) {
    if (typeData.subcodes) {
      for (const [subcode, codeData] of Object.entries(typeData.subcodes)) {
        if (codeData.severity === 'critical' || codeData.severity === 'high') {
          critical.push({ type, subcode, ...codeData });
        }
      }
    }
  }
  return critical;
}

function getCodesByCategory(category) {
  const codes = [];
  for (const [type, typeData] of Object.entries(scanCodes)) {
    if (typeData.subcodes) {
      for (const [subcode, codeData] of Object.entries(typeData.subcodes)) {
        if (codeData.category === category) {
          codes.push({ type, subcode, ...codeData });
        }
      }
    }
  }
  return codes;
}

module.exports = {
  scanCodes,
  getScanCode,
  isCriticalCode,
  getCriticalCodes,
  getCodesByCategory
};
