// Run the database fix for preferred_time_option column
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function runDatabaseFix() {
  try {
    console.log('🔧 RUNNING DATABASE FIX FOR PREFERRED_TIME_OPTION');
    
    // Setup Supabase client with service key for admin operations
    const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('📊 STEP 1: Checking current schema...');
    
    // Check if column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default')
      .eq('table_name', 'marketplace_requests')
      .eq('column_name', 'preferred_time_option');
    
    if (checkError) {
      console.error('❌ Error checking schema:', checkError);
      return false;
    }
    
    if (existingColumns && existingColumns.length > 0) {
      console.log('✅ preferred_time_option column already exists:', existingColumns[0]);
      return true;
    }
    
    console.log('📊 STEP 2: Adding missing column...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('fix-preferred-time-option.sql', 'utf8');
    
    // Execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_readonly_sql', {
      sql: `
        ALTER TABLE public.marketplace_requests 
        ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime' 
        CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));
      `
    });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      console.log('💡 You may need to run this SQL manually in Supabase SQL Editor:');
      console.log(sqlContent);
      return false;
    }
    
    console.log('✅ Column added successfully!');
    
    console.log('📊 STEP 3: Verifying the fix...');
    
    // Verify the column was added
    const { data: newColumns, error: verifyError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, column_default, is_nullable')
      .eq('table_name', 'marketplace_requests')
      .eq('column_name', 'preferred_time_option');
    
    if (verifyError) {
      console.error('❌ Error verifying:', verifyError);
      return false;
    }
    
    if (newColumns && newColumns.length > 0) {
      console.log('✅ VERIFICATION SUCCESSFUL:', newColumns[0]);
      console.log('🎉 Database fix complete! BookingForm should now work.');
      return true;
    } else {
      console.log('❌ Column not found after migration');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    return false;
  }
}

// Run the fix
runDatabaseFix().then(success => {
  if (success) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Test the BookingForm submission');
    console.log('2. Verify no more "preferred_time_option" errors');
    console.log('3. Check that smart scheduling works');
  } else {
    console.log('\n🚨 MANUAL ACTION REQUIRED:');
    console.log('Run this SQL in Supabase SQL Editor:');
    console.log('ALTER TABLE public.marketplace_requests ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT \'anytime\';');
  }
});
