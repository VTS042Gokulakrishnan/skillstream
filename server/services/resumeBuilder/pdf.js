const puppeteer = require('puppeteer');
const { resolveChrome, browserError } = require('./browser');
const { renderResume, hydrateResume } = require('./template');
let active = 0;
async function generatePdf(doc) {
  if (active >= 2) { const e = new Error('PDF generation is busy. Please try again shortly.'); e.status = 503; throw e; }
  const executablePath = resolveChrome();
  doc = hydrateResume(doc);
  const html = renderResume(doc);
  active++;
  let browser;
  try {
    try {
      browser = await puppeteer.launch({ headless: true, executablePath,
        args: process.env.RESUME_CHROME_NO_SANDBOX === 'true' ? ['--no-sandbox', '--disable-setuid-sandbox'] : [] });
    } catch (error) {
      console.error('Resume PDF browser launch failed:', error.message);
      throw browserError('The PDF browser could not start. Check the backend Chrome installation, operating-system dependencies and RESUME_CHROME_PATH, then retry.');
    }
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on('request', request => request.abort());
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
    return Buffer.from(await page.pdf({ format: doc.settings.paper, preferCSSPageSize: true, printBackground: true, timeout: 30000 }));
  } finally {
    try { if (browser) await browser.close(); } finally { active--; }
  }
}
module.exports = { generatePdf };
