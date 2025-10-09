const { Client } = require('pg');
const fs = require('fs');

// Try to read Supabase config
let config;
try {
  config = JSON.parse(fs.readFileSync('Supabase Schema/db-schema-config.json', 'utf8'));
} catch (e) {
  console.log('❌ Could not read Supabase Schema/db-schema-config.json');
  process.exit(1);
}

const client = new Client({
  host: config.db_host,
  port: config.db_port,
  database: config.db_name,
  user: config.db_user,
  password: config.db_password,
  ssl: { rejectUnauthorized: false }
});

async function auditMarketplaceSchema() {
  console.log('🔍 FULL AUDIT: marketplace_requests table schema');

  try {
    await client.connect();

    // Get actual table structure from information_schema
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default, udt_name
      FROM information_schema.columns
      WHERE table_name = 'marketplace_requests'
        AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    const columnsResult = await client.query(columnsQuery);
    const columns = columnsResult.rows;

    console.log('📋 ACTUAL marketplace_requests columns:');
    columns.forEach((col, i) => {
      const enumInfo = col.udt_name.includes('enum') ? ` [ENUM: ${col.udt_name}]` : '';
      console.log(`  ${i+1}. ${col.column_name} (${col.data_type}${enumInfo}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? 'DEFAULT ' + col.column_default : ''}`);
    });

    // Test a simple select to see what works
    console.log('\n🧪 Testing simple select...');
    const testQuery = 'SELECT * FROM marketplace_requests LIMIT 1;';
    const testResult = await client.query(testQuery);

    console.log('✅ Select test successful');
    if (testResult.rows && testResult.rows.length > 0) {
      console.log('📄 Sample record fields:', Object.keys(testResult.rows[0]));
    } else {
      console.log('📄 No records found, but table exists');
    }

    // Get enum values if they exist
    console.log('\n🔍 Checking enum values...');
    const enumColumns = columns.filter(col => col.udt_name.includes('enum'));

    for (const enumCol of enumColumns) {
      const enumQuery = `
        SELECT enumlabel
        FROM pg_enum
        WHERE enumtypid = (
          SELECT oid
          FROM pg_type
          WHERE typname = '${enumCol.udt_name}'
        )
        ORDER BY enumsortorder;
      `;

      try {
        const enumResult = await client.query(enumQuery);
        console.log(`📋 ${enumCol.column_name} (${enumCol.udt_name}) values:`, enumResult.rows.map(r => r.enumlabel));
      } catch (enumError) {
        console.log(`⚠️ Could not get enum values for ${enumCol.column_name}:`, enumError.message);
      }
    }

  } catch (error) {
    console.error('❌ Audit failed:', error);
  } finally {
    await client.end();
  }
}

auditMarketplaceSchema();
