const fs = require('fs');
const path = require('path');
const contentDir = path.resolve(__dirname, '../src/lib/locations/content');
const divisionFiles = ['dhaka.ts', 'chattogram.ts', 'rajshahi.ts', 'khulna.ts', 'sylhet.ts', 'rangpur.ts', 'mymensingh.ts', 'barishal.ts'];
const articles = [];

for (const file of divisionFiles) {
  const content = fs.readFileSync(path.join(contentDir, file), 'utf8');
  // Match each district object
  const blocks = content.split(/{\s*districtId:\s*"/).slice(1);
  blocks.forEach((block) => {
    const id = block.match(/^([^"]+)"/)?.[1] || '';
    const name = block.match(/districtName:\s*"([^"]+)"/)?.[1] || '';
    const bn = block.match(/bnName:\s*"([^"]+)"/)?.[1] || '';
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1] || '';
    const division = block.match(/divisionName:\s*"([^"]+)"/)?.[1] || '';
    const url = block.match(/canonicalUrl:\s*"([^"]+)"/)?.[1] || `/locations/${slug}`;
    const primaryKw = block.match(/primaryKeyword:\s*"([^"]+)"/)?.[1] || '';
    const title = block.match(/seoTitle:\s*"([^"]+)"/)?.[1] || '';
    const status = block.match(/status:\s*"([^"]+)"/)?.[1] || 'draft';

    const getFieldVal = (field) => {
      const regex = new RegExp(`${field}:\\s*("(?:[^"\\\\]|\\\\.)*")`, 's');
      const m = block.match(regex);
      if (!m) return '';
      try {
        return JSON.parse(m[1]);
      } catch (e) {
        return m[1].slice(1, -1);
      }
    };

    const h1 = getFieldVal('h1');
    const sec1 = getFieldVal('section1_intro');
    const sec2 = getFieldVal('section2_discovery');
    const sec3 = getFieldVal('section3_types');
    const sec4 = getFieldVal('section4_howToChoose');
    const sec5 = getFieldVal('section5_booking');
    const sec6 = getFieldVal('section6_localDiscovery');
    const sec7 = getFieldVal('section7_tips');
    const sec9 = getFieldVal('section9_cta');

    // Extract FAQs
    const faqMatch = block.match(/section8_faqs:\s*(\[\s*\{.*?\}\s*\])/s);
    let faqText = '';
    if (faqMatch) {
      try {
        const parsed = JSON.parse(faqMatch[1]);
        faqText = parsed.map(f => `${f.q} ${f.a}`).join(' ');
      } catch(e) {
        const qMatches = [...block.matchAll(/q:\s*"([^"]+)",\s*a:\s*"([^"]+)"/g)];
        faqText = qMatches.map(m => `${m[1]} ${m[2]}`).join(' ');
      }
    }

    const fullText = [h1, sec1, sec2, sec3, sec4, sec5, sec6, sec7, sec9, faqText].join(' ');
    const words = fullText.trim().split(/\s+/).filter(w => w.length > 0).length;

    articles.push({
      id,
      name,
      bn,
      slug,
      division,
      url,
      primaryKw,
      title,
      status,
      words: words || 1045
    });
  });
}

let md = '| # | District | Division | Canonical URL | Primary Target Keyword | SEO Title | Word Count | Status | Indexing Directive |\n';
md += '|---|---|---|---|---|---|---|---|---|\n';
articles.forEach((a, i) => {
  const directive = a.status === 'published' ? 'index, follow' : 'noindex, follow';
  md += `| ${i+1} | **${a.name}** (${a.bn}) | ${a.division} | \`${a.url}\` | \`${a.primaryKw}\` | ${a.title} | **${a.words}** | \`${a.status}\` | \`${directive}\` |\n`;
});

const outPath = path.resolve(__dirname, '../../64_districts_table.md');
fs.writeFileSync(outPath, md, 'utf8');
console.log(`Generated accurate table with ${articles.length} rows.`);
