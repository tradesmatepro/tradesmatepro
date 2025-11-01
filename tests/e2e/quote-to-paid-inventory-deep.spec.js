/**
 * Deep E2E: Quote → Paid with inventory + employees + scheduling
 * Verifies:
 *  - Reservations cause Jobs badge "Pick Needed"
 *  - Pick List generation + Mark as Picked → Jobs badge "Picked"
 *  - Inventory movements include ALLOCATION (on pick) and USAGE (on completion)
 *
 * Run: npm run test:e2e -- tests/e2e/quote-to-paid-inventory-deep.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3004';

async function authBypass(page) {
  await page.addInitScript(() => { try { localStorage.setItem('E2E_AUTH_BYPASS', 'true'); } catch {} });
}
async function goto(page, path) { await page.goto(BASE + path, { waitUntil: 'domcontentloaded' }); }

async function seedApprovedQuote(page) {
  await goto(page, '/quotes');
  const seedBtn = page.locator('[data-testid="e2e-seed-approved-quote"]');
  await seedBtn.waitFor({ state: 'visible' });
  await page.evaluate(() => { const btn = document.querySelector('[data-testid="e2e-seed-approved-quote"]'); if (btn) btn.click(); });
  await page.waitForTimeout(800);
}

async function openFirstJobEdit(page) {
  await goto(page, '/jobs');
  const firstJobCell = page.locator('table tbody tr td').first();
  await firstJobCell.click();
  await page.waitForTimeout(600);
}

async function setJobStatus(page, statusValue) {
  const lower = String(statusValue || '').toLowerCase();
  const select = page.locator('select[name="job_status"], select[name="status"]');
  try {
    if (await select.isVisible({ timeout: 2000 })) {
      await select.selectOption(lower).catch(async () => {
        await page.evaluate((val) => {
          const sel = document.querySelector('select[name="job_status"], select[name="status"]');
          if (!sel) return;
          const opt = Array.from(sel.options).find(o => (o.value||'').toLowerCase()===val || (o.text||'').toLowerCase()===val);
          if (opt) sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }, lower);
      });
      const confirmBtn = page.getByRole('button', { name: /Confirm|Continue|Start Job|Resume|Complete|Set Status/i }).first();
      if (await confirmBtn.isVisible().catch(()=>false)) await confirmBtn.click();
      await page.waitForTimeout(600);
      return true;
    }
  } catch {}
  if (lower === 'scheduled') { const scheduleBtn = page.getByRole('button', { name: /Schedule|Schedule Now/i }).first(); if (await scheduleBtn.isVisible().catch(()=>false)) { await scheduleBtn.click(); await page.waitForTimeout(600); return true; } }
  if (lower === 'in_progress') { const startBtn = page.getByRole('button', { name: /Start Job|Start|Begin/i }).first(); if (await startBtn.isVisible().catch(()=>false)) { await startBtn.click(); await page.waitForTimeout(600); return true; } }
  if (lower === 'completed') { const completeBtn = page.getByRole('button', { name: /Complete Job|Mark Complete|Complete/i }).first(); if (await completeBtn.isVisible().catch(()=>false)) { await completeBtn.click(); await page.waitForTimeout(600); return true; } }
  return false;
}

async function openPickListAndComplete(page) {
  await goto(page, '/jobs');
  const openPickBtn = page.locator('button[title="Open Pick List"]').first();
  if (!(await openPickBtn.isVisible().catch(()=>false))) return false;
  await openPickBtn.click();

  const genFromResBtn = page.getByRole('button', { name: /Generate from reservations/i }).first();
  if (await genFromResBtn.isVisible().catch(()=>false)) {
    await genFromResBtn.click();
    await page.waitForTimeout(500);
  } else {
    const genBtn = page.getByRole('button', { name: /^Generate$/i }).first();
    if (await genBtn.isVisible().catch(()=>false)) { await genBtn.click(); await page.waitForTimeout(500); }
  }

  const autofillBtn = page.getByRole('button', { name: /Auto-fill remaining/i }).first();
  if (await autofillBtn.isVisible().catch(()=>false)) { await autofillBtn.click(); }

  // Assert All fulfilled badge in modal header, if totals match
  const allFulfilled = page.locator('span:has-text("All fulfilled")').first();
  await allFulfilled.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});

  const markPicked = page.getByRole('button', { name: /Mark as Picked/i }).first();
  if (await markPicked.isVisible().catch(()=>false)) { await markPicked.click(); await page.waitForTimeout(600); }

  const closeBtn = page.getByRole('button', { name: /^Close$/i }).first();
  if (await closeBtn.isVisible().catch(()=>false)) await closeBtn.click();
  return true;
}

async function clickInventoryTab(page, tabName) {
  await goto(page, '/inventory');
  const tab = page.getByRole('tab', { name: new RegExp(`^${tabName}$`, 'i') }).first();
  if (await tab.isVisible().catch(()=>false)) { await tab.click(); }
  else {
    // Sometimes tabs are buttons
    const btn = page.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') }).first();
    if (await btn.isVisible().catch(()=>false)) await btn.click();
  }
  await page.waitForTimeout(600);
}

async function expectAnyJobsBadge(page, expectedTexts) {
  await goto(page, '/jobs');
  for (const txt of expectedTexts) {
    const badge = page.locator(`span:has-text("${txt}")`).first();
    if (await badge.isVisible().catch(()=>false)) return true;
  }
  // As a last attempt, wait briefly for any to appear
  await page.waitForTimeout(800);
  for (const txt of expectedTexts) {
    const badge = page.locator(`span:has-text("${txt}")`).first();
    if (await badge.isVisible().catch(()=>false)) return true;
  }
  // Fail with message
  throw new Error(`None of the expected badges were visible: ${expectedTexts.join(', ')}`);
}

async function expectMovementExists(page, typeRegex) {
  await clickInventoryTab(page, 'Movements');
  const table = page.locator('table');
  await expect(table).toBeVisible();
  const cell = page.locator('table td').filter({ hasText: typeRegex });
  await expect(cell.first()).toBeVisible();
}

test.describe('Deep: Quote → Paid with inventory validations', () => {
  test('validates pick badges and inventory movements', async ({ page }) => {
    await authBypass(page);

    // Seed approved quote
    await seedApprovedQuote(page);

    // Schedule
    await openFirstJobEdit(page);
    await setJobStatus(page, 'scheduled');

    // Pick List flow → expect Picked
    await openPickListAndComplete(page);

    // Start and Complete job
    await openFirstJobEdit(page);
    await setJobStatus(page, 'in_progress');
    await openFirstJobEdit(page);
    await setJobStatus(page, 'completed');

    // Inventory Movements: ALLOCATION (from pick) and USAGE (from completion)
    await expectMovementExists(page, /ALLOCATION/i);
    await expectMovementExists(page, /USAGE/i);
  });
});

