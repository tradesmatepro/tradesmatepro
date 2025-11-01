/**
 * Fix expiration date for existing paid/closed quotes
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
    
    // Update all paid/closed quotes to have 2 weeks expiration from now
    const result = await client.query(`
      UPDATE work_orders
      SET 
        portal_link_expires_at = now() + interval '2 weeks',
        portal_token_expires_reason = 'migration_fix'
      WHERE status IN ('paid', 'closed')
        AND portal_token IS NOT NULL
      RETURNING 
        work_order_number,
        quote_number,
        status,
        portal_token,
        portal_link_expires_at
    `);

    console.log(`✅ Updated ${result.rows.length} work orders:\n`);
    
    result.rows.forEach(wo => {
      console.log(`  ${wo.work_order_number || wo.quote_number}`);
      console.log(`    Status: ${wo.status}`);
      console.log(`    Token: ${wo.portal_token}`);
      console.log(`    New Expiration: ${wo.portal_link_expires_at}`);
      console.log(`    Portal URL: https://www.tradesmatepro.com/customer-portal-new.html?token=${wo.portal_token}`);
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected');
  }
})();

