import React, { useState, useEffect } from 'react';
import { predictiveService, awbService } from '../services/api';

const PredictiveRiskAnalytics = () => {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [filterTerritory, setFilterTerritory] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Territory and region mappings - updated from IN SPAC NSL data
  const territories = {
    'all': { name: 'All Territories', regions: [] },
    'MEISA': { name: 'MEISA (Middle East & South Asia)', regions: ['BOMCL', 'AMDVG', 'GUXAT', 'RAJAD', 'MAAA', 'DAEA', 'DELCP', 'BOMTP', 'GUXKO', 'AMDBH', 'BLRPE', 'BLRKR', 'MAAPE'] },
    'APAC': { name: 'Asia Pacific', regions: ['SGNA', 'JKTA', 'DADA', 'BDQA', 'BKKA', 'BAOA', 'CGKA', 'HLPA', 'SUBA', 'KWBA', 'QHIA', 'TDXA', 'CUJA', 'DPSA', 'PAGA', 'KDTA'] }
  };

  const serviceTypes = {
    'all': 'All Service Types',
    'Priority': 'Priority',
    'Deferred': 'Deferred'
  };

  useEffect(() => {
    loadPredictions();
    const interval = setInterval(loadPredictions, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadPredictions = async () => {
    try {
      const response = await predictiveService.getAllPredictions();
      const payload = response.data.data || {};
      const predictions = (payload.predictions || payload || []).map((pred) => {
        const delayProbability = Number(pred.delayProbability ?? pred.prediction?.delayProbability ?? 0);
        const riskLevel = pred.riskLevel || pred.prediction?.riskLevel || 'LOW';
        return {
          ...pred,
          id: pred.awb,
          delayProbability,
          riskLevel,
          estimatedDelay: pred.deliveryEstimate?.estimatedDelay ?? pred.estimatedDelay ?? 0,
          factors: pred.prediction?.reasons || pred.factors || [],
          recommendations: pred.recommendations || [],
          promiseDate: pred.promiseDate || pred.deliveryEstimate?.revisedEstimate || pred.deliveryEstimate?.originalEstimate
        };
      });
      setShipments(predictions);
    } catch (error) {
      console.error('Error loading predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectShipment = async (shipment) => {
    setSelectedShipment(shipment);
    if (!shipment?.awb) return;
    try {
      setDetailsLoading(true);
      const response = await awbService.getByAWB(shipment.awb);
      const details = response.data.data;
      if (!details) return;
      setSelectedShipment((prev) => ({
        ...prev,
        weight: details.weight,
        shipper: details.shipper,
        receiver: details.receiver,
        serviceType: details.serviceType || prev?.serviceType,
        origin: details.origin || prev?.origin,
        destination: details.destination || prev?.destination,
        promiseDate: details.estimatedDelivery || prev?.promiseDate,
      }));
    } catch (error) {
      console.error('Error loading shipment details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Unknown';
    if (typeof location === 'string') return location;
    if (typeof location === 'object') {
      const parts = [];
      if (location.locationCode) parts.push(location.locationCode);
      if (location.postalCode) parts.push(location.postalCode);
      if (location.megaRegion) parts.push(location.megaRegion);
      return parts.length > 0 ? parts.join(', ') : 'Unknown';
    }
    return 'Unknown';
  };

  const getLocationText = (value) => {
    const formatted = formatLocation(value);
    return formatted.toUpperCase();
  };

  const formatProbability = (value) => {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  };

  const normalizeServiceType = (value) => {
    if (!value) return null;
    const text = value.toString().toUpperCase();
    if (text.includes('PRIORITY')) return 'INTERNATIONAL_PRIORITY';
    if (text.includes('STANDARD')) return 'STANDARD_OVERNIGHT';
    if (text.includes('2DAY')) return 'FEDEX_2DAY';
    if (text.includes('GROUND')) return 'FEDEX_GROUND';
    if (text.includes('SAVER')) return 'EXPRESS_SAVER';
    if (text.includes('INTERNATIONAL FIRST')) return 'INTERNATIONAL_FIRST';
    if (text.includes('INTERNATIONAL ECONOMY')) return 'INTERNATIONAL_ECONOMY';
    return value;
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      CRITICAL: 'bg-red-600',
      HIGH: 'bg-orange-600',
      MEDIUM: 'bg-yellow-600',
      LOW: 'bg-green-600',
    };
    return colors[riskLevel] || 'bg-gray-600';
  };

  const getRiskBg = (riskLevel) => {
    const colors = {
      CRITICAL: 'bg-red-50 dark:bg-red-900/20 border-l-red-600',
      HIGH: 'bg-orange-50 dark:bg-orange-900/20 border-l-orange-600',
      MEDIUM: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-600',
      LOW: 'bg-green-50 dark:bg-green-900/20 border-l-green-600',
    };
    return colors[riskLevel] || 'bg-gray-50 dark:bg-gray-900/20 border-l-gray-600';
  };

  const filteredShipments = shipments.filter((shipment) => {
    // Territory filter
    const originText = getLocationText(shipment.origin);
    const matchTerritory = filterTerritory === 'all' ||
      (territories[filterTerritory] && territories[filterTerritory].regions.some(region =>
        originText.includes(region)
      ));
    
    // Region filter (cascades from territory)
    const matchRegion = filterRegion === 'all' || originText.includes(filterRegion);
    
    // Service type filter
    const normalizedService = normalizeServiceType(shipment.serviceType);
    const matchService = filterService === 'all' || normalizedService === filterService || shipment.serviceType === filterService;
    
    // Risk level filter
    const matchRisk = filterRisk === 'all' || shipment.riskLevel === filterRisk;
    
    return matchTerritory && matchRegion && matchService && matchRisk;
  });

  const getRiskStats = () => {
    return {
      critical: shipments.filter(s => s.riskLevel === 'CRITICAL').length,
      high: shipments.filter(s => s.riskLevel === 'HIGH').length,
      medium: shipments.filter(s => s.riskLevel === 'MEDIUM').length,
      low: shipments.filter(s => s.riskLevel === 'LOW').length,
    };
  };

  const riskStats = getRiskStats();
  const totalAtRisk = riskStats.critical + riskStats.high + riskStats.medium;
  const totalShipments = shipments.length;
  const percentOfTotal = (value) => (totalShipments ? ((value / totalShipments) * 100).toFixed(1) : '0.0');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D148C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">trending_up</span>
            Predictive Risk Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            AI-powered delay forecasting for {shipments.length} monitored shipments
          </p>
        </div>
        <button
          onClick={loadPredictions}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4D148C] hover:bg-[#3e0f73] transition-all"
        >
          <span className="material-icons text-sm mr-2">refresh</span>
          Refresh
        </button>
      </div>

      {/* Risk Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">CRITICAL RISK</p>
          <p className="text-3xl font-bold mt-2">{riskStats.critical}</p>
          <p className="text-xs opacity-75 mt-1">
            {percentOfTotal(riskStats.critical)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">HIGH RISK</p>
          <p className="text-3xl font-bold mt-2">{riskStats.high}</p>
          <p className="text-xs opacity-75 mt-1">
            {percentOfTotal(riskStats.high)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">MEDIUM RISK</p>
          <p className="text-3xl font-bold mt-2">{riskStats.medium}</p>
          <p className="text-xs opacity-75 mt-1">
            {percentOfTotal(riskStats.medium)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">LOW RISK</p>
          <p className="text-3xl font-bold mt-2">{riskStats.low}</p>
          <p className="text-xs opacity-75 mt-1">
            {percentOfTotal(riskStats.low)}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-lg">
          <p className="text-sm opacity-90 font-semibold">AT RISK</p>
          <p className="text-3xl font-bold mt-2">{totalAtRisk}</p>
          <p className="text-xs opacity-75 mt-1">
            {percentOfTotal(totalAtRisk)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Filter Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="material-icons mr-2">tune</span>
              Filters
            </h3>

            <div className="space-y-4">
              {/* Territory Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Territory
                </label>
                <select
                  value={filterTerritory}
                  onChange={(e) => {
                    setFilterTerritory(e.target.value);
                    setFilterRegion('all'); // Reset region when territory changes
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                >
                  {Object.entries(territories).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                  ))}
                </select>
              </div>

              {/* Region Filter (cascades from territory) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Region/Hub
                </label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                  disabled={filterTerritory === 'all'}
                >
                  <option value="all">All Hubs</option>
                  {filterTerritory === 'MEISA' && (
                    <optgroup label="MEISA Hubs">
                      <option value="BOMCL">Mumbai (BOMCL)</option>
                      <option value="AMDVG">Ahmedabad (AMDVG)</option>
                      <option value="GUXAT">Guwahati (GUXAT)</option>
                      <option value="RAJAD">Jaipur (RAJAD)</option>
                      <option value="MAAA">Chennai (MAAA)</option>
                      <option value="DAEA">Delhi (DAEA)</option>
                      <option value="DELCP">Delhi (DELCP)</option>
                      <option value="BOMTP">Thane (BOMTP)</option>
                      <option value="GUXKO">Kolkata (GUXKO)</option>
                      <option value="AMDBH">Bengaluru (AMDBH)</option>
                      <option value="BLRPE">Bengaluru (BLRPE)</option>
                      <option value="BLRKR">Bengaluru (BLRKR)</option>
                      <option value="MAAPE">Pune (MAAPE)</option>
                    </optgroup>
                  )}
                  {filterTerritory === 'APAC' && (
                    <optgroup label="APAC Hubs">
                      <option value="SGNA">Singapore (SGNA)</option>
                      <option value="JKTA">Jakarta (JKTA)</option>
                      <option value="DADA">Danang (DADA)</option>
                      <option value="BDQA">Bandung (BDQA)</option>
                      <option value="BKKA">Bangkok (BKKA)</option>
                      <option value="BAOA">Bangkok (BAOA)</option>
                      <option value="CGKA">Chiang Mai (CGKA)</option>
                      <option value="HLPA">Hanoi (HLPA)</option>
                      <option value="SUBA">Surabaya (SUBA)</option>
                      <option value="KWBA">Kuala Lumpur (KWBA)</option>
                      <option value="QHIA">Ho Chi Minh (QHIA)</option>
                      <option value="TDXA">Bangkok (TDXA)</option>
                      <option value="CUJA">Cebu (CUJA)</option>
                      <option value="DPSA">Denpasar (DPSA)</option>
                      <option value="PAGA">Manila (PAGA)</option>
                      <option value="KDTA">Khon Kaen (KDTA)</option>
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Service Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Service Type
                </label>
                <select
                  value={filterService}
                  onChange={(e) => setFilterService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                >
                  {Object.entries(serviceTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Risk Level
                </label>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4D148C]"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Quick Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Monitored:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{shipments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">At-Risk:</span>
                    <span className="font-bold text-red-600">{totalAtRisk}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Delay Prob:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {shipments.length > 0
                        ? (
                          shipments.reduce((sum, s) => sum + (s.delayProbability || 0), 0) /
                          shipments.length
                        ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Heatmap & List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                <span className="material-icons mr-2">heatmap</span>
                At-Risk Shipments ({filteredShipments.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <button
                    key={shipment.id}
                    onClick={() => handleSelectShipment(shipment)}
                    className={`w-full text-left p-4 border-l-4 transition-all hover:bg-gray-50 dark:hover:bg-gray-700 ${getRiskBg(
                      shipment.riskLevel
                    )} ${selectedShipment?.id === shipment.id ? 'ring-2 ring-[#4D148C]' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {shipment.awb}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {formatLocation(shipment.origin)} → {formatLocation(shipment.destination)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getRiskColor(
                          shipment.riskLevel
                        )}`}>
                          {shipment.delayProbability}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {shipment.serviceType}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Delay Est: {shipment.estimatedDelay || 0}h
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <span className="material-icons text-4xl mx-auto mb-2">check_circle</span>
                  <p>No at-risk shipments in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Shipment Details */}
      {selectedShipment && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedShipment.awb}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatLocation(selectedShipment.origin)} → {formatLocation(selectedShipment.destination)}
              </p>
              {detailsLoading && (
                <p className="text-xs text-gray-400 mt-2">Loading shipment details...</p>
              )}
            </div>
            <button
              onClick={() => setSelectedShipment(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Risk Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Risk Assessment
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Risk Level</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold text-white ${getRiskColor(
                    selectedShipment.riskLevel
                  )}`}>
                    {selectedShipment.riskLevel}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Delay Probability</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedShipment.delayProbability}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Estimated Delay</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {selectedShipment.estimatedDelay || 0} hours
                  </p>
                </div>
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Service Details
              </p>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Service Type</p>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {selectedShipment.serviceType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Weight</p>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {selectedShipment.weight || 'N/A'} lbs
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Promise Date</p>
                  <p className="text-gray-900 dark:text-white font-semibold mt-1">
                    {new Date(selectedShipment.promiseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Contributing Factors
              </p>
              <div className="space-y-2 text-sm">
                {selectedShipment.factors && selectedShipment.factors.length > 0 ? (
                  selectedShipment.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="material-icons text-xs text-red-600 mt-1">
                        error_outline
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{factor}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No identified risk factors</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center">
              <span className="material-icons text-sm mr-2">lightbulb</span>
              Recommended Actions
            </p>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              {selectedShipment.recommendations && selectedShipment.recommendations.length > 0 ? (
                selectedShipment.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li>Monitor closely for any changes in tracking status</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveRiskAnalytics;
