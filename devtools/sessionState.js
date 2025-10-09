/**
 * Session State Manager
 * 
 * Maintains persistent state across AI DevTools sessions
 * Enables the AI teammate to remember what it was doing and resume work
 * 
 * Features:
 * - Persistent storage of test runs, results, and retry counts
 * - Session recovery after crashes or restarts
 * - Historical tracking of all test scenarios
 * - Automatic state saving after each significant action
 */

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'session_state.json');
const HISTORY_DIR = path.join(__dirname, 'session_history');

// Ensure history directory exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

/**
 * Default session state structure
 */
const DEFAULT_STATE = {
  version: '1.0.0',
  sessionId: null,
  startedAt: null,
  lastUpdated: null,
  currentScenario: null,
  lastScenario: null,
  lastResult: null,
  retryCount: 0,
  maxRetries: 3,
  scenarios: {},
  servers: {
    errorLogger: { status: 'unknown', lastCheck: null },
    commandExecutor: { status: 'unknown', lastCheck: null },
    websocketDebug: { status: 'unknown', lastCheck: null },
    mainApp: { status: 'unknown', lastCheck: null }
  },
  statistics: {
    totalRuns: 0,
    successfulRuns: 0,
    failedRuns: 0,
    totalRetries: 0,
    averageRunTime: 0
  },
  errors: [],
  fixes: []
};

/**
 * Session State Manager Class
 */
class SessionStateManager {
  constructor() {
    this.state = this.loadState();
    this.autoSaveEnabled = true;
    this.saveInterval = null;
  }

  /**
   * Load state from disk or create new
   */
  loadState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        const state = JSON.parse(data);
        console.log('✅ Session state loaded from disk');
        console.log(`   Session ID: ${state.sessionId}`);
        console.log(`   Last scenario: ${state.lastScenario || 'none'}`);
        console.log(`   Last result: ${state.lastResult || 'none'}`);
        return state;
      }
    } catch (err) {
      console.warn('⚠️ Failed to load session state:', err.message);
    }

    // Create new session
    const newState = {
      ...DEFAULT_STATE,
      sessionId: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    console.log('🆕 Created new session state');
    console.log(`   Session ID: ${newState.sessionId}`);
    
    this.saveState(newState);
    return newState;
  }

  /**
   * Save state to disk
   */
  saveState(state = this.state) {
    try {
      state.lastUpdated = new Date().toISOString();
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
      
      // Also save to history
      const historyFile = path.join(
        HISTORY_DIR,
        `session_${state.sessionId}_${Date.now()}.json`
      );
      fs.writeFileSync(historyFile, JSON.stringify(state, null, 2), 'utf8');
      
      return true;
    } catch (err) {
      console.error('❌ Failed to save session state:', err.message);
      return false;
    }
  }

  /**
   * Start auto-save interval
   */
  startAutoSave(intervalMs = 30000) {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
    }
    
    this.saveInterval = setInterval(() => {
      if (this.autoSaveEnabled) {
        this.saveState();
        console.log('💾 Auto-saved session state');
      }
    }, intervalMs);
    
    console.log(`✅ Auto-save enabled (every ${intervalMs / 1000}s)`);
  }

  /**
   * Stop auto-save
   */
  stopAutoSave() {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
      console.log('🛑 Auto-save disabled');
    }
  }

  /**
   * Update current scenario
   */
  setCurrentScenario(scenarioName) {
    this.state.currentScenario = scenarioName;
    this.state.lastUpdated = new Date().toISOString();
    
    if (!this.state.scenarios[scenarioName]) {
      this.state.scenarios[scenarioName] = {
        name: scenarioName,
        runs: [],
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
        lastRun: null,
        lastResult: null
      };
    }
    
    this.saveState();
    console.log(`📝 Current scenario set to: ${scenarioName}`);
  }

  /**
   * Record scenario result
   */
  recordScenarioResult(scenarioName, result, duration = 0) {
    const scenario = this.state.scenarios[scenarioName] || {
      name: scenarioName,
      runs: [],
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRun: null,
      lastResult: null
    };

    const run = {
      timestamp: new Date().toISOString(),
      result: result, // 'pass', 'fail', 'error'
      duration: duration,
      retryCount: this.state.retryCount
    };

    scenario.runs.push(run);
    scenario.totalRuns++;
    scenario.lastRun = run.timestamp;
    scenario.lastResult = result;

    if (result === 'pass') {
      scenario.successfulRuns++;
      this.state.statistics.successfulRuns++;
    } else {
      scenario.failedRuns++;
      this.state.statistics.failedRuns++;
    }

    this.state.scenarios[scenarioName] = scenario;
    this.state.lastScenario = scenarioName;
    this.state.lastResult = result;
    this.state.statistics.totalRuns++;
    this.state.currentScenario = null;

    this.saveState();
    
    console.log(`📊 Recorded result for ${scenarioName}: ${result.toUpperCase()}`);
    console.log(`   Total runs: ${scenario.totalRuns}`);
    console.log(`   Success rate: ${((scenario.successfulRuns / scenario.totalRuns) * 100).toFixed(1)}%`);
  }

  /**
   * Increment retry count
   */
  incrementRetry() {
    this.state.retryCount++;
    this.state.statistics.totalRetries++;
    this.saveState();
    
    console.log(`🔄 Retry count: ${this.state.retryCount}/${this.state.maxRetries}`);
    return this.state.retryCount;
  }

  /**
   * Reset retry count
   */
  resetRetry() {
    this.state.retryCount = 0;
    this.saveState();
    console.log('🔄 Retry count reset');
  }

  /**
   * Check if max retries reached
   */
  isMaxRetriesReached() {
    return this.state.retryCount >= this.state.maxRetries;
  }

  /**
   * Update server status
   */
  updateServerStatus(serverName, status) {
    if (this.state.servers[serverName]) {
      this.state.servers[serverName].status = status;
      this.state.servers[serverName].lastCheck = new Date().toISOString();
      this.saveState();
    }
  }

  /**
   * Get server status
   */
  getServerStatus(serverName) {
    return this.state.servers[serverName] || { status: 'unknown', lastCheck: null };
  }

  /**
   * Record error
   */
  recordError(error) {
    this.state.errors.push({
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || null,
      scenario: this.state.currentScenario
    });
    
    // Keep only last 100 errors
    if (this.state.errors.length > 100) {
      this.state.errors = this.state.errors.slice(-100);
    }
    
    this.saveState();
  }

  /**
   * Record fix applied
   */
  recordFix(fix) {
    this.state.fixes.push({
      timestamp: new Date().toISOString(),
      description: fix.description || 'Unknown fix',
      scenario: this.state.currentScenario,
      success: fix.success || false
    });
    
    // Keep only last 100 fixes
    if (this.state.fixes.length > 100) {
      this.state.fixes = this.state.fixes.slice(-100);
    }
    
    this.saveState();
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return { ...this.state.statistics };
  }

  /**
   * Get scenario history
   */
  getScenarioHistory(scenarioName) {
    return this.state.scenarios[scenarioName] || null;
  }

  /**
   * Get all scenarios
   */
  getAllScenarios() {
    return { ...this.state.scenarios };
  }

  /**
   * Clear session (start fresh)
   */
  clearSession() {
    const newState = {
      ...DEFAULT_STATE,
      sessionId: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    this.state = newState;
    this.saveState();
    
    console.log('🗑️ Session cleared, new session started');
    console.log(`   Session ID: ${newState.sessionId}`);
  }
}

// Singleton instance
const sessionState = new SessionStateManager();

// Export singleton and class
module.exports = sessionState;
module.exports.SessionStateManager = SessionStateManager;

