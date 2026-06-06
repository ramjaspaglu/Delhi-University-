import * as cheerio from 'cheerio';

async function testKalindi() {
  const response = await fetch('https://www.kalindicollege.in/previous-year-qpapers/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const links: any[] = [];
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim() || 'Download';
    if (href && href.toLowerCase().includes('.pdf')) {
      links.push({ name: text.replace(/\n/g, ' '), path: href, isDir: false });
    }
  });
  console.log("Kalindi PDFs found:", links.slice(0, 5));
}

async function testMaitreyi() {
  const response = await fetch('https://www.maitreyi.ac.in/library/resources/previous-years-question-papers', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const links: any[] = [];
  $('a').each((_, element) => {
    const href = $(element).attr('href');
    let text = $(element).text().trim();
    const trText = $(element).closest('tr').find('td').first().text().trim();
    if (trText && (text.toLowerCase() === 'view' || text.toLowerCase() === 'download')) {
       text = trText;
    } else if (!text) {
       text = 'Download';
    }
    
    if (href && (href.toLowerCase().includes('.pdf') || href.includes('drive.google.com') || href.includes('docs.google.com'))) {
      const absHref = href.startsWith('/') ? `https://www.maitreyi.ac.in${href}` : href;
      links.push({ name: text, path: absHref, isDir: false });
    }
  });
  console.log("Maitreyi PDFs/Drive Links found:", links.slice(0, 5));
}

testKalindi();
testMaitreyi();
