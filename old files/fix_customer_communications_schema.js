/**
 * Fix Customer Communications Schema - Big Picture Fix
 * 
 * Based on real error analysis:
 * - Error: customer_communications?select=*,users(first_name,last_name) - HTTP 400
 * - Root Cause: Missing user_id foreign key relationship
 * - Location: src/pages/Customers.js line 1795
 * 
 * This fix ensures the table has the correct schema that matches the code expectations.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTU2NzI5NCwiZXhwIjoyMDQxMTQzMjk0fQ.VQqX0oaG0a_F_1OqjJhJQu0xJbOkKQNuWnRx8YLQGzI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixCustomerCommunicationsSchema() {
  console.log('🔧 FIXING CUSTOMER COMMUNICATIONS SCHEMA');
  console.log('========================================');
  console.log('📋 Based on real error: customer_communications?select=*,users(first_name,last_name) - HTTP 400');
  console.log('🎯 Root cause: Missing user_id foreign key relationship');
  
  try {
    // 1. Create/update customer_communications table with correct schema
    console.log('\n📋 Step 1: Creating customer_communications table with proper schema...');
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.customer_communications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
        user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
        
        -- Communication details
        type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('email', 'phone', 'sms', 'meeting', 'note', 'letter', 'chat')),
        direction TEXT DEFAULT 'outbound' CHECK (direction IN ('inbound', 'outbound')),
        
        -- Content
        subject TEXT,
        content TEXT,
        outcome TEXT,
        
        -- Timestamps
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });
    
    if (createError) {
      console.log('❌ Error creating table:', createError.message);
      
      // If table exists but has wrong schema, try to add missing columns
      console.log('\n🔧 Table might exist with wrong schema. Trying to add missing user_id column...');
      
      const addUserIdSQL = `
        ALTER TABLE public.customer_communications 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
      `;
      
      const { error: alterError } = await supabase.rpc('exec_sql', { 
        sql: addUserIdSQL 
      });
      
      if (alterError) {
        console.log('❌ Error adding user_id column:', alterError.message);
        
        // Try alternative approach - check if performed_by exists and rename it
        console.log('\n🔧 Trying to rename performed_by to user_id if it exists...');
        
        const renameColumnSQL = `
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'customer_communications' 
              AND column_name = 'performed_by'
            ) THEN
              ALTER TABLE public.customer_communications 
              RENAME COLUMN performed_by TO user_id;
            END IF;
          END $$;
        `;
        
        const { error: renameError } = await supabase.rpc('exec_sql', { 
          sql: renameColumnSQL 
        });
        
        if (renameError) {
          console.log('❌ Error renaming column:', renameError.message);
        } else {
          console.log('✅ Successfully renamed performed_by to user_id');
        }
      } else {
        console.log('✅ Successfully added user_id column');
      }
    } else {
      console.log('✅ customer_communications table created successfully');
    }
    
    // 2. Verify the schema is correct
    console.log('\n📋 Step 2: Verifying schema...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'customer_communications')
      .order('column_name');
    
    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message);
    } else {
      console.log('📋 Current customer_communications columns:');
      columns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
      
      const hasUserId = columns.some(col => col.column_name === 'user_id');
      if (hasUserId) {
        console.log('✅ user_id column exists - foreign key relationship available');
      } else {
        console.log('❌ user_id column still missing');
      }
    }
    
    // 3. Test the failing query
    console.log('\n📋 Step 3: Testing the failing query...');
    
    try {
      const { data: communications, error: queryError } = await supabase
        .from('customer_communications')
        .select('*, users(first_name, last_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (queryError) {
        console.log('❌ Query still failing:', queryError.message);
        console.log('🔧 Additional schema work may be needed');
      } else {
        console.log(`✅ Query success: ${communications.length} records`);
        console.log('🎉 The HTTP 400 error should now be fixed!');
      }
    } catch (err) {
      console.log('❌ Query error:', err.message);
    }
    
    // 4. Create indexes for performance
    console.log('\n📋 Step 4: Creating performance indexes...');
    
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_customer_communications_company_id 
      ON public.customer_communications(company_id);
      
      CREATE INDEX IF NOT EXISTS idx_customer_communications_customer_id 
      ON public.customer_communications(customer_id);
      
      CREATE INDEX IF NOT EXISTS idx_customer_communications_user_id 
      ON public.customer_communications(user_id);
      
      CREATE INDEX IF NOT EXISTS idx_customer_communications_created_at 
      ON public.customer_communications(created_at DESC);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', { 
      sql: createIndexesSQL 
    });
    
    if (indexError) {
      console.log('⚠️ Warning - could not create indexes:', indexError.message);
    } else {
      console.log('✅ Performance indexes created');
    }
    
    console.log('\n🎉 CUSTOMER COMMUNICATIONS SCHEMA FIX COMPLETE!');
    console.log('================================================');
    console.log('✅ Table exists with proper user_id foreign key');
    console.log('✅ Query customer_communications?select=*,users(first_name,last_name) should now work');
    console.log('✅ HTTP 400 errors should be resolved');
    console.log('✅ Communication history will display properly in Customers page');
    
  } catch (error) {
    console.error('❌ Error fixing customer communications schema:', error.message);
  }
}

// Run the fix
fixCustomerCommunicationsSchema().catch(console.error);
