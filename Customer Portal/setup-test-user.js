// Setup Test User for Customer Portal
// Run this script to create a proper test user that works with the authentication system

const { createClient } = require('@supabase/supabase-js');

// Use the same credentials as the app
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODE1ODcsImV4cCI6MjA2OTY1NzU4N30.5jbqp_kJ1POnrfKuO1_1bzuVscSEWI3FI6k3r8NCLew";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupTestUser() {
  const testEmail = 'test@gmail.com';
  const testPassword = 'Gizmo123';

  console.log('🚀 Setting up test user for Customer Portal...');

  try {
    // First, let's check what tables exist
    console.log('🔍 Checking database tables...');

    // Check if customer_portal_accounts table exists
    const { data: portalCheck, error: portalCheckError } = await supabase
      .from('customer_portal_accounts')
      .select('id')
      .limit(1);

    if (portalCheckError) {
      console.log('⚠️ customer_portal_accounts table issue:', portalCheckError.message);
    } else {
      console.log('✅ customer_portal_accounts table exists');
    }

    // Check if customers table exists
    const { data: customerCheck, error: customerCheckError } = await supabase
      .from('customers')
      .select('id')
      .limit(1);

    if (customerCheckError) {
      console.log('⚠️ customers table issue:', customerCheckError.message);
    } else {
      console.log('✅ customers table exists');
    }

    // Step 1: Try to sign in first to see if user already exists
    console.log('📝 Checking if user already exists...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    let authUser;
    if (signInError) {
      console.log('👤 User does not exist, creating new user...');
      // User doesn't exist, create new one
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `http://localhost:3001/dashboard`
        }
      });

      if (authError) {
        throw authError;
      }
      authUser = authData.user;
    } else {
      console.log('✅ User already exists in Supabase Auth');
      authUser = signInData.user;
    }

    console.log('✅ Auth user created/found:', authUser.id);

    // Step 2: Create a customer record (needed for portal account)
    console.log('📝 Creating customer record...');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert([{
        name: 'Test Customer',
        email: testEmail,
        phone: '555-123-4567',
        street_address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'United States',
        customer_type: 'RESIDENTIAL',
        status: 'ACTIVE',
        company_id: null // Global customer for self-signup
      }], {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (customerError) {
      console.error('❌ Error creating customer:', customerError);
      return;
    }

    console.log('✅ Customer record created:', customerData.id);

    // Step 3: Create customer portal account
    console.log('📝 Creating customer portal account...');
    const { data: portalData, error: portalError } = await supabase
      .from('customer_portal_accounts')
      .upsert([{
        customer_id: customerData.id,
        auth_user_id: authUser.id,
        email: testEmail,
        is_active: true,
        created_via: 'test_setup',
        needs_password_setup: false
      }], {
        onConflict: 'auth_user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (portalError) {
      console.error('❌ Error creating portal account:', portalError);
      return;
    }

    console.log('✅ Customer portal account created:', portalData.id);

    console.log('\n🎉 Test user setup complete!');
    console.log('📧 Email:', testEmail);
    console.log('🔑 Password:', testPassword);
    console.log('\nYou can now log in to the customer portal with these credentials.');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupTestUser();
