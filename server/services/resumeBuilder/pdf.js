const puppeteer = require('puppeteer');
const { renderResume } = require('./template');
let active = 0;
async function generatePdf(doc) {
  if (active >= 2) { const e = new Error('PDF generation is busy. Please try again shortly.'); e.status = 503; throw e; }
  active++;
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, executablePath: process.env.RESUME_CHROME_PATH || undefined,
      args: process.env.RESUME_CHROME_NO_SANDBOX === 'true' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] });
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', request => request.abort());
    await page.setContent(renderResume(doc), { waitUntil: 'domcontentloaded', timeout: 20000 });
    return Buffer.from(await page.pdf({ format: doc.settings.paper, preferCSSPageSize: true, printBackground: true, timeout: 30000 }));
  } finally {
    try { if (browser) await browser.close(); } finally { active--; }
  }
}
module.exports = { generatePdf };
