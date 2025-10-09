const { createClient } = require('@supabase/supabase-js');

// Use the same config as the app
const supabaseUrl = "https://amgtktrwpdsigcomavlg.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMarketplaceRequests() {
  console.log('🔍 Debugging Marketplace Requests...\n');

  try {
    // 1. Check all marketplace requests
    console.log('1. All marketplace requests:');
    const { data: allRequests, error: allError } = await supabase
      .from('marketplace_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) throw allError;
    
    console.log(`Found ${allRequests.length} total requests:`);
    allRequests.forEach((req, i) => {
      console.log(`   ${i+1}. ID: ${req.id}`);
      console.log(`      Title: ${req.title || 'No title'}`);
      console.log(`      Status: ${req.status}`);
      console.log(`      Request Type: ${req.request_type}`);
      console.log(`      Pricing: ${req.pricing_preference || req.pricing_type}`);
      console.log(`      Company ID: ${req.company_id || 'NULL'}`);
      console.log(`      Customer ID: ${req.customer_id || 'NULL'}`);
      console.log(`      Created: ${req.created_at}`);
      console.log('');
    });

    // 2. Check unique status values
    console.log('2. Unique status values:');
    const { data: statusData } = await supabase
      .from('marketplace_requests')
      .select('status')
      .not('status', 'is', null);
    
    const uniqueStatuses = [...new Set(statusData.map(r => r.status))];
    console.log(`   Statuses found: ${uniqueStatuses.join(', ')}`);

    // 3. Check unique request_type values
    console.log('\n3. Unique request_type values:');
    const { data: typeData } = await supabase
      .from('marketplace_requests')
      .select('request_type')
      .not('request_type', 'is', null);
    
    const uniqueTypes = [...new Set(typeData.map(r => r.request_type))];
    console.log(`   Types found: ${uniqueTypes.join(', ')}`);

    // 4. Check unique pricing values
    console.log('\n4. Unique pricing values:');
    const { data: pricingData } = await supabase
      .from('marketplace_requests')
      .select('pricing_preference, pricing_type')
      .not('pricing_preference', 'is', null);
    
    const uniquePricing = [...new Set(pricingData.map(r => r.pricing_preference || r.pricing_type).filter(Boolean))];
    console.log(`   Pricing found: ${uniquePricing.join(', ')}`);

    // 5. Test the exact query from getBrowseRequests
    console.log('\n5. Testing getBrowseRequests query (status=available):');
    const { data: availableRequests, error: availableError } = await supabase
      .from('marketplace_requests')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    
    if (availableError) {
      console.log(`   Error: ${availableError.message}`);
    } else {
      console.log(`   Found ${availableRequests.length} requests with status='available'`);
    }

    // 6. Test with 'open' status instead
    console.log('\n6. Testing with status=open:');
    const { data: openRequests, error: openError } = await supabase
      .from('marketplace_requests')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });
    
    if (openError) {
      console.log(`   Error: ${openError.message}`);
    } else {
      console.log(`   Found ${openRequests.length} requests with status='open'`);
    }

    // 7. Check the database schema for status enum
    console.log('\n7. Checking status enum values:');
    const { data: enumData, error: enumError } = await supabase
      .rpc('get_enum_values', { enum_name: 'request_status_enum' });
    
    if (enumError) {
      console.log(`   Could not get enum values: ${enumError.message}`);
    } else {
      console.log(`   Enum values: ${enumData?.join(', ') || 'None found'}`);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugMarketplaceRequests();
