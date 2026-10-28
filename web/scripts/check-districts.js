const fs = require('fs');
const content = fs.readFileSync('./src/lib/locations/data.ts', 'utf8');

// Use a safer parser or regex
const districtBlocks = content.split('// ─── ALL 64 DISTRICTS OF BANGLADESH ───')[1].split('// ─── SERVICE CATEGORIES')[0];
const districtRegex = /{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*bnName:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*divisionId:\s*"([^"]+)",\s*divisionName:\s*"([^"]+)",\s*divisionSlug:\s*"([^"]+)",\s*popularAreas:\s*(\[[^\]]*\])/g;

let match;
const districts = [];
while ((match = districtRegex.exec(districtBlocks)) !== null) {
  districts.push({
    id: match[1],
    name: match[2],
    bnName: match[3],
    slug: match[4],
    divisionId: match[5],
    divisionName: match[6],
    popularAreas: JSON.parse(match[8])
  });
}

console.log(`Parsed ${districts.length} districts.`);
districts.forEach((d, idx) => {
  console.log(`${idx + 1}. ${d.name} (${d.bnName}) [${d.divisionName}] - Areas: ${d.popularAreas.join(', ')}`);
});

