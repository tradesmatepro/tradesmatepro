// Phase 3: Fix Loop Orchestrator - JSON Handoff Mode
import { FixExecutor } from "./fixExecutor";

// Simple core interface for browser environment
const devToolsCore = {
  addLog: (level, message, source) => {
    console.log(`[${level}] [${source}] ${message}`);
    
    // Add to global devLogger if available
    if (window.devLogger) {
      window.devLogger.addLog(level, message, source);
    }
  },
  getState: () => ({
    errors: window.__CAPTURED_ERRORS__ || []
  })
};

const executor = new FixExecutor(devToolsCore);

export async function runFixCycle() {
  devToolsCore.addLog("INFO", "🚀 Starting Fix Cycle (JSON Handoff Mode)", "system");
  
  const failures = collectIssues();
  devToolsCore.addLog("INFO", `📊 Found ${failures.length} issues to process`, "system");
  
  const results = [];

  for (const issue of failures) {
    devToolsCore.addLog("INFO", `🔧 Processing issue: ${issue.message}`, "system");
    const result = await executor.runFixLoop(issue);
    results.push(result);
  }

  window.__FIX_RESULTS__ = results;
  
  const proposalCount = results.reduce((sum, r) => sum + r.attempts.length, 0);
  devToolsCore.addLog("INFO", `🎯 Fix cycle complete: ${proposalCount} patch proposals created for ${results.length} issues`, "system");
  
  return results;
}

function collectIssues() {
  const results = [];
  const validatorResults = window.__VALIDATOR_RESULTS__ || [];
  const runtimeErrors = devToolsCore.getState().errors || [];

  // Collect validator failures
  validatorResults.forEach(v => {
    v.results.forEach(r => {
      if (!r.pass) {
        results.push({
          type: "validator",
          validator: v.validator,
          message: r.errors.join("; "),
          stack: null,
          id: r.id,
          title: r.title
        });
      }
    });
  });

  // Collect runtime errors
  runtimeErrors.forEach(e => {
    results.push({
      type: "runtime",
      validator: "runtime",
      message: e.message || e.toString(),
      stack: e.stack || null,
      id: `runtime-${Date.now()}`,
      title: "Runtime Error"
    });
  });

  devToolsCore.addLog("INFO", `📋 Collected ${results.length} issues (${results.filter(r => r.type === 'validator').length} validator, ${results.filter(r => r.type === 'runtime').length} runtime)`, "system");

  return results;
}

export function getFixHistory() {
  return executor.getHistory();
}

export function rollbackFix(fixId) {
  return executor.rollback(fixId);
}
