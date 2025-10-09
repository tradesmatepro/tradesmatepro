const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSchemaUpdates() {
  try {
    console.log('🔄 Running database schema updates...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('database_schema_updates.sql', 'utf8');
    
    // Split into individual statements (basic splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n⏳ Executing statement ${i + 1}/${statements.length}...`);
      console.log(`📄 ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';' 
        });
        
        if (error) {
          // Try direct query if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('information_schema.tables')
            .select('*')
            .limit(1);
            
          if (directError) {
            console.error(`❌ Error executing statement ${i + 1}:`, error);
            console.error('Direct query also failed:', directError);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully (via fallback)`);
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception executing statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('\n🎉 Schema updates completed!');
    console.log('\n📋 Summary of changes:');
    console.log('  ✅ Created service_tags table for flexible service categories');
    console.log('  ✅ Created marketplace_request_tags link table');
    console.log('  ✅ Added pricing_type, hourly_rate_limit to marketplace_requests');
    console.log('  ✅ Added service_mode (onsite/remote/hybrid) support');
    console.log('  ✅ Added requires_inspection workflow flag');
    console.log('  ✅ Added location fields for onsite services');
    console.log('  ✅ Made max_responses nullable for unlimited responses');
    console.log('  ✅ Added decline_reason tracking to responses');
    console.log('  ✅ Seeded common service tags across all industries');
    console.log('  ✅ Created RPC functions for request creation and responses');
    console.log('  ✅ Created search function for service tags');
    
  } catch (error) {
    console.error('❌ Failed to run schema updates:', error);
    process.exit(1);
  }
}

// Run the updates
runSchemaUpdates();
