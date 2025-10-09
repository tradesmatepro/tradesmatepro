const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = "https://amgtktrwpdsigcomavlg.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestRequests() {
  console.log('🏗️ Creating Test Marketplace Requests...\n');

  // Create requests from different "customers" (not companies) so contractors can see them
  const testRequests = [
    {
      title: 'Kitchen Electrical Upgrade',
      description: 'Need to upgrade electrical panel and add new outlets in kitchen renovation',
      location_address: '123 Main St, Anytown',
      postal_code: '12345',
      request_type: 'STANDARD',
      pricing_preference: 'HOURLY',
      status: 'available',
      company_id: null, // Customer request, not from a company
      customer_id: null // Anonymous customer
    },
    {
      title: 'Bathroom Plumbing Repair',
      description: 'Leaky faucet and running toilet need repair',
      location_address: '456 Oak Ave, Somewhere',
      postal_code: '67890',
      request_type: 'STANDARD',
      pricing_preference: 'FLAT',
      status: 'available',
      company_id: null,
      customer_id: null
    },
    {
      title: 'HVAC Emergency - No Heat',
      description: 'Furnace stopped working, need immediate repair',
      location_address: '789 Pine St, Coldtown',
      postal_code: '54321',
      request_type: 'EMERGENCY',
      pricing_preference: 'NEGOTIABLE',
      status: 'available',
      company_id: null,
      customer_id: null
    },
    {
      title: 'Roof Inspection and Minor Repairs',
      description: 'Need roof inspection after storm and repair any damage found',
      location_address: '321 Elm Dr, Stormville',
      postal_code: '98765',
      request_type: 'STANDARD',
      pricing_preference: 'HOURLY',
      status: 'available',
      company_id: null,
      customer_id: null
    },
    {
      title: 'Hardwood Floor Installation',
      description: 'Install hardwood flooring in living room and dining room (800 sq ft)',
      location_address: '654 Maple Ln, Woodtown',
      postal_code: '13579',
      request_type: 'STANDARD',
      pricing_preference: 'FLAT',
      status: 'available',
      company_id: null,
      customer_id: null
    }
  ];

  try {
    // First, delete existing test requests to avoid duplicates
    console.log('🧹 Cleaning up existing requests...');
    await supabase
      .from('marketplace_requests')
      .delete()
      .not('id', 'is', null);

    // Insert new test requests
    console.log('📝 Creating new test requests...');
    const { data, error } = await supabase
      .from('marketplace_requests')
      .insert(testRequests)
      .select();

    if (error) {
      console.error('❌ Error creating requests:', error.message);
      return;
    }

    console.log(`✅ Created ${data.length} test requests:`);
    data.forEach((req, i) => {
      console.log(`   ${i+1}. ${req.title}`);
      console.log(`      Type: ${req.request_type} | Pricing: ${req.pricing_preference}`);
      console.log(`      Location: ${req.location}`);
      console.log('');
    });

    console.log('🎉 Test requests created successfully!');
    console.log('Now contractors should be able to see a variety of requests with different types and pricing models.');

  } catch (error) {
    console.error('❌ Failed:', error.message);
  }
}

createTestRequests();
