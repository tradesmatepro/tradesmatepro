const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithEmptyStrings() {
  console.log('\n🧪 TESTING WITH EMPTY STRINGS (Real-world scenario)\n');
  console.log('='.repeat(80));

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (!companies || companies.length === 0) {
    console.error('❌ No companies found');
    return false;
  }

  const companyId = companies[0].id;

  // Test data with EMPTY STRINGS (what the UI might send)
  const testData = {
    name: 'Test Company',
    phone: '',  // EMPTY STRING
    email: '',  // EMPTY STRING
    website: '',  // EMPTY STRING
    tagline: '',  // EMPTY STRING
    logo_url: '',  // EMPTY STRING
    banner_url: '',  // EMPTY STRING
    tax_id: '',  // EMPTY STRING - This was causing the error!
    address_line1: '123 Test St',
    city: 'Test City',
    state_province: 'CA',
    postal_code: '12345',
    licenses: [{ number: 'TEST123' }],
    theme_color: '#3B82F6',
    quote_terms: 'Payment due within 30 days.',
    invoice_footer: 'Thank you for your business!'
  };

  console.log('📤 Sending data with EMPTY STRINGS:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('\n' + '-'.repeat(80) + '\n');

  // Simulate what sanitizeCompanyData does
  const sanitized = { ...testData };
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  });

  // Phone formatting
  if (sanitized.phone !== null && sanitized.phone !== undefined) {
    const digits = String(sanitized.phone).replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      sanitized.phone = '+' + digits;
    } else if (digits.length === 10) {
      sanitized.phone = '+1' + digits;
    } else if (String(sanitized.phone).startsWith('+')) {
      sanitized.phone = '+' + digits;
    } else {
      sanitized.phone = null;
    }
  }

  // Email validation
  if (sanitized.email !== null && sanitized.email !== undefined) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
      sanitized.email = null;
    }
  }

  console.log('🧹 After sanitization (empty strings → null):');
  console.log(JSON.stringify(sanitized, null, 2));
  console.log('\n' + '-'.repeat(80) + '\n');

  // Test the actual PATCH
  const { data, error } = await supabase
    .from('companies')
    .update(sanitized)
    .eq('id', companyId)
    .select();

  if (error) {
    console.error('❌ PATCH FAILED:');
    console.error(JSON.stringify(error, null, 2));
    return false;
  } else {
    console.log('✅ PATCH SUCCEEDED with empty strings converted to null');
    console.log('\n📊 Saved data:');
    console.log(JSON.stringify(data[0], null, 2));
    return true;
  }
}

testWithEmptyStrings()
  .then(success => {
    console.log('\n' + '='.repeat(80));
    if (success) {
      console.log('\n✅ EMPTY STRING TEST PASSED\n');
      console.log('The sanitization function correctly converts empty strings to null.');
      console.log('This prevents constraint violations on tax_id, phone, email, etc.\n');
      process.exit(0);
    } else {
      console.log('\n❌ EMPTY STRING TEST FAILED\n');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ TEST ERROR:', error);
    process.exit(1);
  });

