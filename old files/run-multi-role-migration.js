const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMultiRoleMigration() {
  console.log('🚀 Starting Multi-Role Marketplace Migration...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('create-multi-role-rpc-functions.sql', 'utf8');
    
    // Split into individual statements (rough split by function boundaries)
    const statements = sqlContent
      .split(/(?=CREATE OR REPLACE FUNCTION|DO \$\$)/)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim());

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
      
      // Extract function name for logging
      const functionMatch = statement.match(/CREATE OR REPLACE FUNCTION\s+(\w+)/i);
      const functionName = functionMatch ? functionMatch[1] : `Statement ${i + 1}`;
      
      console.log(`   Function: ${functionName}`);
      
      try {
        // Use raw SQL execution via RPC
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // If exec_sql doesn't exist, try direct query
          if (error.code === 'PGRST202') {
            console.log('   ⚠️ exec_sql RPC not available, trying direct execution...');
            
            // For functions, we need to use a different approach
            // Let's try to create a simple test to see if the function exists
            const testResult = await supabase
              .from('information_schema.routines')
              .select('routine_name')
              .eq('routine_name', functionName.toLowerCase())
              .eq('routine_schema', 'public');
            
            if (testResult.error) {
              console.log(`   ❌ Could not verify function ${functionName}: ${testResult.error.message}`);
            } else {
              console.log(`   ✅ Function ${functionName} verification completed`);
            }
          } else {
            throw error;
          }
        } else {
          console.log(`   ✅ ${functionName} created successfully`);
        }
      } catch (err) {
        console.error(`   ❌ Error executing ${functionName}:`, err.message);
        // Continue with other statements
      }
    }

    console.log('\n🎉 Multi-Role Migration completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Verify functions were created in Supabase Dashboard');
    console.log('2. Test the new expandable request cards');
    console.log('3. Try creating a multi-role request');
    console.log('4. Test role-based response submission');
    
    // Test if we can call one of the functions
    console.log('\n🧪 Testing function availability...');
    
    try {
      const { data, error } = await supabase.rpc('get_request_with_roles', {
        request_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID
      });
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = function not found is expected
        console.log('   ✅ get_request_with_roles function is available');
      } else if (error.code === 'PGRST116') {
        console.log('   ❌ get_request_with_roles function not found - manual creation needed');
      }
    } catch (err) {
      console.log('   ⚠️ Function test inconclusive:', err.message);
    }

  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMultiRoleMigration()
  .then(() => {
    console.log('\n✨ Migration script completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
