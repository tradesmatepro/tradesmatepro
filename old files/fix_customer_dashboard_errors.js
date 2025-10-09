// Automated Customer Dashboard 400 Error Fix
const fetch = require('node-fetch');

const DEV_PROXY_URL = 'http://127.0.0.1:4000/dev/sql/exec';

async function execSQL(sql) {
  try {
    const response = await fetch(DEV_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error: error.message };
  }
}

async function fixCustomerDashboardErrors() {
  console.log('🔧 FIXING CUSTOMER DASHBOARD 400 ERRORS...\n');

  // 1. Check if missing tables exist
  console.log('1️⃣ Checking missing tables...');
  
  const missingTables = ['customer_messages', 'service_requests'];
  for (const table of missingTables) {
    const result = await execSQL(`SELECT COUNT(*) FROM ${table}`);
    if (result.success) {
      console.log(`✅ ${table} exists`);
    } else {
      console.log(`❌ ${table} missing - creating...`);
      await createMissingTable(table);
    }
  }

  // 2. Check customers table company_id column
  console.log('\n2️⃣ Checking customers table structure...');
  const customersCheck = await execSQL(`SELECT column_name FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'company_id'`);
  if (customersCheck.success && customersCheck.data && customersCheck.data.length > 0) {
    console.log('✅ customers.company_id exists');
  } else {
    console.log('❌ customers.company_id missing - adding...');
    await execSQL(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)`);
  }

  // 3. Test the actual failing queries
  console.log('\n3️⃣ Testing failing queries...');
  const testQueries = [
    'SELECT COUNT(*) FROM customer_messages',
    'SELECT COUNT(*) FROM customers WHERE company_id IS NOT NULL',
    'SELECT COUNT(*) FROM service_requests'
  ];

  for (const query of testQueries) {
    const result = await execSQL(query);
    if (result.success) {
      console.log(`✅ ${query} - SUCCESS`);
    } else {
      console.log(`❌ ${query} - ERROR: ${result.error}`);
    }
  }

  console.log('\n🎯 Customer Dashboard fix complete!');
}

async function createMissingTable(tableName) {
  let createSQL = '';
  
  if (tableName === 'customer_messages') {
    createSQL = `
      CREATE TABLE IF NOT EXISTS customer_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        message TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`;
  } else if (tableName === 'service_requests') {
    createSQL = `
      CREATE TABLE IF NOT EXISTS service_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id),
        company_id UUID REFERENCES companies(id),
        title TEXT,
        description TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`;
  }

  if (createSQL) {
    const result = await execSQL(createSQL);
    if (result.success) {
      console.log(`✅ Created ${tableName}`);
    } else {
      console.log(`❌ Failed to create ${tableName}: ${result.error}`);
    }
  }
}

// Run the fix
fixCustomerDashboardErrors().catch(console.error);
