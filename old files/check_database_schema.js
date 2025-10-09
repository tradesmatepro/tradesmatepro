/**
 * Check Database Schema - Following How-to Guide #2
 * 
 * This script checks the actual Supabase database schema to verify:
 * 1. Does customer_communications table exist?
 * 2. Does it have the user_id foreign key?
 * 3. What columns does it actually have?
 * 4. Does the users table exist with the expected columns?
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTU2NzI5NCwiZXhwIjoyMDQxMTQzMjk0fQ.VQqX0oaG0a_F_1OqjJhJQu0xJbOkKQNuWnRx8YLQGzI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseSchema() {
  console.log('🔍 CHECKING DATABASE SCHEMA');
  console.log('============================');
  
  try {
    // 1. Check if customer_communications table exists
    console.log('\n📋 Step 1: Checking customer_communications table...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'customer_communications');
    
    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message);
      return;
    }
    
    if (!tables || tables.length === 0) {
      console.log('❌ customer_communications table does NOT exist');
      console.log('🔧 This explains the 400 error - table is missing!');
      return;
    } else {
      console.log('✅ customer_communications table exists');
    }
    
    // 2. Check customer_communications columns
    console.log('\n📋 Step 2: Checking customer_communications columns...');
    
    const { data: commColumns, error: commColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'customer_communications')
      .order('column_name');
    
    if (commColumnsError) {
      console.log('❌ Error checking customer_communications columns:', commColumnsError.message);
    } else {
      console.log('📋 customer_communications columns:');
      commColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      // Check if user_id column exists
      const hasUserId = commColumns.some(col => col.column_name === 'user_id');
      if (hasUserId) {
        console.log('✅ user_id column exists in customer_communications');
      } else {
        console.log('❌ user_id column is MISSING from customer_communications');
        console.log('🔧 This explains the 400 error - foreign key is missing!');
      }
    }
    
    // 3. Check users table
    console.log('\n📋 Step 3: Checking users table...');
    
    const { data: usersTables, error: usersTablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'users');
    
    if (usersTablesError) {
      console.log('❌ Error checking users table:', usersTablesError.message);
    } else if (!usersTables || usersTables.length === 0) {
      console.log('❌ users table does NOT exist');
    } else {
      console.log('✅ users table exists');
      
      // Check users columns
      const { data: usersColumns, error: usersColumnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'users')
        .order('column_name');
      
      if (usersColumnsError) {
        console.log('❌ Error checking users columns:', usersColumnsError.message);
      } else {
        console.log('📋 users table columns:');
        usersColumns.forEach(col => {
          console.log(`   • ${col.column_name} (${col.data_type})`);
        });
        
        const hasFirstName = usersColumns.some(col => col.column_name === 'first_name');
        const hasLastName = usersColumns.some(col => col.column_name === 'last_name');
        
        if (hasFirstName && hasLastName) {
          console.log('✅ users table has first_name and last_name columns');
        } else {
          console.log('❌ users table is missing first_name or last_name columns');
        }
      }
    }
    
    // 4. Test the failing query
    console.log('\n📋 Step 4: Testing the failing query...');
    
    try {
      const { data: communications, error: queryError } = await supabase
        .from('customer_communications')
        .select('*, users(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (queryError) {
        console.log('❌ Query failed:', queryError.message);
        console.log('🔧 This confirms the 400 error cause');
      } else {
        console.log(`✅ Query succeeded: ${communications.length} records`);
      }
    } catch (err) {
      console.log('❌ Query error:', err.message);
    }
    
    console.log('\n🎯 SCHEMA CHECK COMPLETE');
    console.log('========================');
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  }
}

// Run the schema check
checkDatabaseSchema().catch(console.error);
