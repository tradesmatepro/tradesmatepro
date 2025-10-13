/**
 * CAPTURE CALENDAR LAYOUT
 * 
 * Takes screenshots of the calendar page to analyze layout issues
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const APP_URL = 'http://localhost:3004';
const TEST_USER = {
  email: 'jeraldjsmith@gmail.com',
  password: 'Gizmo123'
};

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function captureCalendarLayout() {
  console.log('\n📸 CAPTURING CALENDAR LAYOUT');
  console.log('='.repeat(80));
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100
  });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  
  try {
    // Login
    console.log('\n🔐 Logging in...');
    await page.goto(`${APP_URL}/login`);
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in\n');
    
    // Navigate to Calendar/Scheduling
    console.log('📋 Navigating to Calendar/Scheduling page...');
    await page.goto(`${APP_URL}/scheduling`);
    await page.waitForTimeout(5000);
    
    // Take full page screenshot
    const fullPagePath = path.join(SCREENSHOTS_DIR, `calendar-full-page-${Date.now()}.png`);
    await page.screenshot({ path: fullPagePath, fullPage: true });
    console.log(`✅ Full page screenshot: ${fullPagePath}`);
    
    // Take viewport screenshot
    const viewportPath = path.join(SCREENSHOTS_DIR, `calendar-viewport-${Date.now()}.png`);
    await page.screenshot({ path: viewportPath, fullPage: false });
    console.log(`✅ Viewport screenshot: ${viewportPath}`);
    
    // Capture backlog sidebar specifically
    try {
      const backlogSelector = '.card.lg\\:col-span-1'; // Backlog sidebar
      const backlogElement = await page.locator(backlogSelector).first();
      if (await backlogElement.count() > 0) {
        const backlogPath = path.join(SCREENSHOTS_DIR, `calendar-backlog-${Date.now()}.png`);
        await backlogElement.screenshot({ path: backlogPath });
        console.log(`✅ Backlog sidebar screenshot: ${backlogPath}`);
      }
    } catch (e) {
      console.log('⚠️  Could not capture backlog sidebar specifically');
    }
    
    // Get layout measurements
    console.log('\n📏 Measuring layout...');
    
    const measurements = await page.evaluate(() => {
      const results = {};
      
      // Backlog sidebar
      const backlog = document.querySelector('.card.lg\\:col-span-1');
      if (backlog) {
        results.backlog = {
          width: backlog.offsetWidth,
          height: backlog.offsetHeight,
          scrollHeight: backlog.scrollHeight,
          isOverflowing: backlog.scrollHeight > backlog.offsetHeight
        };
        
        // Count backlog items
        const items = backlog.querySelectorAll('.backlog-item');
        results.backlog.itemCount = items.length;
        
        // Measure first item
        if (items.length > 0) {
          const firstItem = items[0].closest('.border');
          results.backlog.firstItemHeight = firstItem ? firstItem.offsetHeight : 0;
        }
      }
      
      // Calendar container
      const calendar = document.querySelector('.fc');
      if (calendar) {
        results.calendar = {
          width: calendar.offsetWidth,
          height: calendar.offsetHeight,
          top: calendar.getBoundingClientRect().top
        };
      }
      
      // All-day events area
      const allDayArea = document.querySelector('.fc-daygrid-body');
      if (allDayArea) {
        results.allDayArea = {
          height: allDayArea.offsetHeight,
          eventCount: allDayArea.querySelectorAll('.fc-event').length
        };
      }
      
      // Time grid area
      const timeGrid = document.querySelector('.fc-timegrid-body');
      if (timeGrid) {
        results.timeGrid = {
          height: timeGrid.offsetHeight,
          eventCount: timeGrid.querySelectorAll('.fc-event').length
        };
      }
      
      return results;
    });
    
    console.log('\n📊 Layout Measurements:');
    console.log(JSON.stringify(measurements, null, 2));
    
    // Check for layout issues
    console.log('\n🔍 Layout Analysis:');
    
    if (measurements.backlog) {
      console.log(`\n   Backlog Sidebar:`);
      console.log(`      Width: ${measurements.backlog.width}px`);
      console.log(`      Height: ${measurements.backlog.height}px`);
      console.log(`      Scroll Height: ${measurements.backlog.scrollHeight}px`);
      console.log(`      Items: ${measurements.backlog.itemCount}`);
      console.log(`      First Item Height: ${measurements.backlog.firstItemHeight}px`);
      
      if (measurements.backlog.isOverflowing) {
        console.log(`      ⚠️  OVERFLOWING - needs scrolling`);
      } else {
        console.log(`      ✅ Not overflowing`);
      }
      
      if (measurements.backlog.firstItemHeight > 100) {
        console.log(`      🔴 ISSUE: Items are too tall (${measurements.backlog.firstItemHeight}px)`);
      } else {
        console.log(`      ✅ Item height looks good`);
      }
    }
    
    if (measurements.allDayArea) {
      console.log(`\n   All-Day Events Area:`);
      console.log(`      Height: ${measurements.allDayArea.height}px`);
      console.log(`      Events: ${measurements.allDayArea.eventCount}`);
      
      if (measurements.allDayArea.height > 200) {
        console.log(`      🔴 ISSUE: All-day area is too tall (${measurements.allDayArea.height}px)`);
        console.log(`      This might be pushing the time grid down`);
      } else {
        console.log(`      ✅ All-day area height looks normal`);
      }
    }
    
    if (measurements.timeGrid) {
      console.log(`\n   Time Grid Area:`);
      console.log(`      Height: ${measurements.timeGrid.height}px`);
      console.log(`      Events: ${measurements.timeGrid.eventCount}`);
    }
    
    // Save measurements to file
    const measurementsPath = path.join(SCREENSHOTS_DIR, `calendar-measurements-${Date.now()}.json`);
    fs.writeFileSync(measurementsPath, JSON.stringify(measurements, null, 2));
    console.log(`\n💾 Measurements saved: ${measurementsPath}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('📸 SCREENSHOTS CAPTURED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  captureCalendarLayout().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { captureCalendarLayout };

