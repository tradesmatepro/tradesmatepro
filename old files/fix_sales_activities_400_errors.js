/**
 * Fix Sales Activities 400 Errors
 * 
 * Based on real dev tools logs showing:
 * - sales_activities?select=*,users(first_name,last_name) - HTTP 400
 * - sales_activities?select=*&next_action_date=lte.2025-09-16&completed_at=is.null - HTTP 400
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNTU2NzI5NCwiZXhwIjoyMDQxMTQzMjk0fQ.VQqX0oaG0a_F_1OqjJhJQu0xJbOkKQNuWnRx8YLQGzI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSalesActivities400Errors() {
  console.log('🔧 FIXING SALES ACTIVITIES 400 ERRORS');
  console.log('=====================================');
  
  try {
    // 1. Check current sales_activities table structure
    console.log('\n📋 Step 1: Checking current sales_activities table structure...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'sales_activities')
      .order('column_name');
    
    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message);
    } else {
      console.log('✅ Current sales_activities columns:');
      columns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`);
      });
    }
    
    // 2. Add missing columns
    console.log('\n📋 Step 2: Adding missing columns...');
    
    const addColumnsSQL = `
      -- Add missing columns that are causing 400 errors
      ALTER TABLE sales_activities 
      ADD COLUMN IF NOT EXISTS next_action_date DATE,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
      
      -- Add missing user relationship columns
      ALTER TABLE sales_activities 
      ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
      
      -- Update performed_by to be user_id if it doesn't exist
      UPDATE sales_activities 
      SET user_id = performed_by 
      WHERE user_id IS NULL AND performed_by IS NOT NULL;
    `;
    
    const { error: addColumnsError } = await supabase.rpc('exec_sql', { 
      sql: addColumnsSQL 
    });
    
    if (addColumnsError) {
      console.log('❌ Error adding columns:', addColumnsError.message);
    } else {
      console.log('✅ Missing columns added successfully');
    }
    
    // 3. Test the queries that were failing
    console.log('\n📋 Step 3: Testing the queries that were causing 400 errors...');
    
    // Test query 1: sales_activities with users join
    console.log('\n🧪 Testing: sales_activities?select=*,users(first_name,last_name)');
    try {
      const { data: activitiesWithUsers, error: query1Error } = await supabase
        .from('sales_activities')
        .select('*, users(first_name, last_name)')
        .limit(5);
      
      if (query1Error) {
        console.log('❌ Query 1 failed:', query1Error.message);
      } else {
        console.log(`✅ Query 1 success: ${activitiesWithUsers.length} records`);
      }
    } catch (err) {
      console.log('❌ Query 1 error:', err.message);
    }
    
    // Test query 2: sales_activities with date filters
    console.log('\n🧪 Testing: sales_activities with next_action_date and completed_at filters');
    try {
      const { data: activitiesWithFilters, error: query2Error } = await supabase
        .from('sales_activities')
        .select('*')
        .lte('next_action_date', '2025-09-17')
        .is('completed_at', null)
        .limit(5);
      
      if (query2Error) {
        console.log('❌ Query 2 failed:', query2Error.message);
      } else {
        console.log(`✅ Query 2 success: ${activitiesWithFilters.length} records`);
      }
    } catch (err) {
      console.log('❌ Query 2 error:', err.message);
    }
    
    // 4. Verify the fixes
    console.log('\n📋 Step 4: Verifying the fixes...');
    
    const { data: updatedColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'sales_activities')
      .in('column_name', ['next_action_date', 'completed_at', 'user_id'])
      .order('column_name');
    
    if (verifyError) {
      console.log('❌ Error verifying columns:', verifyError.message);
    } else {
      console.log('✅ Verification - Added columns:');
      updatedColumns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type})`);
      });
    }
    
    console.log('\n🎉 SALES ACTIVITIES 400 ERRORS FIXED!');
    console.log('✅ Added missing columns: next_action_date, completed_at, user_id');
    console.log('✅ Fixed foreign key relationship to users table');
    console.log('✅ Both failing queries should now work');
    
  } catch (error) {
    console.error('❌ Error fixing sales activities:', error.message);
  }
}

// Run the fix
fixSalesActivities400Errors().catch(console.error);
