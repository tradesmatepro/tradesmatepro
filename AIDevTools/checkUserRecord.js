#!/usr/bin/env node

/**
 * Check if user record exists for the test account
 */

const { Client } = require('pg');
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'aws-1-us-west-1.pooler.supabase.com';
const DB_PORT = process.env.DB_PORT || '5432';
const DB_USER = process.env.DB_USER || 'postgres.cxlqzejzraczumqmsrcx';
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'postgres';

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function checkUserRecord() {
  const client = new Client({ connectionString });

  try {
    console.log('🔍 Checking user record for jeraldjsmith@gmail.com\n');
    await client.connect();

    // Check auth.users table
    console.log('📋 Step 1: Check auth.users table');
    const authResult = await client.query(`
      SELECT id, email, created_at
      FROM auth.users
      WHERE email = 'jeraldjsmith@gmail.com'
    `);
    
    if (authResult.rows.length === 0) {
      console.log('   ❌ No auth user found!');
      return;
    }
    
    const authUser = authResult.rows[0];
    console.log(`   ✅ Auth user found: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}`);
    console.log(`   Created: ${authUser.created_at}\n`);

    // Check public.users table
    console.log('📋 Step 2: Check public.users table');
    const usersResult = await client.query(`
      SELECT id, auth_user_id, company_id, role, status, created_at
      FROM users
      WHERE auth_user_id = $1
    `, [authUser.id]);
    
    if (usersResult.rows.length === 0) {
      console.log('   ❌ No business user record found!');
      console.log('   🔧 This is the problem - need to create a users record\n');
      
      // Check if there's a users record with matching email
      const emailCheck = await client.query(`
        SELECT id, auth_user_id, company_id, role, status
        FROM users
        WHERE id = $1
      `, [authUser.id]);
      
      if (emailCheck.rows.length > 0) {
        console.log('   ℹ️  Found users record by ID (not auth_user_id):');
        console.log(`      ID: ${emailCheck.rows[0].id}`);
        console.log(`      auth_user_id: ${emailCheck.rows[0].auth_user_id}`);
        console.log(`      company_id: ${emailCheck.rows[0].company_id}`);
        console.log(`      role: ${emailCheck.rows[0].role}`);
        console.log(`      status: ${emailCheck.rows[0].status}\n`);
        
        console.log('   🔧 FIX: Update auth_user_id to match auth.users.id');
        console.log(`   SQL: UPDATE users SET auth_user_id = '${authUser.id}' WHERE id = '${authUser.id}';\n`);
      }
      
      return;
    }
    
    const businessUser = usersResult.rows[0];
    console.log(`   ✅ Business user found: ${businessUser.id}`);
    console.log(`   auth_user_id: ${businessUser.auth_user_id}`);
    console.log(`   company_id: ${businessUser.company_id}`);
    console.log(`   role: ${businessUser.role}`);
    console.log(`   status: ${businessUser.status}\n`);

    // Check employees table
    console.log('📋 Step 3: Check employees table');
    const employeesResult = await client.query(`
      SELECT id, user_id, company_id, is_schedulable
      FROM employees
      WHERE user_id = $1
    `, [businessUser.id]);
    
    if (employeesResult.rows.length === 0) {
      console.log('   ❌ No employee record found!');
    } else {
      const employee = employeesResult.rows[0];
      console.log(`   ✅ Employee found: ${employee.id}`);
      console.log(`   user_id: ${employee.user_id}`);
      console.log(`   company_id: ${employee.company_id}`);
      console.log(`   is_schedulable: ${employee.is_schedulable}\n`);
    }

    // Check RLS policies
    console.log('📋 Step 4: Check RLS policies on users table');
    const policiesResult = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
      FROM pg_policies
      WHERE tablename = 'users'
      ORDER BY policyname
    `);
    
    console.log(`   Found ${policiesResult.rows.length} policies:\n`);
    policiesResult.rows.forEach(policy => {
      console.log(`   📜 ${policy.policyname}`);
      console.log(`      Command: ${policy.cmd}`);
      console.log(`      Using: ${policy.qual}`);
      if (policy.with_check) {
        console.log(`      With Check: ${policy.with_check}`);
      }
      console.log('');
    });

    console.log('============================================================');
    console.log('✅ USER RECORD CHECK COMPLETE');
    console.log('============================================================\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUserRecord();

