require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
});

async function checkModalColumns() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if modal columns exist in work_orders table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'work_orders'
      AND column_name IN (
        'presented_date', 'presented_time', 'presented_by', 'customer_reaction', 'next_steps', 'presented_notes',
        'change_types', 'change_details', 'change_urgency', 'change_follow_up_date',
        'follow_up_date', 'follow_up_time', 'follow_up_method', 'follow_up_reminder_time', 'follow_up_reason', 'follow_up_notes',
        'rejection_reason', 'rejection_competitor_name', 'rejection_notes'
      )
      ORDER BY column_name;
    `);

    console.log('\n📋 Modal Columns in work_orders table:');
    console.log('=====================================');
    
    if (result.rows.length === 0) {
      console.log('❌ NO MODAL COLUMNS FOUND!');
      console.log('\nThe migration was NOT applied or failed.');
      console.log('Need to run: node scripts/run-sql.js migrations/2025-10-08_quote_modal_data_fields.sql');
    } else {
      console.log(`✅ Found ${result.rows.length} modal columns:\n`);
      result.rows.forEach(row => {
        console.log(`  ${row.column_name.padEnd(30)} ${row.data_type.padEnd(20)} ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Check if there's any data in these columns
    const dataCheck = await client.query(`
      SELECT 
        id, 
        status,
        change_types,
        change_details,
        change_urgency,
        presented_by,
        follow_up_date,
        rejection_reason
      FROM work_orders
      WHERE status IN ('presented', 'changes_requested', 'follow_up', 'rejected')
      LIMIT 5;
    `);

    console.log('\n📊 Sample data from quotes with modal statuses:');
    console.log('================================================');
    if (dataCheck.rows.length === 0) {
      console.log('No quotes found with modal statuses');
    } else {
      dataCheck.rows.forEach(row => {
        console.log(`\nQuote ID: ${row.id}`);
        console.log(`  Status: ${row.status}`);
        console.log(`  change_types: ${row.change_types || 'NULL'}`);
        console.log(`  change_details: ${row.change_details || 'NULL'}`);
        console.log(`  change_urgency: ${row.change_urgency || 'NULL'}`);
        console.log(`  presented_by: ${row.presented_by || 'NULL'}`);
        console.log(`  follow_up_date: ${row.follow_up_date || 'NULL'}`);
        console.log(`  rejection_reason: ${row.rejection_reason || 'NULL'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkModalColumns();

