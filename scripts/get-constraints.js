const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getConstraints() {
  console.log('\n🔍 FETCHING DATABASE CONSTRAINTS\n');
  console.log('='.repeat(80));

  // Query to get constraint definitions
  const query = `
    SELECT 
      conname AS constraint_name,
      pg_get_constraintdef(oid) AS constraint_definition,
      contype AS constraint_type
    FROM pg_constraint
    WHERE conrelid = 'public.companies'::regclass
      AND contype = 'c'
    ORDER BY conname;
  `;

  let data = null;
  let error = 'Cannot query constraints directly';

  console.log('⚠️  Cannot query constraints directly');
  console.log('\n💡 Testing phone formats to discover constraint...\n');

  const testPhones = [
    '555-1234',
    '(555) 123-4567',
    '+1 (555) 123-4567',
    '5551234567',
    '+15551234567',
    '555.123.4567'
  ];

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (companies && companies.length > 0) {
    for (const phone of testPhones) {
      const { error: testError } = await supabase
        .from('companies')
        .update({ phone })
        .eq('id', companies[0].id);

      if (testError) {
        console.log(`❌ "${phone}" - FAILED: ${testError.message}`);
      } else {
        console.log(`✅ "${phone}" - PASSED`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
}

getConstraints().catch(console.error);

