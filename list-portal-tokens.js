/**
 * List all work orders with portal tokens
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.SUPABASE_DB_HOST || process.env.DB_HOST;
const DB_PORT = process.env.SUPABASE_DB_PORT || process.env.DB_PORT;
const DB_NAME = process.env.SUPABASE_DB_NAME || process.env.DB_NAME;
const DB_USER = process.env.SUPABASE_DB_USER || process.env.DB_USER;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');
    
    // Get all work orders with portal tokens
    const result = await client.query(`
      SELECT 
        work_order_number,
        quote_number,
        status,
        portal_token,
        portal_link_expires_at,
        created_at
      FROM work_orders
      WHERE portal_token IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log(`📊 Found ${result.rows.length} work orders with portal tokens:\n`);
    
    if (result.rows.length === 0) {
      console.log('❌ No work orders have portal tokens!');
      console.log('\nThis means:');
      console.log('1. No quotes have been created yet, OR');
      console.log('2. The portal_token column is not being populated');
      console.log('\nChecking total work orders...\n');
      
      const totalResult = await client.query(`
        SELECT COUNT(*) as count FROM work_orders
      `);
      
      console.log(`Total work orders in database: ${totalResult.rows[0].count}`);
      
      if (totalResult.rows[0].count > 0) {
        console.log('\nShowing first 5 work orders:\n');
        const sampleResult = await client.query(`
          SELECT 
            work_order_number,
            quote_number,
            status,
            portal_token,
            created_at
          FROM work_orders
          ORDER BY created_at DESC
          LIMIT 5
        `);
        
        sampleResult.rows.forEach(wo => {
          console.log(`  ${wo.work_order_number || wo.quote_number}:`);
          console.log(`    Status: ${wo.status}`);
          console.log(`    Portal Token: ${wo.portal_token || '❌ NULL'}`);
          console.log(`    Created: ${wo.created_at}`);
          console.log();
        });
      }
      
    } else {
      result.rows.forEach((wo, i) => {
        console.log(`${i + 1}. ${wo.work_order_number || wo.quote_number}`);
        console.log(`   Status: ${wo.status}`);
        console.log(`   Token: ${wo.portal_token}`);
        console.log(`   Expires: ${wo.portal_link_expires_at || 'Never'}`);
        console.log(`   Created: ${wo.created_at}`);
        console.log();
      });
      
      console.log('\n💡 To test a token, copy one from above and use:');
      console.log('   https://www.tradesmatepro.com/customer-portal-new.html?token=<TOKEN>');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
})();

