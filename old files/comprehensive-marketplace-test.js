// Comprehensive test for all marketplace issues
const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

async function comprehensiveMarketplaceTest() {
  try {
    console.log('🧪 COMPREHENSIVE MARKETPLACE TEST STARTING...\n');
    
    // Setup Supabase client
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Test 1: Check if get_request_with_roles RPC function exists
    console.log('📝 TEST 1: Checking get_request_with_roles RPC function...');
    
    try {
      // Try to call the function with a dummy UUID
      const { data, error } = await supabase.rpc('get_request_with_roles', {
        p_request_id: '00000000-0000-0000-0000-000000000000'
      });
      
      if (error && error.message.includes('function public.get_request_with_roles(uuid) does not exist')) {
        console.log('❌ get_request_with_roles RPC function MISSING - this causes 404 errors');
        console.log('   → Need to run: create-missing-rpc-function.sql');
      } else {
        console.log('✅ get_request_with_roles RPC function EXISTS');
      }
    } catch (err) {
      console.log('❌ Error testing RPC function:', err.message);
    }
    
    // Test 2: Check marketplace_responses table schema
    console.log('\n📝 TEST 2: Checking marketplace_responses table schema...');
    
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'marketplace_responses')
      .order('ordinal_position');
    
    if (schemaError) {
      console.log('❌ Error checking schema:', schemaError.message);
    } else {
      console.log('✅ marketplace_responses table columns:');
      columns.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      const hasCounterOffer = columns.some(col => col.column_name === 'counter_offer');
      const hasProposedRate = columns.some(col => col.column_name === 'proposed_rate');
      
      if (hasCounterOffer && !hasProposedRate) {
        console.log('✅ GOOD: Database has counter_offer column (matches code)');
      } else if (hasProposedRate && !hasCounterOffer) {
        console.log('❌ PROBLEM: Database has proposed_rate but code uses counter_offer');
      } else {
        console.log('⚠️  WARNING: Unexpected column configuration');
      }
    }
    
    // Test 3: Test error server and console capture
    console.log('\n📝 TEST 3: Testing error server and console capture...');
    
    try {
      // Clear any old errors
      const clearResponse = await fetch('http://localhost:4000/save-errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([])
      });
      
      if (clearResponse.ok) {
        console.log('✅ Error server is working - can clear errors');
        
        // Test sending new errors
        const testErrors = [{
          type: 'TEST_MARKETPLACE_ERROR',
          message: 'Dashboard card click test',
          timestamp: new Date().toISOString()
        }];
        
        const testResponse = await fetch('http://localhost:4000/save-errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testErrors)
        });
        
        if (testResponse.ok) {
          console.log('✅ Error server can receive and save errors');
        } else {
          console.log('❌ Error server cannot save errors');
        }
      } else {
        console.log('❌ Error server not responding');
      }
    } catch (err) {
      console.log('❌ Error server test failed:', err.message);
    }
    
    // Test 4: Check React app is running
    console.log('\n📝 TEST 4: Checking React app status...');
    
    try {
      const appResponse = await fetch('http://localhost:3006/', {
        method: 'GET'
      });
      
      if (appResponse.ok) {
        console.log('✅ React app is running on port 3006');
      } else {
        console.log('❌ React app not responding on port 3006');
      }
    } catch (err) {
      console.log('❌ React app test failed:', err.message);
    }
    
    // Summary and next steps
    console.log('\n🎯 SUMMARY AND NEXT STEPS:');
    console.log('1. If get_request_with_roles is missing: Run create-missing-rpc-function.sql in Supabase SQL Editor');
    console.log('2. Navigate to http://localhost:3006 → Marketplace → Providing mode');
    console.log('3. Try clicking dashboard cards (My Responses, Open Requests, Messages)');
    console.log('4. Try submitting a response form');
    console.log('5. Open browser console (F12) and run: sendErrors()');
    console.log('6. Check error_logs/latest.json for captured errors');
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Comprehensive test failed:', error.message);
  }
}

comprehensiveMarketplaceTest();
