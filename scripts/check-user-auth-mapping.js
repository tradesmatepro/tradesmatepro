/**
 * Check if user's auth_user_id is correctly mapped
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
    
    // Check user mapping
    console.log('\n📊 USER AUTH MAPPING\n');
    const userQuery = `
      SELECT 
        u.id as user_id,
        u.email,
        u.company_id,
        u.auth_user_id,
        c.name as company_name
      FROM public.users u
      LEFT JOIN public.companies c ON u.company_id = c.id
      WHERE u.email = 'andy@andysflowers.com';
    `;
    const userResult = await client.query(userQuery);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      console.log('User found:');
      console.log(`  Email: ${user.email}`);
      console.log(`  User ID: ${user.user_id}`);
      console.log(`  Company ID: ${user.company_id}`);
      console.log(`  Auth User ID: ${user.auth_user_id}`);
      console.log(`  Company Name: ${user.company_name}`);
      
      // Check if auth_user_id exists in auth.users
      console.log('\n📊 CHECKING AUTH.USERS TABLE\n');
      const authQuery = `
        SELECT id, email, created_at
        FROM auth.users
        WHERE email = 'andy@andysflowers.com';
      `;
      const authResult = await client.query(authQuery);
      
      if (authResult.rows.length > 0) {
        const authUser = authResult.rows[0];
        console.log('Auth user found:');
        console.log(`  Auth ID: ${authUser.id}`);
        console.log(`  Email: ${authUser.email}`);
        console.log(`  Created: ${authUser.created_at}`);
        
        // Check if they match
        console.log('\n📊 VERIFICATION\n');
        if (user.auth_user_id === authUser.id) {
          console.log('✅ auth_user_id MATCHES auth.users.id');
        } else {
          console.log('❌ MISMATCH!');
          console.log(`  users.auth_user_id: ${user.auth_user_id}`);
          console.log(`  auth.users.id: ${authUser.id}`);
          console.log('\n🔧 FIX: Run this SQL to update:');
          console.log(`  UPDATE public.users SET auth_user_id = '${authUser.id}' WHERE email = 'andy@andysflowers.com';`);
        }
      } else {
        console.log('❌ No auth.users record found for this email!');
      }
      
      // Test RLS policy
      console.log('\n📊 TESTING RLS POLICY FUNCTION\n');
      const rlsTestQuery = `
        SELECT 
          '${user.auth_user_id}'::uuid as current_auth_uid,
          (SELECT company_id FROM users WHERE auth_user_id = '${user.auth_user_id}' LIMIT 1) as policy_company_id,
          '${user.company_id}'::uuid as actual_company_id,
          ('${user.company_id}'::uuid = (SELECT company_id FROM users WHERE auth_user_id = '${user.auth_user_id}' LIMIT 1)) as policy_would_pass;
      `;
      const rlsTestResult = await client.query(rlsTestQuery);
      console.log(rlsTestResult.rows[0]);
      
      if (rlsTestResult.rows[0].policy_would_pass) {
        console.log('\n✅ RLS policy SHOULD allow updates');
      } else {
        console.log('\n❌ RLS policy WOULD BLOCK updates');
      }
      
    } else {
      console.log('❌ User not found in users table!');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

main();

