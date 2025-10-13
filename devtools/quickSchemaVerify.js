/**
 * QUICK SCHEMA VERIFICATION
 * 
 * Directly checks database to verify all columns exist
 */

const { Client } = require('pg');

const DB_HOST = 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = 'Alphaecho19!';

async function quickVerify() {
  console.log('\n🔍 QUICK SCHEMA VERIFICATION');
  console.log('='.repeat(80));

  const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check companies table
    console.log('📋 COMPANIES TABLE:');
    const companiesResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'companies'
      AND column_name IN ('licenses', 'job_buffer_minutes', 'business_hours_start', 'working_days')
      ORDER BY column_name
    `);
    
    const expectedCompaniesColumns = ['licenses', 'job_buffer_minutes', 'business_hours_start', 'working_days'];
    const foundCompaniesColumns = companiesResult.rows.map(r => r.column_name);
    
    expectedCompaniesColumns.forEach(col => {
      if (foundCompaniesColumns.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - MISSING!`);
      }
    });

    // Check rate_cards table
    console.log('\n📋 RATE_CARDS TABLE:');
    const rateCardsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'rate_cards'
      AND column_name IN ('service_name', 'description', 'category', 'unit_type', 'rate', 'sort_order', 'is_active')
      ORDER BY column_name
    `);
    
    const expectedRateCardsColumns = ['service_name', 'description', 'category', 'unit_type', 'rate', 'sort_order', 'is_active'];
    const foundRateCardsColumns = rateCardsResult.rows.map(r => r.column_name);
    
    expectedRateCardsColumns.forEach(col => {
      if (foundRateCardsColumns.includes(col)) {
        console.log(`   ✅ ${col}`);
      } else {
        console.log(`   ❌ ${col} - MISSING!`);
      }
    });

    // Check invoice_items table
    console.log('\n📋 INVOICE_ITEMS TABLE:');
    const invoiceItemsResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'invoice_items'
    `);
    
    if (invoiceItemsResult.rows.length > 0) {
      console.log('   ✅ Table exists');
    } else {
      console.log('   ❌ Table MISSING!');
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    
    const companiesMissing = expectedCompaniesColumns.filter(c => !foundCompaniesColumns.includes(c));
    const rateCardsMissing = expectedRateCardsColumns.filter(c => !foundRateCardsColumns.includes(c));
    const invoiceItemsMissing = invoiceItemsResult.rows.length === 0;
    
    if (companiesMissing.length === 0 && rateCardsMissing.length === 0 && !invoiceItemsMissing) {
      console.log('\n🎉 ALL SCHEMA FIXES VERIFIED!');
      console.log('\n✅ companies table: All columns present');
      console.log('✅ rate_cards table: All columns present');
      console.log('✅ invoice_items table: Exists');
      console.log('\n🚀 The app should now work without schema errors!');
      console.log('   Just rebuild: Ctrl+C then npm start\n');
    } else {
      console.log('\n⚠️  SOME ISSUES REMAIN:');
      if (companiesMissing.length > 0) {
        console.log(`   ❌ companies missing: ${companiesMissing.join(', ')}`);
      }
      if (rateCardsMissing.length > 0) {
        console.log(`   ❌ rate_cards missing: ${rateCardsMissing.join(', ')}`);
      }
      if (invoiceItemsMissing) {
        console.log('   ❌ invoice_items table missing');
      }
    }

    await client.end();

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    process.exit(1);
  }
}

quickVerify();

