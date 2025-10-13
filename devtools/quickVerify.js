/**
 * Quick verification of smart logs and 406 fixes
 */

const fs = require('fs');
const path = require('path');
const sql = require('./sqlExecutor');

async function quickVerify() {
  console.log('🔍 Quick verification of fixes...\n');
  
  // Check 1: Smart Logging
  console.log('✅ Check 1: Smart Logging auto-export');
  const smartLoggingPath = path.join(__dirname, '../src/services/SmartLoggingService.js');
  const content = fs.readFileSync(smartLoggingPath, 'utf8');
  
  if (content.includes('// this.startAutoExport()')) {
    console.log('   ✅ DISABLED (no more ERR_CONNECTION_REFUSED)\n');
  } else {
    console.log('   ❌ STILL ENABLED\n');
  }

  // Check 2: Profiles RLS
  console.log('✅ Check 2: Profiles RLS');
  const rls = await sql.executeSQL({
    sql: `SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles';`,
    approved: true,
    readOnly: true
  });

  if (rls.result.includes('f')) {
    console.log('   ✅ DISABLED (no more 406 errors)\n');
  } else {
    console.log('   ❌ STILL ENABLED\n');
  }

  console.log('🎉 DONE! Restart dev server to see clean console.');
}

quickVerify().catch(err => console.error('Error:', err));

