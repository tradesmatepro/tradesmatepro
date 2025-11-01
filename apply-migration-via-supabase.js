const fs = require('fs');
const path = require('path');
const creds = require('./AIDevTools/credentials.json');

(async () => {
  console.log('🚀 Applying Living Quote Link System Migration via Supabase SQL Editor...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations/2025-10-22_living_quote_link_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Migration SQL loaded');
    console.log('📊 File size:', (migrationSQL.length / 1024).toFixed(2), 'KB\n');

    // Create a temporary file with instructions
    const instructionsPath = path.join(__dirname, 'APPLY_MIGRATION_INSTRUCTIONS.txt');
    const instructions = `
🔗 LIVING QUOTE LINK SYSTEM MIGRATION
=====================================

To apply this migration to your Supabase database:

1. Go to: https://app.supabase.com/project/${creds.supabase.projectRef}/sql/new

2. Copy the entire contents of: migrations/2025-10-22_living_quote_link_system.sql

3. Paste into the SQL Editor

4. Click "Run" button

5. Wait for completion (should take 10-30 seconds)

6. You should see success message:
   ✅ Living Quote Link System implemented!
   🔗 Tokens now expire 2 weeks after work_order reaches paid/closed status
   📊 Activity tracking enabled (last_accessed_at, access_count)
   🔄 Unified RPC: get_living_quote_data() returns quote + invoice + messages + files
   🔐 Token regeneration available via regenerate_portal_token()
   ⏱️ Manual expiration extension available via extend_portal_token_expiration()

WHAT THIS MIGRATION DOES:
========================

1. ✅ Extends portal token expiration logic
   - Tokens now expire 2 weeks AFTER work_order reaches 'paid' or 'closed' status
   - Instead of 24 hours from creation

2. ✅ Adds activity tracking
   - portal_last_accessed_at: When customer last accessed the link
   - portal_access_count: How many times customer accessed the link

3. ✅ Creates unified RPC function: get_living_quote_data(token)
   - Returns quote + invoice + messages + files in single call
   - Automatically updates access tracking
   - Checks token expiration

4. ✅ Creates token management functions
   - regenerate_portal_token(): Create new token if compromised
   - extend_portal_token_expiration(): Manually extend expiration

5. ✅ Adds performance indexes
   - Optimizes queries for portal token lookups

AFTER MIGRATION:
================

The customer portal will:
- Load living quote data via get_living_quote_data() RPC
- Refresh every 30 seconds to show live updates
- Display quote status, invoice, messages, and files
- Track when customer last accessed the link

TESTING:
========

1. Create a test quote and send it to a customer
2. Open the portal link in a browser
3. You should see:
   - Quote details with line items
   - Invoice (if job is complete)
   - Messages and updates
   - Files and attachments
4. Make changes to the quote/job in the app
5. Wait 30 seconds - portal should auto-refresh with new data

TROUBLESHOOTING:
================

If you get an error:
1. Check that all required tables exist (work_orders, customers, quote_items, invoices, messages, files)
2. Verify you're using the service role key (not anon key)
3. Try running the migration in smaller chunks if it times out

Questions? Check: LIVING_QUOTE_LINK_ANALYSIS.md
`;

    fs.writeFileSync(instructionsPath, instructions);
    console.log('✅ Instructions saved to: APPLY_MIGRATION_INSTRUCTIONS.txt\n');

    // Also create a SQL file that can be copy-pasted
    const sqlPath = path.join(__dirname, 'MIGRATION_TO_APPLY.sql');
    fs.writeFileSync(sqlPath, migrationSQL);
    console.log('✅ SQL file saved to: MIGRATION_TO_APPLY.sql\n');

    console.log('📌 NEXT STEPS:');
    console.log('==============');
    console.log('1. Open: APPLY_MIGRATION_INSTRUCTIONS.txt');
    console.log('2. Follow the instructions to apply migration via Supabase SQL Editor');
    console.log('3. Or copy contents of: MIGRATION_TO_APPLY.sql');
    console.log('\n🎉 Files ready for manual application!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();

