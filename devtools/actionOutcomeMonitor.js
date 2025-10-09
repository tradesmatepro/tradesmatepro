/**
 * Action-Outcome Monitor
 * 
 * The missing piece: Gives AI "senses" to know if actions actually worked!
 * 
 * Problem: AI clicks button → moves to next step (no verification)
 * Solution: AI clicks button → monitors outcome → reasons about what happened
 * 
 * This converts "blind task execution" into "observed reasoning"
 */

const fs = require('fs');
const path = require('path');

// Store action history for analysis
const actionHistory = [];
const MAX_HISTORY = 100;

/**
 * Test an action and verify its outcome
 * 
 * This is the core function that gives AI "senses"
 */
async function testAction(page, actionConfig) {
  const {
    label,
    action,
    expectations = {},
    timeout = 5000
  } = actionConfig;

  const result = {
    label,
    action,
    timestamp: new Date().toISOString(),
    success: false,
    evidence: {
      domChanged: false,
      networkActivity: false,
      consoleErrors: [],
      visualChange: false,
      expectedElements: {},
      unexpectedBehavior: []
    },
    reasoning: '',
    suggestions: []
  };

  // Capture state BEFORE action
  const stateBefore = await captureState(page);

  // Execute the action
  try {
    console.log(`🎬 Executing: ${label}`);
    await action(page);
    
    // Wait for potential async updates
    await page.waitForTimeout(expectations.waitAfter || 1000);
    
  } catch (err) {
    result.evidence.unexpectedBehavior.push({
      type: 'action_error',
      message: err.message,
      stack: err.stack
    });
    result.reasoning = `Action failed to execute: ${err.message}`;
    result.suggestions.push('Check if element exists and is clickable');
    result.suggestions.push('Verify selector is correct');
    result.suggestions.push('Check if element is covered by another element');
    
    console.log(`❌ Action failed: ${err.message}`);
    return result;
  }

  // Capture state AFTER action
  const stateAfter = await captureState(page);

  // Analyze what changed
  const analysis = analyzeChanges(stateBefore, stateAfter, expectations);
  result.evidence = { ...result.evidence, ...analysis };

  // Determine if action succeeded based on expectations
  const outcomeAnalysis = evaluateOutcome(result.evidence, expectations);
  result.success = outcomeAnalysis.success;
  result.reasoning = outcomeAnalysis.reasoning;
  result.suggestions = outcomeAnalysis.suggestions;

  // Log result
  if (result.success) {
    console.log(`✅ ${label} - SUCCESS`);
    console.log(`   Reasoning: ${result.reasoning}`);
  } else {
    console.log(`❌ ${label} - FAILED`);
    console.log(`   Reasoning: ${result.reasoning}`);
    console.log(`   Suggestions:`);
    result.suggestions.forEach(s => console.log(`     - ${s}`));
  }

  // Store in history
  actionHistory.push(result);
  if (actionHistory.length > MAX_HISTORY) {
    actionHistory.shift();
  }

  return result;
}

/**
 * Capture page state for comparison
 */
async function captureState(page) {
  const state = {
    url: page.url(),
    title: await page.title(),
    domSnapshot: await page.content(),
    visibleElements: [],
    consoleMessages: [],
    networkRequests: []
  };

  // Capture visible elements (for quick comparison)
  try {
    state.visibleElements = await page.evaluate(() => {
      const elements = [];
      document.querySelectorAll('button, a, input, select, [role="dialog"], .modal').forEach(el => {
        if (el.offsetParent !== null) { // visible check
          elements.push({
            tag: el.tagName,
            id: el.id,
            class: el.className,
            text: el.textContent?.substring(0, 50)
          });
        }
      });
      return elements;
    });
  } catch (err) {
    // Ignore errors in state capture
  }

  return state;
}

/**
 * Analyze what changed between before/after states
 */
function analyzeChanges(before, after, expectations) {
  const changes = {
    domChanged: false,
    networkActivity: false,
    urlChanged: false,
    titleChanged: false,
    newElementsAppeared: [],
    elementsDisappeared: [],
    consoleErrors: [],
    visualChange: false
  };

  // Check URL change
  if (before.url !== after.url) {
    changes.urlChanged = true;
    changes.domChanged = true;
  }

  // Check title change
  if (before.title !== after.title) {
    changes.titleChanged = true;
  }

  // Check DOM change (simple comparison)
  if (before.domSnapshot !== after.domSnapshot) {
    changes.domChanged = true;
    changes.visualChange = true;
  }

  // Check for new elements
  const beforeElements = new Set(before.visibleElements.map(e => `${e.tag}-${e.id}-${e.class}`));
  const afterElements = new Set(after.visibleElements.map(e => `${e.tag}-${e.id}-${e.class}`));
  
  after.visibleElements.forEach(el => {
    const key = `${el.tag}-${el.id}-${el.class}`;
    if (!beforeElements.has(key)) {
      changes.newElementsAppeared.push(el);
    }
  });

  before.visibleElements.forEach(el => {
    const key = `${el.tag}-${el.id}-${el.class}`;
    if (!afterElements.has(key)) {
      changes.elementsDisappeared.push(el);
    }
  });

  // Network activity (would need to be captured from page listeners)
  // For now, we infer from DOM changes
  changes.networkActivity = changes.domChanged;

  return changes;
}

/**
 * Evaluate if the outcome matches expectations
 */
function evaluateOutcome(evidence, expectations) {
  const result = {
    success: false,
    reasoning: '',
    suggestions: []
  };

  // If no expectations specified, just check if SOMETHING happened
  if (!expectations || Object.keys(expectations).length === 0) {
    if (evidence.domChanged || evidence.networkActivity) {
      result.success = true;
      result.reasoning = 'Action triggered changes (DOM updated or network activity detected)';
    } else {
      result.success = false;
      result.reasoning = 'Action did not trigger any observable changes - UI and network unchanged';
      result.suggestions.push('Check if click handler is attached to element');
      result.suggestions.push('Verify element is not disabled');
      result.suggestions.push('Check browser console for JavaScript errors');
      result.suggestions.push('Verify async operations are completing');
    }
    return result;
  }

  // Check specific expectations
  const checks = [];

  if (expectations.shouldNavigate !== undefined) {
    if (evidence.urlChanged === expectations.shouldNavigate) {
      checks.push({ passed: true, check: 'navigation' });
    } else {
      checks.push({ 
        passed: false, 
        check: 'navigation',
        expected: expectations.shouldNavigate ? 'URL to change' : 'URL to stay same',
        actual: evidence.urlChanged ? 'URL changed' : 'URL stayed same'
      });
    }
  }

  if (expectations.shouldShowModal !== undefined) {
    const modalAppeared = evidence.newElementsAppeared.some(el => 
      el.class?.includes('modal') || el.tag === 'DIALOG'
    );
    if (modalAppeared === expectations.shouldShowModal) {
      checks.push({ passed: true, check: 'modal' });
    } else {
      checks.push({ 
        passed: false, 
        check: 'modal',
        expected: expectations.shouldShowModal ? 'Modal to appear' : 'No modal',
        actual: modalAppeared ? 'Modal appeared' : 'No modal appeared'
      });
      if (expectations.shouldShowModal && !modalAppeared) {
        result.suggestions.push('Check if modal trigger is wired correctly');
        result.suggestions.push('Verify modal component is imported and rendered');
        result.suggestions.push('Check if modal state management is working');
      }
    }
  }

  if (expectations.shouldChangeDom !== undefined) {
    if (evidence.domChanged === expectations.shouldChangeDom) {
      checks.push({ passed: true, check: 'dom_change' });
    } else {
      checks.push({ 
        passed: false, 
        check: 'dom_change',
        expected: expectations.shouldChangeDom ? 'DOM to change' : 'DOM to stay same',
        actual: evidence.domChanged ? 'DOM changed' : 'DOM unchanged'
      });
    }
  }

  // Determine overall success
  const failedChecks = checks.filter(c => !c.passed);
  result.success = failedChecks.length === 0;

  // Build reasoning
  if (result.success) {
    result.reasoning = `All expectations met: ${checks.map(c => c.check).join(', ')}`;
  } else {
    result.reasoning = `Failed expectations: ${failedChecks.map(c => 
      `${c.check} (expected: ${c.expected}, actual: ${c.actual})`
    ).join('; ')}`;
    
    // Add generic suggestions if none added yet
    if (result.suggestions.length === 0) {
      result.suggestions.push('Review the action implementation');
      result.suggestions.push('Check browser console for errors');
      result.suggestions.push('Verify element selectors are correct');
    }
  }

  return result;
}

/**
 * Get action history for AI analysis
 */
function getActionHistory(limit = 10) {
  return actionHistory.slice(-limit);
}

/**
 * Get failed actions for debugging
 */
function getFailedActions() {
  return actionHistory.filter(a => !a.success);
}

/**
 * Clear action history
 */
function clearHistory() {
  actionHistory.length = 0;
}

/**
 * Generate AI-friendly report
 */
function generateReport() {
  const total = actionHistory.length;
  const successful = actionHistory.filter(a => a.success).length;
  const failed = actionHistory.filter(a => !a.success).length;

  return {
    summary: {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%'
    },
    recentActions: actionHistory.slice(-10),
    failedActions: getFailedActions(),
    commonIssues: analyzeCommonIssues()
  };
}

/**
 * Analyze common issues across failed actions
 */
function analyzeCommonIssues() {
  const failed = getFailedActions();
  const issues = {};

  failed.forEach(action => {
    action.evidence.unexpectedBehavior?.forEach(behavior => {
      const key = behavior.type;
      issues[key] = (issues[key] || 0) + 1;
    });
  });

  return Object.entries(issues)
    .sort((a, b) => b[1] - a[1])
    .map(([issue, count]) => ({ issue, count }));
}

module.exports = {
  testAction,
  getActionHistory,
  getFailedActions,
  clearHistory,
  generateReport
};

