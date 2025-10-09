# 🤖 AI Re-Entry Prompt

**Use this prompt when starting a new chat session to reload context**

---

## 📋 Quick Re-Entry Prompt

```
Load context from the AI DevTools persistent memory.

Read these files before proceeding:
- /AIDevTools/HOW_TO_USE_AI_TOOLS.md
- /AIDevTools/PHASE_LOG.md
- /AIDevTools/AUTONOMOUS_SYSTEM_SUMMARY.md

Summarize the current status of the AI teammate, list all tools and their states, then continue from the last unfinished phase in PHASE_LOG.md.

Do not assume; verify by reading files.
```

---

## 🔍 Detailed Re-Entry Workflow

### Step 1: Load Documentation
```
Read the following files to understand the system:

1. /AIDevTools/PHASE_LOG.md
   - Shows all completed phases
   - Lists all files created
   - Documents all commands implemented
   - Shows current system status

2. /AIDevTools/HOW_TO_USE_AI_TOOLS.md
   - Complete usage guide
   - Command reference
   - Troubleshooting guide

3. /AIDevTools/AUTONOMOUS_SYSTEM_SUMMARY.md
   - System architecture
   - File inventory
   - Quick start guide
```

### Step 2: Check System Status
```bash
# Validate entire system
node devtools/systemValidator.js

# Check server health
node devtools/healthMonitor.js check

# View session state
node -e "console.log(require('./devtools/sessionState').getState())"
```

### Step 3: Review Recent Activity
```bash
# View latest test results
cat devtools/test_results/latest.json

# View perception report
node -e "console.log(require('./devtools/perceptionEngine').generateReport())"

# View session statistics
node -e "console.log(require('./devtools/sessionState').getStatistics())"
```

### Step 4: Determine Next Actions

Based on PHASE_LOG.md:
- ✅ If all phases complete: Run tests to verify system
- ⏳ If phase in progress: Continue from last step
- ❌ If errors found: Review and fix issues

### Step 5: Execute

```bash
# If system is healthy, run autonomous tests
node devtools/autoTestRunner.js

# If servers not running, start them
node devtools/healthMonitor.js start

# If validation fails, review recommendations
cat devtools/validation_report.json
```

---

## 📊 Expected System State

### All Phases Should Be Complete ✅

- **Phase 0:** Core Infrastructure ✅
- **Phase 1:** System Memory and Health ✅
- **Phase 2:** Perception and Reasoning ✅
- **Phase 3:** Autonomy and Persistence ✅
- **Phase 4:** Documentation and Self-Awareness ✅
- **Phase 5:** Validation ✅

### Files Should Exist

**Core DevTools (9 files):**
- devtools/commandExecutor.js
- devtools/sessionState.js
- devtools/healthMonitor.js
- devtools/perceptionEngine.js
- devtools/autoTestRunner.js
- devtools/systemValidator.js
- devtools/uiInteractionController.js
- devtools/actionOutcomeMonitor.js
- devtools/local_logger_server.js

**Documentation (4 files):**
- AIDevTools/PHASE_LOG.md
- AIDevTools/HOW_TO_USE_AI_TOOLS.md
- AIDevTools/AUTONOMOUS_SYSTEM_SUMMARY.md
- AIDevTools/AI_REENTRY_PROMPT.md

**Startup (1 file):**
- START_AUTONOMOUS_AI.bat

### Commands Should Be Available (20 total)

**Phase 1 (8):** check_health, restart_service, save_session_state, get_session_state, record_scenario_result, get_scenario_stats, start_health_monitor, stop_health_monitor

**Phase 2 (4):** get_perception_report, get_perception_history, get_failure_analysis, clear_perception_history

**Phase 3 (3):** run_full_auto, run_scenario, get_test_results

---

## 🎯 Common Tasks After Re-Entry

### Task 1: Verify System Health
```bash
node devtools/systemValidator.js
```

### Task 2: Start Servers (if not running)
```bash
node devtools/healthMonitor.js start
```

### Task 3: Run Tests
```bash
node devtools/autoTestRunner.js
```

### Task 4: Review Results
```bash
cat devtools/test_results/latest.json
```

### Task 5: Analyze Failures (if any)
```javascript
const perceptionEngine = require('./devtools/perceptionEngine');
console.log(perceptionEngine.analyzeFailurePatterns());
```

### Task 6: Check Session State
```javascript
const sessionState = require('./devtools/sessionState');
console.log(sessionState.getState());
```

---

## 🔧 Troubleshooting After Re-Entry

### If System Validation Fails
```bash
# Check what's missing
node devtools/systemValidator.js

# Review recommendations
cat devtools/validation_report.json

# Fix issues based on recommendations
```

### If Servers Won't Start
```bash
# Check if ports are in use
netstat -ano | findstr :4000

# Kill processes if needed
taskkill /F /PID <PID>

# Restart
node devtools/healthMonitor.js start
```

### If Session State Corrupted
```bash
# Clear and start fresh
node -e "require('./devtools/sessionState').clearSession()"
```

### If Tests Failing
```bash
# Check perception report
node -e "console.log(require('./devtools/perceptionEngine').generateReport())"

# Review failure patterns
node -e "console.log(require('./devtools/perceptionEngine').analyzeFailurePatterns())"

# Check session statistics
node -e "console.log(require('./devtools/sessionState').getStatistics())"
```

---

## 📝 Update Documentation

After making changes:

1. **Update PHASE_LOG.md** with new changes
2. **Update session state** with results
3. **Save perception data** for analysis
4. **Document fixes** in session state

---

## 🚀 Quick Commands Reference

```bash
# System validation
node devtools/systemValidator.js

# Health check
node devtools/healthMonitor.js check

# Start servers
node devtools/healthMonitor.js start

# Run all tests
node devtools/autoTestRunner.js

# Run specific scenario
node devtools/autoTestRunner.js --scenario=quoteFlow

# View session state
type devtools\session_state.json

# View test results
type devtools\test_results\latest.json

# View validation report
type devtools\validation_report.json
```

---

## 💡 Pro Tips for AI Assistants

1. **Always validate first** - Run systemValidator before making changes
2. **Check session state** - Understand what was done previously
3. **Review perception data** - Learn from past failures
4. **Update documentation** - Keep PHASE_LOG.md current
5. **Save state frequently** - Don't lose progress
6. **Use auto-fix** - Let the system heal itself
7. **Verify fixes** - Re-run tests after changes

---

## 🎉 Expected Outcome

After re-entry, you should:

✅ Understand the complete system architecture  
✅ Know all available commands and tools  
✅ See current system health status  
✅ Know what was done previously  
✅ Be ready to continue work or run tests  

---

**Use this prompt at the start of every new chat session to maintain continuity.**

**Last Updated:** 2025-10-09  
**Version:** 1.0.0

