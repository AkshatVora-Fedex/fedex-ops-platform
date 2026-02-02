const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const baseDir = path.join(__dirname, '..', '..', 'Operational Scan Codes');
const outputPath = path.join(__dirname, '..', 'data', 'scanRules.json');

const pdfFiles = [];
const includeRootPdf = true;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      pdfFiles.push(full);
    }
  }
}

walk(baseDir);

if (!includeRootPdf) {
  const rootPdf = path.join(baseDir, 'Express Scanning Standards.pdf');
  const idx = pdfFiles.indexOf(rootPdf);
  if (idx >= 0) pdfFiles.splice(idx, 1);
}

const extractRoutingRules = (text) => {
  const sections = {};

  const normalize = (value) => value.replace(/\s+/g, ' ').trim();

  const rulePatterns = [
    /Routing\s*Rules?\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /Routing\s*Instructions?\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /When\s*to\s*Use\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /Where\s*to\s*Apply\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /Applicable\s*Location\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /Scan\s*Application\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i,
    /Process\s*Steps?\s*[:\-]?\s*([\s\S]*?)(?:\n\s*\n|$)/i
  ];

  for (const pattern of rulePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = normalize(match[1]);
      if (cleaned.length > 20) {
        sections.routingRules = cleaned;
        break;
      }
    }
  }

  const locationPattern = /(Origin|Pickup|Hub|Sort|Ramp|Customs|Destination|Delivery|Station|Facility|Ramp|Airport)/ig;
  const locations = new Set();
  let locMatch;
  while ((locMatch = locationPattern.exec(text)) !== null) {
    locations.add(locMatch[1]);
  }
  if (locations.size > 0) {
    sections.appliesAt = Array.from(locations).map(l => l.trim()).join(', ');
  }

  return sections;
};

(async () => {
  const rules = {};

  for (const file of pdfFiles) {
    const fileName = path.basename(file);
    const relPath = path.relative(baseDir, file);
    
    let codeMatch = fileName.match(/(PUX|DEX|DDEX|HEX|REX|SEP|STAT|CONS)\s*[-_]?\s*([0-9]{2})/i);
    let code = null;
    if (codeMatch) {
      code = `${codeMatch[1].toUpperCase()}${codeMatch[2]}`;
    } else {
      const fallbackMatch = fileName.match(/(PUX|DEX|DDEX|HEX|REX|SEP|STAT|CONS)/i);
      if (fallbackMatch) {
        code = fallbackMatch[1].toUpperCase();
      }
    }

    try {
      const data = await pdf(fs.readFileSync(file));
      const text = data.text || '';

      const extracted = extractRoutingRules(text);
      rules[code || fileName] = {
        source: relPath,
        title: fileName.replace('.pdf', ''),
        routingRules: extracted.routingRules || null,
        appliesAt: extracted.appliesAt || null,
        rawExcerpt: text.trim().slice(0, 1500)
      };
    } catch (error) {
      rules[code || fileName] = {
        source: relPath,
        title: fileName.replace('.pdf', ''),
        error: error.message
      };
    }
  }

  const payload = {
    version: '1.0',
    generatedAt: new Date().toISOString(),
    rules
  };

  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Scan rules extracted to: ${outputPath}`);
})();
