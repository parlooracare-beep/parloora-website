const fs = require('fs');
const path = require('path');

const contentDir = path.resolve(__dirname, '../src/lib/locations/content');
const divisionFiles = ['dhaka.ts', 'chattogram.ts', 'rajshahi.ts', 'khulna.ts', 'sylhet.ts', 'rangpur.ts', 'mymensingh.ts', 'barishal.ts'];

let totalArticles = 0;
let totalWords = 0;
const slugs = new Set();
const titles = new Set();
const articles = [];

for (const file of divisionFiles) {
  const filePath = path.join(contentDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract articles by matching districtId
  const districtMatches = [...content.matchAll(/districtId:\s*"([^"]+)",\s*districtName:\s*"([^"]+)",\s*bnName:\s*"([^"]+)",\s*slug:\s*"([^"]+)",\s*divisionId:\s*"([^"]+)",\s*divisionName:\s*"([^"]+)",\s*canonicalUrl:\s*"([^"]+)",\s*primaryKeyword:\s*"([^"]+)",/g)];
  
  // Extract word count by summing sections in each article
  const articleBlocks = content.split(/districtId:\s*"/).slice(1);
  
  articleBlocks.forEach((block, idx) => {
    const dMatch = districtMatches[idx];
    if (!dMatch) return;
    
    const id = dMatch[1];
    const name = dMatch[2];
    const slug = dMatch[4];
    const division = dMatch[6];
    const primaryKw = dMatch[8];
    
    // Extract sections
    const getField = (field) => {
      const regex = new RegExp(`${field}:\\s*(".*?"|\\[.*?\\])`, 's');
      const m = block.match(regex);
      if (!m) return "";
      try {
        return JSON.parse(m[1]);
      } catch (e) {
        return m[1].replace(/^"|"$/g, '');
      }
    };
    
    const h1 = getField('h1');
    const sec1 = getField('section1_intro');
    const sec2 = getField('section2_discovery');
    const sec3 = getField('section3_types');
    const sec4 = getField('section4_howToChoose');
    const sec5 = getField('section5_booking');
    const sec6 = getField('section6_localDiscovery');
    const sec7 = getField('section7_tips');
    const sec9 = getField('section9_cta');
    const faqs = getField('section8_faqs');
    
    let faqText = "";
    if (Array.isArray(faqs)) {
      faqText = faqs.map(f => `${f.q} ${f.a}`).join(" ");
    }
    
    const fullText = [h1, sec1, sec2, sec3, sec4, sec5, sec6, sec7, sec9, faqText].join(" ");
    const words = fullText.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    const seoTitle = getField('seoTitle');
    const metaDesc = getField('metaDescription');
    const status = block.match(/status:\s*"([^"]+)"/)?.[1] || "draft";
    
    slugs.add(slug);
    titles.add(seoTitle);
    totalArticles++;
    totalWords += words;
    
    articles.push({
      id,
      name,
      slug,
      division,
      primaryKw,
      seoTitle,
      metaDesc,
      status,
      words
    });
  });
}

console.log(`========================================`);
console.log(`TOTAL ARTICLES VERIFIED: ${totalArticles}`);
console.log(`UNIQUE SLUGS: ${slugs.size} (Expected: 64)`);
console.log(`UNIQUE TITLES: ${titles.size} (Expected: 64)`);
console.log(`TOTAL WORDS: ${totalWords.toLocaleString()} words`);
console.log(`AVERAGE WORDS PER ARTICLE: ${Math.round(totalWords / totalArticles)} words`);
console.log(`========================================`);
console.log(`Sample Breakdown (First 5):`);
articles.slice(0, 5).forEach((a, i) => {
  console.log(`${i+1}. [${a.division}] ${a.name} (${a.slug}): ${a.words} words | Status: ${a.status} | Primary KW: "${a.primaryKw}"`);
});
console.log(`Sample Breakdown (Last 5):`);
articles.slice(-5).forEach((a, i) => {
  console.log(`${articles.length - 5 + i + 1}. [${a.division}] ${a.name} (${a.slug}): ${a.words} words | Status: ${a.status} | Primary KW: "${a.primaryKw}"`);
});
