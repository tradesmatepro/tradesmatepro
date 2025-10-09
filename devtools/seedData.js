/**
 * 🌱 SIMPLE DATA SEEDER
 * 
 * Creates realistic test data quickly without complex workflows.
 * Perfect for populating a fresh database or demo environment.
 * 
 * CREATES:
 * - 10 customers (residential + commercial)
 * - 5 employees (various roles)
 * - 15 quotes (various amounts)
 * 
 * NO COMPLEX WORKFLOWS - Just creates the data!
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
  errors: []
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

const QUOTES = [
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
  { title: 'Tankless Water Heater', description: 'Install tankless water heater system', subtotal: 2909.09, tax: 290.91, total: 3200 }
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

async function createCustomers(page) {
  console.log(`\n👥 Creating ${CUSTOMERS.length} customers...`);
  
  for (let i = 0; i < CUSTOMERS.length; i++) {
    try {
      await page.goto(`${APP_URL}/customers`);
      await page.waitForTimeout(1000);
      
      const addBtn = await page.locator('button:has-text("Add Customer"), button:has-text("New Customer"), button:has-text("Create Customer")').first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        
        const customer = CUSTOMERS[i];
        
        await fillField(page, ['name', 'customer_name'], customer.name);
        await fillField(page, ['phone', 'phone_number'], customer.phone);
        await fillField(page, ['email'], customer.email);
        await fillField(page, ['street_address', 'address', 'address_line1'], customer.address);
        await fillField(page, ['city'], customer.city);
        await fillField(page, ['state', 'state_province'], customer.state);
        await fillField(page, ['zip_code', 'zip', 'postal_code'], customer.zip);
        
        const typeSelect = await page.locator('select[name="customer_type"], select[name="type"]').count();
        if (typeSelect > 0) {
          await page.selectOption('select[name="customer_type"], select[name="type"]', customer.type);
        }
        
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create"), button:has-text("Add Customer")');
        await page.waitForTimeout(1500);
        
        results.customers.push({ name: customer.name, status: 'created' });
        console.log(`  ✅ ${i + 1}/${CUSTOMERS.length} ${customer.name}`);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${CUSTOMERS[i].name} - ${error.message}`);
      results.errors.push({ type: 'customer', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.customers.length}/${CUSTOMERS.length} customers`);
}

async function createEmployees(page) {
  console.log(`\n👷 Creating ${EMPLOYEES.length} employees...`);
  
  for (let i = 0; i < EMPLOYEES.length; i++) {
    try {
      await page.goto(`${APP_URL}/employees`);
      await page.waitForTimeout(1000);
      
      const addBtn = await page.locator('button:has-text("Add Employee"), button:has-text("New Employee"), button:has-text("Create Employee")').first();
      if (await addBtn.count() > 0) {
        await addBtn.click();
        await page.waitForTimeout(1000);
        
        const employee = EMPLOYEES[i];
        
        await fillField(page, ['first_name', 'firstName'], employee.firstName);
        await fillField(page, ['last_name', 'lastName'], employee.lastName);
        await fillField(page, ['email'], employee.email);
        await fillField(page, ['phone', 'phone_number'], employee.phone);
        await fillField(page, ['hourly_rate', 'hourlyRate', 'rate'], employee.hourlyRate.toString());
        
        const roleSelect = await page.locator('select[name="role"]').count();
        if (roleSelect > 0) {
          await page.selectOption('select[name="role"]', employee.role);
        }
        
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
        await page.waitForTimeout(1500);
        
        results.employees.push({ name: `${employee.firstName} ${employee.lastName}`, role: employee.role, status: 'created' });
        console.log(`  ✅ ${i + 1}/${EMPLOYEES.length} ${employee.firstName} ${employee.lastName} (${employee.role})`);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${EMPLOYEES[i].firstName} ${EMPLOYEES[i].lastName} - ${error.message}`);
      results.errors.push({ type: 'employee', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.employees.length}/${EMPLOYEES.length} employees`);
}

async function createQuotes(page) {
  console.log(`\n📋 Creating ${QUOTES.length} quotes...`);
  
  const customerCount = results.customers.length;
  
  for (let i = 0; i < QUOTES.length; i++) {
    try {
      await page.goto(`${APP_URL}/quotes`);
      await page.waitForTimeout(1000);
      
      const createBtn = await page.locator('button:has-text("Create Quote"), button:has-text("New Quote"), button:has-text("Add Quote")').first();
      if (await createBtn.count() > 0) {
        await createBtn.click();
        await page.waitForTimeout(1500);
        
        const quote = QUOTES[i];
        const customerIndex = i % customerCount;
        
        await fillField(page, ['title', 'job_title'], quote.title);
        await fillField(page, ['description'], quote.description);
        
        const customerSelect = await page.locator('select[name="customer_id"], select[name="customerId"]').first();
        if (await customerSelect.count() > 0) {
          const options = await page.locator('select[name="customer_id"] option, select[name="customerId"] option').count();
          if (options > 1) {
            await page.selectOption('select[name="customer_id"], select[name="customerId"]', { index: customerIndex + 1 });
          }
        }
        
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
        
        await page.click('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")');
        await page.waitForTimeout(1500);
        
        results.quotes.push({ title: quote.title, amount: quote.total, status: 'created' });
        console.log(`  ✅ ${i + 1}/${QUOTES.length} ${quote.title} ($${quote.total})`);
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${QUOTES[i].title} - ${error.message}`);
      results.errors.push({ type: 'quote', index: i, error: error.message });
    }
  }
  
  console.log(`✅ Created ${results.quotes.length}/${QUOTES.length} quotes`);
}

async function runSeeder() {
  console.log('🌱 STARTING DATA SEEDER\n');
  console.log('This will create realistic test data using the actual frontend UI\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 50
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await login(page);
    await createCustomers(page);
    await createEmployees(page);
    await createQuotes(page);
    
    results.endTime = new Date().toISOString();
    fs.writeFileSync('devtools/seed-results.json', JSON.stringify(results, null, 2));
    
    const totalValue = results.quotes.reduce((sum, q) => sum + q.amount, 0);
    
    console.log('\n✅ SEEDING COMPLETE!\n');
    console.log('📊 Summary:');
    console.log(`  - Customers: ${results.customers.length}/${CUSTOMERS.length}`);
    console.log(`  - Employees: ${results.employees.length}/${EMPLOYEES.length}`);
    console.log(`  - Quotes: ${results.quotes.length}/${QUOTES.length}`);
    console.log(`  - Total Quote Value: $${totalValue.toLocaleString()}`);
    console.log(`  - Errors: ${results.errors.length}`);
    console.log('\n📄 Results saved to: devtools/seed-results.json');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    results.errors.push({ type: 'fatal', error: error.message, stack: error.stack });
    fs.writeFileSync('devtools/seed-results.json', JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

runSeeder();

