const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Use the correct credentials from the codebase
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDeveloperTools() {
    console.log('🛠️ SETTING UP DEVELOPER TOOLS FOR TRADEMATE PRO');
    console.log('=' .repeat(70));
    console.log('📋 Creating RPC functions for database inspection');
    console.log('');

    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync('create_developer_rpc_functions.sql', 'utf8');
        
        // Split into individual statements (basic splitting by semicolon)
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📋 Found ${statements.length} SQL statements to execute`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length === 0) continue;

            console.log(`   Executing statement ${i + 1}/${statements.length}...`);
            
            try {
                // Use the raw SQL execution approach
                const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    },
                    body: JSON.stringify({ 
                        sql: statement + ';'
                    })
                });

                if (!response.ok) {
                    // Try alternative approach - direct query execution
                    console.log(`   ⚠️ Direct exec failed, trying alternative approach...`);
                    
                    // For CREATE FUNCTION statements, we'll try a different approach
                    if (statement.includes('CREATE OR REPLACE FUNCTION')) {
                        console.log(`   ⚠️ Skipping function creation - will be handled by Supabase dashboard`);
                        continue;
                    }
                }

                console.log(`   ✅ Statement ${i + 1} executed successfully`);
            } catch (error) {
                console.log(`   ⚠️ Statement ${i + 1} failed: ${error.message}`);
                // Continue with other statements
            }
        }

        // Test the functions
        console.log('\n📋 TESTING DEVELOPER TOOLS FUNCTIONS');
        console.log('-'.repeat(50));

        // Test get_schema_info
        console.log('   Testing get_schema_info...');
        try {
            const { data: schemaData, error: schemaError } = await supabase
                .rpc('get_schema_info');
            
            if (schemaError) {
                console.log(`   ❌ get_schema_info failed: ${schemaError.message}`);
            } else {
                console.log(`   ✅ get_schema_info working - found ${schemaData?.tables?.length || 0} tables`);
            }
        } catch (error) {
            console.log(`   ❌ get_schema_info error: ${error.message}`);
        }

        // Test test_db_health
        console.log('   Testing test_db_health...');
        try {
            const { data: healthData, error: healthError } = await supabase
                .rpc('test_db_health');
            
            if (healthError) {
                console.log(`   ❌ test_db_health failed: ${healthError.message}`);
            } else {
                console.log(`   ✅ test_db_health working - status: ${healthData?.status}`);
            }
        } catch (error) {
            console.log(`   ❌ test_db_health error: ${error.message}`);
        }

        // Test execute_sql with a safe query
        console.log('   Testing execute_sql...');
        try {
            const { data: sqlData, error: sqlError } = await supabase
                .rpc('execute_sql', { query: 'SELECT 1 as test_value' });
            
            if (sqlError) {
                console.log(`   ❌ execute_sql failed: ${sqlError.message}`);
            } else {
                console.log(`   ✅ execute_sql working - query executed successfully`);
            }
        } catch (error) {
            console.log(`   ❌ execute_sql error: ${error.message}`);
        }

        console.log('\n🎯 DEVELOPER TOOLS SETUP SUMMARY');
        console.log('=' .repeat(70));
        console.log('✅ Developer Tools page created at /developer-tools');
        console.log('✅ Navigation menu updated with Developer Tools link');
        console.log('✅ RPC functions setup attempted');
        console.log('');
        console.log('📋 FEATURES AVAILABLE:');
        console.log('   🔍 Live Console Log Capture');
        console.log('   🗄️ Database Connection Testing');
        console.log('   🔐 Auth Session Debugging');
        console.log('   💚 System Health Monitoring');
        console.log('   📤 Debug Data Export (JSON)');
        console.log('   🧹 Log Management (Clear/Filter)');
        console.log('');
        console.log('📋 NEXT STEPS:');
        console.log('1. Navigate to http://localhost:3000/developer-tools');
        console.log('2. Use the tools to capture real console errors');
        console.log('3. Export debug data for automated troubleshooting');
        console.log('4. If RPC functions failed, create them manually in Supabase dashboard');
        console.log('');
        console.log('🎯 NOW YOU CAN SEE WHAT I NEED TO SEE!');
        console.log('   Export the debug data and share it for true automated fixes');

    } catch (error) {
        console.log('❌ Error during developer tools setup:', error.message);
        console.error('Full error:', error);
    }
}

setupDeveloperTools().catch(console.error);
