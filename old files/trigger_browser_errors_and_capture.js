// Trigger Browser Errors and Capture with Dev Tools
// This script opens the browser, navigates to pages, and captures real console errors

const { spawn } = require('child_process');
const fetch = require('node-fetch');

const LOCAL_LOGGER_URL = 'http://localhost:4321';
const APP_URL = 'http://localhost:3000';

console.log('🌐 TRIGGERING BROWSER ERRORS AND CAPTURING WITH DEV TOOLS');
console.log('='.repeat(80));

async function waitForLogs(seconds = 10) {
  console.log(`⏳ Waiting ${seconds} seconds for logs to be captured...`);
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function getLatestLogs() {
  try {
    const response = await fetch(`${LOCAL_LOGGER_URL}/logs/latest?limit=50`);
    const data = await response.json();

    // Handle different response formats
    if (data && data.entries && Array.isArray(data.entries)) {
      return data.entries;
    } else if (Array.isArray(data)) {
      return data;
    } else {
      console.log('⚠️ Unexpected log format:', typeof data);
      return [];
    }
  } catch (error) {
    console.log('❌ Failed to get logs:', error.message);
    return [];
  }
}

async function openBrowserAndNavigate() {
  console.log('\n🌐 OPENING BROWSER AND NAVIGATING TO PAGES');
  console.log('-'.repeat(50));

  const pages = [
    '/dashboard',
    '/customers', 
    '/quotes',
    '/invoices',
    '/sales'
  ];

  console.log('📋 Pages to test:');
  pages.forEach(page => console.log(`   - ${APP_URL}${page}`));

  // Open browser to each page
  for (const page of pages) {
    const url = `${APP_URL}${page}`;
    console.log(`\n🔍 Opening: ${url}`);
    
    try {
      // Open browser (Windows)
      const browser = spawn('cmd', ['/c', 'start', url], { 
        stdio: 'ignore',
        detached: true 
      });
      
      // Wait for page to load and errors to be captured
      await waitForLogs(5);
      
    } catch (error) {
      console.log(`❌ Failed to open ${url}:`, error.message);
    }
  }

  console.log('\n✅ Browser navigation complete');
}

async function analyzeCapuredErrors() {
  console.log('\n📊 ANALYZING CAPTURED ERRORS');
  console.log('-'.repeat(50));

  const logs = await getLatestLogs();
  
  if (logs.length === 0) {
    console.log('⚠️ No logs captured. Possible issues:');
    console.log('   1. Browser console capture scripts not working');
    console.log('   2. Local logger server not receiving data');
    console.log('   3. App not running on http://localhost:3000');
    return [];
  }

  console.log(`✅ Found ${logs.length} log entries`);

  // Filter for HTTP errors
  const httpErrors = logs.filter(log => 
    log.message && (
      log.message.includes('400') ||
      log.message.includes('404') ||
      log.message.includes('500') ||
      log.message.includes('Failed to fetch') ||
      log.message.includes('HTTP error') ||
      log.message.includes('Bad Request') ||
      log.message.toLowerCase().includes('error')
    )
  );

  if (httpErrors.length > 0) {
    console.log(`\n🚨 FOUND ${httpErrors.length} HTTP/ERROR ENTRIES:`);
    httpErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. [${error.type?.toUpperCase() || 'LOG'}] ${error.timestamp}`);
      console.log(`   Message: ${error.message}`);
      
      // Try to extract URL from error message
      const urlMatch = error.message.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        console.log(`   URL: ${urlMatch[0]}`);
      }
    });
  } else {
    console.log('✅ No HTTP errors found in captured logs');
  }

  // Filter for specific table/column errors
  const dbErrors = logs.filter(log =>
    log.message && (
      log.message.includes('customer_messages') ||
      log.message.includes('customer_communications') ||
      log.message.includes('updated_at') ||
      log.message.includes('sales_activities') ||
      log.message.includes('column') ||
      log.message.includes('relation') ||
      log.message.includes('does not exist')
    )
  );

  if (dbErrors.length > 0) {
    console.log(`\n🗄️ FOUND ${dbErrors.length} DATABASE-RELATED ERRORS:`);
    dbErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. [${error.type?.toUpperCase() || 'LOG'}] ${error.timestamp}`);
      console.log(`   Message: ${error.message}`);
    });
  }

  return { httpErrors, dbErrors, allLogs: logs };
}

async function checkAppStatus() {
  console.log('\n🔍 CHECKING APP STATUS');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(APP_URL, { timeout: 5000 });
    if (response.ok) {
      console.log(`✅ App is running at ${APP_URL}`);
      return true;
    } else {
      console.log(`❌ App returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ App is not running at ${APP_URL}`);
    console.log('   Start the app with: npm start');
    return false;
  }
}

async function checkLoggerServer() {
  console.log('\n🔍 CHECKING LOGGER SERVER STATUS');
  console.log('-'.repeat(50));

  try {
    const response = await fetch(`${LOCAL_LOGGER_URL}/health`);
    const status = await response.json();
    if (status.ok) {
      console.log(`✅ Logger server is running at ${LOCAL_LOGGER_URL}`);
      return true;
    } else {
      console.log(`❌ Logger server health check failed`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Logger server is not running at ${LOCAL_LOGGER_URL}`);
    console.log('   Start with: node devtools/local_logger_server.js');
    return false;
  }
}

async function main() {
  try {
    // Step 1: Check prerequisites
    const appRunning = await checkAppStatus();
    const loggerRunning = await checkLoggerServer();
    
    if (!appRunning) {
      console.log('\n❌ Cannot proceed: App is not running');
      console.log('   Start the app first: npm start');
      return;
    }
    
    if (!loggerRunning) {
      console.log('\n❌ Cannot proceed: Logger server is not running');
      console.log('   Start logger server: node devtools/local_logger_server.js');
      return;
    }

    // Step 2: Clear any existing logs (optional)
    console.log('\n🧹 Getting baseline log count...');
    const initialLogs = await getLatestLogs();
    console.log(`📊 Current log count: ${initialLogs.length}`);

    // Step 3: Open browser and navigate to pages
    await openBrowserAndNavigate();

    // Step 4: Wait for all logs to be captured
    console.log('\n⏳ Waiting for all logs to be captured...');
    await waitForLogs(10);

    // Step 5: Analyze captured errors
    const { httpErrors, dbErrors, allLogs } = await analyzeCapuredErrors();

    // Step 6: Summary
    console.log('\n' + '='.repeat(80));
    console.log('🎉 BROWSER ERROR CAPTURE COMPLETE');
    console.log('='.repeat(80));
    console.log(`📊 Total logs captured: ${allLogs.length}`);
    console.log(`🚨 HTTP errors found: ${httpErrors.length}`);
    console.log(`🗄️ Database errors found: ${dbErrors.length}`);

    if (httpErrors.length > 0 || dbErrors.length > 0) {
      console.log('\n🎯 NEXT STEPS:');
      console.log('1. Review the errors listed above');
      console.log('2. Use the dev SQL server to fix database issues');
      console.log('3. Test fixes by refreshing browser pages');
      console.log('4. Re-run this script to verify fixes');
    } else {
      console.log('\n🎉 No errors found! All pages appear to be working correctly.');
    }

  } catch (error) {
    console.error('❌ Browser error capture failed:', error);
  }
}

// Run the browser error capture
main().catch(console.error);
