const moment = require('moment');
const ScanCodeService = require('../services/ScanCodeService');
const scanRulesData = require('../data/scanRules.json');

// Define FedEx scan types and their meanings
const SCAN_TYPES = {
  PUX: { name: 'Pickup', description: 'Package picked up from shipper' },
  DEX: { name: 'Delivery Exception', description: 'Delivery attempt failed' },
  STAT: { name: 'Status', description: 'Package in transit' },
  OTH: { name: 'Out for Delivery', description: 'Package out for delivery' },
  DX: { name: 'Delivered', description: 'Package delivered' },
  RTO: { name: 'Return to Origin', description: 'Package returned to sender' },
  CUST: { name: 'Customs Clearance', description: 'Customs processing' },
  LSP: { name: 'Last Scan Point', description: 'Final scan before delivery' },
  CONS: { name: 'Consolidation', description: 'Package consolidated at hub' },
  DDEX: { name: 'Domestic Delivery Exception', description: 'Domestic delivery exception' },
  HEX: { name: 'Hub Exception', description: 'Exception at hub' },
  SEP: { name: 'Special Exception', description: 'Special exception handling' }
};

// Expected scan sequence for different service families
const EXPECTED_SCAN_SEQUENCE = {
  EXPRESS: ['PUX', 'STAT', 'STAT', 'OTH', 'DX'],
  GROUND: ['PUX', 'STAT', 'STAT', 'STAT', 'OTH', 'DX'],
  OVERNIGHT: ['PUX', 'STAT', 'LSP', 'OTH', 'DX'],
  INTERNATIONAL: ['PUX', 'STAT', 'CUST', 'STAT', 'OTH', 'DX']
};

class ScanData {
  static getScanType(code) {
    return SCAN_TYPES[code] || { name: 'Unknown', description: 'Unknown scan type' };
  }

  static getExpectedSequence(serviceType) {
    const resolved = this.resolveServiceFamily(serviceType);
    return EXPECTED_SCAN_SEQUENCE[resolved] || ['PUX', 'STAT', 'OTH', 'DX'];
  }

  static resolveServiceFamily(serviceType = '') {
    const normalized = (serviceType || '').toLowerCase();

    if (normalized.includes('international')) return 'INTERNATIONAL';
    if (normalized.includes('overnight')) return 'OVERNIGHT';
    if (normalized.includes('ground')) return 'GROUND';
    if (normalized.includes('express')) return 'EXPRESS';

    return 'EXPRESS';
  }

  static getScanMeta(type) {
    const codeInfo = ScanCodeService.getCodeInfo(type);
    if (codeInfo && (codeInfo.name || codeInfo.description)) {
      return {
        name: codeInfo.name || this.getScanType(type).name,
        description: codeInfo.description || this.getScanType(type).description
      };
    }
    return this.getScanType(type);
  }

  static getRoutingRule(type) {
    const rules = scanRulesData?.rules || {};
    if (rules[type]) return rules[type];

    const candidates = Object.keys(rules).filter(key => key.startsWith(type));
    if (candidates.length === 0) return null;

    const summaries = candidates
      .map(key => rules[key]?.routingRules)
      .filter(Boolean);

    const appliesAt = candidates
      .map(key => rules[key]?.appliesAt)
      .filter(Boolean);

    return {
      routingRules: summaries.length > 0 ? summaries.slice(0, 3).join(' | ') : null,
      appliesAt: appliesAt.length > 0 ? Array.from(new Set(appliesAt)).join(' | ') : null
    };
  }

  static getAppliesAt(type, consignment) {
    const origin = consignment?.origin || 'Origin Facility';
    const destination = consignment?.destination || 'Destination Facility';

    const stageMap = {
      PUX: { stage: 'Origin Pickup', location: origin },
      STAT: { stage: 'In-Transit Hub', location: 'Network / Hub' },
      OTH: { stage: 'Destination Facility', location: destination },
      DX: { stage: 'Destination Delivery', location: destination },
      DEX: { stage: 'Delivery Exception', location: destination },
      RTO: { stage: 'Return to Origin', location: origin },
      CUST: { stage: 'Customs Clearance', location: 'Customs Facility' },
      LSP: { stage: 'Last Scan Point', location: destination },
      CONS: { stage: 'Consolidation Hub', location: 'Hub / Sort Facility' },
      DDEX: { stage: 'Domestic Exception', location: destination },
      HEX: { stage: 'Hub Exception', location: 'Hub / Sort Facility' },
      SEP: { stage: 'Special Exception', location: 'Security / Exception Area' }
    };

    return stageMap[type] || { stage: 'In-Transit', location: 'Network' };
  }

  static getExpectedChecklist(consignment) {
    const expectedSequence = this.getExpectedSequence(consignment.serviceType);
    return expectedSequence.map((expectedType, index) => {
      const meta = this.getScanMeta(expectedType);
      const rule = this.getRoutingRule(expectedType);
      const appliesAt = rule?.appliesAt
        ? { stage: 'Routing Rule', location: rule.appliesAt }
        : this.getAppliesAt(expectedType, consignment);
      return {
        position: index + 1,
        expected: {
          type: expectedType,
          name: meta.name,
          description: meta.description,
          appliesAt,
          routingRules: rule?.routingRules || null
        }
      };
    });
  }

  static validateScans(awb, scans, serviceType) {
    const expectedSequence = this.getExpectedSequence(serviceType);
    const scanTypes = scans.map(s => s.type);
    
    const discrepancies = [];
    expectedSequence.forEach((expectedType, index) => {
      const actualType = scanTypes[index];
      if (actualType !== expectedType) {
        discrepancies.push({
          position: index + 1,
          expected: expectedType,
          actual: actualType || 'MISSING',
          severity: !actualType ? 'HIGH' : 'MEDIUM'
        });
      }
    });

    // Check for extra scans
    if (scanTypes.length > expectedSequence.length) {
      discrepancies.push({
        position: expectedSequence.length + 1,
        note: `${scanTypes.length - expectedSequence.length} extra scans detected`,
        severity: 'LOW'
      });
    }

    return {
      isValid: discrepancies.length === 0,
      discrepancies,
      totalExpected: expectedSequence.length,
      totalActual: scanTypes.length
    };
  }
}

module.exports = ScanData;
