// Add UPPERCASE enum values one at a time (can't be done in transaction)
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const uppercaseValues = [
  'DRAFT', 'QUOTE', 'SENT', 'ACCEPTED', 'REJECTED',
  'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
  'INVOICED', 'PAID', 'CLOSED'
];

async function addEnumValues() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    for (const value of uppercaseValues) {
      try {
        await client.query(`ALTER TYPE work_order_status_enum ADD VALUE IF NOT EXISTS '${value}'`);
        console.log(`✅ Added enum value: ${value}`);
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log(`⏭️  Enum value already exists: ${value}`);
        } else {
          console.error(`❌ Error adding ${value}:`, err.message);
        }
      }
    }

    // Show all enum values
    const result = await client.query(`
      SELECT unnest(enum_range(NULL::work_order_status_enum))::text as value
      ORDER BY value
    `);
    
    console.log('\n📋 All enum values:');
    result.rows.forEach(row => console.log(`  - ${row.value}`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
  }
}

addEnumValues();

