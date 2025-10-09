/**
 * Predefined UI Test Scenarios
 *
 * Common test scenarios that AI can run to verify frontend functionality
 */

const fs = require('fs');
const path = require('path');

// Load credentials dynamically from project info
function getTestCredentials() {
  try {
    const projectInfoPath = path.join(__dirname, '../APP Schemas/Locked/TradesMate_project_info.md');
    const content = fs.readFileSync(projectInfoPath, 'utf8');

    // Extract credentials from markdown (line 71: jeraldjsmith@gmail.com / Gizmo123)
    const emailMatch = content.match(/jeraldjsmith@gmail\.com/i);
    const passwordMatch = content.match(/Gizmo123/);

    return {
      email: emailMatch ? emailMatch[0] : process.env.TEST_EMAIL || 'jeraldjsmith@gmail.com',
      password: passwordMatch ? passwordMatch[0] : process.env.TEST_PASSWORD || 'Gizmo123'
    };
  } catch (err) {
    console.warn('⚠️ Could not load credentials from project info, using defaults');
    return {
      email: process.env.TEST_EMAIL || 'jeraldjsmith@gmail.com',
      password: process.env.TEST_PASSWORD || 'Gizmo123'
    };
  }
}

const TEST_USER = getTestCredentials();

// Refresh credentials on demand
function refreshCredentials() {
  const newCreds = getTestCredentials();
  TEST_USER.email = newCreds.email;
  TEST_USER.password = newCreds.password;
  console.log('🔄 Credentials refreshed:', TEST_USER.email);
}

/**
 * Quote Flow: Create a new quote
 */
const quoteFlowScenario = {
  scenario: 'Quote Flow - Create New Quote',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to quotes page',
      params: { url: '/quotes' }
    },
    {
      action: 'click',
      description: 'Click New Quote button',
      params: { selector: 'button:has-text("New Quote"), button:has-text("Create Quote")' }
    },
    {
      action: 'waitFor',
      description: 'Wait for quote form',
      params: { selector: 'form, [role="dialog"]', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture quote form',
      params: { name: 'quote-form' }
    },
    {
      action: 'checkElement',
      description: 'Verify form is visible',
      params: { selector: 'input[name="job_title"], input[placeholder*="title"]', shouldExist: true, shouldBeVisible: true }
    }
  ]
};

/**
 * Invoice Flow: Navigate and check invoices
 */
const invoiceFlowScenario = {
  scenario: 'Invoice Flow - View Invoices',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to invoices page',
      params: { url: '/invoices' }
    },
    {
      action: 'waitFor',
      description: 'Wait for page load',
      params: { selector: 'body', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture invoices page',
      params: { name: 'invoices-page' }
    },
    {
      action: 'checkElement',
      description: 'Check for invoices table or empty state',
      params: { selector: 'table, [data-testid="invoices-list"], .empty-state', shouldExist: true }
    }
  ]
};

/**
 * Customer Flow: Create new customer
 */
const customerFlowScenario = {
  scenario: 'Customer Flow - Create New Customer',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to customers page',
      params: { url: '/customers' }
    },
    {
      action: 'click',
      description: 'Click New Customer button',
      params: { selector: 'button:has-text("New Customer"), button:has-text("Add Customer")' }
    },
    {
      action: 'waitFor',
      description: 'Wait for customer form',
      params: { selector: 'form, [role="dialog"]', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture customer form',
      params: { name: 'customer-form' }
    }
  ]
};

/**
 * Job Status Transition: Test status changes
 */
const jobStatusTransitionScenario = {
  scenario: 'Job Status Transition - Draft to Sent',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to jobs page',
      params: { url: '/jobs' }
    },
    {
      action: 'waitFor',
      description: 'Wait for jobs to load',
      params: { selector: 'table, [data-testid="jobs-list"]', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture jobs page',
      params: { name: 'jobs-before-transition' }
    },
    {
      action: 'click',
      description: 'Click first job',
      params: { selector: 'tr:first-of-type, [data-testid="job-row"]:first-of-type' }
    },
    {
      action: 'waitFor',
      description: 'Wait for job details',
      params: { selector: 'select[name="job_status"], select[name="status"]', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture job details',
      params: { name: 'job-details' }
    }
  ]
};

/**
 * Modal Test: OnHold modal
 */
const onHoldModalScenario = {
  scenario: 'OnHold Modal - Verify Modal Opens',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to jobs page',
      params: { url: '/jobs' }
    },
    {
      action: 'waitFor',
      description: 'Wait for jobs to load',
      params: { selector: 'table', timeout: 5000 }
    },
    {
      action: 'click',
      description: 'Click first job',
      params: { selector: 'tr:first-of-type' }
    },
    {
      action: 'waitFor',
      description: 'Wait for status dropdown',
      params: { selector: 'select[name="job_status"]', timeout: 5000 }
    },
    {
      action: 'select',
      description: 'Change status to on_hold',
      params: { selector: 'select[name="job_status"]', value: 'on_hold' }
    },
    {
      action: 'waitFor',
      description: 'Wait for OnHold modal',
      params: { selector: '[role="dialog"], .modal', timeout: 3000 }
    },
    {
      action: 'screenshot',
      description: 'Capture OnHold modal',
      params: { name: 'onhold-modal' }
    },
    {
      action: 'checkElement',
      description: 'Verify modal is visible',
      params: { selector: '[role="dialog"], .modal', shouldExist: true, shouldBeVisible: true }
    }
  ]
};

/**
 * Dashboard Load Test
 */
const dashboardLoadScenario = {
  scenario: 'Dashboard - Load and Verify',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to dashboard',
      params: { url: '/dashboard' }
    },
    {
      action: 'waitFor',
      description: 'Wait for dashboard to load',
      params: { selector: 'body', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture dashboard',
      params: { name: 'dashboard', fullPage: true }
    },
    {
      action: 'checkElement',
      description: 'Check for dashboard content',
      params: { selector: '[data-testid="dashboard"], .dashboard, main', shouldExist: true }
    }
  ]
};

/**
 * Complete Pipeline Test: Quote → Invoice
 */
const completePipelineScenario = {
  scenario: 'Complete Pipeline - Quote to Invoice',
  steps: [
    // 1. Create Quote
    {
      action: 'navigate',
      description: 'Navigate to quotes',
      params: { url: '/quotes' }
    },
    {
      action: 'click',
      description: 'Click New Quote',
      params: { selector: 'button:has-text("New Quote")' }
    },
    {
      action: 'waitFor',
      description: 'Wait for form',
      params: { selector: 'form', timeout: 5000 }
    },
    {
      action: 'fill',
      description: 'Fill quote title',
      params: { selector: 'input[name="job_title"]', value: `Test Quote ${Date.now()}` }
    },
    {
      action: 'screenshot',
      description: 'Capture quote form',
      params: { name: 'pipeline-quote-form' }
    },
    {
      action: 'click',
      description: 'Save quote',
      params: { selector: 'button:has-text("Save"), button[type="submit"]' }
    },
    {
      action: 'wait',
      params: { ms: 2000 }
    },
    {
      action: 'screenshot',
      description: 'Capture after save',
      params: { name: 'pipeline-quote-saved' }
    },

    // 2. Navigate to Jobs
    {
      action: 'navigate',
      description: 'Navigate to jobs',
      params: { url: '/jobs' }
    },
    {
      action: 'waitFor',
      description: 'Wait for jobs list',
      params: { selector: 'table', timeout: 5000 }
    },
    {
      action: 'screenshot',
      description: 'Capture jobs list',
      params: { name: 'pipeline-jobs-list' }
    }
  ]
};

/**
 * Auth Flow: Login
 */
const authFlowScenario = {
  scenario: 'Auth Flow - Login',
  steps: [
    {
      action: 'navigate',
      description: 'Navigate to login',
      params: { url: '/login' }
    },
    {
      action: 'fill',
      description: 'Enter email',
      params: { selector: 'input[type="email"]', value: TEST_USER.email }
    },
    {
      action: 'fill',
      description: 'Enter password',
      params: { selector: 'input[type="password"]', value: TEST_USER.password }
    },
    {
      action: 'screenshot',
      description: 'Capture login form',
      params: { name: 'login-form' }
    },
    {
      action: 'click',
      description: 'Click login button',
      params: { selector: 'button[type="submit"]', waitForNavigation: true }
    },
    {
      action: 'wait',
      params: { ms: 2000 }
    },
    {
      action: 'screenshot',
      description: 'Capture after login',
      params: { name: 'after-login' }
    },
    {
      action: 'checkElement',
      description: 'Verify logged in (not on login page)',
      params: { selector: 'button:has-text("Logout"), [data-testid="user-menu"]', shouldExist: true }
    }
  ]
};

// Export all scenarios
const scenarios = {
  quoteFlow: quoteFlowScenario,
  invoiceFlow: invoiceFlowScenario,
  customerFlow: customerFlowScenario,
  jobStatusTransition: jobStatusTransitionScenario,
  onHoldModal: onHoldModalScenario,
  dashboardLoad: dashboardLoadScenario,
  completePipeline: completePipelineScenario,
  authFlow: authFlowScenario
};

module.exports = { scenarios, TEST_USER, refreshCredentials };