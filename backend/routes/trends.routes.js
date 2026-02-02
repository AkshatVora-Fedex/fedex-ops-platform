const express = require('express');
const router = express.Router();

// Mock trend data
const generateTrendData = (days) => {
  return {
    recurring: {
      locations: [
        {
          facility: 'FedEx Memphis Hub',
          city: 'Memphis',
          country: 'USA',
          failureCount: 145,
          avgDelay: 2.5,
          affectedShipments: 892,
          trend: 12
        },
        {
          facility: 'LAX Distribution Center',
          city: 'Los Angeles',
          country: 'USA',
          failureCount: 132,
          avgDelay: 3.2,
          affectedShipments: 745,
          trend: -5
        },
        {
          facility: 'ORD Sorting Facility',
          city: 'Chicago',
          country: 'USA',
          failureCount: 98,
          avgDelay: 2.1,
          affectedShipments: 623,
          trend: 8
        },
        {
          facility: 'IND Hub',
          city: 'Indianapolis',
          country: 'USA',
          failureCount: 87,
          avgDelay: 1.8,
          affectedShipments: 534,
          trend: -3
        },
        {
          facility: 'ATL Gateway',
          city: 'Atlanta',
          country: 'USA',
          failureCount: 76,
          avgDelay: 2.3,
          affectedShipments: 478,
          trend: 15
        },
        {
          facility: 'DXB International',
          city: 'Dubai',
          country: 'UAE',
          failureCount: 65,
          avgDelay: 4.1,
          affectedShipments: 398,
          trend: 22
        },
        {
          facility: 'LHR Gateway',
          city: 'London',
          country: 'UK',
          failureCount: 54,
          avgDelay: 3.5,
          affectedShipments: 312,
          trend: -8
        },
        {
          facility: 'HKG Hub',
          city: 'Hong Kong',
          country: 'China',
          failureCount: 43,
          avgDelay: 2.9,
          affectedShipments: 267,
          trend: 5
        },
        {
          facility: 'GRU Distribution',
          city: 'São Paulo',
          country: 'Brazil',
          failureCount: 38,
          avgDelay: 3.8,
          affectedShipments: 198,
          trend: 18
        },
        {
          facility: 'SIN Hub',
          city: 'Singapore',
          country: 'Singapore',
          failureCount: 29,
          avgDelay: 2.2,
          affectedShipments: 156,
          trend: -2
        }
      ],
      serviceTypes: [
        {
          name: 'Priority Overnight',
          totalShipments: 25000,
          failures: 450,
          failureRate: 1.8
        },
        {
          name: 'Standard Overnight',
          totalShipments: 18000,
          failures: 612,
          failureRate: 3.4
        },
        {
          name: 'FedEx 2Day',
          totalShipments: 32000,
          failures: 1280,
          failureRate: 4.0
        },
        {
          name: 'FedEx Ground',
          totalShipments: 45000,
          failures: 3150,
          failureRate: 7.0
        },
        {
          name: 'Express Saver',
          totalShipments: 12000,
          failures: 240,
          failureRate: 2.0
        },
        {
          name: 'International Priority',
          totalShipments: 8000,
          failures: 720,
          failureRate: 9.0
        },
        {
          name: 'International Economy',
          totalShipments: 6000,
          failures: 780,
          failureRate: 13.0
        }
      ],
      rootCauses: [
        {
          reason: 'Weather delays',
          count: 1247,
          percentage: 32,
          severity: 'HIGH'
        },
        {
          reason: 'Hub congestion',
          count: 892,
          percentage: 23,
          severity: 'MEDIUM'
        },
        {
          reason: 'Vehicle breakdown',
          count: 654,
          percentage: 17,
          severity: 'CRITICAL'
        },
        {
          reason: 'Incorrect sorting',
          count: 523,
          percentage: 13,
          severity: 'MEDIUM'
        },
        {
          reason: 'Address issues',
          count: 378,
          percentage: 10,
          severity: 'LOW'
        },
        {
          reason: 'Customs delays',
          count: 198,
          percentage: 5,
          severity: 'HIGH'
        }
      ],
      recommendations: [
        {
          priority: 'CRITICAL',
          title: 'Implement Pre-Emptive Rerouting for ATL Hub',
          description: 'Atlanta Gateway shows a 15% increase in failures. Recommend implementing automated rerouting protocols during peak hours to distribute load across nearby hubs.',
          estimatedImprovement: '+12% on-time rate',
          effort: '2-3 weeks implementation'
        },
        {
          priority: 'HIGH',
          title: 'Enhance Weather Prediction Integration',
          description: 'Weather delays account for 32% of all failures. Integrate advanced weather prediction APIs to enable 48-hour advance rerouting decisions.',
          estimatedImprovement: '+8% reduction in delays',
          effort: '1-2 weeks integration'
        },
        {
          priority: 'MEDIUM',
          title: 'Hub Capacity Expansion for MEM',
          description: 'Memphis Hub consistently shows high volume with moderate delays. Consider temporary capacity expansion or shift scheduling optimization.',
          estimatedImprovement: '+5% throughput',
          effort: '4-6 weeks planning'
        },
        {
          priority: 'MEDIUM',
          title: 'Driver Training Program for International Routes',
          description: 'International routes show 9-13% failure rates. Implement specialized training program for international documentation and customs procedures.',
          estimatedImprovement: '+6% international success',
          effort: '3-4 weeks development'
        }
      ]
    }
  };
};

const generateRegionalData = (days) => {
  return {
    territories: [
      {
        name: 'North America (NA)',
        health: 'GOOD',
        onTimeRate: 94.5,
        avgDelay: 1.8,
        totalShipments: 125000,
        topHubs: ['MEM', 'IND', 'ORD', 'LAX', 'ATL']
      },
      {
        name: 'EMEA',
        health: 'FAIR',
        onTimeRate: 89.2,
        avgDelay: 3.1,
        totalShipments: 45000,
        topHubs: ['CDG', 'LHR', 'DXB', 'FRA']
      },
      {
        name: 'Asia Pacific (APAC)',
        health: 'EXCELLENT',
        onTimeRate: 96.8,
        avgDelay: 1.2,
        totalShipments: 67000,
        topHubs: ['HKG', 'SIN', 'NRT', 'SYD']
      },
      {
        name: 'Latin America (LAC)',
        health: 'POOR',
        onTimeRate: 82.3,
        avgDelay: 4.5,
        totalShipments: 23000,
        topHubs: ['GRU', 'MEX', 'BOG', 'EZE']
      }
    ]
  };
};

// GET /api/trends/recurring - Get recurring failure analysis
router.get('/recurring', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = generateTrendData(days);

    res.json({
      success: true,
      data: data.recurring
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/trends/regional - Get regional performance trends
router.get('/regional', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const data = generateRegionalData(days);

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
