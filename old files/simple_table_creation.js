#!/usr/bin/env node
/**
 * Simple table creation - one statement at a time
 * This should work with the corrected exec_sql function
 */

async function executeSql(sql, description = 'SQL execution') {
  try {
    const response = await fetch('http://localhost:4000/dev/sql/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });

    const result = await response.json();
    
    console.log(`📋 ${description}:`);
    if (result.success && result.data) {
      console.log(`✅ SUCCESS`);
      console.log(`   Result:`, JSON.stringify(result.data, null, 2));
    } else if (result.success) {
      console.log(`✅ SUCCESS (no data returned)`);
    } else {
      console.log(`❌ FAILED`);
      console.log(`   Error:`, result.error);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${description}: NETWORK ERROR`);
    console.log(`   Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function createMissingTables() {
  console.log('🚀 Creating missing tables one by one...\n');

  // Test 1: Simple SELECT to verify exec_sql works
  console.log('1. Testing exec_sql function...');
  await executeSql(
    "SELECT 'exec_sql is working!' as message, NOW() as timestamp",
    'Test exec_sql function'
  );

  // Test 2: Check existing tables
  console.log('\n2. Checking existing tables...');
  await executeSql(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    'List existing tables'
  );

  // Test 3: Create customer_communications table
  console.log('\n3. Creating customer_communications table...');
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_communications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      customer_id UUID NOT NULL,
      user_id UUID NOT NULL,
      type TEXT NOT NULL DEFAULT 'call',
      direction TEXT NOT NULL DEFAULT 'outbound',
      subject TEXT,
      content TEXT,
      outcome TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `, 'Create customer_communications table');

  // Test 4: Create customer_tags table
  console.log('\n4. Creating customer_tags table...');
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT '#3B82F6',
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `, 'Create customer_tags table');

  // Test 5: Create service_requests table
  console.log('\n5. Creating service_requests table...');
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID,
      customer_id UUID NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT,
      priority TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'open',
      assigned_to UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `, 'Create service_requests table');

  // Test 6: Create customer_service_agreements table
  console.log('\n6. Creating customer_service_agreements table...');
  await executeSql(`
    CREATE TABLE IF NOT EXISTS public.customer_service_agreements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      customer_id UUID NOT NULL,
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
    )
  `, 'Create customer_service_agreements table');

  // Test 7: Verify all tables were created
  console.log('\n7. Verifying tables were created...');
  await executeSql(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('customer_communications', 'customer_tags', 'service_requests', 'customer_service_agreements')
    ORDER BY table_name
  `, 'Verify new tables exist');

  console.log('\n🎉 Table creation process complete!');
  console.log('\n✅ If successful, the HTTP 400 errors on the Customers page should now be resolved!');
}

// Run the table creation
createMissingTables().catch(console.error);
