const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

/**
 * AWB Historical Data Import Script
 * Parses IN SPAC NSL.txt CSV file and imports into MongoDB
 */

const CSV_FILE = path.join(__dirname, '..', 'IN SPAC NSL.txt');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'awb-historical.json');

async function importAWBData() {
  console.log('🚀 Starting AWB Historical Data Import...\n');
  console.log(`📁 Reading from: ${CSV_FILE}`);

  const awbRecords = [];
  const stats = {
    total: 0,
    byService: {},
    byRegion: {},
    byStatus: {},
  };

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ Error: File not found - ${CSV_FILE}`);
      console.error('   Please ensure IN SPAC NSL.txt exists in the project root.');
      reject(new Error('CSV file not found'));
      return;
    }

    fs.createReadStream(CSV_FILE)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse and transform row
          const record = {
            awb: row.shp_trk_nbr,
            masterAWB: row.mstr_ab_trk_nbr || null,
            shipDate: row.shp_dt || null,
            pickupScanDate: row.pckup_scan_dt || null,
            podScanDate: row.pod_scan_dt || null,
            serviceCommitDate: row.svc_commit_dt || null,
            
            shipper: {
              customerNumber: row.shpr_cust_nbr || null,
              companyName: row.shpr_co_nm || null,
              postalCode: row.shpr_pstl_cd || null,
            },
            
            recipient: {
              companyName: row.recp_co_nm || null,
              postalCode: row.recp_pstl_cd || null,
            },
            
            origin: {
              locationCode: row.orig_loc_cd || null,
              postalCode: row.orig_pstl_cd || null,
              megaRegion: row.orig_mega_region || null,
              region: row.orig_region || null,
              subregion: row.orig_subregion || null,
              market: row.orig_market_cd || null,
              mdName: row.orig_MD_name || null,
            },
            
            destination: {
              locationCode: row.dest_loc_cd || null,
              postalCode: row.dest_pstl_cd || null,
              megaRegion: row.dest_mega_region || null,
              region: row.dest_region || null,
              subregion: row.dest_subregion || null,
              market: row.dest_market_cd || null,
              mdName: row.dest_MD_name || null,
            },
            
            service: {
              type: row.Service || null,
              detail: row.Service_Detail || null,
              product: row.Product || null,
              baseCode: row.svc_bas_cd || null,
            },
            
            performance: {
              pofCause: row.pof_cause || null,
              catCauseCode: row.cat_cause_cd || null,
              pofCatCode: row.pof_cat_cd || null,
              bucket: row.Bucket || null,
              mbgClass: row.MBG_Class || null,
              nslOtVol: parseInt(row.NSL_OT_VOL) || 0,
              mbgOtVol: parseInt(row.MBG_OT_VOL) || 0,
              nslFVol: parseInt(row.NSL_F_VOL) || 0,
              totVol: parseInt(row.TOT_VOL) || 0,
            },
            
            scanInfo: {
              pickupLocation: row.pckup_scan_loc_cd || null,
              pickupScanType: row.pkg_pckup_scan_typ_cd || null,
              pickupExceptionType: row.pkg_pckup_excp_typ_cd || null,
              pickupStopType: row.pckup_stop_typ_cd || null,
              podLocation: row.pod_scan_loc_cd || null,
            },
          };

          awbRecords.push(record);
          stats.total++;

          // Update statistics
          const service = record.service.type || 'Unknown';
          const region = record.origin.megaRegion || 'Unknown';
          const status = record.performance.mbgClass || 'Unknown';

          stats.byService[service] = (stats.byService[service] || 0) + 1;
          stats.byRegion[region] = (stats.byRegion[region] || 0) + 1;
          stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        } catch (error) {
          console.error(`⚠️  Error parsing row: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log('\n✅ CSV Processing Complete\n');
        console.log('📊 Import Statistics:');
        console.log(`   Total Records: ${stats.total}`);
        console.log('\n   By Service:');
        Object.entries(stats.byService)
          .sort((a, b) => b[1] - a[1])
          .forEach(([service, count]) => {
            console.log(`     ${service}: ${count}`);
          });
        
        console.log('\n   By Region:');
        Object.entries(stats.byRegion)
          .sort((a, b) => b[1] - a[1])
          .forEach(([region, count]) => {
            console.log(`     ${region}: ${count}`);
          });
        
        console.log('\n   By Status:');
        Object.entries(stats.byStatus)
          .sort((a, b) => b[1] - a[1])
          .forEach(([status, count]) => {
            console.log(`     ${status}: ${count}`);
          });

        // Save to JSON file
        const dataDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        const output = {
          importDate: new Date().toISOString(),
          sourceFile: path.basename(CSV_FILE),
          recordCount: stats.total,
          statistics: stats,
          records: awbRecords,
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`\n💾 Saved to: ${OUTPUT_FILE}`);
        console.log('\n🎉 Import Complete!');
        
        resolve(output);
      })
      .on('error', (error) => {
        console.error(`\n❌ Error reading CSV: ${error.message}`);
        reject(error);
      });
  });
}

// Run if executed directly
if (require.main === module) {
  importAWBData()
    .then(() => {
      console.log('\n✨ You can now use this data in your application');
      console.log('   Load it in your backend with: require("./data/awb-historical.json")');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Import failed:', error.message);
      process.exit(1);
    });
}

module.exports = { importAWBData };
