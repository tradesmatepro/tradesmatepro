const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = "https://amgtktrwpdsigcomavlg.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODE1ODcsImV4cCI6MjA2OTY1NzU4N30.5jbqp_kJ1POnrfKuO1_1bzuVscSEWI3FI6k3r8NCLew";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMarketplaceService() {
  console.log('🧪 Testing MarketplaceService getBrowseRequests...\n');

  const testCompanyId = 'ba643da1-c16f-468e-8fcb-f347e7929597'; // From debug output

  try {
    // Test the exact same query as MarketplaceService.getBrowseRequests
    console.log('1. Testing exact MarketplaceService query...');
    const resp = await supabase
      .from('marketplace_requests')
      .select(`
        *,
        request_tags (
          tags (name)
        )
      `)
      .eq('status', 'available')
      .or(`company_id.is.null,company_id.neq.${testCompanyId}`)
      .order('created_at', { ascending: false });

    if (resp.error) {
      console.error('❌ Error:', resp.error.message);
      return;
    }

    console.log(`✅ Found ${resp.data.length} requests:`);
    resp.data.forEach((req, i) => {
      console.log(`   ${i+1}. ${req.title}`);
      console.log(`      Type: ${req.request_type} | Pricing: ${req.pricing_preference}`);
      console.log(`      Company ID: ${req.company_id || 'NULL'}`);
      console.log(`      Location: ${req.location_address || 'No address'}`);
      console.log('');
    });

    // Test with different company ID
    console.log('2. Testing with different company ID...');
    const resp2 = await supabase
      .from('marketplace_requests')
      .select('*')
      .eq('status', 'available')
      .or(`company_id.is.null,company_id.neq.00000000-0000-0000-0000-000000000000`)
      .order('created_at', { ascending: false });

    console.log(`✅ Found ${resp2.data.length} requests with different company filter`);

    // Test without company filter
    console.log('\n3. Testing without company filter...');
    const resp3 = await supabase
      .from('marketplace_requests')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    console.log(`✅ Found ${resp3.data.length} requests without company filter`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMarketplaceService();
