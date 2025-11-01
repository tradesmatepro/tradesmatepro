/**
 * Check token in database
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.SUPABASE_DB_HOST || process.env.DB_HOST;
const DB_PORT = process.env.SUPABASE_DB_PORT || process.env.DB_PORT;
const DB_NAME = process.env.SUPABASE_DB_NAME || process.env.DB_NAME;
const DB_USER = process.env.SUPABASE_DB_USER || process.env.DB_USER;
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const token = process.argv[2] || '1b9c5296-5b76-4517-89f6-fbffae7d6842';

(async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🔌 Connected to database\n');
    
    // Check if work order exists with this token
    const result = await client.query(`
      SELECT 
        id,
        work_order_number,
        quote_number,
        status,
        portal_token,
        portal_link_expires_at,
        portal_token_expires_reason,
        customer_id,
        created_at
      FROM work_orders
      WHERE portal_token = $1
    `, [token]);

    console.log('📊 Query Results:\n');
    
    if (result.rows.length === 0) {
      console.log('❌ NO WORK ORDER FOUND with token:', token);
      console.log('\nPossible reasons:');
      console.log('1. Token is incorrect');
      console.log('2. Work order was deleted');
      console.log('3. Token was regenerated');
      console.log('\nSearching for any work orders with similar tokens...\n');
      
      const similarResult = await client.query(`
        SELECT 
          work_order_number,
          quote_number,
          portal_token,
          status
        FROM work_orders
        WHERE portal_token LIKE $1
        LIMIT 5
      `, [`${token.substring(0, 10)}%`]);
      
      if (similarResult.rows.length > 0) {
        console.log('Found similar tokens:');
        similarResult.rows.forEach(row => {
          console.log(`  - ${row.work_order_number}: ${row.portal_token}`);
        });
      } else {
        console.log('No similar tokens found.');
      }
      
    } else {
      const wo = result.rows[0];
      console.log('✅ WORK ORDER FOUND:');
      console.log('  ID:', wo.id);
      console.log('  Work Order #:', wo.work_order_number);
      console.log('  Quote #:', wo.quote_number);
      console.log('  Status:', wo.status);
      console.log('  Customer ID:', wo.customer_id);
      console.log('  Portal Token:', wo.portal_token);
      console.log('  Token Expires:', wo.portal_link_expires_at || 'Never');
      console.log('  Expiration Reason:', wo.portal_token_expires_reason || 'N/A');
      console.log('  Created:', wo.created_at);
      
      // Check if expired
      if (wo.portal_link_expires_at) {
        const expiresAt = new Date(wo.portal_link_expires_at);
        const now = new Date();
        const isExpired = expiresAt < now;
        
        console.log('\n⏰ Expiration Check:');
        console.log('  Expires at:', expiresAt.toISOString());
        console.log('  Current time:', now.toISOString());
        console.log('  Is expired?', isExpired ? '❌ YES' : '✅ NO');
      }
      
      // Check customer
      if (wo.customer_id) {
        const customerResult = await client.query(`
          SELECT id, name, email
          FROM customers
          WHERE id = $1
        `, [wo.customer_id]);
        
        if (customerResult.rows.length > 0) {
          const customer = customerResult.rows[0];
          console.log('\n👤 Customer:');
          console.log('  ID:', customer.id);
          console.log('  Name:', customer.name);
          console.log('  Email:', customer.email);
        } else {
          console.log('\n❌ Customer not found! (ID:', wo.customer_id, ')');
        }
      }
      
      // Test the RPC function
      console.log('\n🧪 Testing RPC function...\n');
      const rpcResult = await client.query(`
        SELECT get_living_quote_data($1) as result
      `, [token]);
      
      console.log('RPC Result:', JSON.stringify(rpcResult.rows[0].result, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detail:', error.detail);
    if (error.hint) console.error('Hint:', error.hint);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected');
  }
})();

