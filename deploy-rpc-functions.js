#!/usr/bin/env node
/**
 * Deploy RPC Functions for Employee Management
 */

const { Client } = require('pg');

const DB_CONFIG = {
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!',
  ssl: { rejectUnauthorized: false }
};

const RPC_FUNCTIONS = [
  {
    name: 'get_schedulable_employees',
    sql: `
CREATE OR REPLACE FUNCTION get_schedulable_employees(p_company_id UUID)
RETURNS TABLE (
  id UUID, user_id UUID, full_name TEXT, email TEXT, phone_number TEXT,
  job_title TEXT, department TEXT, hourly_rate NUMERIC, is_schedulable BOOLEAN,
  status TEXT, avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.user_id, u.full_name, u.email, u.phone_number, e.job_title,
    e.department, e.hourly_rate, e.is_schedulable, e.status, u.avatar_url
  FROM employees e
  INNER JOIN users u ON e.user_id = u.id
  WHERE e.company_id = p_company_id AND e.is_schedulable = true AND e.status = 'active'
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'get_all_employees',
    sql: `
CREATE OR REPLACE FUNCTION get_all_employees(p_company_id UUID)
RETURNS TABLE (
  id UUID, user_id UUID, full_name TEXT, email TEXT, phone_number TEXT,
  job_title TEXT, department TEXT, hire_date DATE, hourly_rate NUMERIC,
  overtime_rate NUMERIC, is_schedulable BOOLEAN, status TEXT, avatar_url TEXT,
  emergency_contact_name TEXT, emergency_contact_phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.user_id, u.full_name, u.email, u.phone_number, e.job_title,
    e.department, e.hire_date, e.hourly_rate, e.overtime_rate, e.is_schedulable,
    e.status, u.avatar_url, e.emergency_contact_name, e.emergency_contact_phone
  FROM employees e
  INNER JOIN users u ON e.user_id = u.id
  WHERE e.company_id = p_company_id
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'update_employee_schedulable',
    sql: `
CREATE OR REPLACE FUNCTION update_employee_schedulable(
  p_employee_id UUID, p_company_id UUID, p_is_schedulable BOOLEAN
)
RETURNS JSON AS $$
BEGIN
  UPDATE employees SET is_schedulable = p_is_schedulable, updated_at = now()
  WHERE id = p_employee_id AND company_id = p_company_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Employee not found');
  END IF;
  RETURN json_build_object('success', true, 'employee_id', p_employee_id, 'is_schedulable', p_is_schedulable);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  }
];

async function deployRPCFunctions() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🚀 DEPLOYING RPC FUNCTIONS\n');
    
    await client.connect();
    console.log('✅ Connected to Supabase\n');
    
    for (const func of RPC_FUNCTIONS) {
      try {
        console.log(`📝 Creating function: ${func.name}...`);
        await client.query(func.sql);
        console.log(`✅ Success\n`);
      } catch (error) {
        console.log(`⚠️  Error: ${error.message}\n`);
      }
    }
    
    console.log('✅ RPC Functions deployed!\n');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

deployRPCFunctions();

