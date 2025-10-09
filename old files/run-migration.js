const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function addPreferredTimeField() {
  console.log('🔧 Adding preferred_time_option field to marketplace_requests table...');

  try {
    console.log('📡 Connected to Supabase');

    // Check if column already exists
    const { data: checkResult, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'marketplace_requests')
      .eq('column_name', 'preferred_time_option');

    if (checkError) {
      console.log('ℹ️ Could not check existing columns, proceeding with migration...');
    } else if (checkResult && checkResult.length > 0) {
      console.log('ℹ️ Column preferred_time_option already exists');
      return true;
    }

    // Use RPC to execute the ALTER TABLE command
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.marketplace_requests
        ADD COLUMN IF NOT EXISTS preferred_time_option TEXT DEFAULT 'anytime'
        CHECK (preferred_time_option IN ('anytime', 'soonest', 'this_week', 'weekend_only', 'specific'));
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      return false;
    }

    console.log('✅ Successfully added preferred_time_option field');
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

// Run the migration
addPreferredTimeField()
  .then(success => {
    if (success) {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Migration failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
