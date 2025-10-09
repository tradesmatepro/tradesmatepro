# 🤖 How to Use AI Developer Tools

**TradeMate Pro - Autonomous AI Teammate Guide**

This guide explains how to use the AI Developer Tools system as a fully autonomous AI teammate capable of testing, fixing, and maintaining the TradeMate Pro application.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Starting All Servers](#starting-all-servers)
3. [Running Tests](#running-tests)
4. [Monitoring and Health](#monitoring-and-health)
5. [Session State Management](#session-state-management)
6. [Perception and Analysis](#perception-and-analysis)
7. [Command Reference](#command-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- TradeMate Pro repository cloned
- Dependencies installed (`npm install`)
- Playwright installed (`npx playwright install`)

### 30-Second Start
```bash
# 1. Start health monitor (starts all servers)
node devtools/healthMonitor.js start

# 2. Run autonomous tests
node devtools/autoTestRunner.js

# 3. View results
cat devtools/test_results/latest.json
```

---

## 🖥️ Starting All Servers

### Method 1: Health Monitor (Recommended)
```bash
node devtools/healthMonitor.js start
```

This starts:
- Error Logger Server (port 4000)
- Command Executor (file watcher)
- Health monitoring (60s intervals)

### Method 2: Manual Start
```bash
# Terminal 1: Error Logger
node devtools/local_logger_server.js

# Terminal 2: Command Executor
node devtools/commandExecutor.js

# Terminal 3: Health Monitor
node devtools/healthMonitor.js start
```

### Verify Servers Running
```bash
node devtools/healthMonitor.js check
```

Expected output:
```
✅ Error Logger Server: HEALTHY
✅ Command Executor: HEALTHY
⚪ Main App: DISABLED
```

---

## 🧪 Running Tests

### Run All Scenarios (Autonomous)
```bash
node devtools/autoTestRunner.js
```

This will:
1. Check system health
2. Load session state
3. Run all test scenarios
4. Auto-fix failures
5. Retry after fixes
6. Generate report
7. Save results

### Run Specific Scenario
```bash
node devtools/autoTestRunner.js --scenario=quoteFlow
```

### Disable Auto-Fix
```bash
node devtools/autoTestRunner.js --no-auto-fix
```

### Available Scenarios
- `quoteFlow` - Create and send quote
- `invoiceFlow` - View and manage invoices
- `jobStatusTransition` - Test job status changes
- `dashboardLoad` - Load dashboard
- `onHoldModal` - Test OnHold modal
- `completePipeline` - Quote → Invoice pipeline

---

## 🏥 Monitoring and Health

### Check Health Status
```bash
node devtools/healthMonitor.js check
```

### Start Health Monitoring
```bash
node devtools/healthMonitor.js start
```

Monitors all servers every 60 seconds and auto-restarts on failure.

### Stop Health Monitoring
```bash
node devtools/healthMonitor.js stop
```

### View Server Status
```javascript
const healthMonitor = require('./devtools/healthMonitor');
const status = healthMonitor.getStatus();
console.log(status);
```

---

## 💾 Session State Management

### View Current Session
```javascript
const sessionState = require('./devtools/sessionState');
const state = sessionState.getState();
console.log(state);
```

### Get Statistics
```javascript
const stats = sessionState.getStatistics();
console.log(stats);
// {
//   totalRuns: 10,
//   successfulRuns: 8,
//   failedRuns: 2,
//   totalRetries: 3,
//   averageRunTime: 5000
// }
```

### Get Scenario History
```javascript
const history = sessionState.getScenarioHistory('quoteFlow');
console.log(history);
```

### Clear Session (Start Fresh)
```javascript
sessionState.clearSession();
```

### Session Files
- Current state: `devtools/session_state.json`
- History: `devtools/session_history/session_*.json`

---

## 🔍 Perception and Analysis

### Get Perception Report
```javascript
const perceptionEngine = require('./devtools/perceptionEngine');
const report = perceptionEngine.generateReport();
console.log(report);
```

### View Action History
```javascript
const history = perceptionEngine.getHistory(10); // Last 10 actions
console.log(history);
```

### Analyze Failure Patterns
```javascript
const analysis = perceptionEngine.analyzeFailurePatterns();
console.log(analysis);
// {
//   totalFailures: 5,
//   patterns: {
//     selectorIssues: 2,
//     networkIssues: 1,
//     consoleErrors: 2,
//     timeouts: 0
//   },
//   recommendations: [...]
// }
```

### Get Success Rate
```javascript
const successRate = perceptionEngine.getSuccessRate();
console.log(`Success rate: ${successRate.toFixed(1)}%`);
```

---

## 📚 Command Reference

### Health Commands
```javascript
// Via command executor
{
  "command": "check_health",
  "params": {}
}

{
  "command": "restart_service",
  "params": { "service": "errorLogger" }
}

{
  "command": "start_health_monitor",
  "params": { "intervalMs": 60000 }
}
```

### Session Commands
```javascript
{
  "command": "get_session_state",
  "params": {}
}

{
  "command": "save_session_state",
  "params": {}
}

{
  "command": "record_scenario_result",
  "params": {
    "scenario": "quoteFlow",
    "result": "pass",
    "duration": 5000
  }
}

{
  "command": "get_scenario_stats",
  "params": { "scenario": "quoteFlow" }
}
```

### Perception Commands
```javascript
{
  "command": "get_perception_report",
  "params": {}
}

{
  "command": "get_perception_history",
  "params": { "limit": 10 }
}

{
  "command": "get_failure_analysis",
  "params": {}
}
```

### Test Commands
```javascript
{
  "command": "run_full_auto",
  "params": { "autoFix": true }
}

{
  "command": "run_scenario",
  "params": { "scenario": "quoteFlow" }
}

{
  "command": "get_test_results",
  "params": {}
}
```

---

## 🔧 Troubleshooting

### Servers Won't Start
```bash
# Check if ports are in use
netstat -ano | findstr :4000

# Kill process if needed
taskkill /F /PID <PID>

# Restart health monitor
node devtools/healthMonitor.js start
```

### Tests Failing
```bash
# 1. Check system health
node devtools/healthMonitor.js check

# 2. View perception report
node -e "console.log(require('./devtools/perceptionEngine').generateReport())"

# 3. Check session state
node -e "console.log(require('./devtools/sessionState').getState())"

# 4. View failure analysis
node -e "console.log(require('./devtools/perceptionEngine').analyzeFailurePatterns())"
```

### Session State Corrupted
```bash
# Clear and start fresh
node -e "require('./devtools/sessionState').clearSession()"
```

### View Logs
```bash
# Error logs
cat devtools/logs/console-*.jsonl

# Test results
cat devtools/test_results/latest.json

# Session history
ls devtools/session_history/
```

---

## 🎯 AI Self-Operation Guide

### For AI Assistants (Claude/GPT)

When you start a new chat session:

1. **Load Context:**
   ```
   Read /AIDevTools/PHASE_LOG.md
   Read /AIDevTools/HOW_TO_USE_AI_TOOLS.md
   Read /AIDevTools/IMPLEMENTATION_SUMMARY.md
   ```

2. **Check System Status:**
   ```bash
   node devtools/healthMonitor.js check
   ```

3. **Review Session State:**
   ```javascript
   const sessionState = require('./devtools/sessionState');
   console.log(sessionState.getState());
   ```

4. **Continue From Last Phase:**
   - Check PHASE_LOG.md for last completed phase
   - Resume unfinished work
   - Run tests to verify system

5. **Run Autonomous Tests:**
   ```bash
   node devtools/autoTestRunner.js
   ```

6. **Analyze Results:**
   ```javascript
   const perceptionEngine = require('./devtools/perceptionEngine');
   console.log(perceptionEngine.generateReport());
   ```

7. **Apply Fixes:**
   - Review failure analysis
   - Apply recommended fixes
   - Re-run tests
   - Update PHASE_LOG.md

---

## 📊 Understanding Reports

### Test Report Structure
```json
{
  "status": "success",
  "summary": {
    "total": 4,
    "passed": 3,
    "failed": 1,
    "successRate": 75,
    "duration": 45000
  },
  "scenarios": [...],
  "sessionState": {...},
  "perceptionReport": {...}
}
```

### Perception Report Structure
```json
{
  "totalActions": 50,
  "successRate": 85,
  "recentHistory": [...],
  "failureAnalysis": {
    "totalFailures": 7,
    "patterns": {...},
    "recommendations": [...]
  }
}
```

---

## 🚀 Next Steps

1. **Start servers:** `node devtools/healthMonitor.js start`
2. **Run tests:** `node devtools/autoTestRunner.js`
3. **Review results:** `cat devtools/test_results/latest.json`
4. **Analyze failures:** Check perception report
5. **Apply fixes:** Use recommendations
6. **Re-test:** Verify fixes work
7. **Update docs:** Record changes in PHASE_LOG.md

---

**Last Updated:** 2025-10-09
**Version:** 2.1.0

---

## 📸 Screenshot Analysis (NEW!)

The AI teammate can now "see" and analyze screenshots using local OCR.

### Start Screenshot API Server

```bash
node devtools/screenshotApiServer.js
```

Server runs on **http://localhost:5050**

### Endpoints

**Save Screenshot:**
```bash
POST http://localhost:5050/ai/analyze-screenshot
Body: {
  "image_base64": "<base64 data>",
  "context": "quote-test"
}
Response: { "status": "ok", "saved": "path/to/file.png" }
```

**Analyze Screenshot:**
```bash
POST http://localhost:5050/ai/analyze-screenshot/local
Body: {
  "image_base64": "<base64 data>",
  "context": "quote-test"
}
Response: {
  "status": "ok",
  "analysis": {
    "summary": "Login page detected",
    "extractedText": "Email Password Sign In...",
    "elements": [
      {"type": "input", "text": "email"},
      {"type": "button", "text": "Sign In"}
    ]
  }
}
```

**Get Analysis Report:**
```bash
GET http://localhost:5050/ai/analyze-screenshot/report?limit=10
Response: {
  "status": "ok",
  "count": 10,
  "analyses": [...]
}
```

### How It Works

1. **Test captures screenshot** → Saved as PNG
2. **Screenshot sent to local API** → Base64 encoded
3. **Tesseract.js performs OCR** → Extracts text
4. **AI detects UI elements** → Buttons, links, alerts
5. **Structured summary generated** → JSON format
6. **Results logged** → PHASE_LOG.md + visual_analysis_results.json

### Benefits

✅ **No cloud uploads** - All processing local
✅ **No per-image costs** - Free OCR
✅ **AI can "see"** - Makes decisions based on screenshots
✅ **Automatic analysis** - Integrated into tests
✅ **Persistent results** - Saved for review

---

**Last Updated:** 2025-10-09
**Version:** 2.1.0
**Status:** Production Ready

