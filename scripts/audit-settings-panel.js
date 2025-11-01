const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function auditSchema() {
  console.log('\n🔍 FULL SCHEMA AUDIT FOR SETTINGS DATABASE PANEL\n');
  console.log('=' .repeat(80));
  
  // Get companies columns
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .limit(1);

  if (companiesError) {
    console.error('❌ Error querying companies:', companiesError);
  } else if (companiesData && companiesData.length > 0) {
    const companiesColumns = Object.keys(companiesData[0]);
    console.log('\n📋 COMPANIES TABLE COLUMNS (' + companiesColumns.length + ' total):');
    console.log(companiesColumns.sort().join(', '));
  }

  // Get settings columns
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(1);

  if (settingsError) {
    console.error('❌ Error querying settings:', settingsError);
  } else if (settingsData && settingsData.length > 0) {
    const settingsColumns = Object.keys(settingsData[0]);
    console.log('\n📋 SETTINGS TABLE COLUMNS (' + settingsColumns.length + ' total):');
    console.log(settingsColumns.sort().join(', '));
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 CHECKING FIELDS FROM SettingsDatabasePanel.js:\n');

  // Fields being sent to SETTINGS table (line 180-203)
  const settingsFields = [
    'labor_rate',
    'overtime_multiplier',
    'parts_markup',
    'default_tax_rate',
    'minimum_travel_charge',
    'timezone',
    'currency',
    'quote_terms',  // ⚠️ SUSPECT
    'invoice_footer',  // ⚠️ SUSPECT
    'default_invoice_terms',
    'updated_at'
  ];

  // Fields being sent to COMPANIES table (line 207-226)
  const companiesFields = [
    'name',
    'phone',
    'email',
    'website',
    'licenses',
    'tax_id',
    'theme_color',
    'logo_url',
    'banner_url',
    'address_line1',
    'city',
    'state_province',
    'postal_code'
  ];

  console.log('📤 FIELDS BEING SENT TO SETTINGS TABLE:');
  const settingsColumns = settingsData && settingsData.length > 0 ? Object.keys(settingsData[0]) : [];
  settingsFields.forEach(field => {
    const exists = settingsColumns.includes(field);
    console.log(`  ${exists ? '✅' : '❌'} ${field}${exists ? '' : ' ← DOES NOT EXIST IN SETTINGS TABLE'}`);
  });

  console.log('\n📤 FIELDS BEING SENT TO COMPANIES TABLE:');
  const companiesColumns = companiesData && companiesData.length > 0 ? Object.keys(companiesData[0]) : [];
  companiesFields.forEach(field => {
    const exists = companiesColumns.includes(field);
    console.log(`  ${exists ? '✅' : '❌'} ${field}${exists ? '' : ' ← DOES NOT EXIST IN COMPANIES TABLE'}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 CHECKING WHERE QUOTE_TERMS AND INVOICE_FOOTER ACTUALLY EXIST:\n');

  const quoteTermsInCompanies = companiesColumns.includes('quote_terms');
  const quoteTermsInSettings = settingsColumns.includes('quote_terms');
  const invoiceFooterInCompanies = companiesColumns.includes('invoice_footer');
  const invoiceFooterInSettings = settingsColumns.includes('invoice_footer');

  console.log(`quote_terms:`);
  console.log(`  ${quoteTermsInCompanies ? '✅' : '❌'} companies table`);
  console.log(`  ${quoteTermsInSettings ? '✅' : '❌'} settings table`);

  console.log(`\ninvoice_footer:`);
  console.log(`  ${invoiceFooterInCompanies ? '✅' : '❌'} companies table`);
  console.log(`  ${invoiceFooterInSettings ? '✅' : '❌'} settings table`);

  console.log('\n' + '='.repeat(80));
  console.log('\n💡 RECOMMENDATIONS:\n');

  const wrongTable = [];
  
  if (!quoteTermsInSettings && quoteTermsInCompanies) {
    wrongTable.push('quote_terms: Move from settingsData to companyData');
  }
  if (!invoiceFooterInSettings && invoiceFooterInCompanies) {
    wrongTable.push('invoice_footer: Move from settingsData to companyData');
  }

  if (wrongTable.length > 0) {
    console.log('❌ FIELDS IN WRONG TABLE:');
    wrongTable.forEach(msg => console.log(`  - ${msg}`));
  } else {
    console.log('✅ All fields are in the correct tables');
  }

  console.log('\n' + '='.repeat(80));
}

auditSchema().catch(console.error);

