const fs = require('fs');

let data = JSON.parse(fs.readFileSync('./data/awb-historical.json', 'utf8'));

// Handle both array and object with records property
if (!Array.isArray(data)) {
  data = data.records || [];
}

const buckets = {};
data.forEach(record => {
  const bucket = record.performance?.bucket || 'Unknown';
  buckets[bucket] = (buckets[bucket] || 0) + 1;
});

console.log('Bucket Distribution:');
Object.entries(buckets)
  .sort((a, b) => b[1] - a[1])
  .forEach(([bucket, count]) => {
    const percent = ((count / data.length) * 100).toFixed(2);
    console.log(`  ${bucket.padEnd(15)}: ${count.toString().padStart(6)} (${percent}%)`);
  });

console.log(`\nTotal Records: ${data.length}`);
