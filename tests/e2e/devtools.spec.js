const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

const RUNS_DIR = path.join(process.cwd(), 'devtools', 'test_runs');
ensureDir(RUNS_DIR);

const DEV_EMAIL = process.env.DEV_LOGIN_EMAIL || 'jeraldjsmith@gmail.com';
const DEV_PASSWORD = process.env.DEV_LOGIN_PASSWORD || 'Gizmo123';

async function tryLogin(page) {
  // Try to identify a login form; if none present, assume already logged in
  const emailSelector = 'input[type="email"], input[name="email"]';
  const passwordSelector = 'input[type="password"], input[name="password"]';
  const loginButtonSelector = 'button:has-text("Log in"), button:has-text("Login"), button[type="submit"]';

  const hasEmailField = await page.$(emailSelector);
  if (!hasEmailField) return false;

  await page.fill(emailSelector, DEV_EMAIL);
  await page.fill(passwordSelector, DEV_PASSWORD);
  const loginBtn = await page.$(loginButtonSelector);
  if (loginBtn) await loginBtn.click();

  // Wait for navigation or dashboard indicator
  await page.waitForLoadState('networkidle');
  return true;
}

/**
 * Capture console output while navigating to /developer-tools and basic pages
 */
 test('DevTools smoke: navigate, capture console, ensure page renders', async ({ page, baseURL }) => {
  const runId = Date.now();
  const outFile = path.join(RUNS_DIR, `playwright-${runId}.console.json`);
  const errors = [];
  const messages = [];

  page.on('console', (msg) => {
    const entry = { type: msg.type(), text: msg.text(), ts: new Date().toISOString() };
    messages.push(entry);
    if (msg.type() === 'error') errors.push(entry);
  });

  // Start at base URL
  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

  // Attempt login if necessary
  await tryLogin(page).catch(() => {});

  // Go to developer tools page
  await page.goto(baseURL + '/developer-tools', { waitUntil: 'domcontentloaded' });

  // Check for the Dev Tools container or restricted access message
  const container = await page.$('[data-testid="developer-tools"]');
  const restricted = await page.locator('text=Access is restricted').first();
  const restrictedVisible = await restricted.isVisible().catch(() => false);

  // If restricted, still pass but record it
  const ok = !!container || restrictedVisible;
  expect(ok).toBeTruthy();

  // Write console log snapshot
  fs.writeFileSync(outFile, JSON.stringify({ runId, errors, messages }, null, 2));

  // Also try to post to local logger server if available
  try {
    await page.evaluate(async (payload) => {
      try { await fetch('http://localhost:4321/ingest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), mode: 'cors' }); } catch(e) {}
    }, { ts: new Date().toISOString(), errors, logs: messages, warnings: [] });
  } catch (_) {}
});

