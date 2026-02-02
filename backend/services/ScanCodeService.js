// Scan Code Service
// Provides utilities for scan code operations and analysis

const { scanCodes, getScanCode, isCriticalCode, getCriticalCodes, getCodesByCategory } = require('../data/scanCodes');

class ScanCodeService {
  // Get detailed information about a scan code
  static getCodeInfo(type, subcode = null) {
    return getScanCode(type, subcode);
  }

  // Check if a scan code represents a critical issue
  static isCritical(type, subcode = null) {
    return isCriticalCode(type, subcode);
  }

  // Get all critical scan codes
  static getAllCriticalCodes() {
    return getCriticalCodes();
  }

  // Get scan codes by category
  static getCodesByCategory(category) {
    return getCodesByCategory(category);
  }

  // Get all scan code types
  static getAllTypes() {
    return Object.keys(scanCodes).filter(key => key !== 'Standard');
  }

  // Get all categories
  static getAllCategories() {
    const categories = new Set();
    for (const [type, typeData] of Object.entries(scanCodes)) {
      if (typeData.subcodes) {
        for (const [_, codeData] of Object.entries(typeData.subcodes)) {
          categories.add(codeData.category);
        }
      }
    }
    return Array.from(categories).sort();
  }

  // Analyze scan sequence for a shipment
  static analyzeScanSequence(scans) {
    const analysis = {
      totalScans: scans.length,
      scanTypes: {},
      criticalScans: [],
      categories: {},
      timeline: [],
      issues: []
    };

    scans.forEach((scan, index) => {
      const codeInfo = this.getCodeInfo(scan.type, scan.subcode);
      
      // Track scan types
      if (!analysis.scanTypes[scan.type]) {
        analysis.scanTypes[scan.type] = 0;
      }
      analysis.scanTypes[scan.type]++;

      // Track categories
      if (codeInfo && codeInfo.category) {
        if (!analysis.categories[codeInfo.category]) {
          analysis.categories[codeInfo.category] = [];
        }
        analysis.categories[codeInfo.category].push({
          scanIndex: index,
          type: scan.type,
          subcode: scan.subcode,
          timestamp: scan.timestamp,
          location: scan.location
        });
      }

      // Identify critical scans
      if (this.isCritical(scan.type, scan.subcode)) {
        analysis.criticalScans.push({
          scanIndex: index,
          type: scan.type,
          subcode: scan.subcode,
          description: codeInfo?.description || 'Unknown',
          severity: codeInfo?.severity || 'unknown',
          timestamp: scan.timestamp,
          location: scan.location
        });
      }

      // Build timeline
      analysis.timeline.push({
        index,
        type: scan.type,
        subcode: scan.subcode,
        description: codeInfo?.description || 'Unknown code',
        severity: codeInfo?.severity || 'unknown',
        timestamp: scan.timestamp,
        location: scan.location
      });
    });

    // Identify issues
    if (analysis.criticalScans.length > 0) {
      analysis.issues.push({
        type: 'CRITICAL_SCANS',
        count: analysis.criticalScans.length,
        message: `${analysis.criticalScans.length} critical event(s) detected`
      });
    }

    // Check for unusual patterns
    if (analysis.scanTypes.DEX || analysis.scanTypes.RTO) {
      analysis.issues.push({
        type: 'DELIVERY_EXCEPTION',
        message: 'Delivery exception or return detected'
      });
    }

    if (analysis.categories['Delay'] && analysis.categories['Delay'].length > 2) {
      analysis.issues.push({
        type: 'MULTIPLE_DELAYS',
        count: analysis.categories['Delay'].length,
        message: 'Multiple delays detected in shipment'
      });
    }

    return analysis;
  }

  // Get expected scan sequence
  static getExpectedScanSequence(serviceType = 'Standard') {
    return {
      'Standard': ['PUX', 'STAT', 'STAT', 'OTH', 'DX'],
      'Overnight': ['PUX', 'STAT', 'STAT', 'OTH', 'DX'],
      'Ground': ['PUX', 'STAT', 'STAT', 'STAT', 'OTH', 'DX'],
      'International': ['PUX', 'STAT', 'STAT', 'STAT', 'STAT', 'CONS', 'STAT', 'DX']
    }[serviceType] || ['PUX', 'STAT', 'OTH', 'DX'];
  }

  // Validate scan sequence
  static validateScanSequence(scans, serviceType = 'Standard') {
    const expected = this.getExpectedScanSequence(serviceType);
    const actual = scans.map(s => s.type);
    
    const validation = {
      isValid: true,
      expected,
      actual,
      missing: [],
      unexpected: [],
      outOfOrder: false
    };

    // Check for missing scans
    let expectedIndex = 0;
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[expectedIndex]) {
        if (expectedIndex < expected.length - 1) {
          validation.missing.push(expected[expectedIndex]);
          validation.outOfOrder = true;
        }
      } else {
        expectedIndex++;
      }
    }

    // Check for unexpected scans
    actual.forEach(scan => {
      if (!expected.includes(scan)) {
        validation.unexpected.push(scan);
      }
    });

    validation.isValid = validation.missing.length === 0 && 
                        validation.unexpected.length === 0 &&
                        !validation.outOfOrder;

    return validation;
  }

  // Get scan code description
  static getDescription(type, subcode = null) {
    const code = this.getCodeInfo(type, subcode);
    return code?.description || `Unknown scan code: ${type}${subcode ? '-' + subcode : ''}`;
  }

  // Get severity level
  static getSeverity(type, subcode = null) {
    const code = this.getCodeInfo(type, subcode);
    return code?.severity || 'unknown';
  }
}

module.exports = ScanCodeService;
