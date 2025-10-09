/**
 * Screenshot Capture Utility
 * 
 * Captures screenshots of the app on demand
 * Used for debugging and documentation
 */

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '../screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Capture screenshot of a specific page
 */
async function captureScreenshot(params = {}) {
  const url = params.url || 'http://localhost:3004';
  const name = params.name || `screenshot_${Date.now()}`;
  const fullPage = params.fullPage !== false;
  const waitFor = params.waitFor || 2000;
  
  let browser;
  
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Navigate to URL
    await page.goto(url);
    await page.waitForTimeout(waitFor);
    
    // Take screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage });
    
    return {
      status: 'success',
      path: screenshotPath,
      url,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message,
      url
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Capture screenshots of multiple pages
 */
async function captureMultipleScreenshots(pages = []) {
  const results = [];
  
  for (const pageConfig of pages) {
    const result = await captureScreenshot(pageConfig);
    results.push(result);
  }
  
  return {
    status: 'success',
    screenshots: results,
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length
  };
}

/**
 * Capture screenshot on error
 */
async function captureErrorScreenshot(errorContext = {}) {
  const name = `error_${errorContext.component || 'unknown'}_${Date.now()}`;
  
  return await captureScreenshot({
    url: errorContext.url || 'http://localhost:3004',
    name,
    fullPage: true,
    waitFor: 1000
  });
}

module.exports = {
  captureScreenshot,
  captureMultipleScreenshots,
  captureErrorScreenshot
};

