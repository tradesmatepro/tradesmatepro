/**
 * Read Smart Logs for AI Analysis
 * 
 * This script reads the smart logs captured by SmartLoggingService
 * and provides filtered views for debugging specific issues.
 * 
 * Usage: node devtools/read_smart_logs.js [category]
 * 
 * Categories: quote, labor, lineItems, database, api, error, debug, all
 */

const fs = require('fs');
const path = require('path');

const SMART_LOGS_PATH = path.join(__dirname, '..', 'error_logs', 'smart_logs_latest.json');

// Get category from command line args
const category = process.argv[2] || 'all';

console.log(`\n📊 SMART LOGS ANALYSIS - Category: ${category.toUpperCase()}\n`);
console.log('='.repeat(80));

// Check if smart logs exist
if (!fs.existsSync(SMART_LOGS_PATH)) {
  console.log('\n❌ No smart logs found!');
  console.log('\nMake sure:');
  console.log('1. The error server is running (npm run dev-error-server)');
  console.log('2. The frontend is running (npm run dev-main)');
  console.log('3. SmartLoggingService is capturing logs');
  console.log('\nWait a few seconds for logs to be exported, then try again.\n');
  process.exit(1);
}

// Read smart logs
const data = JSON.parse(fs.readFileSync(SMART_LOGS_PATH, 'utf8'));

console.log(`\n📈 SUMMARY:`);
console.log(`  Total Logs: ${data.totalLogs}`);
console.log(`  Last Updated: ${data.timestamp}`);
console.log(`\n📂 CATEGORIES:`);
Object.entries(data.categories).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} logs`);
});

// Filter logs by category
let logsToShow = [];

if (category === 'all') {
  logsToShow = data.recentLogs || [];
} else if (data.categorizedLogs && data.categorizedLogs[category]) {
  logsToShow = data.categorizedLogs[category];
} else {
  console.log(`\n❌ Category "${category}" not found!`);
  console.log('\nAvailable categories:', Object.keys(data.categories).join(', '));
  process.exit(1);
}

console.log(`\n\n📋 LOGS (${category.toUpperCase()}) - Showing ${logsToShow.length} logs:\n`);
console.log('='.repeat(80));

// Display logs
logsToShow.forEach((log, index) => {
  console.log(`\n[${index + 1}] ${log.level.toUpperCase()} - ${log.timestamp}`);
  console.log(`Category: ${log.category}`);
  console.log(`Message:`);
  console.log(log.message);
  console.log('-'.repeat(80));
});

console.log(`\n\n✅ Analysis complete! Showed ${logsToShow.length} logs.\n`);

// Export filtered logs to a file for AI to read
const outputPath = path.join(__dirname, `smart_logs_${category}.json`);
fs.writeFileSync(outputPath, JSON.stringify({
  category,
  timestamp: new Date().toISOString(),
  totalLogs: logsToShow.length,
  logs: logsToShow
}, null, 2));

console.log(`📁 Filtered logs saved to: ${outputPath}\n`);

