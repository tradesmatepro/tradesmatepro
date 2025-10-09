// Check the actual database schema for marketplace_responses table
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Use hardcoded credentials from supabasecreds.txt
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check marketplace_responses table schema
    console.log('📝 Checking marketplace_responses table columns...');
    
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'marketplace_responses')
      .order('ordinal_position');
    
    if (error) {
      console.error('❌ Error checking schema:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ marketplace_responses table columns:');
      data.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Check specifically for the problematic columns
      const hasProposedRate = data.some(col => col.column_name === 'proposed_rate');
      const hasCounterOffer = data.some(col => col.column_name === 'counter_offer');
      
      console.log('\n🔍 Column analysis:');
      console.log(`   proposed_rate exists: ${hasProposedRate}`);
      console.log(`   counter_offer exists: ${hasCounterOffer}`);
      
      if (hasProposedRate && !hasCounterOffer) {
        console.log('❌ PROBLEM: Code uses counter_offer but DB has proposed_rate');
      } else if (!hasProposedRate && hasCounterOffer) {
        console.log('✅ GOOD: Code uses counter_offer and DB has counter_offer');
      } else if (hasProposedRate && hasCounterOffer) {
        console.log('⚠️  WARNING: DB has both columns - potential confusion');
      } else {
        console.log('❌ PROBLEM: Neither column exists');
      }
      
    } else {
      console.log('❌ marketplace_responses table not found or has no columns');
    }
    
    // Also check if get_request_with_roles RPC function exists
    console.log('\n📝 Checking for get_request_with_roles RPC function...');
    
    const { data: rpcData, error: rpcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .eq('routine_name', 'get_request_with_roles');
    
    if (rpcError) {
      console.error('❌ Error checking RPC functions:', rpcError.message);
    } else if (rpcData && rpcData.length > 0) {
      console.log('✅ get_request_with_roles RPC function exists');
    } else {
      console.log('❌ get_request_with_roles RPC function missing - this causes 404 errors');
    }
    
  } catch (error) {
    console.error('❌ Database schema check failed:', error.message);
  }
}

checkDatabaseSchema();
