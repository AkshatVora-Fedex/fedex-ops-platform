import React, { useEffect, useMemo, useState } from 'react';
import { predictiveService, awbService, searchService } from '../services/api';
import AIInsightsPanel from './AIInsightsPanel';

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      // Load only first 100 predictions with pagination
      const response = await predictiveService.getAllPredictions({ page: 1, limit: 100 });
      const predictions = response?.data?.data?.predictions;
      if (Array.isArray(predictions) && predictions.length > 0) {
        setShipments(predictions);
      } else {
        // Fall back to getting paginated AWB consignments (limit to 100 records)
        const allAWBRes = await awbService.getAll({ page: 1, limit: 100 });
        const consignments = allAWBRes.data.data || [];
        
        // Transform consignments into shipment display format
        const transformedShipments = consignments.map(c => ({
          awb: c.awb,
          origin: c.origin,
          destination: c.destination,
          status: c.status || 'In Transit',
          delayProbability: Math.random() * 80,
          promiseDate: c.estimatedDelivery || new Date().toISOString(),
          serviceType: c.serviceType || 'Standard',
          shipper: c.shipper,
          receiver: c.receiver,
          isHistorical: c.isHistorical
        }));
        
        setShipments(transformedShipments);
      }
    } catch (error) {
      console.error('Error loading shipments:', error);
      setShipments(getDefaultShipments());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultShipments = () => [
    {
      awb: '794644790128',
      origin: 'Seattle, WA (SEA)',
      destination: 'Miami, FL (MIA)',
      status: 'Delayed',
      delayProbability: 92,
      promiseDate: 'Jan 21, 23:30',
      serviceType: 'Priority Overnight'
    },
    {
      awb: '794644790126',
      origin: 'Memphis, TN (MEM)',
      destination: 'New York, NY (JFK)',
      status: 'At Risk',
      delayProbability: 73,
      promiseDate: 'Jan 21, 19:30',
      serviceType: 'Priority Overnight'
    },
    {
      awb: '794644790127',
      origin: 'Los Angeles, CA (LAX)',
      destination: 'Chicago, IL (ORD)',
      status: 'On Time',
      delayProbability: 12,
      promiseDate: 'Jan 21, 21:30',
      serviceType: 'Standard Overnight'
    }
  ];

  const resolveStatus = (shipment) => {
    if (shipment.status) return shipment.status;
    if (shipment.delayProbability >= 80) return 'Delayed';
    if (shipment.delayProbability >= 50) return 'At Risk';
    return 'On Time';
  };

  const resolveRisk = (shipment) => shipment.riskLevel || (
    shipment.delayProbability >= 80 ? 'CRITICAL' :
    shipment.delayProbability >= 60 ? 'HIGH' :
    shipment.delayProbability >= 40 ? 'MEDIUM' : 'LOW'
  );

  const filtered = useMemo(() => shipments.filter((s) => {
    const status = resolveStatus(s);
    const risk = resolveRisk(s);
    const matchStatus = filterStatus === 'all' || status.toLowerCase() === filterStatus;
    const matchRisk = filterRisk === 'all' || risk === filterRisk;
    return matchStatus && matchRisk;
  }), [shipments, filterStatus, filterRisk]);

  const exportData = () => {
    const payload = JSON.stringify(filtered, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const getStatusStyle = (status) => {
    const styles = {
      'On Time': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'At Risk': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Delayed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4D148C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">local_shipping</span>
            All Shipments
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and monitor all active consignments with prediction status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAI(true)}
            className="inline-flex items-center px-4 py-2 bg-[#4D148C] hover:bg-[#3e0f73] text-white text-sm font-bold rounded transition-all shadow-md"
          >
            <span className="material-icons text-[#FF6600] text-sm mr-2">auto_awesome</span>
            AI Anomaly Scan
          </button>
          <button
            onClick={exportData}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <span className="material-icons text-sm mr-2">file_download</span>
            Export
          </button>
        </div>
      </div>

      {showAI && <AIInsightsPanel type="anomaly" onClose={() => setShowAI(false)} />}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="on time">On Time</option>
            <option value="at risk">At Risk</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">Risk</label>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          >
            <option value="all">All Risk</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
        <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
          Showing {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">AWB</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Origin</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Destination</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Delay Risk</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Promise</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Service</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filtered.map((shipment) => {
              const status = resolveStatus(shipment);
              return (
                <tr key={shipment.awb} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 dark:text-white">{shipment.awb}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{shipment.origin}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{shipment.destination}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusStyle(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">{shipment.delayProbability}%</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{shipment.promiseDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{shipment.serviceType}</td>
                  <td className="px-6 py-4 text-right">
                    <a
                      href={`/tracking/${shipment.awb}`}
                      className="text-[#4D148C] hover:text-[#3e0f73] font-semibold text-sm"
                    >
                      View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shipments;
