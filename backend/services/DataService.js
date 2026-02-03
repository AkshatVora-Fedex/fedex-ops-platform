const fs = require('fs');
const path = require('path');

/**
 * Direct historical data search
 * Bypasses models and provides direct access to AWB records
 */

const historicalDataPath = path.join(__dirname, '../../backend/data/awb-historical.json');

let cachedData = null;
let cachedMtimeMs = null;

async function getHistoricalData() {
  try {
    if (fs.existsSync(historicalDataPath)) {
      const stats = fs.statSync(historicalDataPath);
      if (cachedData && cachedMtimeMs === stats.mtimeMs) {
        return cachedData;
      }
    }
  } catch (error) {
    console.error('Error checking data file status:', error.message);
  }

  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(historicalDataPath)) {
        console.log('Historical data not found at:', historicalDataPath);
        resolve([]);
        return;
      }

      const stats = fs.statSync(historicalDataPath);
      const data = fs.readFileSync(historicalDataPath, 'utf8');
      const parsedData = JSON.parse(data);
      
      // Handle both direct array and wrapped object with records property
      cachedData = Array.isArray(parsedData) ? parsedData : (parsedData.records || []);
      cachedMtimeMs = stats.mtimeMs;
      
      console.log(`Loaded ${cachedData.length} AWB records`);
      resolve(cachedData);
    } catch (error) {
      console.error('Error loading data:', error.message);
      resolve([]);
    }
  });
}

async function searchAWB(awb) {
  const data = await getHistoricalData();
  return data.find(record => record.awb === awb);
}

module.exports = {
  getHistoricalData,
  searchAWB
};
