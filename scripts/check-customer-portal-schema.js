const { Client } = require('pg');

async function checkCustomerPortalSchema() {
  const config = {
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  console.log('🔍 Connecting to Supabase...\n');
  const client = new Client(config);
  await client.connect();

  try {
    // Check for customer portal related tables
    console.log('📋 CHECKING CUSTOMER PORTAL TABLES:\n');
    
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND (
          table_name LIKE '%portal%' 
          OR table_name LIKE '%customer%'
          OR table_name LIKE '%quote%'
          OR table_name LIKE '%invoice%'
          OR table_name LIKE '%payment%'
          OR table_name LIKE '%activity%'
          OR table_name LIKE '%tracking%'
          OR table_name LIKE '%notification%'
          OR table_name LIKE '%magic%'
          OR table_name LIKE '%token%'
          OR table_name LIKE '%link%'
        )
      ORDER BY table_name;
    `);
    
    console.log('Found tables:', tables.rows.map(r => r.table_name).join(', '));
    console.log('\n');

    // Check work_orders table (quotes/invoices)
    console.log('📋 WORK_ORDERS TABLE (quotes/invoices):');
    const workOrdersSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'work_orders'
      ORDER BY ordinal_position;
    `);
    console.table(workOrdersSchema.rows);

    // Check customers table
    console.log('\n📋 CUSTOMERS TABLE:');
    const customersSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'customers'
      ORDER BY ordinal_position;
    `);
    console.table(customersSchema.rows);

    // Check payments table
    console.log('\n📋 PAYMENTS TABLE:');
    const paymentsSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'payments'
      ORDER BY ordinal_position;
    `);
    console.table(paymentsSchema.rows);

    // Check if customer_portal_sessions or similar exists
    const portalSessionCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_portal_sessions'
      );
    `);
    console.log('\n📋 customer_portal_sessions table exists?', portalSessionCheck.rows[0].exists);

    // Check if customer_portal_activity exists
    const portalActivityCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customer_portal_activity'
      );
    `);
    console.log('📋 customer_portal_activity table exists?', portalActivityCheck.rows[0].exists);

    // Check if quote_views or email_tracking exists
    const quoteViewsCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'quote_views'
      );
    `);
    console.log('📋 quote_views table exists?', quoteViewsCheck.rows[0].exists);

    const emailTrackingCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'email_tracking'
      );
    `);
    console.log('📋 email_tracking table exists?', emailTrackingCheck.rows[0].exists);

    // Check user_activity_log
    console.log('\n📋 USER_ACTIVITY_LOG TABLE:');
    const activityLogSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user_activity_log'
      ORDER BY ordinal_position;
    `);
    if (activityLogSchema.rows.length > 0) {
      console.table(activityLogSchema.rows);
    } else {
      console.log('Table does not exist');
    }

    // Sample work order to see what fields exist
    console.log('\n📊 SAMPLE WORK ORDER (QUOTE):');
    const sampleQuote = await client.query(`
      SELECT * FROM work_orders WHERE status = 'quote' LIMIT 1;
    `);
    if (sampleQuote.rows.length > 0) {
      console.log('Available columns:', Object.keys(sampleQuote.rows[0]).join(', '));
      console.log('\nSample quote:', JSON.stringify(sampleQuote.rows[0], null, 2));
    } else {
      console.log('No quotes found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkCustomerPortalSchema().catch(console.error);

