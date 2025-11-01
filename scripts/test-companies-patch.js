const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPatch() {
  const companyId = 'c27b7833-5eec-4688-8409-cbb6784470c1';
  
  // Test with minimal payload first
  console.log('\n🧪 Test 1: Minimal PATCH (just name)');
  const { data: test1, error: err1 } = await supabase
    .from('companies')
    .update({ name: 'Ford Brothers' })
    .eq('id', companyId)
    .select();
  
  if (err1) {
    console.error('❌ Test 1 failed:', err1);
  } else {
    console.log('✅ Test 1 passed');
  }

  // Test with licenses array
  console.log('\n🧪 Test 2: PATCH with licenses array');
  const { data: test2, error: err2 } = await supabase
    .from('companies')
    .update({ licenses: [] })
    .eq('id', companyId)
    .select();
  
  if (err2) {
    console.error('❌ Test 2 failed:', err2);
  } else {
    console.log('✅ Test 2 passed');
  }

  // Test with full payload from frontend
  console.log('\n🧪 Test 3: Full PATCH payload (matching frontend)');
  const fullPayload = {
    name: 'Ford Brothers',
    phone: '+15551231234',
    email: 'andy@andysflowers.com',
    address_line1: '72459 Rattlesnake Rd',
    city: 'The Dalles',
    state_province: 'OR',
    postal_code: '97058',
    country: 'US',
    tax_id: null,
    website: 'https://fordbros.com',
    tagline: null,
    logo_url: null,
    banner_url: null,
    theme_color: '#3B82F6',
    secondary_color: '#6B7280',
    licenses: []
  };

  const { data: test3, error: err3 } = await supabase
    .from('companies')
    .update(fullPayload)
    .eq('id', companyId)
    .select();
  
  if (err3) {
    console.error('❌ Test 3 failed:', err3);
    console.error('Error details:', JSON.stringify(err3, null, 2));
  } else {
    console.log('✅ Test 3 passed');
  }
}

testPatch();

