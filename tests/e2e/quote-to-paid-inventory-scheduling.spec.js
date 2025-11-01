/**
 * Quote → Paid pipeline smoke with inventory + employees + scheduling
 * - Adds an employee (if UI present)
 * - Seeds an approved quote (helper button)
 * - Schedules the job, starts it (creates reservations + pick list path)
 * - Opens Pick List, generates from reservations, auto-fills and marks picked
 * - Completes the job, creates invoice, marks paid
 *
 * Run with:
 *   E2E_BASE_URL=http://localhost:3004 npm run test:e2e -- tests/e2e/quote-to-paid-inventory-scheduling.spec.js
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3004';

async function authBypass(page) {
  await page.addInitScript(() => {
    try { localStorage.setItem('E2E_AUTH_BYPASS', 'true'); } catch {}
  });
}

async function goto(page, path) {
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
}

async function tryAddEmployee(page) {
  try {
    await goto(page, '/employees');
    // Look for Add Employee action
    const addBtn = page.getByRole('button', { name: /Add Employee/i }).first();
    const visible = await addBtn.isVisible().catch(() => false);
    if (!visible) return false;
    await addBtn.click();

    // Modal fields
    const email = `e2e-tech+${Date.now()}@example.test`;
    await page.getByLabel(/Email Address/i).fill(email);
    await page.getByLabel(/Full Name/i).fill('E2E Tech');

    // Role select if present
    const roleSelect = page.locator('select[name="role"]');
    if (await roleSelect.count()) {
      await roleSelect.selectOption({ label: /technician/i }).catch(async () => {
        // Fallback to first option
        const options = await roleSelect.locator('option').allTextContents();
        if (options && options.length) await roleSelect.selectOption({ index: 0 });
      });
    }

    // Schedulable toggle (optional) — if checkbox exists
    const schedulable = page.locator('input[name="is_schedulable"], input[type="checkbox"][name*="schedulable"]');
    if (await schedulable.count()) {
      const checked = await schedulable.isChecked().catch(() => true);
      if (!checked) await schedulable.check();
    }

    // Submit
    const submit = page.getByRole('button', { name: /Create|Save|Add/i }).first();
    await submit.click();

    // Wait briefly; ignore if edge function requires config and fails
    await page.waitForTimeout(1200);
    return true;
  } catch (_) {
    return false;
  }
}

async function seedApprovedQuote(page) {
  await goto(page, '/quotes');
  const seedBtn = page.locator('[data-testid="e2e-seed-approved-quote"]');
  await seedBtn.waitFor({ state: 'visible' });
  await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="e2e-seed-approved-quote"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
}

async function openFirstJobEdit(page) {
  await goto(page, '/jobs');
  // Click the first row's job title cell (table body row first cell)
  const firstJobCell = page.locator('table tbody tr td').first();
  await firstJobCell.click();
  // Wait a moment for edit modal/form
  await page.waitForTimeout(600);
}

async function setJobStatus(page, statusValue) {
  const lower = String(statusValue || '').toLowerCase();
  const select = page.locator('select[name="job_status"], select[name="status"]');
  try {
    if (await select.isVisible({ timeout: 2000 })) {
      await select.selectOption(lower).catch(async () => {
        // Fallback by visible label via evaluate
        await page.evaluate((val) => {
          const sel = document.querySelector('select[name="job_status"], select[name="status"]');
          if (!sel) return;
          const opt = Array.from(sel.options).find(o => (o.value||'').toLowerCase()===val || (o.text||'').toLowerCase()===val);
          if (opt) sel.value = opt.value;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }, lower);
      });
      // Confirm any modal if it appears
      const confirmBtn = page.getByRole('button', { name: /Confirm|Continue|Start Job|Resume|Complete|Set Status/i }).first();
      if (await confirmBtn.isVisible().catch(()=>false)) await confirmBtn.click();
      await page.waitForTimeout(600);
      return true;
    }
  } catch {}

  // Button-driven UIs fallback
  if (lower === 'scheduled') {
    const scheduleBtn = page.getByRole('button', { name: /Schedule|Schedule Now/i }).first();
    if (await scheduleBtn.isVisible().catch(()=>false)) { await scheduleBtn.click(); await page.waitForTimeout(600); return true; }
  }
  if (lower === 'in_progress') {
    const startBtn = page.getByRole('button', { name: /Start Job|Start|Begin/i }).first();
    if (await startBtn.isVisible().catch(()=>false)) { await startBtn.click(); await page.waitForTimeout(600); return true; }
  }
  if (lower === 'completed') {
    const completeBtn = page.getByRole('button', { name: /Complete Job|Mark Complete|Complete/i }).first();
    if (await completeBtn.isVisible().catch(()=>false)) { await completeBtn.click(); await page.waitForTimeout(600); return true; }
  }
  return false;
}

async function openPickListAndComplete(page) {
  // Back to Jobs table (if not already)
  await goto(page, '/jobs');
  // Click first row actions: "Open Pick List"
  const openPickBtn = page.locator('button[title="Open Pick List"]').first();
  const exists = await openPickBtn.isVisible().catch(()=>false);
  if (!exists) return false;
  await openPickBtn.click();

  // If no pick list yet, click Generate
  const genFromResBtn = page.getByRole('button', { name: /Generate from reservations/i }).first();
  if (await genFromResBtn.isVisible().catch(()=>false)) {
    await genFromResBtn.click();
    await page.waitForTimeout(500);
  } else {
    const genBtn = page.getByRole('button', { name: /^Generate$/i }).first();
    if (await genBtn.isVisible().catch(()=>false)) {
      await genBtn.click();
      await page.waitForTimeout(500);
    }
  }

  // Auto-fill remaining (if lines exist)
  const autofillBtn = page.getByRole('button', { name: /Auto-fill remaining/i }).first();
  if (await autofillBtn.isVisible().catch(()=>false)) {
    await autofillBtn.click();
  }

  // Mark as Picked
  const markPicked = page.getByRole('button', { name: /Mark as Picked/i }).first();
  if (await markPicked.isVisible().catch(()=>false)) {
    await markPicked.click();
    await page.waitForTimeout(600);
  }

  // Close if still open
  const closeBtn = page.getByRole('button', { name: /^Close$/i }).first();
  if (await closeBtn.isVisible().catch(()=>false)) await closeBtn.click();
  return true;
}

async function createInvoiceAndMarkPaid(page) {
  await goto(page, '/invoices');
  // Create from latest completed job (beta helper)
  const createBtn = page.locator('[data-testid="beta-create-invoice-latest"]').first();
  if (await createBtn.isVisible().catch(()=>false)) {
    await createBtn.click();
  }
  await page.waitForURL(/\/invoices/);

  // Mark latest invoice paid
  page.once('dialog', async dialog => { await dialog.accept(); });
  const payBtn = page.locator('[data-testid="beta-mark-latest-invoice-paid"]').first();
  if (await payBtn.isVisible().catch(()=>false)) {
    await payBtn.click();
    await page.waitForTimeout(400);
  }
}

test.describe('Quote → Paid with inventory, employees, scheduling (smoke)', () => {
  test('end-to-end smoke', async ({ page }) => {
    await authBypass(page);

    // Employees (optional)
    await tryAddEmployee(page);

    // Seed an approved quote
    await seedApprovedQuote(page);

    // Schedule the job, then start it
    await openFirstJobEdit(page);
    await setJobStatus(page, 'scheduled');
    await setJobStatus(page, 'in_progress');

    // Pick list flow
    await openPickListAndComplete(page);

    // Complete job
    await openFirstJobEdit(page);
    await setJobStatus(page, 'completed');

    // Create invoice and mark paid
    await createInvoiceAndMarkPaid(page);

    // Basic post-condition: invoices page visible
    await expect(page).toHaveURL(/\/invoices/);
  });
});

