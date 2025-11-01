/**
 * Check companies table RLS policies and test PATCH
 */

const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!'
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');
    console.log('='.repeat(80));
    
    // Check RLS status
    console.log('\n📊 ROW LEVEL SECURITY STATUS\n');
    const rlsQuery = `
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE tablename = 'companies';
    `;
    const rlsResult = await client.query(rlsQuery);
    console.log(rlsResult.rows[0]);
    
    // Check RLS policies
    console.log('\n📊 RLS POLICIES ON companies TABLE\n');
    const policiesQuery = `
      SELECT 
        polname as policy_name,
        polcmd as command,
        polpermissive as permissive,
        polroles::regrole[] as roles,
        pg_get_expr(polqual, polrelid) as using_expression,
        pg_get_expr(polwithcheck, polrelid) as with_check_expression
      FROM pg_policy
      WHERE polrelid = 'public.companies'::regclass;
    `;
    const policiesResult = await client.query(policiesQuery);
    
    if (policiesResult.rows.length === 0) {
      console.log('✅ No RLS policies (table is open)');
    } else {
      console.log(`Found ${policiesResult.rows.length} policies:\n`);
      policiesResult.rows.forEach(policy => {
        console.log(`Policy: ${policy.policy_name}`);
        console.log(`  Command: ${policy.command}`);
        console.log(`  Roles: ${policy.roles}`);
        console.log(`  Using: ${policy.using_expression}`);
        console.log(`  With Check: ${policy.with_check_expression}`);
        console.log('');
      });
    }
    
    // Check current data
    console.log('\n📊 CURRENT LICENSE DATA IN DATABASE\n');
    const dataQuery = `
      SELECT id, name, licenses
      FROM public.companies
      WHERE id = 'c27b7833-5eec-4688-8409-cbb6784470c1';
    `;
    const dataResult = await client.query(dataQuery);
    
    if (dataResult.rows.length > 0) {
      const row = dataResult.rows[0];
      console.log(`Company: ${row.name}`);
      console.log(`ID: ${row.id}`);
      console.log(`Licenses (raw):`, row.licenses);
      console.log(`Licenses (type):`, typeof row.licenses);
      console.log(`Licenses (is array):`, Array.isArray(row.licenses));
      
      if (Array.isArray(row.licenses)) {
        console.log(`Licenses (count):`, row.licenses.length);
        if (row.licenses.length > 0) {
          console.log(`Licenses (data):`, JSON.stringify(row.licenses, null, 2));
        } else {
          console.log(`Licenses: EMPTY ARRAY []`);
        }
      }
    } else {
      console.log('❌ Company not found!');
    }
    
    // Test UPDATE permission
    console.log('\n📊 TESTING UPDATE PERMISSION\n');
    try {
      const testUpdate = `
        UPDATE public.companies
        SET licenses = '[{"id": "test_123", "number": "TEST", "state": null, "expiry_date": null, "description": null}]'::jsonb
        WHERE id = 'c27b7833-5eec-4688-8409-cbb6784470c1'
        RETURNING licenses;
      `;
      const updateResult = await client.query(testUpdate);
      console.log('✅ UPDATE successful!');
      console.log('Updated licenses:', updateResult.rows[0].licenses);
      
      // Rollback the test
      const rollback = `
        UPDATE public.companies
        SET licenses = '[]'::jsonb
        WHERE id = 'c27b7833-5eec-4688-8409-cbb6784470c1';
      `;
      await client.query(rollback);
      console.log('✅ Test data rolled back');
    } catch (error) {
      console.log('❌ UPDATE failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();

