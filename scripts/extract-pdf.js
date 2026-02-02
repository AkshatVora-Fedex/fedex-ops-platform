const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const base = path.join(__dirname, '..', 'Operational Scan Codes');
const outFile = path.join(base, '_extracted_scan_rules.txt');

const pdfFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile()) {
      if (entry.name.toLowerCase().endsWith('.pdf')) {
        pdfFiles.push(full);
      }
    }
  }
}
walk(base);

(async () => {
  const out = [];
  out.push(`Total PDFs: ${pdfFiles.length}`);
  for (const file of pdfFiles) {
    try {
      const data = await pdf(fs.readFileSync(file));
      out.push('\n=== FILE: ' + path.relative(base, file) + ' ===');
      out.push(data.text.trim());
    } catch (err) {
      out.push('\n=== FILE: ' + path.relative(base, file) + ' ===');
      out.push('ERROR: ' + err.message);
    }
  }
  fs.writeFileSync(outFile, out.join('\n'), 'utf8');
  console.log('Wrote:', outFile);
})();
