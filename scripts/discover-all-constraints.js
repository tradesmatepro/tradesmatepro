const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function discoverAllConstraints() {
  console.log('\n🔍 DISCOVERING ALL CONSTRAINTS ON COMPANIES TABLE\n');
  console.log('='.repeat(80));

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (!companies || companies.length === 0) {
    console.error('❌ No companies found');
    return {};
  }

  const companyId = companies[0].id;
  const constraints = {};

  // Test tax_id constraint
  console.log('\n📋 Testing tax_id constraint...');
  const taxIdTests = [
    '',
    null,
    '12-3456789',
    '123456789',
    '12-345678',
    '123-45-6789',
    'XX-XXXXXXX'
  ];

  for (const taxId of taxIdTests) {
    const { error } = await supabase
      .from('companies')
      .update({ tax_id: taxId })
      .eq('id', companyId);

    if (error) {
      console.log(`❌ tax_id="${taxId}" - FAILED: ${error.message}`);
    } else {
      console.log(`✅ tax_id="${taxId}" - PASSED`);
      if (!constraints.tax_id) {
        constraints.tax_id = { valid: [], invalid: [] };
      }
      constraints.tax_id.valid.push(taxId);
    }
  }

  // Test phone constraint
  console.log('\n📋 Testing phone constraint...');
  const phoneTests = [
    '',
    null,
    '+15551234567',
    '(555) 123-4567',
    '555-1234',
    '+1 555 123 4567'
  ];

  for (const phone of phoneTests) {
    const { error } = await supabase
      .from('companies')
      .update({ phone })
      .eq('id', companyId);

    if (error) {
      console.log(`❌ phone="${phone}" - FAILED: ${error.message}`);
    } else {
      console.log(`✅ phone="${phone}" - PASSED`);
      if (!constraints.phone) {
        constraints.phone = { valid: [], invalid: [] };
      }
      constraints.phone.valid.push(phone);
    }
  }

  // Test email constraint
  console.log('\n📋 Testing email constraint...');
  const emailTests = [
    '',
    null,
    'test@example.com',
    'invalid-email',
    'test@',
    '@example.com'
  ];

  for (const email of emailTests) {
    const { error } = await supabase
      .from('companies')
      .update({ email })
      .eq('id', companyId);

    if (error) {
      console.log(`❌ email="${email}" - FAILED: ${error.message}`);
    } else {
      console.log(`✅ email="${email}" - PASSED`);
      if (!constraints.email) {
        constraints.email = { valid: [], invalid: [] };
      }
      constraints.email.valid.push(email);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n📊 CONSTRAINT SUMMARY:\n');
  console.log(JSON.stringify(constraints, null, 2));

  return constraints;
}

discoverAllConstraints().catch(console.error);

