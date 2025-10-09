#!/usr/bin/env node

/**
 * Check what enum values are available for user roles
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ0MywiZXhwIjoyMDc0NTYxNDQzfQ.lNQuV8WoSo7RiHeg2IKhY7xDLipYR5-39OpajF5nTOM';

// Create Supabase client with service key (admin privileges)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkEnums() {
  console.log('\n🔍 Checking Enum Values');
  console.log('=======================\n');
  
  try {
    // Check user_role_enum values
    console.log('1️⃣ Checking user_role_enum values...');
    const { data: roleEnums, error: roleError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT unnest(enum_range(NULL::user_role_enum)) as role_value;"
      });
    
    if (roleError) {
      console.error('❌ Failed to get role enum values:', roleError.message);
      
      // Try alternative method
      console.log('🔄 Trying alternative method...');
      const { data: altRoles, error: altError } = await supabase
        .from('pg_enum')
        .select('enumlabel')
        .eq('enumtypid', 'user_role_enum');
      
      if (altError) {
        console.error('❌ Alternative method also failed:', altError.message);
      } else {
        console.log('✅ Role enum values (alternative method):');
        altRoles.forEach(role => console.log(`   - ${role.enumlabel}`));
      }
    } else {
      console.log('✅ Role enum values:');
      roleEnums.forEach(role => console.log(`   - ${role.role_value}`));
    }
    
    // Check employee_status_enum values
    console.log('\n2️⃣ Checking employee_status_enum values...');
    const { data: statusEnums, error: statusError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT unnest(enum_range(NULL::employee_status_enum)) as status_value;"
      });
    
    if (statusError) {
      console.error('❌ Failed to get status enum values:', statusError.message);
    } else {
      console.log('✅ Status enum values:');
      statusEnums.forEach(status => console.log(`   - ${status.status_value}`));
    }
    
    // Try to create a test user with APP_OWNER role to see if it's valid
    console.log('\n3️⃣ Testing if APP_OWNER is a valid role...');
    const { data: testResult, error: testError } = await supabase
      .rpc('exec_sql', {
        sql: "SELECT 'APP_OWNER'::user_role_enum as test_role;"
      });
    
    if (testError) {
      console.error('❌ APP_OWNER is not a valid role:', testError.message);
      console.log('💡 You may need to add APP_OWNER to the user_role_enum');
    } else {
      console.log('✅ APP_OWNER is a valid role!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the check
console.log('🔍 Starting enum check...');
checkEnums();
