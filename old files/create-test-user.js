// Script to create a test user and company in Supabase
const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";

async function createTestData() {
  try {
    console.log('Creating test company...');
    
    // Create test company
    const companyResponse = await fetch(`${SUPABASE_URL}/rest/v1/companies`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        name: 'Demo Company',
        street_address: '123 Business Street',
        city: 'Demo City',
        state: 'CA',
        postal_code: '12345',
        phone: '555-123-4567',
        email: 'info@democompany.com'
      })
    });

    if (!companyResponse.ok) {
      const error = await companyResponse.text();
      console.error('Failed to create company:', error);
      return;
    }

    const company = await companyResponse.json();
    const companyId = company[0].id;
    console.log('Company created:', companyId);

    console.log('Creating test user...');
    
    // Create test user
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email: 'demo@trademateapp.com',
        full_name: 'Demo User',
        company_id: companyId,
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '555-123-4567'
      })
    });

    if (!userResponse.ok) {
      const error = await userResponse.text();
      console.error('Failed to create user:', error);
      return;
    }

    const user = await userResponse.json();
    console.log('User created:', user[0]);

    console.log('\n✅ Test data created successfully!');
    console.log('📧 Email: demo@trademateapp.com');
    console.log('🔑 Password: any password (password validation disabled for demo)');
    console.log('🏢 Company:', company[0].name);
    console.log('👤 User:', user[0].full_name);

  } catch (error) {
    console.error('Error creating test data:', error);
  }
}

// Run the script
createTestData();
