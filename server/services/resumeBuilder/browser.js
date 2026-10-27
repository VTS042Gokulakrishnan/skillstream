const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
function browserError(message) { const error = new Error(message); error.status = 503; return error; }
function resolveChrome({ env = process.env, platform = process.platform, exists = file => fs.existsSync(file) && fs.statSync(file).isFile(), bundled = () => puppeteer.executablePath() } = {}) {
  const explicit = env.RESUME_CHROME_PATH || env.PUPPETEER_EXECUTABLE_PATH;
  if (explicit) {
    if (exists(explicit)) return explicit;
    throw browserError('The configured PDF browser was not found. Correct RESUME_CHROME_PATH on the backend and restart it.');
  }
  try { const file = bundled(); if (file && exists(file)) return file; } catch (_) { /* Try an existing system installation. */ }
  let candidates = [];
  if (platform === 'win32') {
    const roots = [env.PROGRAMFILES || 'C:/Program Files', env['PROGRAMFILES(X86)'] || 'C:/Program Files (x86)', env.LOCALAPPDATA].filter(Boolean);
    candidates = roots.flatMap(root => [path.join(root, 'Google/Chrome/Application/chrome.exe'), path.join(root, 'Microsoft/Edge/Application/msedge.exe')]);
  } else if (platform === 'darwin') {
    candidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'];
  } else {
    candidates = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];
  }
  const found = candidates.find(exists);
  if (found) return found;
  throw browserError('PDF export is unavailable because Chrome/Chromium is missing on the backend. Install it with npx puppeteer browsers install chrome, or set RESUME_CHROME_PATH to an installed browser and restart the backend.');
}
module.exports = { resolveChrome, browserError };
