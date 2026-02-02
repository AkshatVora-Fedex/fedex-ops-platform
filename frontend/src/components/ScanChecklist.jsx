import React, { useState, useEffect } from 'react';

const ScanChecklist = ({ awb, serviceType = 'INTERNATIONAL_PRIORITY' }) => {
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expected scan progression based on service type
  const getScanProgression = (service) => {
    const progressions = {
      INTERNATIONAL_PRIORITY: [
        { code: 'PU', name: 'Pickup', location: 'Origin', status: 'completed', time: '08:30' },
        { code: 'OC', name: 'Origin Scan', location: 'Origin Hub', status: 'completed', time: '10:15' },
        { code: 'DP', name: 'Departed', location: 'Origin Hub', status: 'completed', time: '12:00' },
        { code: 'AR', name: 'Arrived', location: 'Gateway Hub', status: 'completed', time: '18:45' },
        { code: 'IT', name: 'In Transit', location: 'Gateway Hub', status: 'current', time: '20:30' },
        { code: 'AR', name: 'Arrived', location: 'Destination Hub', status: 'pending', time: 'Est. 04:00' },
        { code: 'OFD', name: 'Out for Delivery', location: 'Destination', status: 'pending', time: 'Est. 08:00' },
        { code: 'DL', name: 'Delivered', location: 'Destination', status: 'pending', time: 'Est. 10:30' },
      ],
      FEDEX_GROUND: [
        { code: 'PU', name: 'Pickup', location: 'Origin', status: 'completed', time: '14:00' },
        { code: 'OC', name: 'Origin Scan', location: 'Origin Terminal', status: 'completed', time: '16:30' },
        { code: 'IT', name: 'In Transit', location: 'Regional Hub', status: 'current', time: '22:00' },
        { code: 'AR', name: 'Arrived', location: 'Destination Terminal', status: 'pending', time: 'Est. 06:00' },
        { code: 'OFD', name: 'Out for Delivery', location: 'Destination', status: 'pending', time: 'Est. 08:00' },
        { code: 'DL', name: 'Delivered', location: 'Destination', status: 'pending', time: 'Est. 17:00' },
      ],
      PRIORITY_OVERNIGHT: [
        { code: 'PU', name: 'Pickup', location: 'Origin', status: 'completed', time: '17:30' },
        { code: 'OC', name: 'Origin Scan', location: 'Origin Hub', status: 'completed', time: '19:00' },
        { code: 'DP', name: 'Departed', location: 'Origin Hub', status: 'completed', time: '21:00' },
        { code: 'AR', name: 'Arrived', location: 'Sort Facility', status: 'current', time: '02:15' },
        { code: 'OFD', name: 'Out for Delivery', location: 'Destination', status: 'pending', time: 'Est. 08:00' },
        { code: 'DL', name: 'Delivered', location: 'Destination', status: 'pending', time: 'Est. 10:30' },
      ],
    };

    return progressions[service] || progressions.INTERNATIONAL_PRIORITY;
  };

  useEffect(() => {
    // In production, fetch from API: /api/scan-codes/checklist/:awb
    setTimeout(() => {
      setChecklist(getScanProgression(serviceType));
      setLoading(false);
    }, 500);
  }, [awb, serviceType]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return { icon: 'check_circle', color: 'text-green-600' };
      case 'current':
        return { icon: 'pending', color: 'text-blue-600' };
      case 'pending':
        return { icon: 'radio_button_unchecked', color: 'text-gray-400' };
      case 'delayed':
        return { icon: 'warning', color: 'text-red-600' };
      default:
        return { icon: 'help', color: 'text-gray-400' };
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-50 text-green-700 border-green-200',
      current: 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-gray-50 text-gray-500 border-gray-200',
      delayed: 'bg-red-50 text-red-700 border-red-200',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Expected Scan Progression</h3>
          <p className="text-sm text-gray-500 mt-1">
            Service: <span className="font-semibold text-gray-700">{serviceType.replace(/_/g, ' ')}</span>
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-600 mr-1"></span>
            Completed
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-600 mr-1"></span>
            Current
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
            Pending
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200"></div>

        {/* Scan Items */}
        <div className="space-y-6">
          {checklist.map((scan, index) => {
            const statusInfo = getStatusIcon(scan.status);
            return (
              <div key={index} className="relative flex items-start">
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0">
                  <span className={`material-icons ${statusInfo.color} text-2xl`}>
                    {statusInfo.icon}
                  </span>
                </div>

                {/* Content */}
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{scan.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="material-icons text-xs align-middle mr-1">place</span>
                        {scan.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(scan.status)}`}>
                        {scan.code}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{scan.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <div className="flex items-start">
          <span className="material-icons text-blue-600 text-lg mr-2">info</span>
          <div className="text-xs text-blue-700">
            <p className="font-semibold mb-1">Scan Code Information</p>
            <p>
              This checklist shows the expected scan progression for {serviceType.replace(/_/g, ' ')} service.
              Actual scans may vary based on route optimization and operational conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanChecklist;
