#!/usr/bin/env node
/**
 * Test the SQL Automation System
 * This script tests Claude's ability to automatically fix database issues
 */

// Test function to execute SQL via the automation API
async function executeSql(sql, description = 'Test SQL') {
  try {
    const response = await fetch('http://localhost:4000/dev/sql/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${description}: SUCCESS`);
      console.log(`   Result:`, result.data);
    } else {
      console.log(`❌ ${description}: FAILED`);
      console.log(`   Error:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${description}: NETWORK ERROR`);
    console.log(`   Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function testAutomation() {
  console.log('🚀 Testing SQL Automation System...\n');

  // Test 0: Check if exec_sql function exists
  console.log('0. Checking if exec_sql function exists...');
  await executeSql(
    "select proname, prorettype from pg_proc where proname='exec_sql';",
    'Check exec_sql function'
  );

  // Test 1: Connection test
  console.log('\n1. Testing connection...');
  await executeSql(
    "SELECT NOW() as current_time, 'Connection successful!' as message;",
    'Connection Test'
  );

  console.log('\n2. Creating missing tables for Sales section...');

  // Test 2: Create customer_communications table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_communications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'call',
      direction TEXT NOT NULL DEFAULT 'outbound',
      subject TEXT,
      content TEXT,
      outcome TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `, 'Create customer_communications table');

  // Test 3: Create customer_tags table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(company_id, name)
    );
  `, 'Create customer_tags table');

  // Test 4: Create customer_service_agreements table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_service_agreements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      agreement_type TEXT NOT NULL DEFAULT 'maintenance',
      start_date DATE NOT NULL,
      end_date DATE,
      monthly_fee DECIMAL(10,2),
      annual_fee DECIMAL(10,2),
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `, 'Create customer_service_agreements table');

  // Test 5: Create service_requests table
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  `, 'Create service_requests table');

  console.log('\n3. Verifying table creation...');

  // Test 6: Verify tables exist
  await executeSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('customer_communications', 'customer_tags', 'customer_service_agreements', 'service_requests')
    ORDER BY table_name;
  `, 'Verify tables created');

  console.log('\n🎉 SQL Automation System Test Complete!');
  console.log('\n✅ If all tests passed, Claude can now automatically fix database issues!');
}

// Run the test
testAutomation().catch(console.error);
