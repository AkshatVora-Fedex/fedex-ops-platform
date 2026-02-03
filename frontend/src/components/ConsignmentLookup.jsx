import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { searchService, awbService } from '../services/api';

const ConsignmentLookup = () => {
  const [awb, setAwb] = useState('');
  const [consignment, setConsignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showSamples, setShowSamples] = useState(false);
  const [samples, setSamples] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!awb.trim()) {
      setError('Please enter an AWB');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use new searchService with fallback to awbService
      try {
        const response = await searchService.searchAWB(awb);
        setConsignment(response.data.data);
      } catch (searchErr) {
        // Try getting from AWB service (which includes historical data)
        try {
          const response = await awbService.getHistoricalByAWB(awb);
          setConsignment(response.data.data);
        } catch (awbErr) {
          throw new Error('Consignment not found');
        }
      }
    } catch (err) {
      setError('Consignment not found. Check the AWB number. You can view sample AWBs by clicking "View Samples" below.');
      setConsignment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSamples = async () => {
    setShowSamples(!showSamples);
    if (!showSamples && (!samples || samples.length === 0)) {
      try {
        // Get historical data grouped by status to show samples
        const response = await awbService.getHistoricalGrouped('status');
        let samplesData = [];
        
        // Try getting first few AWBs from each status group
        if (response.data.data) {
          // For demo, load some real AWBs from historical data
          const allConsignments = await awbService.getAll();
          samplesData = allConsignments.data.data ? allConsignments.data.data.slice(0, 20) : [];
        }
        
        setSamples(samplesData || []);
      } catch (err) {
        console.error('Error loading samples:', err);
        setSamples([]);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsb')) {
      setError('Please upload a TXT, CSV, or XLSB file');
      return;
    }

    setUploadLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/search/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const recordsAdded = data?.recordsAdded || 0;
        const totalRecords = data?.totalRecords || 'unknown';
        setSuccess({
          message: `Successfully uploaded ${recordsAdded} records from ${file.name}`,
          recordsAdded: recordsAdded,
          totalRecords: totalRecords
        });
        setSamples([]); // Reset samples to reload fresh data
        e.target.value = ''; // Reset file input
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        let errorMsg = 'Upload failed';
        try {
          const errorData = await response.json();
          errorMsg = errorData?.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
    } catch (err) {
      setError(`Failed to upload file: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'IN_TRANSIT': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'DELIVERED': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'OUT_FOR_DELIVERY': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'DELAYED': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'EXCEPTION': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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

  const formatParty = (party) => {
    if (!party) return 'Unknown';
    if (typeof party === 'string') return party;
    if (typeof party === 'object') {
      if (party.companyName) return party.companyName;
      return 'Unknown';
    }
    return 'Unknown';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2">search</span>
            Search Consignment by AWB
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter an Air Waybill number to view shipment details
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-icons text-gray-400">local_shipping</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter AWB Number (e.g., 7488947332)"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4D148C] focus:border-[#4D148C] text-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#4D148C] hover:bg-[#3e0f73] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4D148C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-icons animate-spin mr-2">refresh</span>
                    Searching...
                  </>
                ) : (
                  <>
                    <span className="material-icons mr-2">search</span>
                    Search
                  </>
                )}
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleViewSamples}
                className="text-sm text-[#4D148C] hover:text-[#3e0f73] font-medium flex items-center"
              >
                <span className="material-icons text-sm mr-1">preview</span>
                {showSamples ? 'Hide' : 'View'} Sample AWBs
              </button>
              <label className="text-sm text-[#FF6600] hover:text-[#e55a00] font-medium flex items-center cursor-pointer">
                <input
                  type="file"
                  accept=".txt,.csv,.xlsb"
                  onChange={handleFileUpload}
                  disabled={uploadLoading}
                  className="hidden"
                />
                <span className="material-icons text-sm mr-1">upload_file</span>
                {uploadLoading ? 'Uploading...' : 'Upload File'}
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* Sample AWBs Display */}
      {showSamples && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <span className="material-icons mr-2">preview</span>
              Sample AWBs Available for Testing
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Click any AWB below to search for it</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {samples && Array.isArray(samples) && samples.length > 0 ? (
                samples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAwb(sample.awb);
                      setShowSamples(false);
                    }}
                    className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-[#4D148C] hover:text-white dark:hover:bg-[#4D148C] transition-all"
                  >
                    <div className="text-sm font-mono font-bold">{sample.awb}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(sample.status || 'IN_TRANSIT')}`}>
                        {(sample.status || 'IN_TRANSIT').replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {sample.origin || 'Unknown'} → {sample.destination || 'Unknown'}
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Loading sample AWBs...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-green-600">check_circle</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">{success.message}</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Total records in system: {success.totalRecords?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-icons text-red-400">error</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Consignment Details */}
      {consignment && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#4D148C] to-[#3e0f73]">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="material-icons text-white text-3xl mr-3">inventory_2</span>
                <div>
                  <h3 className="text-xl font-bold text-white">Consignment Details</h3>
                  <p className="text-sm text-indigo-200 mt-1">AWB: {consignment?.awb || 'Unknown'}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(consignment?.status || 'IN_TRANSIT')}`}>
                {(consignment?.status || 'IN_TRANSIT').replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Route Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-2">route</span>
                  Route Information
                </h4>
                <dl className="space-y-3">
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Origin:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold flex items-center">
                      <span className="material-icons text-green-600 text-sm mr-1">flight_takeoff</span>
                      {formatLocation(consignment?.origin)}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Destination:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold flex items-center">
                      <span className="material-icons text-red-600 text-sm mr-1">flight_land</span>
                      {formatLocation(consignment?.destination)}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Current Location:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold flex items-center">
                      <span className="material-icons text-blue-600 text-sm mr-1">location_on</span>
                      {consignment?.currentLocation || 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Shipment Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-2">info</span>
                  Shipment Details
                </h4>
                <dl className="space-y-3">
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Service Type:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold">
                      {consignment?.serviceType || 'Unknown'}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Weight:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold">
                      {consignment?.weight || 'Unknown'} lbs
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Est. Delivery:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold flex items-center">
                      <span className="material-icons text-purple-600 text-sm mr-1">schedule</span>
                      {consignment?.estimatedDelivery ? new Date(consignment.estimatedDelivery).toLocaleString() : 'Unknown'}
                    </dd>
                  </div>
                  <div className="flex items-start">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 w-32">Scans Recorded:</dt>
                    <dd className="text-sm text-gray-900 dark:text-white font-semibold">
                      {consignment?.scans?.length || 0} events
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Shipper & Recipient */}
              <div className="space-y-4 md:col-span-2">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center">
                  <span className="material-icons text-sm mr-2">business</span>
                  Party Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipper</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatParty(consignment?.shipper)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Recipient</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatParty(consignment?.recipient)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* View Tracking Button */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                to={`/tracking/${consignment.awb}`}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#FF6600] hover:bg-[#e55a00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF6600] transition-all"
              >
                <span className="material-icons mr-2">timeline</span>
                View Detailed Tracking
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsignmentLookup;
