const { Client } = require('pg');

const projectRef = 'cxlqzejzraczumqmsrcx';
const config = {
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  user: `postgres.${projectRef}`,
  password: 'Alphaecho19!',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function auditExpensesSchema() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check if expenses table exists
    console.log('=== EXPENSES TABLE ===');
    const expensesExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='expenses'
      ) as exists
    `);
    
    if (expensesExists.rows[0].exists) {
      console.log('✅ expenses table EXISTS\n');
      
      // Show columns
      const cols = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='expenses'
        ORDER BY ordinal_position
      `);
      console.log('Columns:');
      cols.rows.forEach(row => {
        console.log(`  ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
      });
      
      // Check for enum types
      console.log('\n=== EXPENSE ENUMS ===');
      const enums = await client.query(`
        SELECT t.typname as enum_name, e.enumlabel as enum_value
        FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid  
        WHERE t.typname LIKE '%expense%'
        ORDER BY t.typname, e.enumsortorder
      `);
      
      if (enums.rows.length > 0) {
        let currentEnum = '';
        enums.rows.forEach(row => {
          if (row.enum_name !== currentEnum) {
            console.log(`\n${row.enum_name}:`);
            currentEnum = row.enum_name;
          }
          console.log(`  - ${row.enum_value}`);
        });
      } else {
        console.log('❌ No expense-related enums found');
      }
      
    } else {
      console.log('❌ expenses table DOES NOT EXIST');
    }

    // 2. Check expense_categories table
    console.log('\n\n=== EXPENSE_CATEGORIES TABLE ===');
    const categoriesExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='expense_categories'
      ) as exists
    `);
    
    if (categoriesExists.rows[0].exists) {
      console.log('✅ expense_categories table EXISTS');
      const count = await client.query(`SELECT COUNT(*) as count FROM expense_categories`);
      console.log(`   ${count.rows[0].count} categories in database\n`);
      
      const cats = await client.query(`SELECT * FROM expense_categories ORDER BY name LIMIT 10`);
      console.log('Sample categories:');
      cats.rows.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.id})`);
      });
    } else {
      console.log('❌ expense_categories table DOES NOT EXIST');
    }

    // 3. Check reimbursement_requests table
    console.log('\n\n=== REIMBURSEMENT_REQUESTS TABLE ===');
    const reimbExists = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema='public' AND table_name='reimbursement_requests'
      ) as exists
    `);
    
    if (reimbExists.rows[0].exists) {
      console.log('✅ reimbursement_requests table EXISTS');
    } else {
      console.log('❌ reimbursement_requests table DOES NOT EXIST');
    }

    console.log('\n✅ Expenses schema audit complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

auditExpensesSchema();

