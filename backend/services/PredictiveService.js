const moment = require('moment');

class PredictiveService {
  /**
   * Predict if a consignment will be delayed
   * @param {Object} consignment - Consignment data
   * @returns {Object} Prediction result with probability and reasons
   */
  static predictDelay(consignment) {
    let delayProbability = 0;
    const reasons = [];

    // Factor 1: Check elapsed time vs expected time
    const createdAt = moment(consignment.createdAt);
    const estimatedDelivery = moment(consignment.estimatedDelivery);
    const currentTime = moment();
    const elapsedHours = currentTime.diff(createdAt, 'hours', true);
    const expectedHours = estimatedDelivery.diff(createdAt, 'hours', true);
    const remainingHours = estimatedDelivery.diff(currentTime, 'hours', true);

    if (remainingHours < 0) {
      delayProbability += 50;
      reasons.push('Package is already past estimated delivery time');
    } else if (remainingHours < 2) {
      delayProbability += 30;
      reasons.push(`Only ${remainingHours.toFixed(1)} hours remaining for delivery`);
    }

    // Factor 2: Check scan frequency
    const scans = consignment.scans || [];
    const hoursSinceLastScan = currentTime.diff(moment(consignment.lastScan?.timestamp), 'hours', true);
    
    if (scans.length === 0) {
      delayProbability += 25;
      reasons.push('No scans recorded yet');
    } else if (hoursSinceLastScan > 4) {
      delayProbability += 20;
      reasons.push(`No scan recorded in last ${hoursSinceLastScan.toFixed(1)} hours`);
    }

    // Factor 3: Check for delivery exceptions
    const hasException = scans.some(s => s.type === 'DEX' || s.type === 'RTO');
    if (hasException) {
      delayProbability += 40;
      reasons.push('Delivery exception or return initiated');
    }

    // Factor 4: Check scan progression
    const expectedScans = this.getExpectedScansAtTime(consignment.serviceType, elapsedHours);
    const actualScans = scans.length;
    if (actualScans < expectedScans - 1) {
      const missedScans = expectedScans - actualScans;
      delayProbability += missedScans * 10;
      reasons.push(`Behind expected scan progression by ${missedScans} scan(s)`);
    }

    // Factor 5: Check time buffer
    const progressPercentage = (elapsedHours / expectedHours) * 100;
    if (progressPercentage > 85 && actualScans < expectedScans) {
      delayProbability += 25;
      reasons.push('High time consumption with incomplete scan progression');
    }

    // Cap probability at 100
    delayProbability = Math.min(delayProbability, 100);

    return {
      willBeDelayed: delayProbability > 50,
      delayProbability: Math.round(delayProbability),
      riskLevel: delayProbability > 70 ? 'CRITICAL' : delayProbability > 50 ? 'HIGH' : delayProbability > 30 ? 'MEDIUM' : 'LOW',
      reasons,
      metrics: {
        elapsedHours: elapsedHours.toFixed(2),
        expectedHours: expectedHours.toFixed(2),
        remainingHours: Math.max(0, remainingHours.toFixed(2)),
        scansRecorded: actualScans,
        expectedScans,
        progressPercentage: progressPercentage.toFixed(1)
      }
    };
  }

  /**
   * Calculate expected number of scans based on elapsed time and service type
   */
  static getExpectedScansAtTime(serviceType, elapsedHours) {
    const scanIntervals = {
      'FedEx Express': { initial: 1, interval: 4 },
      'FedEx Ground': { initial: 1, interval: 6 },
      'FedEx Overnight': { initial: 1, interval: 3 },
      'FedEx Home Delivery': { initial: 1, interval: 6 }
    };

    const config = scanIntervals[serviceType] || { initial: 1, interval: 4 };
    return config.initial + Math.floor(elapsedHours / config.interval);
  }

  /**
   * Estimate delivery time based on current progress
   */
  static estimateDeliveryTime(consignment) {
    const createdAt = moment(consignment.createdAt);
    const estimatedDelivery = moment(consignment.estimatedDelivery);
    const expectedHours = estimatedDelivery.diff(createdAt, 'hours', true);

    const scans = consignment.scans || [];
    const prediction = this.predictDelay(consignment);

    let estimatedTime = estimatedDelivery;
    if (prediction.willBeDelayed) {
      const delayHours = Math.ceil(prediction.delayProbability / 10); // 1 hour per 10% probability
      estimatedTime = estimatedDelivery.add(delayHours, 'hours');
    }

    return {
      originalEstimate: estimatedDelivery.format('YYYY-MM-DD HH:mm:ss'),
      revisedEstimate: estimatedTime.format('YYYY-MM-DD HH:mm:ss'),
      estimatedDelay: estimatedTime.diff(estimatedDelivery, 'hours'),
      confidence: 100 - prediction.delayProbability
    };
  }

  /**
   * Analyze historical patterns (for future ML integration)
   */
  static getHistoricalMetrics(consignments = []) {
    if (consignments.length === 0) return {};

    const delivered = consignments.filter(c => c.status === 'DELIVERED' || c.status === 'DX');
    const delayed = delivered.filter(c => {
      const estimated = moment(c.estimatedDelivery);
      const lastScan = moment(c.lastScan?.timestamp);
      return lastScan.isAfter(estimated);
    });

    return {
      totalConsignments: consignments.length,
      deliveredCount: delivered.length,
      delayedCount: delayed.length,
      delayPercentage: delivered.length > 0 ? ((delayed.length / delivered.length) * 100).toFixed(1) : 0
    };
  }
}

module.exports = PredictiveService;
