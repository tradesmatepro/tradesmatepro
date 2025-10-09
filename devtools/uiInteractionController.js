/**
 * UI Interaction Controller
 *
 * Enables AI assistants to interact with the frontend like a human QA tester:
 * - Click buttons, links, and elements
 * - Type into input fields
 * - Navigate between pages
 * - Verify DOM state
 * - Capture screenshots
 * - Detect visual changes
 *
 * PLUS: Action-Outcome Monitoring (Part 2!)
 * - Monitors if actions actually worked
 * - Provides reasoning about failures
 * - Suggests fixes based on evidence
 *
 * This converts "blind task execution" into "observed reasoning"!
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { testAction } = require('./actionOutcomeMonitor');

const APP_URL = process.env.APP_URL || 'http://localhost:3004';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'ai-tests');
const DOM_SNAPSHOTS_DIR = path.join(__dirname, 'dom-snapshots');

// Ensure directories exist
[SCREENSHOTS_DIR, DOM_SNAPSHOTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Shared browser instance for performance
let browserInstance = null;
let pageInstance = null;

/**
 * Get or create browser instance
 */
async function getBrowser() {
  // Check if browser is still alive
  if (browserInstance) {
    try {
      // Test if browser is responsive
      const contexts = browserInstance.contexts();
      if (contexts.length === 0) {
        console.log('⚠️ Browser has no contexts, restarting...');
        await browserInstance.close().catch(() => {});
        browserInstance = null;
      }
    } catch (err) {
      console.log('⚠️ Browser not responsive, restarting...');
      browserInstance = null;
    }
  }

  if (!browserInstance) {
    console.log('🌐 Launching new browser instance...');
    browserInstance = await chromium.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 100, // Slow down for visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Handle unexpected disconnections
    browserInstance.on('disconnected', () => {
      console.log('⚠️ Browser disconnected unexpectedly');
      browserInstance = null;
      pageInstance = null;
    });
  }

  return browserInstance;
}

/**
 * Get or create page instance
 */
async function getPage() {
  // Check if page is still alive
  if (pageInstance) {
    try {
      await pageInstance.title(); // Test if page is responsive
    } catch (err) {
      console.log('⚠️ Page not responsive, creating new page...');
      pageInstance = null;
    }
  }

  if (!pageInstance) {
    const browser = await getBrowser();
    pageInstance = await browser.newPage();

    // Clear any cached credentials/storage
    await pageInstance.context().clearCookies();
    await pageInstance.context().clearPermissions();

    // Set viewport
    await pageInstance.setViewportSize({ width: 1920, height: 1080 });

    // Capture console logs
    pageInstance.on('console', msg => {
      console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    // Capture page errors
    pageInstance.on('pageerror', error => {
      console.error(`[BROWSER ERROR] ${error.message}`);
    });

    // Capture network errors
    pageInstance.on('requestfailed', request => {
      console.error(`[NETWORK ERROR] ${request.url()} - ${request.failure().errorText}`);
    });

    // Handle page close
    pageInstance.on('close', () => {
      console.log('⚠️ Page closed unexpectedly');
      pageInstance = null;
    });
  }

  return pageInstance;
}

/**
 * Close browser and cleanup
 */
async function closeBrowser() {
  if (pageInstance) {
    await pageInstance.close();
    pageInstance = null;
  }
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Navigate to a URL
 */
async function navigate(params) {
  const { url, waitForSelector, timeout = 30000 } = params;
  const page = await getPage();
  
  try {
    const fullUrl = url.startsWith('http') ? url : `${APP_URL}${url}`;
    console.log(`🌐 Navigating to: ${fullUrl}`);
    
    await page.goto(fullUrl, { 
      waitUntil: 'networkidle',
      timeout 
    });
    
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 5000 });
    }
    
    return {
      status: 'success',
      url: page.url(),
      title: await page.title()
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Navigation failed: ${err.message}`
    };
  }
}

/**
 * Click an element
 */
async function click(params) {
  const { selector, waitForNavigation = false, timeout = 5000 } = params;
  const page = await getPage();
  
  try {
    console.log(`🖱️  Clicking: ${selector}`);
    
    // Wait for element to be visible and enabled
    await page.waitForSelector(selector, { state: 'visible', timeout });
    
    if (waitForNavigation) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        page.click(selector)
      ]);
    } else {
      await page.click(selector);
    }
    
    // Wait a bit for any UI updates
    await page.waitForTimeout(500);
    
    return {
      status: 'success',
      message: `Clicked: ${selector}`
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Click failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Type into an input field
 */
async function type(params) {
  const { selector, text, clear = true, timeout = 5000 } = params;
  const page = await getPage();
  
  try {
    console.log(`⌨️  Typing into: ${selector}`);
    
    await page.waitForSelector(selector, { state: 'visible', timeout });
    
    if (clear) {
      await page.fill(selector, '');
    }
    
    await page.type(selector, text, { delay: 50 });
    
    return {
      status: 'success',
      message: `Typed into: ${selector}`,
      text
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Type failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Fill a form field (faster than type)
 */
async function fill(params) {
  const { selector, value, timeout = 5000 } = params;
  const page = await getPage();
  
  try {
    console.log(`📝 Filling: ${selector}`);
    
    await page.waitForSelector(selector, { state: 'visible', timeout });
    await page.fill(selector, value);
    
    return {
      status: 'success',
      message: `Filled: ${selector}`,
      value
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Fill failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Select from dropdown
 */
async function select(params) {
  const { selector, value, label, index, timeout = 5000 } = params;
  const page = await getPage();

  try {
    console.log(`🔽 Selecting from: ${selector}`);

    await page.waitForSelector(selector, { state: 'visible', timeout });

    if (value) {
      await page.selectOption(selector, { value });
    } else if (label) {
      await page.selectOption(selector, { label });
    } else if (index !== undefined) {
      await page.selectOption(selector, { index });
    }

    // Manually trigger change event for React
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
      }
    }, selector);

    console.log(`✅ Selected and triggered change event for: ${selector}`);

    return {
      status: 'success',
      message: `Selected from: ${selector}`
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Select failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Check if element exists and is visible
 */
async function checkElement(params) {
  const { selector, shouldExist = true, shouldBeVisible = true, timeout = 5000 } = params;
  const page = await getPage();

  try {
    console.log(`🔍 Checking element: ${selector}`);

    const element = await page.$(selector);
    const exists = element !== null;

    let visible = false;
    if (exists) {
      visible = await element.isVisible();
    }

    const passed = (exists === shouldExist) && (!shouldExist || visible === shouldBeVisible);

    return {
      status: passed ? 'success' : 'error',
      exists,
      visible,
      expected: { exists: shouldExist, visible: shouldBeVisible },
      message: passed
        ? `Element check passed: ${selector}`
        : `Element check failed: ${selector} (exists: ${exists}, visible: ${visible})`
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Element check failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Get text content from element
 */
async function getText(params) {
  const { selector, timeout = 5000 } = params;
  const page = await getPage();

  try {
    await page.waitForSelector(selector, { state: 'visible', timeout });
    const text = await page.textContent(selector);

    return {
      status: 'success',
      text: text.trim()
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Get text failed: ${err.message}`,
      selector
    };
  }
}

/**
 * Wait for element to appear/disappear
 */
async function waitFor(params) {
  const { selector, state = 'visible', timeout = 10000 } = params;
  const page = await getPage();

  try {
    console.log(`⏳ Waiting for ${selector} to be ${state}`);

    await page.waitForSelector(selector, { state, timeout });

    return {
      status: 'success',
      message: `Element ${selector} is now ${state}`
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Wait failed: ${err.message}`,
      selector,
      state
    };
  }
}

/**
 * Capture screenshot
 */
async function screenshot(params) {
  const { name = `screenshot-${Date.now()}`, fullPage = true, selector = null } = params;
  const page = await getPage();

  try {
    const filename = `${name}.png`;
    const filepath = path.join(SCREENSHOTS_DIR, filename);

    console.log(`📸 Capturing screenshot: ${filename}`);

    if (selector) {
      const element = await page.$(selector);
      if (element) {
        await element.screenshot({ path: filepath });
      } else {
        throw new Error(`Element not found: ${selector}`);
      }
    } else {
      await page.screenshot({ path: filepath, fullPage });
    }

    return {
      status: 'success',
      path: filepath,
      filename
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Screenshot failed: ${err.message}`
    };
  }
}

/**
 * Get DOM snapshot
 */
async function getDOMSnapshot(params) {
  const { name = `dom-${Date.now()}`, selector = 'body' } = params;
  const page = await getPage();

  try {
    console.log(`📄 Capturing DOM snapshot: ${name}`);

    const html = await page.content();
    const filename = `${name}.html`;
    const filepath = path.join(DOM_SNAPSHOTS_DIR, filename);

    fs.writeFileSync(filepath, html);

    // Also get specific element if requested
    let elementHTML = null;
    if (selector !== 'body') {
      const element = await page.$(selector);
      if (element) {
        elementHTML = await element.innerHTML();
      }
    }

    return {
      status: 'success',
      path: filepath,
      filename,
      elementHTML
    };
  } catch (err) {
    return {
      status: 'error',
      message: `DOM snapshot failed: ${err.message}`
    };
  }
}

/**
 * Execute JavaScript in browser context
 */
async function executeScript(params) {
  const { script, args = [] } = params;
  const page = await getPage();

  try {
    console.log(`🔧 Executing script in browser`);

    const result = await page.evaluate(script, ...args);

    return {
      status: 'success',
      result
    };
  } catch (err) {
    return {
      status: 'error',
      message: `Script execution failed: ${err.message}`
    };
  }
}

/**
 * Run a complete UI test scenario
 */
async function runScenario(params) {
  const { scenario, steps } = params;
  const results = {
    scenario,
    startTime: new Date().toISOString(),
    steps: [],
    passed: 0,
    failed: 0
  };

  console.log(`\n🎬 Running scenario: ${scenario}`);
  console.log('='.repeat(60));

  try {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\nStep ${i + 1}/${steps.length}: ${step.action} ${step.description || ''}`);

      let result;
      switch (step.action) {
        case 'navigate':
          result = await navigate(step.params);
          break;
        case 'click':
          result = await click(step.params);
          break;
        case 'type':
          result = await type(step.params);
          break;
        case 'fill':
          result = await fill(step.params);
          break;
        case 'select':
          result = await select(step.params);
          break;
        case 'checkElement':
          result = await checkElement(step.params);
          break;
        case 'getText':
          result = await getText(step.params);
          break;
        case 'waitFor':
          result = await waitFor(step.params);
          break;
        case 'screenshot':
          result = await screenshot(step.params);
          break;
        case 'wait':
          await new Promise(resolve => setTimeout(resolve, step.params.ms || 1000));
          result = { status: 'success', message: `Waited ${step.params.ms || 1000}ms` };
          break;
        default:
          result = { status: 'error', message: `Unknown action: ${step.action}` };
      }

      results.steps.push({
        step: i + 1,
        action: step.action,
        description: step.description,
        ...result
      });

      if (result.status === 'success') {
        results.passed++;
        console.log(`✅ ${result.message || 'Success'}`);
      } else {
        results.failed++;
        console.log(`❌ ${result.message || 'Failed'}`);

        // Take screenshot on failure
        await screenshot({ name: `error-step-${i + 1}-${Date.now()}` });

        // Stop on failure if specified
        if (step.stopOnFailure) {
          console.log('🛑 Stopping scenario due to failure');
          break;
        }
      }
    }
  } catch (err) {
    results.error = err.message;
    console.error(`❌ Scenario failed: ${err.message}`);
  }

  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏱️  Duration: ${results.duration}ms`);

  return {
    status: results.failed === 0 ? 'success' : 'error',
    data: results
  };
}

/**
 * Login helper (common operation)
 */
async function login(params) {
  const { email, password, url = '/login' } = params;

  const steps = [
    {
      action: 'navigate',
      description: 'Navigate to login page',
      params: { url }
    },
    {
      action: 'fill',
      description: 'Enter email',
      params: { selector: 'input[type="email"]', value: email }
    },
    {
      action: 'fill',
      description: 'Enter password',
      params: { selector: 'input[type="password"]', value: password }
    },
    {
      action: 'click',
      description: 'Click login button',
      params: { selector: 'button[type="submit"]', waitForNavigation: true }
    },
    {
      action: 'wait',
      params: { ms: 2000 }
    }
  ];

  return await runScenario({ scenario: 'Login', steps });
}

/**
 * MONITORED ACTIONS (Part 2!)
 * These versions use the Action-Outcome Monitor to provide reasoning
 */

/**
 * Click with outcome monitoring
 */
async function clickWithMonitoring(params) {
  const { selector, expectations = {}, timeout = 5000 } = params;
  const page = await getPage();

  return await testAction(page, {
    label: `Click ${selector}`,
    action: async (page) => {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      await page.click(selector);
    },
    expectations: {
      shouldChangeDom: true,
      ...expectations
    },
    timeout
  });
}

/**
 * Fill with outcome monitoring
 */
async function fillWithMonitoring(params) {
  const { selector, value, expectations = {}, timeout = 5000 } = params;
  const page = await getPage();

  return await testAction(page, {
    label: `Fill ${selector} with "${value}"`,
    action: async (page) => {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      await page.fill(selector, value);
    },
    expectations,
    timeout
  });
}

/**
 * Navigate with outcome monitoring
 */
async function navigateWithMonitoring(params) {
  const { url, expectations = {}, timeout = 30000 } = params;
  const page = await getPage();

  const fullUrl = url.startsWith('http') ? url : `${APP_URL}${url}`;

  return await testAction(page, {
    label: `Navigate to ${url}`,
    action: async (page) => {
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout });
    },
    expectations: {
      shouldNavigate: true,
      shouldChangeDom: true,
      ...expectations
    },
    timeout
  });
}

/**
 * Select with outcome monitoring
 */
async function selectWithMonitoring(params) {
  const { selector, value, label, index, expectations = {}, timeout = 5000 } = params;
  const page = await getPage();

  return await testAction(page, {
    label: `Select from ${selector}`,
    action: async (page) => {
      await page.waitForSelector(selector, { state: 'visible', timeout });
      if (value) {
        await page.selectOption(selector, { value });
      } else if (label) {
        await page.selectOption(selector, { label });
      } else if (index !== undefined) {
        await page.selectOption(selector, { index });
      }
    },
    expectations: {
      shouldChangeDom: true,
      ...expectations
    },
    timeout
  });
}

// Export all functions
module.exports = {
  // Browser management
  getBrowser,
  getPage,
  closeBrowser,

  // Navigation
  navigate,

  // Interactions
  click,
  type,
  fill,
  select,

  // Verification
  checkElement,
  getText,
  waitFor,

  // Capture
  screenshot,
  getDOMSnapshot,

  // Advanced
  executeScript,
  runScenario,

  // Helpers
  login,

  // Monitored actions (Part 2!)
  clickWithMonitoring,
  fillWithMonitoring,
  navigateWithMonitoring,
  selectWithMonitoring
};

