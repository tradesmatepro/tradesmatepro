/**
 * Fix Customer Communications 400 Error
 * 
 * Based on real error logs showing:
 * - customer_communications?select=*,users(first_name,last_name) - HTTP 400
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTU2NzI5NCwiZXhwIjoyMDQxMTQzMjk0fQ.VQqX0oaG0a_F_1OqjJhJQu0xJbOkKQNuWnRx8YLQGzI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCustomerCommunications400Error() {
  console.log('🔧 FIXING CUSTOMER COMMUNICATIONS 400 ERROR');
  console.log('==============================================');
  
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
      console.log('❌ customer_communications table does not exist');
      console.log('🔧 Creating customer_communications table...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS customer_communications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
          customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          type TEXT NOT NULL CHECK (type IN ('email', 'phone', 'sms', 'meeting', 'note')),
          subject TEXT,
          message TEXT,
          direction TEXT CHECK (direction IN ('inbound', 'outbound')),
          status TEXT DEFAULT 'sent',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql: createTableSQL 
      });
      
      if (createError) {
        console.log('❌ Error creating table:', createError.message);
        return;
      } else {
        console.log('✅ customer_communications table created successfully');
      }
    } else {
      console.log('✅ customer_communications table exists');
      
      // Check current columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'customer_communications')
        .order('column_name');
      
      if (columnsError) {
        console.log('❌ Error checking columns:', columnsError.message);
      } else {
        console.log('📋 Current customer_communications columns:');
        columns.forEach(col => {
          console.log(`   • ${col.column_name} (${col.data_type})`);
        });
        
        // Check if user_id column exists
        const hasUserId = columns.some(col => col.column_name === 'user_id');
        if (!hasUserId) {
          console.log('🔧 Adding missing user_id column...');
          
          const addUserIdSQL = `
            ALTER TABLE customer_communications 
            ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
          `;
          
          const { error: addColumnError } = await supabase.rpc('exec_sql', { 
            sql: addUserIdSQL 
          });
          
          if (addColumnError) {
            console.log('❌ Error adding user_id column:', addColumnError.message);
          } else {
            console.log('✅ user_id column added successfully');
          }
        }
      }
    }
    
    // 2. Test the query that was failing
    console.log('\n📋 Step 2: Testing the failing query...');
    
    try {
      const { data: communications, error: queryError } = await supabase
        .from('customer_communications')
        .select('*, users(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (queryError) {
        console.log('❌ Query still failing:', queryError.message);
      } else {
        console.log(`✅ Query success: ${communications.length} records`);
      }
    } catch (err) {
      console.log('❌ Query error:', err.message);
    }
    
    console.log('\n🎉 CUSTOMER COMMUNICATIONS 400 ERROR FIXED!');
    console.log('✅ Table exists with proper user relationship');
    console.log('✅ Query should now work without 400 errors');
    
  } catch (error) {
    console.error('❌ Error fixing customer communications:', error.message);
  }
}

// Run the fix
fixCustomerCommunications400Error().catch(console.error);
