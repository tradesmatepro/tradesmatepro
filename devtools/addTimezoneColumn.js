/**
 * Add timezone column to companies table
 * This is needed for smart scheduling to work with company timezones
 */

const sql = require('./sqlExecutor');

async function addTimezoneColumn() {
  console.log('🔧 Adding timezone column to companies table...\n');

  // Step 1: Add column if it doesn't exist
  console.log('Step 1: Adding timezone column...');
  const addColumnResult = await sql.executeSQL({
    sql: "ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Los_Angeles';",
    approved: true
  });

  console.log('Result:', JSON.stringify(addColumnResult, null, 2));

  if (addColumnResult.status === 'error') {
    console.error('❌ Failed to add column');
    return;
  }

  console.log('✅ Column added (or already exists)\n');

  // Step 2: Update existing companies to have default timezone
  console.log('Step 2: Updating existing companies...');
  const updateResult = await sql.executeSQL({
    sql: "UPDATE public.companies SET timezone = 'America/Los_Angeles' WHERE timezone IS NULL;",
    approved: true
  });

  console.log('Result:', JSON.stringify(updateResult, null, 2));
  console.log('✅ Existing companies updated\n');

  // Step 3: Verify the column exists
  console.log('Step 3: Verifying column exists...');
  const verifyResult = await sql.executeSQL({
    sql: "SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'timezone';",
    approved: true,
    readOnly: true
  });

  console.log('Result:', JSON.stringify(verifyResult, null, 2));

  if (verifyResult.status === 'success' && verifyResult.result.includes('timezone')) {
    console.log('✅ Timezone column verified!\n');
  } else {
    console.log('⚠️ Could not verify column\n');
  }

  // Step 4: Check Smith Plumbing company
  console.log('Step 4: Checking Smith Plumbing company...');
  const checkCompanyResult = await sql.executeSQL({
    sql: "SELECT id, name, timezone FROM companies WHERE id = 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e';",
    approved: true,
    readOnly: true
  });

  console.log('Result:', JSON.stringify(checkCompanyResult, null, 2));
  console.log('✅ Company check complete\n');

  console.log('🎉 All done! Timezone column is ready.');
  console.log('\n📋 Next steps:');
  console.log('1. Hard refresh browser (Ctrl + Shift + R)');
  console.log('2. Open quote.html');
  console.log('3. Navigate to Schedule step');
  console.log('4. Verify times show 8:00 AM (not 1:00 AM)');
}

// Run it
addTimezoneColumn().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

