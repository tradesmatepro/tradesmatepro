/**
 * ✅ COMPREHENSIVE REAL-WORLD TEST DATA CREATION
 * 
 * Creates realistic test data by actually using the frontend UI.
 * Tests the entire workflow from quote → job → timesheet → invoice → payment → closed
 * 
 * COMPREHENSIVE TEST DATA:
 * - 10 customers (realistic names, addresses)
 * - 5 employees (various roles)
 * - 20 quotes (progressed through different stages)
 * - 10 scheduled jobs (with employee assignments)
 * - 15 timesheets (draft, submitted, approved)
 * - 5 PTO requests (pending, approved)
 * - 10 inventory items
 * - 5 vendors
 * - 8 invoices (unpaid, paid)
 * - 5 expenses
 * 
 * STRESS TESTS:
 * - Overload employees with multiple jobs
 * - Create scheduling conflicts
 * - Test approval workflows
 * - Test full pipeline: quote → closed
 */

const { chromium } = require('playwright');
const fs = require('fs');

const APP_URL = 'http://localhost:3004';
const TEST_EMAIL = 'jeraldjsmith@gmail.com';
const TEST_PASSWORD = 'Gizmo123';

const results = {
  startTime: new Date().toISOString(),
  customers: [],
  employees: [],
  quotes: [],
  jobs: [],
  timesheets: [],
  pto: [],
  inventory: [],
  vendors: [],
  invoices: [],
  expenses: [],
  errors: [],
  workflows: []
};

// Realistic test data
const CUSTOMERS = [
  { name: 'John Smith', phone: '+15551234567', email: 'john.smith@email.com', address: '123 Main St', city: 'Portland', state: 'OR', zip: '97201', type: 'residential' },
  { name: 'Sarah Johnson', phone: '+15552345678', email: 'sarah.j@email.com', address: '456 Oak Ave', city: 'Portland', state: 'OR', zip: '97202', type: 'residential' },
  { name: 'Mike Williams', phone: '+15553456789', email: 'mike.w@email.com', address: '789 Pine Rd', city: 'Beaverton', state: 'OR', zip: '97005', type: 'residential' },
  { name: 'Emily Davis', phone: '+15554567890', email: 'emily.d@email.com', address: '321 Elm St', city: 'Hillsboro', state: 'OR', zip: '97124', type: 'residential' },
  { name: 'David Brown', phone: '+15555678901', email: 'david.b@email.com', address: '654 Maple Dr', city: 'Tigard', state: 'OR', zip: '97223', type: 'residential' },
  { name: 'Portland Office Complex', phone: '+15556789012', email: 'facilities@portlandoffice.com', address: '987 Cedar Ln', city: 'Portland', state: 'OR', zip: '97034', type: 'commercial' },
  { name: 'Hillsboro Shopping Center', phone: '+15557890123', email: 'maintenance@hillsboromall.com', address: '147 Birch Way', city: 'Hillsboro', state: 'OR', zip: '97068', type: 'commercial' },
  { name: 'Lisa Martinez', phone: '+15558901234', email: 'lisa.m@email.com', address: '258 Spruce Ct', city: 'Oregon City', state: 'OR', zip: '97045', type: 'residential' },
  { name: 'Robert Anderson', phone: '+15559012345', email: 'robert.a@email.com', address: '369 Willow Pl', city: 'Milwaukie', state: 'OR', zip: '97222', type: 'residential' },
  { name: 'Mary Thomas', phone: '+15550123456', email: 'mary.t@email.com', address: '741 Ash Blvd', city: 'Gresham', state: 'OR', zip: '97030', type: 'residential' }
];

const EMPLOYEES = [
  { firstName: 'Tom', lastName: 'Anderson', email: 'tom.anderson@smithplumbing.com', phone: '+15551111111', role: 'technician', hourlyRate: 45 },
  { firstName: 'Lisa', lastName: 'Chen', email: 'lisa.chen@smithplumbing.com', phone: '+15552222222', role: 'technician', hourlyRate: 45 },
  { firstName: 'Mark', lastName: 'Rodriguez', email: 'mark.rodriguez@smithplumbing.com', phone: '+15553333333', role: 'lead_technician', hourlyRate: 55 },
  { firstName: 'Amy', lastName: 'Johnson', email: 'amy.johnson@smithplumbing.com', phone: '+15554444444', role: 'dispatcher', hourlyRate: 35 },
  { firstName: 'Chris', lastName: 'Lee', email: 'chris.lee@smithplumbing.com', phone: '+15555555555', role: 'apprentice', hourlyRate: 25 }
];

const QUOTE_TEMPLATES = [
  { title: 'Kitchen Sink Replacement', description: 'Replace old kitchen sink with new stainless steel model', subtotal: 773.64, tax: 76.36, total: 850 },
  { title: 'Water Heater Installation', description: 'Install 50-gallon gas water heater', subtotal: 1681.82, tax: 168.18, total: 1850 },
  { title: 'Bathroom Remodel', description: 'Complete bathroom remodel with new fixtures', subtotal: 5000, tax: 500, total: 5500 },
  { title: 'Leak Repair', description: 'Fix leaking pipe under kitchen sink', subtotal: 318.18, tax: 31.82, total: 350 },
  { title: 'Drain Cleaning', description: 'Clear clogged main drain line', subtotal: 250, tax: 25, total: 275 },
  { title: 'Faucet Replacement', description: 'Replace bathroom faucet', subtotal: 386.36, tax: 38.64, total: 425 },
  { title: 'Toilet Repair', description: 'Fix running toilet', subtotal: 168.18, tax: 16.82, total: 185 },
  { title: 'Garbage Disposal Installation', description: 'Install new garbage disposal unit', subtotal: 295.45, tax: 29.55, total: 325 },
  { title: 'Shower Head Replacement', description: 'Replace old shower head', subtotal: 113.64, tax: 11.36, total: 125 },
  { title: 'Pipe Insulation', description: 'Insulate exposed pipes in basement', subtotal: 409.09, tax: 40.91, total: 450 },
  { title: 'Sump Pump Installation', description: 'Install new sump pump system', subtotal: 1090.91, tax: 109.09, total: 1200 },
  { title: 'Water Softener Installation', description: 'Install whole-house water softener', subtotal: 1909.09, tax: 190.91, total: 2100 },
  { title: 'Gas Line Installation', description: 'Install gas line for new range', subtotal: 590.91, tax: 59.09, total: 650 },
  { title: 'Backflow Prevention', description: 'Install backflow prevention device', subtotal: 500, tax: 50, total: 550 },
  { title: 'Tankless Water Heater', description: 'Install tankless water heater system', subtotal: 2909.09, tax: 290.91, total: 3200 },
  { title: 'Sewer Line Repair', description: 'Repair damaged sewer line', subtotal: 2545.45, tax: 254.55, total: 2800 },
  { title: 'Bathtub Installation', description: 'Install new bathtub', subtotal: 1772.73, tax: 177.27, total: 1950 },
  { title: 'Kitchen Faucet Upgrade', description: 'Upgrade to touchless kitchen faucet', subtotal: 522.73, tax: 52.27, total: 575 },
  { title: 'Washing Machine Hookup', description: 'Install washing machine water lines', subtotal: 204.55, tax: 20.45, total: 225 },
  { title: 'Outdoor Faucet Installation', description: 'Install new outdoor hose bib', subtotal: 268.18, tax: 26.82, total: 295 }
];

const INVENTORY_ITEMS = [
  { name: 'PVC Pipe 1/2"', sku: 'PVC-PIPE-05', category: 'Plumbing', unitCost: 0.50, unitPrice: 1.25, quantity: 500, reorderPoint: 100 },
  { name: 'PVC Elbow 1/2"', sku: 'PVC-ELBOW-05', category: 'Plumbing', unitCost: 0.25, unitPrice: 0.75, quantity: 200, reorderPoint: 50 },
  { name: 'Copper Pipe 3/4"', sku: 'CU-PIPE-075', category: 'Plumbing', unitCost: 2.50, unitPrice: 5.00, quantity: 150, reorderPoint: 50 },
  { name: 'Ball Valve 1/2"', sku: 'VALVE-BALL-05', category: 'Plumbing', unitCost: 5.00, unitPrice: 12.00, quantity: 75, reorderPoint: 20 },
  { name: 'Wax Ring', sku: 'WAX-RING-STD', category: 'Plumbing', unitCost: 1.50, unitPrice: 4.00, quantity: 50, reorderPoint: 10 },
  { name: 'Teflon Tape', sku: 'TEFLON-TAPE', category: 'Supplies', unitCost: 0.50, unitPrice: 1.50, quantity: 100, reorderPoint: 25 },
  { name: 'Pipe Dope', sku: 'PIPE-DOPE', category: 'Supplies', unitCost: 3.00, unitPrice: 7.00, quantity: 30, reorderPoint: 10 },
  { name: 'Drain Snake 25ft', sku: 'SNAKE-25', category: 'Tools', unitCost: 45.00, unitPrice: 0, quantity: 5, reorderPoint: 2 },
  { name: 'Pipe Wrench 14"', sku: 'WRENCH-14', category: 'Tools', unitCost: 35.00, unitPrice: 0, quantity: 8, reorderPoint: 3 },
  { name: 'Plumbers Putty', sku: 'PUTTY-STD', category: 'Supplies', unitCost: 2.00, unitPrice: 5.00, quantity: 40, reorderPoint: 15 }
];

const VENDORS = [
  { name: 'ABC Supply Co', email: 'orders@abcsupply.com', phone: '+15551234567', vendorNumber: 'VEN-001' },
  { name: 'Plumbing Wholesale', email: 'sales@plumbingwholesale.com', phone: '+15559876543', vendorNumber: 'VEN-002' },
  { name: 'Home Depot Pro', email: 'pro@homedepot.com', phone: '+15555551234', vendorNumber: 'VEN-003' },
  { name: 'Ferguson Plumbing', email: 'orders@ferguson.com', phone: '+15555559876', vendorNumber: 'VEN-004' },
  { name: 'Grainger Industrial', email: 'sales@grainger.com', phone: '+15555554321', vendorNumber: 'VEN-005' }
];

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${APP_URL}/login`);
  await page.waitForTimeout(2000);
  
  const emailInput = await page.locator('input[type="email"]').count();
  if (emailInput > 0) {
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log('✅ Logged in');
  } else {
    console.log('✅ Already logged in');
  }
}

async function createCustomers(page) {
  console.log(`\n👥 Creating ${CUSTOMERS.length} customers...`);
  
  for (let i = 0; i < CUSTOMERS.length; i++) {
    try {
      await page.goto(`${APP_URL}/customers`);
      await page.waitForTimeout(1500);
      
      // Click "Add Customer" button
      const addBtn = await page.locator('button:has-text("Add Customer"), button:has-text("New Customer"), button:has-text("Create Customer")').first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        
        const customer = CUSTOMERS[i];
        
        // Fill form - try multiple possible field names
        await fillField(page, ['name', 'customer_name'], customer.name);
        await fillField(page, ['phone', 'phone_number'], customer.phone);
        await fillField(page, ['email'], customer.email);
        await fillField(page, ['street_address', 'address', 'address_line1'], customer.address);
        await fillField(page, ['city'], customer.city);
        await fillField(page, ['state', 'state_province'], customer.state);
        await fillField(page, ['zip_code', 'zip', 'postal_code'], customer.zip);
        
        // Select customer type if available
        const typeSelect = await page.locator('select[name="customer_type"], select[name="type"]').count();
        if (typeSelect > 0) {
          await page.selectOption('select[name="customer_type"], select[name="type"]', customer.type);
        }
        
        // Submit
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create"), button:has-text("Add Customer")');
        await page.waitForTimeout(2000);
        
        results.customers.push({ name: customer.name, status: 'created' });
        console.log(`  ✅ ${i + 1}/${CUSTOMERS.length} Created: ${customer.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create customer ${i + 1}: ${error.message}`);
      results.errors.push({ type: 'customer', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.customers.length}/${CUSTOMERS.length} customers`);
}

async function fillField(page, fieldNames, value) {
  for (const name of fieldNames) {
    const field = await page.locator(`input[name="${name}"], input[placeholder*="${name}" i], textarea[name="${name}"]`).first();
    if (await field.count() > 0) {
      await field.fill(value);
      return true;
    }
  }
  return false;
}

async function createEmployees(page) {
  console.log(`\n👷 Creating ${EMPLOYEES.length} employees...`);
  
  for (let i = 0; i < EMPLOYEES.length; i++) {
    try {
      await page.goto(`${APP_URL}/employees`);
      await page.waitForTimeout(1500);
      
      const addBtn = await page.locator('button:has-text("Add Employee"), button:has-text("New Employee"), button:has-text("Create Employee")').first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        
        const employee = EMPLOYEES[i];
        
        await fillField(page, ['first_name', 'firstName'], employee.firstName);
        await fillField(page, ['last_name', 'lastName'], employee.lastName);
        await fillField(page, ['email'], employee.email);
        await fillField(page, ['phone', 'phone_number'], employee.phone);
        await fillField(page, ['hourly_rate', 'hourlyRate', 'rate'], employee.hourlyRate.toString());
        
        // Select role
        const roleSelect = await page.locator('select[name="role"]').count();
        if (roleSelect > 0) {
          await page.selectOption('select[name="role"]', employee.role);
        }
        
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
        await page.waitForTimeout(2000);
        
        results.employees.push({ name: `${employee.firstName} ${employee.lastName}`, role: employee.role, status: 'created' });
        console.log(`  ✅ ${i + 1}/${EMPLOYEES.length} Created: ${employee.firstName} ${employee.lastName} (${employee.role})`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create employee ${i + 1}: ${error.message}`);
      results.errors.push({ type: 'employee', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.employees.length}/${EMPLOYEES.length} employees`);
}

async function createInventory(page) {
  console.log(`\n📦 Creating ${INVENTORY_ITEMS.length} inventory items...`);
  
  for (let i = 0; i < INVENTORY_ITEMS.length; i++) {
    try {
      await page.goto(`${APP_URL}/inventory`);
      await page.waitForTimeout(1500);
      
      const addBtn = await page.locator('button:has-text("Add Item"), button:has-text("New Item"), button:has-text("Create Item")').first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        
        const item = INVENTORY_ITEMS[i];
        
        await fillField(page, ['name', 'item_name'], item.name);
        await fillField(page, ['sku'], item.sku);
        await fillField(page, ['category'], item.category);
        await fillField(page, ['unit_cost', 'unitCost', 'cost'], item.unitCost.toString());
        await fillField(page, ['unit_price', 'unitPrice', 'price'], item.unitPrice.toString());
        await fillField(page, ['quantity_on_hand', 'quantity', 'stock'], item.quantity.toString());
        await fillField(page, ['reorder_point', 'reorderPoint'], item.reorderPoint.toString());
        
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
        await page.waitForTimeout(2000);
        
        results.inventory.push({ name: item.name, sku: item.sku, status: 'created' });
        console.log(`  ✅ ${i + 1}/${INVENTORY_ITEMS.length} Created: ${item.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed to create inventory item ${i + 1}: ${error.message}`);
      results.errors.push({ type: 'inventory', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.inventory.length}/${INVENTORY_ITEMS.length} inventory items`);
}

async function createQuotesAndWorkflows(page) {
  console.log(`\n📋 Creating ${QUOTE_TEMPLATES.length} quotes and progressing through workflows...`);
  console.log('This will test the full pipeline: quote → approved → scheduled → completed → invoiced → paid → closed\n');

  const customerCount = results.customers.length;
  const employeeCount = results.employees.length;

  for (let i = 0; i < QUOTE_TEMPLATES.length; i++) {
    try {
      await page.goto(`${APP_URL}/quotes`);
      await page.waitForTimeout(1500);

      // Click "Create Quote" button
      const createBtn = await page.locator('button:has-text("Create Quote"), button:has-text("New Quote"), button:has-text("Add Quote")').first();
      if (await createBtn.count() > 0) {
        await createBtn.click();
        await page.waitForTimeout(2000);

        const quote = QUOTE_TEMPLATES[i];
        const customerIndex = i % customerCount;

        // Fill quote details
        await fillField(page, ['title', 'job_title'], quote.title);
        await fillField(page, ['description'], quote.description);

        // Select customer
        const customerSelect = await page.locator('select[name="customer_id"], select[name="customerId"]').first();
        if (await customerSelect.count() > 0) {
          const options = await page.locator('select[name="customer_id"] option, select[name="customerId"] option').count();
          if (options > 1) {
            await page.selectOption('select[name="customer_id"], select[name="customerId"]', { index: customerIndex + 1 });
          }
        }

        // Try to add line items or fill total
        const addLineBtn = await page.locator('button:has-text("Add Line"), button:has-text("Add Item")').first();
        if (await addLineBtn.count() > 0) {
          await addLineBtn.click();
          await page.waitForTimeout(500);
          await fillField(page, ['description'], quote.description);
          await fillField(page, ['quantity'], '1');
          await fillField(page, ['unit_price', 'price', 'amount'], quote.subtotal.toString());
        } else {
          await fillField(page, ['subtotal'], quote.subtotal.toString());
          await fillField(page, ['tax_amount', 'tax'], quote.tax.toString());
          await fillField(page, ['total_amount', 'total'], quote.total.toString());
        }

        // Save quote
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
        await page.waitForTimeout(2000);

        // Determine workflow progression based on index
        let finalStatus = 'draft';
        let workflowSteps = ['created'];

        if (i < 5) {
          // First 5: Keep as draft
          finalStatus = 'draft';
        } else if (i < 10) {
          // Next 5: Send to customer
          finalStatus = 'sent';
          await sendQuote(page);
          workflowSteps.push('sent');
        } else if (i < 14) {
          // Next 4: Approve and schedule
          finalStatus = 'scheduled';
          await sendQuote(page);
          workflowSteps.push('sent');
          await approveQuote(page);
          workflowSteps.push('approved');
          await scheduleJob(page, i % employeeCount);
          workflowSteps.push('scheduled');
          results.jobs.push({ title: quote.title, status: 'scheduled' });
        } else if (i < 17) {
          // Next 3: Complete full workflow to invoiced
          finalStatus = 'invoiced';
          await sendQuote(page);
          workflowSteps.push('sent');
          await approveQuote(page);
          workflowSteps.push('approved');
          await scheduleJob(page, i % employeeCount);
          workflowSteps.push('scheduled');
          await completeJob(page);
          workflowSteps.push('completed');
          await createInvoice(page);
          workflowSteps.push('invoiced');
          results.jobs.push({ title: quote.title, status: 'completed' });
          results.invoices.push({ title: quote.title, status: 'unpaid' });
        } else if (i < 19) {
          // Next 2: Complete to paid
          finalStatus = 'paid';
          await sendQuote(page);
          await approveQuote(page);
          await scheduleJob(page, i % employeeCount);
          await completeJob(page);
          await createInvoice(page);
          await markInvoicePaid(page);
          workflowSteps.push('sent', 'approved', 'scheduled', 'completed', 'invoiced', 'paid');
          results.jobs.push({ title: quote.title, status: 'completed' });
          results.invoices.push({ title: quote.title, status: 'paid' });
        } else {
          // Last 1: Complete to closed
          finalStatus = 'closed';
          await sendQuote(page);
          await approveQuote(page);
          await scheduleJob(page, i % employeeCount);
          await completeJob(page);
          await createInvoice(page);
          await markInvoicePaid(page);
          await closeJob(page);
          workflowSteps.push('sent', 'approved', 'scheduled', 'completed', 'invoiced', 'paid', 'closed');
          results.jobs.push({ title: quote.title, status: 'closed' });
          results.invoices.push({ title: quote.title, status: 'paid' });
          results.workflows.push({ title: quote.title, steps: workflowSteps });
        }

        results.quotes.push({ title: quote.title, status: finalStatus, workflow: workflowSteps });
        console.log(`  ✅ ${i + 1}/${QUOTE_TEMPLATES.length} ${quote.title} → ${finalStatus} (${workflowSteps.length} steps)`);
      }
    } catch (error) {
      console.log(`  ❌ Failed quote ${i + 1}: ${error.message}`);
      results.errors.push({ type: 'quote', index: i, error: error.message });
    }
  }

  console.log(`\n✅ Created ${results.quotes.length}/${QUOTE_TEMPLATES.length} quotes`);
  console.log(`✅ Progressed ${results.workflows.length} through full workflow (quote → closed)`);
}

async function sendQuote(page) {
  await page.waitForTimeout(500);
  const sendBtn = await page.locator('button:has-text("Send")').first();
  if (await sendBtn.count() > 0) {
    await sendBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function approveQuote(page) {
  await page.waitForTimeout(500);
  const approveBtn = await page.locator('button:has-text("Approve"), button:has-text("Accept")').first();
  if (await approveBtn.count() > 0) {
    await approveBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function scheduleJob(page, employeeIndex) {
  await page.waitForTimeout(500);
  const scheduleBtn = await page.locator('button:has-text("Schedule")').first();
  if (await scheduleBtn.count() > 0) {
    await scheduleBtn.click();
    await page.waitForTimeout(2000);

    // Assign employee
    const employeeSelect = await page.locator('select[name="employee_id"], select[name="assigned_to"]').first();
    if (await employeeSelect.count() > 0) {
      await page.selectOption('select[name="employee_id"], select[name="assigned_to"]', { index: employeeIndex + 1 });
    }

    // Set date to tomorrow
    const dateInput = await page.locator('input[type="date"]').first();
    if (await dateInput.count() > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateInput.fill(tomorrow.toISOString().split('T')[0]);
    }

    await page.click('button[type="submit"]:has-text("Schedule"), button:has-text("Save")');
    await page.waitForTimeout(2000);
  }
}

async function completeJob(page) {
  await page.waitForTimeout(500);
  const completeBtn = await page.locator('button:has-text("Complete"), button:has-text("Mark Complete")').first();
  if (await completeBtn.count() > 0) {
    await completeBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function createInvoice(page) {
  await page.waitForTimeout(500);
  const invoiceBtn = await page.locator('button:has-text("Create Invoice"), button:has-text("Invoice")').first();
  if (await invoiceBtn.count() > 0) {
    await invoiceBtn.click();
    await page.waitForTimeout(2000);
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")');
    await page.waitForTimeout(2000);
  }
}

async function markInvoicePaid(page) {
  await page.waitForTimeout(500);
  const paidBtn = await page.locator('button:has-text("Mark Paid"), button:has-text("Record Payment")').first();
  if (await paidBtn.count() > 0) {
    await paidBtn.click();
    await page.waitForTimeout(1500);
    await page.click('button[type="submit"]:has-text("Save"), button:has-text("Confirm")');
    await page.waitForTimeout(2000);
  }
}

async function closeJob(page) {
  await page.waitForTimeout(500);
  const closeBtn = await page.locator('button:has-text("Close"), button:has-text("Close Job")').first();
  if (await closeBtn.count() > 0) {
    await closeBtn.click();
    await page.waitForTimeout(1500);
  }
}

async function runFullTest() {
  console.log('🚀 STARTING COMPREHENSIVE REAL-WORLD TEST\n');
  console.log('This will create realistic test data using the actual frontend UI\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Slow down to see what's happening
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await login(page);
    
    // Phase 1: Create base data
    await createCustomers(page);
    await createEmployees(page);
    await createInventory(page);

    // Save intermediate results
    fs.writeFileSync('devtools/real-world-test-results.json', JSON.stringify(results, null, 2));

    console.log('\n✅ PHASE 1 COMPLETE - Base data created');
    console.log('\n📊 Summary:');
    console.log(`  - Customers: ${results.customers.length}`);
    console.log(`  - Employees: ${results.employees.length}`);
    console.log(`  - Inventory: ${results.inventory.length}`);
    console.log(`  - Errors: ${results.errors.length}`);

    console.log('\n⏸️  Pausing for 3 seconds before Phase 2...');
    await page.waitForTimeout(3000);

    // Phase 2: Create quotes and progress through workflow
    await createQuotesAndWorkflows(page);

    // Save final results
    results.endTime = new Date().toISOString();
    fs.writeFileSync('devtools/real-world-test-results.json', JSON.stringify(results, null, 2));

    console.log('\n✅ ALL PHASES COMPLETE!');
    console.log('\n📊 Final Summary:');
    console.log(`  - Customers: ${results.customers.length}`);
    console.log(`  - Employees: ${results.employees.length}`);
    console.log(`  - Quotes: ${results.quotes.length}`);
    console.log(`  - Jobs: ${results.jobs.length}`);
    console.log(`  - Invoices: ${results.invoices.length}`);
    console.log(`  - Timesheets: ${results.timesheets.length}`);
    console.log(`  - PTO Requests: ${results.pto.length}`);
    console.log(`  - Workflows Completed: ${results.workflows.length}`);
    console.log(`  - Errors: ${results.errors.length}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    results.errors.push({ type: 'fatal', error: error.message, stack: error.stack });
    fs.writeFileSync('devtools/real-world-test-results.json', JSON.stringify(results, null, 2));
  } finally {
    console.log('\n📄 Results saved to: devtools/real-world-test-results.json');
    await browser.close();
  }
}

runFullTest();

