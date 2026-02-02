import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScanCodeReference = () => {
  const [activeTab, setActiveTab] = useState('types');
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [criticalCodes, setCriticalCodes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScanCodeData();
  }, []);

  const loadScanCodeData = async () => {
    try {
      setLoading(true);
      const [typesRes, categoriesRes, criticalRes] = await Promise.all([
        axios.get('/api/scan-codes/types'),
        axios.get('/api/scan-codes/categories'),
        axios.get('/api/scan-codes/critical')
      ]);

      setTypes(typesRes.data.data);
      setCategories(categoriesRes.data.data);
      setCriticalCodes(criticalRes.data.data);
    } catch (error) {
      console.error('Error loading scan codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = async (category) => {
    setSelectedCategory(category);
    try {
      const res = await axios.get(`/api/scan-codes/category/${category}`);
      setCategoryDetails(res.data.data);
    } catch (error) {
      console.error('Error loading category details:', error);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="material-icons mr-2 text-[#FF6600]">library_books</span>
            Scan Code Reference
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Complete FedEx operational scan codes database
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'types'
                ? 'text-[#4D148C] border-b-2 border-[#4D148C] bg-gray-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-icons align-middle mr-2">category</span>
            Scan Types ({types.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'categories'
                ? 'text-[#4D148C] border-b-2 border-[#4D148C] bg-gray-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-icons align-middle mr-2">folder</span>
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('critical')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
              activeTab === 'critical'
                ? 'text-[#4D148C] border-b-2 border-[#4D148C] bg-gray-50 dark:bg-gray-700'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            <span className="material-icons align-middle mr-2">warning</span>
            Critical Codes ({criticalCodes.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Scan Types Tab */}
          {activeTab === 'types' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                All FedEx operational scan code types
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {types.map((type) => (
                  <div
                    key={type}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#4D148C] hover:shadow-md transition-all cursor-pointer bg-gray-50 dark:bg-gray-700"
                  >
                    <p className="font-bold text-lg text-[#4D148C]">{type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Click to view details
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan codes organized by category
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleSelectCategory(category)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedCategory === category
                        ? 'border-[#4D148C] bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-[#4D148C]'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{category}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {categoryDetails.length > 0 && selectedCategory === category
                        ? `${categoryDetails.length} codes`
                        : 'View codes'}
                    </p>
                  </button>
                ))}
              </div>

              {selectedCategory && categoryDetails.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {selectedCategory} Codes
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {categoryDetails.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-[#4D148C]">
                              {code.type}-{code.subcode}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {code.description}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${getSeverityColor(code.severity)}`}>
                            {code.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Critical Codes Tab */}
          {activeTab === 'critical' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                High and critical severity scan codes that require immediate attention
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {criticalCodes.map((code, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      code.severity === 'critical'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {code.type}-{code.subcode}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {code.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Category: {code.category}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold whitespace-nowrap ml-4 ${
                        code.severity === 'critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-orange-600 text-white'
                      }`}>
                        {code.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference Card */}
      <div className="bg-gradient-to-r from-[#4D148C] to-[#3e0f73] shadow rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <span className="material-icons mr-2">info</span>
          Quick Reference Guide
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold">PUX</p>
            <p className="text-gray-200 text-xs mt-1">Pickup Exception</p>
          </div>
          <div>
            <p className="font-semibold">STAT</p>
            <p className="text-gray-200 text-xs mt-1">Status Update</p>
          </div>
          <div>
            <p className="font-semibold">DEX</p>
            <p className="text-gray-200 text-xs mt-1">Delivery Exception</p>
          </div>
          <div>
            <p className="font-semibold">RTO</p>
            <p className="text-gray-200 text-xs mt-1">Return to Origin</p>
          </div>
          <div>
            <p className="font-semibold">CONS</p>
            <p className="text-gray-200 text-xs mt-1">Consolidation</p>
          </div>
          <div>
            <p className="font-semibold">DDEX</p>
            <p className="text-gray-200 text-xs mt-1">Domestic Exception</p>
          </div>
          <div>
            <p className="font-semibold">HEX</p>
            <p className="text-gray-200 text-xs mt-1">Hub Exception</p>
          </div>
          <div>
            <p className="font-semibold">SEP</p>
            <p className="text-gray-200 text-xs mt-1">Special Exception</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanCodeReference;
