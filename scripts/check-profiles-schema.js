const { Client } = require('pg');

async function checkProfilesSchema() {
  const config = {
    host: 'aws-1-us-west-1.pooler.supabase.com',
    port: 5432,
    user: 'postgres.cxlqzejzraczumqmsrcx',
    password: 'Alphaecho19!',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  };

  console.log('🔍 Connecting to Supabase...');
  const client = new Client(config);
  await client.connect();

  try {
    // Check all tables that might have user data
    console.log('\n📋 CHECKING ALL USER-RELATED TABLES:\n');

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%employee%')
      ORDER BY table_name;
    `);

    console.log('Found tables:', tables.rows.map(r => r.table_name).join(', '));

    // Check profiles table
    console.log('\n\n📋 PROFILES TABLE SCHEMA:');
    const profilesSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
      ORDER BY ordinal_position;
    `);
    console.table(profilesSchema.rows);

    // Check users table
    console.log('\n📋 USERS TABLE SCHEMA:');
    const usersSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.table(usersSchema.rows);

    // Check employees table
    console.log('\n📋 EMPLOYEES TABLE SCHEMA:');
    const employeesSchema = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'employees'
      ORDER BY ordinal_position;
    `);
    console.table(employeesSchema.rows);

    // Check for views
    console.log('\n📋 CHECKING FOR VIEWS:');
    const views = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND (table_name LIKE '%user%' OR table_name LIKE '%profile%' OR table_name LIKE '%employee%')
      ORDER BY table_name;
    `);
    console.log('Found views:', views.rows.map(r => r.table_name).join(', '));

    // Check user_profiles view if it exists
    if (views.rows.some(r => r.table_name === 'user_profiles')) {
      console.log('\n📋 USER_PROFILES VIEW SCHEMA:');
      const viewSchema = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
        ORDER BY ordinal_position;
      `);
      console.table(viewSchema.rows);

      console.log('\n📊 SAMPLE USER_PROFILES DATA:');
      const viewData = await client.query(`SELECT * FROM user_profiles LIMIT 1;`);
      if (viewData.rows.length > 0) {
        console.log('Available columns:', Object.keys(viewData.rows[0]).join(', '));
        console.log('\nSample row:', JSON.stringify(viewData.rows[0], null, 2));
      }
    }

    // Get sample joined data
    console.log('\n📊 SAMPLE JOINED DATA (users + profiles):');
    const joinedData = await client.query(`
      SELECT
        u.id as user_id,
        u.email,
        u.company_id,
        p.*
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      LIMIT 1;
    `);
    if (joinedData.rows.length > 0) {
      console.log('Available columns:', Object.keys(joinedData.rows[0]).join(', '));
      console.log('\nSample row:', JSON.stringify(joinedData.rows[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkProfilesSchema().catch(console.error);

