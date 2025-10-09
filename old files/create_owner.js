const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://amgtktrwpdsigcomavlg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64';

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOwner() {
  try {
    console.log('🔧 Creating APP_OWNER user...');
    
    // Create user with admin privileges
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'info@cgre-llc.com',
      password: 'Alphaecho19!',
      email_confirm: true,
      user_metadata: { 
        role: 'APP_OWNER' 
      }
    });

    if (error) {
      console.error('❌ Error creating user:', error);
      return;
    }

    console.log('✅ User created successfully!');
    console.log('📧 Email:', data.user.email);
    console.log('🆔 User ID:', data.user.id);
    console.log('🔑 Role:', data.user.user_metadata.role);
    
    // Now create the profile record
    console.log('🔧 Creating profile record...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        first_name: 'Admin',
        last_name: 'User',
        role: 'APP_OWNER',
        company_id: null // APP_OWNER doesn't belong to a specific company
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creating profile:', profileError);
      return;
    }

    console.log('✅ Profile created successfully!');
    console.log('👤 Profile:', profile);
    console.log('');
    console.log('🎉 APP_OWNER account ready!');
    console.log('📧 Login with: info@cgre-llc.com');
    console.log('🔒 Password: Alphaecho19!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
createOwner();
