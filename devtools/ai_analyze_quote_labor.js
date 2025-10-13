/**
 * AI Auto-Analyzer for Quote Labor Issue
 * 
 * This script automatically analyzes smart logs to find
 * where labor line items are disappearing.
 * 
 * Usage: node devtools/ai_analyze_quote_labor.js
 */

const fs = require('fs');
const path = require('path');

const SMART_LOGS_PATH = path.join(__dirname, '..', 'error_logs', 'smart_logs_latest.json');

console.log('\n🤖 AI AUTO-ANALYZER: Quote Labor Line Items\n');
console.log('='.repeat(80));

// Check if logs exist
if (!fs.existsSync(SMART_LOGS_PATH)) {
  console.log('\n❌ No smart logs found!');
  console.log('\nRun this first:');
  console.log('  devtools\\AUTO_TEST_QUOTE_LABOR_COMPLETE.bat\n');
  process.exit(1);
}

// Read logs
const data = JSON.parse(fs.readFileSync(SMART_LOGS_PATH, 'utf8'));

console.log(`\n📊 ANALYZING ${data.totalLogs} LOGS...\n`);

// Analysis results
const analysis = {
  laborRowsFound: false,
  laborRowsEmpty: false,
  laborConversionCalled: false,
  laborQuoteItemsCreated: false,
  laborQuoteItemsEmpty: false,
  combinedItemsIncludeLabor: false,
  saveQuoteItemsCalled: false,
  databaseInsertAttempted: false,
  databaseInsertSuccessful: false,
  errors: [],
  warnings: [],
  findings: []
};

// Get all relevant logs
const allLogs = [
  ...(data.categorizedLogs?.labor || []),
  ...(data.categorizedLogs?.quote || []),
  ...(data.categorizedLogs?.lineItems || []),
  ...(data.categorizedLogs?.database || []),
  ...(data.categorizedLogs?.error || [])
];

// Analyze each log
allLogs.forEach(log => {
  const msg = log.message.toLowerCase();
  
  // Check for laborRows
  if (msg.includes('laborrows')) {
    analysis.laborRowsFound = true;
    
    if (msg.includes('laborrows: []') || msg.includes('laborrows.length: 0')) {
      analysis.laborRowsEmpty = true;
      analysis.findings.push({
        severity: 'CRITICAL',
        message: 'laborRows is EMPTY when it should contain labor data',
        log: log.message,
        timestamp: log.timestamp
      });
    }
  }
  
  // Check for labor conversion
  if (msg.includes('convertlaborrowstoquoteitems') || msg.includes('labor conversion')) {
    analysis.laborConversionCalled = true;
  }
  
  // Check for laborQuoteItems
  if (msg.includes('laborquoteitems')) {
    analysis.laborQuoteItemsCreated = true;
    
    if (msg.includes('laborquoteitems: []') || msg.includes('laborquoteitems.length: 0')) {
      analysis.laborQuoteItemsEmpty = true;
      analysis.findings.push({
        severity: 'CRITICAL',
        message: 'laborQuoteItems is EMPTY after conversion',
        log: log.message,
        timestamp: log.timestamp
      });
    }
  }
  
  // Check for combinedQuoteItems
  if (msg.includes('combinedquoteitems')) {
    const hasLabor = msg.includes('item_type: \'labor\'') || msg.includes('item_type: "labor"');
    if (hasLabor) {
      analysis.combinedItemsIncludeLabor = true;
    } else {
      analysis.findings.push({
        severity: 'CRITICAL',
        message: 'combinedQuoteItems does NOT include labor items',
        log: log.message,
        timestamp: log.timestamp
      });
    }
  }
  
  // Check for saveQuoteItems
  if (msg.includes('saving line items') || msg.includes('savequoteitems')) {
    analysis.saveQuoteItemsCalled = true;
  }
  
  // Check for database operations
  if (msg.includes('insert') && msg.includes('work_order_line_items')) {
    analysis.databaseInsertAttempted = true;
  }
  
  if (msg.includes('line items saved successfully')) {
    analysis.databaseInsertSuccessful = true;
  }
  
  // Collect errors
  if (log.level === 'error' || msg.includes('error') || msg.includes('❌')) {
    analysis.errors.push({
      message: log.message,
      timestamp: log.timestamp
    });
  }
  
  // Collect warnings
  if (log.level === 'warn' || msg.includes('warning') || msg.includes('⚠️')) {
    analysis.warnings.push({
      message: log.message,
      timestamp: log.timestamp
    });
  }
});

// Generate report
console.log('📋 ANALYSIS RESULTS:\n');
console.log('='.repeat(80));

console.log('\n✅ EXECUTION FLOW:\n');
console.log(`  1. laborRows found:              ${analysis.laborRowsFound ? '✅ YES' : '❌ NO'}`);
console.log(`  2. laborRows empty:              ${analysis.laborRowsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
console.log(`  3. Labor conversion called:      ${analysis.laborConversionCalled ? '✅ YES' : '❌ NO'}`);
console.log(`  4. laborQuoteItems created:      ${analysis.laborQuoteItemsCreated ? '✅ YES' : '❌ NO'}`);
console.log(`  5. laborQuoteItems empty:        ${analysis.laborQuoteItemsEmpty ? '❌ YES (PROBLEM!)' : '✅ NO'}`);
console.log(`  6. Combined items include labor: ${analysis.combinedItemsIncludeLabor ? '✅ YES' : '❌ NO (PROBLEM!)'}`);
console.log(`  7. saveQuoteItems called:        ${analysis.saveQuoteItemsCalled ? '✅ YES' : '❌ NO'}`);
console.log(`  8. Database INSERT attempted:    ${analysis.databaseInsertAttempted ? '✅ YES' : '❌ NO'}`);
console.log(`  9. Database INSERT successful:   ${analysis.databaseInsertSuccessful ? '✅ YES' : '❌ NO (PROBLEM!)'}`);

// Critical findings
if (analysis.findings.length > 0) {
  console.log('\n\n🚨 CRITICAL FINDINGS:\n');
  console.log('='.repeat(80));
  
  analysis.findings.forEach((finding, index) => {
    console.log(`\n[${index + 1}] ${finding.severity}: ${finding.message}`);
    console.log(`    Time: ${finding.timestamp}`);
    console.log(`    Log: ${finding.log.substring(0, 200)}...`);
  });
}

// Errors
if (analysis.errors.length > 0) {
  console.log('\n\n❌ ERRORS FOUND:\n');
  console.log('='.repeat(80));
  
  analysis.errors.slice(0, 5).forEach((error, index) => {
    console.log(`\n[${index + 1}] ${error.timestamp}`);
    console.log(`    ${error.message.substring(0, 200)}...`);
  });
  
  if (analysis.errors.length > 5) {
    console.log(`\n... and ${analysis.errors.length - 5} more errors`);
  }
}

// Diagnosis
console.log('\n\n🔍 DIAGNOSIS:\n');
console.log('='.repeat(80));

if (analysis.laborRowsEmpty) {
  console.log('\n❌ ROOT CAUSE: laborRows is EMPTY');
  console.log('\nThis means the labor table data is not being captured when the form is submitted.');
  console.log('\nPossible causes:');
  console.log('  1. Labor table state is not being passed to submit handler');
  console.log('  2. Labor table is being cleared before submit');
  console.log('  3. Labor table ref is not accessible in submit handler');
  console.log('\nNext steps:');
  console.log('  1. Check how laborRows is populated in QuoteBuilder.js');
  console.log('  2. Verify laborRows state is maintained until submit');
  console.log('  3. Add logging to track laborRows lifecycle');
  
} else if (analysis.laborQuoteItemsEmpty) {
  console.log('\n❌ ROOT CAUSE: Labor conversion returns EMPTY array');
  console.log('\nThis means convertLaborRowsToQuoteItems() is failing.');
  console.log('\nPossible causes:');
  console.log('  1. Conversion function has a bug');
  console.log('  2. Labor rows have invalid data');
  console.log('  3. Rates are missing');
  console.log('\nNext steps:');
  console.log('  1. Review convertLaborRowsToQuoteItems() function');
  console.log('  2. Check if rates are loaded');
  console.log('  3. Verify labor row data structure');
  
} else if (!analysis.combinedItemsIncludeLabor) {
  console.log('\n❌ ROOT CAUSE: Labor items filtered out before saving');
  console.log('\nThis means labor items are being removed from combinedQuoteItems.');
  console.log('\nPossible causes:');
  console.log('  1. Filter removing labor items');
  console.log('  2. Labor items missing required fields');
  console.log('  3. Labor items have invalid structure');
  console.log('\nNext steps:');
  console.log('  1. Check filters applied to combinedQuoteItems');
  console.log('  2. Verify labor items have all required fields');
  console.log('  3. Check validation logic');
  
} else if (!analysis.databaseInsertSuccessful) {
  console.log('\n❌ ROOT CAUSE: Database INSERT failed');
  console.log('\nThis means the database rejected the labor line items.');
  console.log('\nPossible causes:');
  console.log('  1. Invalid enum value for line_type');
  console.log('  2. Missing required fields');
  console.log('  3. Foreign key constraint violation');
  console.log('\nNext steps:');
  console.log('  1. Check database error logs');
  console.log('  2. Verify enum values match database');
  console.log('  3. Check required fields are present');
  
} else if (!analysis.laborRowsFound) {
  console.log('\n⚠️  NO LABOR LOGS FOUND');
  console.log('\nThis means either:');
  console.log('  1. No quote was created during testing');
  console.log('  2. Logging is not working');
  console.log('  3. Labor-related code was not executed');
  console.log('\nNext steps:');
  console.log('  1. Run the automated test again');
  console.log('  2. Make sure to add labor to the quote');
  console.log('  3. Check that SmartLoggingService is running');
  
} else {
  console.log('\n✅ NO OBVIOUS ISSUES FOUND');
  console.log('\nThe logs suggest labor items should be working.');
  console.log('\nNext steps:');
  console.log('  1. Check the database directly for labor line items');
  console.log('  2. Verify the quote was actually saved');
  console.log('  3. Check if there are any silent failures');
}

// Save analysis report
const reportPath = path.join(__dirname, 'labor_analysis_report.json');
fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));

console.log(`\n\n📁 Full analysis saved to: ${reportPath}\n`);
console.log('='.repeat(80));
console.log('\n✅ Analysis complete!\n');

