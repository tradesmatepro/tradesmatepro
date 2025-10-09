const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixUserRole() {
  try {
    console.log('🔧 Updating user role to APP_OWNER...');
    
    // Update the profile role
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'APP_OWNER' })
      .eq('email', 'info@cgre-llc.com')
      .select();

    if (error) {
      console.error('❌ Error updating role:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Role updated successfully!');
      console.log('👤 User:', data[0].email);
      console.log('🔑 New Role:', data[0].role);
    } else {
      console.log('❌ User not found with email: info@cgre-llc.com');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixUserRole();
