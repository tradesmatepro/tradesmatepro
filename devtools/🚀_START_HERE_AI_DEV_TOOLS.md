# 🚀 START HERE - AI Dev Tools Guide

## 📋 Quick Start for AI Assistants

This guide explains how to use TradeMate Pro's AI dev tools to autonomously test, debug, and fix issues.

---

## 🎯 Overview

**TradeMate Pro has a complete AI automation infrastructure:**

1. **SmartLoggingService** - Captures all console logs automatically
2. **Error Server** - Stores and serves logs for AI analysis
3. **Full Auto Tests** - Playwright-based end-to-end testing
4. **SQL Executor** - Database query and schema inspection
5. **Server Manager** - Background process management
6. **Screenshot Capture** - Visual verification
7. **UI Interaction Controller** - High-level UI automation with outcome monitoring
8. **Action-Outcome Monitor** - Verify if actions actually worked
9. **Perception Engine** - Enhanced action execution with full context
10. **Debug Frontend** - Capture API calls and responses
11. **Comprehensive Test Suite** - Multiple test scripts for different scenarios

**⚠️ IMPORTANT:** All these tools exist and work! Use them for full autonomy!

---

## 🛠️ Available Tools

### 1. **SmartLoggingService** 📊

**Location:** `src/services/SmartLoggingService.js`

**What it does:**
- Intercepts ALL console.log/error/warn/info/debug calls
- Categorizes logs automatically (quote, labor, lineItems, database, api, error, debug)
- Exports to error server every 5 seconds
- Stores last 1000 logs in memory

**How to use:**
```javascript
// Already auto-started in development mode
// Logs are automatically exported to:
// - http://localhost:4000/smart-logs
// - error_logs/smart_logs_latest.json
```

**AI can read logs:**
```bash
# Via HTTP
curl http://localhost:4000/smart-logs

# Via file
cat error_logs/smart_logs_latest.json
```

---

### 2. **Error Server** 🖥️

**Location:** `server.js`

**What it does:**
- Receives logs from frontend
- Stores in `error_logs/` directory
- Provides HTTP endpoints for AI access
- Manages smart logs and error logs

**Endpoints:**
```
GET  /health                    - Server health check
GET  /error_logs/latest.json    - Latest error logs
POST /log-error                 - Log new error
POST /export-smart-logs         - Export smart logs
GET  /smart-logs                - Get smart logs
```

**How to start:**
```bash
# Terminal 1: Start error server
npm run dev-error-server
# or
node server.js

# Runs on http://localhost:4000
```

**AI can check health:**
```bash
curl http://localhost:4000/health
```

---

### 3. **Full Auto Test** 🤖

**Location:** `devtools/full_auto_quote_labor_test.js`

**What it does:**
- Starts servers automatically
- Launches browser with Playwright
- Logs into app automatically
- Creates test quote with labor
- Captures all logs
- Analyzes execution flow
- Generates detailed report
- Cleans up automatically

**How to run:**
```bash
# Option 1: Via batch file
devtools\RUN_FULL_AUTO_TEST.bat

# Option 2: Direct
node devtools/full_auto_quote_labor_test.js
```

**Output:**
- `devtools/full_auto_test_results.json` - Complete results
- `error_logs/smart_logs_latest.json` - All console logs

**AI can read results:**
```javascript
const results = require('./devtools/full_auto_test_results.json');

if (!results.testPassed) {
  console.log('Issue:', results.analysis);
  // Apply fix based on analysis
}
```

---

### 4. **SQL Executor** 🗄️

**Location:** `devtools/sqlExecutor.js`

**What it does:**
- Executes SQL queries against Supabase
- Provides schema inspection
- Requires approval for safety
- Logs all queries

**Functions:**
```javascript
const sql = require('./devtools/sqlExecutor');

// Get database schema
await sql.getDatabaseSchema({ table: 'work_orders' });

// Get table row count
await sql.getTableRowCount({ table: 'work_orders' });

// Get recent records
await sql.getRecentRecords({ 
  table: 'work_orders', 
  limit: 10,
  orderBy: 'created_at'
});

// Execute custom query (read-only)
await sql.executeSQL({
  sql: 'SELECT * FROM work_orders WHERE status = \'quote\' LIMIT 5',
  approved: true
});

// Execute write query (requires explicit approval)
await sql.executeSQL({
  sql: 'INSERT INTO work_order_line_items (...)',
  approved: true,
  readOnly: false
});
```

**AI can use via command line:**
```bash
node -e "const sql = require('./devtools/sqlExecutor'); sql.getDatabaseSchema({table: 'work_orders'}).then(console.log)"
```

---

### 5. **Read Smart Logs** 📖

**Location:** `devtools/read_smart_logs.js`

**What it does:**
- Filters smart logs by category
- Exports to JSON for AI analysis
- Provides summary statistics

**How to use:**
```bash
# Read all logs
node devtools/read_smart_logs.js all

# Read labor logs only
node devtools/read_smart_logs.js labor

# Read quote logs only
node devtools/read_smart_logs.js quote

# Read line items logs
node devtools/read_smart_logs.js lineItems

# Read database logs
node devtools/read_smart_logs.js database

# Read error logs
node devtools/read_smart_logs.js error
```

**Output:**
- `devtools/smart_logs_[category].json`

---

### 6. **AI Analyze Quote Labor** 🔍

**Location:** `devtools/ai_analyze_quote_labor.js`

**What it does:**
- Analyzes smart logs for labor line item issues
- Checks 9 execution flow checkpoints
- Identifies root cause
- Suggests fixes

**How to use:**
```bash
node devtools/ai_analyze_quote_labor.js
```

**Output:**
- Console: Detailed analysis
- `devtools/labor_analysis_report.json` - Full report

**Execution flow checkpoints:**
1. laborRows found?
2. laborRows empty?
3. Labor conversion called?
4. laborQuoteItems created?
5. laborQuoteItems empty?
6. Combined items include labor?
7. saveQuoteItems called?
8. Database INSERT attempted?
9. Database INSERT successful?

---

### 7. **UI Interaction Controller** 🎮

**Location:** `devtools/uiInteractionController.js`

**What it does:**
- Enables AI to interact with frontend like a human QA tester
- Click buttons, links, and elements
- Type into input fields
- Navigate between pages
- Verify DOM state
- Capture screenshots
- Detect visual changes
- **Action-Outcome Monitoring** - Knows if actions actually worked!

**Key Features:**
```javascript
const { getBrowser, click, type, navigate, verifyElement } = require('./uiInteractionController');

// Get browser instance (reuses existing or creates new)
const { browser, page } = await getBrowser();

// Click with outcome monitoring
const result = await click(page, 'button:has-text("Create Quote")', {
  waitForNavigation: true,
  expectElement: 'input[placeholder*="HVAC"]'
});

// Type into fields
await type(page, 'input[placeholder*="HVAC"]', 'Test Quote');

// Navigate
await navigate(page, '/quotes');

// Verify element exists
const exists = await verifyElement(page, 'button:has-text("Save")');
```

**Shared Browser Instance:**
- Reuses browser across multiple operations
- Faster than launching new browser each time
- Maintains session state

---

### 8. **Action-Outcome Monitor** 🔬

**Location:** `devtools/actionOutcomeMonitor.js`

**What it does:**
- **Gives AI "senses" to know if actions actually worked!**
- Monitors action outcomes
- Provides reasoning about failures
- Suggests fixes based on evidence

**The Problem It Solves:**
```
Before: AI clicks button → moves to next step (no verification)
After:  AI clicks button → monitors outcome → reasons about what happened
```

**How to use:**
```javascript
const { testAction } = require('./actionOutcomeMonitor');

const result = await testAction(page, {
  label: 'Click Create Quote Button',
  action: async (page) => {
    await page.click('button:has-text("Create Quote")');
  },
  expectations: {
    urlChange: true,
    elementAppears: 'input[placeholder*="HVAC"]',
    waitAfter: 2000
  }
});

console.log(result.success);      // true/false
console.log(result.reasoning);    // "Modal opened successfully"
console.log(result.suggestions);  // ["Check if modal is visible", ...]
console.log(result.evidence);     // {domChanged: true, networkActivity: true, ...}
```

**Evidence Captured:**
- DOM changes
- Network activity
- Console errors
- Visual changes
- Expected elements present/absent
- Unexpected behavior

---

### 9. **Perception Engine** 👁️

**Location:** `devtools/perceptionEngine.js`

**What it does:**
- Enhanced action execution with full perception
- Combines action-outcome monitoring with additional context
- Captures screenshots during actions
- Monitors network events
- Tracks timing and duration

**How to use:**
```javascript
const { executeWithPerception } = require('./perceptionEngine');

const result = await executeWithPerception(page, {
  label: 'Save Quote',
  action: async (page) => {
    await page.click('button:has-text("Save")');
  },
  expectations: {
    networkActivity: true,
    elementDisappears: '.modal'
  }
});

// Enhanced result includes:
// - All action-outcome data
// - Screenshot path
// - Network events
// - Timing data
```

---

### 10. **Debug Frontend** 🐛

**Location:** `devtools/debugFrontend.js`

**What it does:**
- Captures ACTUAL API calls and responses
- Shows exactly what frontend sends to API
- Monitors Supabase requests
- Logs console errors in real-time

**How to use:**
```bash
node devtools/debugFrontend.js
```

**What it captures:**
```
📤 REQUEST: POST https://...supabase.co/rest/v1/work_orders
   Body: {"title":"Test Quote","customer_id":"123",...}

📥 RESPONSE: 201 https://...supabase.co/rest/v1/work_orders
   Body: {"id":"456","title":"Test Quote",...}

❌ CONSOLE ERROR: Failed to save: customer_id is required
```

**Perfect for:**
- Debugging API issues
- Seeing what data is actually sent
- Finding silent failures
- Tracking network errors

---

### 11. **Comprehensive Test Scripts** 🧪

**Multiple test scripts for different scenarios:**

#### **realComprehensiveTest.js**
- Tests if data ACTUALLY displays on each page
- Checks customers, employees, timesheets, invoices, etc.
- Takes screenshots of each page
- Reports what data exists vs missing

#### **comprehensiveTest.js**
- Full feature testing
- Tests all major workflows
- Captures detailed results

#### **deepFunctionalTest.js**
- Deep testing of specific features
- More detailed than comprehensive test

#### **verifiedTest.js**
- Verified working test scenarios
- Known good test cases

**How to use:**
```bash
node devtools/realComprehensiveTest.js
node devtools/comprehensiveTest.js
node devtools/deepFunctionalTest.js
```

---

## 🚀 Full Autonomous Workflow

### **Step 1: Start Servers**

```bash
# Terminal 1: Error server
npm run dev-error-server

# Terminal 2: Frontend
npm run dev-main
```

**AI can check if running:**
```bash
curl http://localhost:4000/health
curl http://localhost:3000
```

---

### **Step 2: Run Full Auto Test**

```bash
node devtools/full_auto_quote_labor_test.js
```

**AI waits for completion, then reads:**
```bash
cat devtools/full_auto_test_results.json
```

---

### **Step 3: Analyze Results**

```javascript
const results = require('./devtools/full_auto_test_results.json');

if (!results.testPassed) {
  // Check analysis
  const analysis = results.analysis;
  
  if (analysis.laborRowsEmpty) {
    console.log('Root cause: laborRows is empty');
    console.log('Fix: Check how laborRows is populated in QuoteBuilder.js');
  }
  
  if (analysis.laborConversionCalled === false) {
    console.log('Root cause: Conversion function not called');
    console.log('Fix: Ensure convertLaborRowsToQuoteItems is invoked');
  }
  
  // Read detailed logs
  const logs = results.logs.labor;
  console.log('Labor logs:', logs);
}
```

---

### **Step 4: Apply Fix**

```javascript
// AI edits the file
// Example: Fix laborRows population in QuoteBuilder.js

// Read current code
const code = await readFile('src/components/QuoteBuilder.js');

// Apply fix
const fixedCode = code.replace(
  'const laborRows = [];',
  'const laborRows = laborTableRef.current?.getLaborRows() || [];'
);

// Write back
await writeFile('src/components/QuoteBuilder.js', fixedCode);
```

---

### **Step 5: Re-test**

```bash
node devtools/full_auto_quote_labor_test.js
```

---

### **Step 6: Verify**

```javascript
const newResults = require('./devtools/full_auto_test_results.json');

if (newResults.testPassed) {
  console.log('✅ FIXED! Test passes!');
  
  // Commit
  await runCommand('git add .');
  await runCommand('git commit -m "Fix: Labor line items now saving correctly"');
  await runCommand('git push origin master');
} else {
  console.log('❌ Still failing. Analyzing...');
  // Iterate
}
```

---

## 📁 Key Files & Directories

### **Frontend Services**
- `src/services/SmartLoggingService.js` - Log capture
- `src/services/AIDevToolsService.js` - AI integration
- `src/services/DevToolsService.js` - System diagnostics

### **Backend**
- `server.js` - Error logging server

### **Dev Tools**
- `devtools/full_auto_quote_labor_test.js` - Full auto test
- `devtools/sqlExecutor.js` - Database access
- `devtools/read_smart_logs.js` - Log filtering
- `devtools/ai_analyze_quote_labor.js` - Log analysis

### **Output**
- `error_logs/smart_logs_latest.json` - Latest logs
- `devtools/full_auto_test_results.json` - Test results
- `devtools/labor_analysis_report.json` - Analysis report

### **Documentation**
- `devtools/README.md` - General dev tools guide
- `devtools/README_AUTO_TESTING.md` - Auto testing guide
- `🤖_AI_AUTONOMY_ASSESSMENT.md` - AI capabilities
- `🎯_FINAL_ANSWER_CAN_I_BE_AUTONOMOUS.md` - Summary

---

## 🎯 Common Tasks

### **Task: Debug Labor Line Items Issue**

```bash
# 1. Start servers
npm run dev-error-server &
npm run dev-main &

# 2. Run test
node devtools/full_auto_quote_labor_test.js

# 3. Analyze
node devtools/ai_analyze_quote_labor.js

# 4. Read results
cat devtools/full_auto_test_results.json

# 5. Apply fix (AI edits QuoteBuilder.js)

# 6. Re-test
node devtools/full_auto_quote_labor_test.js

# 7. Verify and commit
```

---

### **Task: Check Database Schema**

```bash
node -e "const sql = require('./devtools/sqlExecutor'); sql.getDatabaseSchema().then(r => console.log(r.result))"
```

---

### **Task: Query Work Orders**

```bash
node -e "const sql = require('./devtools/sqlExecutor'); sql.executeSQL({sql: 'SELECT id, work_order_number, status, total_amount FROM work_orders ORDER BY created_at DESC LIMIT 10', approved: true}).then(r => console.log(r.result))"
```

---

### **Task: Read Live Logs**

```bash
# Get latest smart logs
curl http://localhost:4000/smart-logs | jq .

# Filter by category
node devtools/read_smart_logs.js labor
cat devtools/smart_logs_labor.json
```

---

## ⚙️ Configuration

### **Database Credentials**
**Location:** `devtools/sqlExecutor.js`

```javascript
const DB_CONFIG = {
  host: 'aws-0-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!'
};
```

### **Test Credentials**
**Location:** `devtools/full_auto_quote_labor_test.js`

```javascript
const CONFIG = {
  frontendUrl: 'http://localhost:3000',
  errorServerUrl: 'http://localhost:4000',
  testEmail: 'brad@ghvac.com',
  testPassword: 'Alphaecho19!',
  // ... timing configs
};
```

---

## 🚨 Troubleshooting

### **Servers not running**
```bash
# Check ports
netstat -ano | findstr :3000
netstat -ano | findstr :4000

# Start if needed
npm run dev-error-server
npm run dev-main
```

### **Playwright not installed**
```bash
npm install --save-dev playwright
npx playwright install chromium
```

### **Can't read test results**
```bash
# Check if file exists
dir devtools\full_auto_test_results.json

# If not, test hasn't run yet
node devtools/full_auto_quote_labor_test.js
```

### **Database connection fails**
```bash
# Test connection
node -e "const sql = require('./devtools/sqlExecutor'); sql.getDatabaseSchema().then(console.log)"
```

---

## 🎉 Ready to Go!

**AI is now ready to work autonomously!**

**Next steps:**
1. Start servers
2. Run tests
3. Read results
4. Apply fixes
5. Re-test
6. Commit

**Let's fix some bugs!** 🚀

