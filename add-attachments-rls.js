const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

(async () => {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Step 1: Check if RLS is enabled
    console.log('🔍 Checking if RLS is enabled on attachments table...');
    const rlsCheck = await client.query(`
      SELECT relname, relrowsecurity 
      FROM pg_class 
      WHERE relname = 'attachments' AND relnamespace = 'public'::regnamespace;
    `);
    console.log('RLS Status:', rlsCheck.rows);

    // Step 2: Check existing policies
    console.log('\n📋 Checking existing policies...');
    const policiesCheck = await client.query(`
      SELECT policyname, permissive, roles, cmd
      FROM pg_policies
      WHERE tablename = 'attachments';
    `);
    console.log('Existing Policies:', policiesCheck.rows);

    // Step 3: Enable RLS if not already enabled
    if (!rlsCheck.rows[0]?.relrowsecurity) {
      console.log('\n🔐 Enabling RLS on attachments table...');
      await client.query(`ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;`);
      console.log('✅ RLS enabled!');
    } else {
      console.log('\n✅ RLS already enabled');
    }

    // Step 4: Drop existing policies (if any)
    console.log('\n🗑️ Dropping existing policies...');
    await client.query(`DROP POLICY IF EXISTS "attachments_select_company" ON public.attachments;`);
    await client.query(`DROP POLICY IF EXISTS "attachments_insert_company" ON public.attachments;`);
    await client.query(`DROP POLICY IF EXISTS "attachments_update_company" ON public.attachments;`);
    await client.query(`DROP POLICY IF EXISTS "attachments_delete_company" ON public.attachments;`);
    console.log('✅ Old policies dropped');

    // Step 5: Create helper function if it doesn't exist
    console.log('\n🔧 Creating helper function user_company_id()...');
    await client.query(`
      CREATE OR REPLACE FUNCTION public.user_company_id()
      RETURNS UUID AS $$
      BEGIN
        RETURN (SELECT company_id FROM public.users WHERE auth_user_id = auth.uid());
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('✅ Helper function created');

    // Step 6: Create RLS policies for attachments table
    console.log('\n🔐 Creating RLS policies for attachments table...');

    // SELECT: Users can view attachments from their company
    await client.query(`
      CREATE POLICY "attachments_select_company"
        ON public.attachments
        FOR SELECT
        USING (company_id = public.user_company_id());
    `);
    console.log('✅ SELECT policy created');

    // INSERT: Users can create attachments for their company
    await client.query(`
      CREATE POLICY "attachments_insert_company"
        ON public.attachments
        FOR INSERT
        WITH CHECK (company_id = public.user_company_id());
    `);
    console.log('✅ INSERT policy created');

    // UPDATE: Users can update attachments from their company
    await client.query(`
      CREATE POLICY "attachments_update_company"
        ON public.attachments
        FOR UPDATE
        USING (company_id = public.user_company_id())
        WITH CHECK (company_id = public.user_company_id());
    `);
    console.log('✅ UPDATE policy created');

    // DELETE: Users can delete attachments from their company
    await client.query(`
      CREATE POLICY "attachments_delete_company"
        ON public.attachments
        FOR DELETE
        USING (company_id = public.user_company_id());
    `);
    console.log('✅ DELETE policy created');

    // Step 7: Verify policies
    console.log('\n📋 Verifying new policies...');
    const verifyPolicies = await client.query(`
      SELECT policyname, permissive, roles, cmd
      FROM pg_policies
      WHERE tablename = 'attachments'
      ORDER BY policyname;
    `);
    console.log('New Policies:');
    verifyPolicies.rows.forEach(p => {
      console.log(`  - ${p.policyname} (${p.cmd})`);
    });

    console.log('\n✅ All done! Attachments table now has proper RLS policies.');
    console.log('\n📝 Summary:');
    console.log('  - RLS enabled on attachments table');
    console.log('  - Company-level isolation enforced');
    console.log('  - Users can only access attachments from their own company');
    console.log('  - Standard pattern matching other tables (invoices, timesheets, etc.)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
})();

