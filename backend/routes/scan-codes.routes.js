// Scan Codes API Routes
// Provides endpoints for scan code reference data and analysis

const express = require('express');
const router = express.Router();
const ScanCodeService = require('../services/ScanCodeService');

/**
 * GET /api/scan-codes/types
 * Get all scan code types
 */
router.get('/types', (req, res) => {
  try {
    const types = ScanCodeService.getAllTypes();
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scan-codes/categories
 * Get all scan code categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = ScanCodeService.getAllCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scan-codes/critical
 * Get all critical scan codes
 */
router.get('/critical', (req, res) => {
  try {
    const criticalCodes = ScanCodeService.getAllCriticalCodes();
    res.json({
      success: true,
      data: criticalCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scan-codes/category/:category
 * Get scan codes by category
 */
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const codes = ScanCodeService.getCodesByCategory(category);
    
    if (codes.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    
    res.json({
      success: true,
      category,
      data: codes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scan-codes/:type/:subcode?
 * Get scan code information
 */
router.get('/:type/:subcode?', (req, res) => {
  try {
    const { type, subcode } = req.params;
    const codeInfo = ScanCodeService.getCodeInfo(type, subcode);
    
    if (!codeInfo) {
      return res.status(404).json({
        success: false,
        error: 'Scan code not found'
      });
    }
    
    res.json({
      success: true,
      data: codeInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scan-codes/analyze
 * Analyze a scan sequence
 */
router.post('/analyze', (req, res) => {
  try {
    const { scans, serviceType } = req.body;
    
    if (!scans || !Array.isArray(scans) || scans.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty scans array'
      });
    }
    
    const analysis = ScanCodeService.analyzeScanSequence(scans);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/scan-codes/validate
 * Validate scan sequence against expected sequence
 */
router.post('/validate', (req, res) => {
  try {
    const { scans, serviceType } = req.body;
    
    if (!scans || !Array.isArray(scans) || scans.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or empty scans array'
      });
    }
    
    const validation = ScanCodeService.validateScanSequence(scans, serviceType || 'Standard');
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/scan-codes/description/:type/:subcode?
 * Get human-readable description of a scan code
 */
router.get('/description/:type/:subcode?', (req, res) => {
  try {
    const { type, subcode } = req.params;
    const description = ScanCodeService.getDescription(type, subcode);
    const severity = ScanCodeService.getSeverity(type, subcode);
    
    res.json({
      success: true,
      data: {
        type,
        subcode: subcode || null,
        description,
        severity,
        isCritical: severity === 'critical' || severity === 'high'
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
