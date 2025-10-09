/**
 * Complete Pipeline E2E Test
 * 
 * Tests the entire workflow from quote to closed
 */

const { test, expect } = require('@playwright/test');

test.describe('Complete Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full pipeline: quote → closed', async ({ page }) => {
    // Step 1: Create Quote
    await page.click('text=Quotes');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("New Quote")');
    await page.waitForTimeout(500);
    
    await page.fill('input[name="customer_name"]', 'E2E Test Customer');
    await page.fill('textarea[name="description"]', 'Automated E2E test quote');
    
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    // Verify quote created
    await expect(page.locator('text=E2E Test Customer')).toBeVisible();
    
    // Step 2: Send Quote
    await page.click('text=E2E Test Customer');
    await page.waitForTimeout(500);
    
    await page.selectOption('select[name="job_status"]', 'sent');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Step 3: Approve Quote
    await page.selectOption('select[name="job_status"]', 'approved');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(2000);
    
    // Step 4: Verify Auto-Transition to Scheduled
    const status = await page.locator('select[name="job_status"]').inputValue();
    expect(status).toBe('scheduled');
    
    // Step 5: Start Job
    await page.selectOption('select[name="job_status"]', 'in_progress');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Step 6: Put On Hold
    await page.selectOption('select[name="job_status"]', 'on_hold');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(500);
    
    // Check if modal appeared
    const hasModal = await page.locator('text=On Hold').count() > 0;
    if (hasModal) {
      await page.fill('textarea[name="on_hold_reason"]', 'E2E test hold');
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);
    }
    
    // Step 7: Resume Job
    await page.selectOption('select[name="job_status"]', 'in_progress');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Step 8: Complete Job
    await page.selectOption('select[name="job_status"]', 'completed');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(500);
    
    const hasCompletionModal = await page.locator('text=Complete').count() > 0;
    if (hasCompletionModal) {
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);
    }
    
    // Step 9: Create Invoice
    const hasInvoiceModal = await page.locator('text=Invoice').count() > 0;
    if (hasInvoiceModal) {
      await page.click('button:has-text("Create Invoice")');
      await page.waitForTimeout(1000);
    }
    
    // Step 10: Mark Paid
    await page.selectOption('select[name="job_status"]', 'paid');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Step 11: Close Job
    await page.selectOption('select[name="job_status"]', 'closed');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(1000);
    
    // Verify final status
    const finalStatus = await page.locator('select[name="job_status"]').inputValue();
    expect(finalStatus).toBe('closed');
  });

  test('should show OnHold modal when changing to on_hold', async ({ page }) => {
    // Navigate to jobs
    await page.click('text=Jobs');
    await page.waitForTimeout(1000);
    
    // Find a job in progress or create one
    const hasInProgressJob = await page.locator('text=in_progress').count() > 0;
    
    if (hasInProgressJob) {
      await page.click('text=in_progress').first();
      await page.waitForTimeout(500);
      
      // Change to on_hold
      await page.selectOption('select[name="job_status"]', 'on_hold');
      await page.click('button:has-text("Update")');
      await page.waitForTimeout(500);
      
      // Verify modal appears
      await expect(page.locator('text=On Hold')).toBeVisible({ timeout: 2000 });
    }
  });

  test('should auto-transition from approved to scheduled', async ({ page }) => {
    // Create and approve a quote
    await page.click('text=Quotes');
    await page.waitForTimeout(1000);
    
    await page.click('button:has-text("New Quote")');
    await page.waitForTimeout(500);
    
    await page.fill('input[name="customer_name"]', 'Auto Transition Test');
    await page.fill('textarea[name="description"]', 'Testing auto-transition');
    
    await page.click('button:has-text("Save")');
    await page.waitForTimeout(1000);
    
    await page.click('text=Auto Transition Test');
    await page.waitForTimeout(500);
    
    // Approve
    await page.selectOption('select[name="job_status"]', 'approved');
    await page.click('button:has-text("Update")');
    await page.waitForTimeout(2000);
    
    // Verify auto-transition
    const status = await page.locator('select[name="job_status"]').inputValue();
    expect(status).toBe('scheduled');
  });
});

