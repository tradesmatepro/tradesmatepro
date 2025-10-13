const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

console.log('🔐 Generating RLS Policies for All Tables\n');

require('dotenv').config();

const client = new Client({
  host: process.env.SUPABASE_DB_HOST || process.env.DB_HOST,
  port: process.env.SUPABASE_DB_PORT || process.env.DB_PORT || 5432,
  database: process.env.SUPABASE_DB_NAME || process.env.DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || process.env.DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Get all tables with company_id column
    const tablesResult = await client.query(`
      SELECT DISTINCT t.tablename
      FROM pg_tables t
      JOIN information_schema.columns c 
        ON c.table_name = t.tablename 
        AND c.table_schema = t.schemaname
      WHERE t.schemaname = 'public'
      AND c.column_name = 'company_id'
      AND t.tablename NOT LIKE 'pg_%'
      ORDER BY t.tablename;
    `);

    const tables = tablesResult.rows.map(r => r.tablename);
    console.log(`Found ${tables.length} tables with company_id column\n`);

    let sql = `-- ============================================
-- Auto-Generated RLS Policies for All Tables
-- Generated: ${new Date().toISOString()}
-- ============================================\n\n`;

    for (const table of tables) {
      console.log(`Generating policies for: ${table}`);

      // Check if policies already exist
      const policiesResult = await client.query(`
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = $1 
        AND schemaname = 'public';
      `, [table]);

      if (policiesResult.rows.length > 0) {
        console.log(`  ⏭️  Skipping (${policiesResult.rows.length} policies already exist)`);
        continue;
      }

      sql += `-- ============================================\n`;
      sql += `-- ${table.toUpperCase()}\n`;
      sql += `-- ============================================\n`;

      // Drop existing policies first (if they exist)
      sql += `DROP POLICY IF EXISTS "company_${table}_select" ON ${table};\n`;
      sql += `DROP POLICY IF EXISTS "company_${table}_insert" ON ${table};\n`;
      sql += `DROP POLICY IF EXISTS "company_${table}_update" ON ${table};\n`;
      sql += `DROP POLICY IF EXISTS "company_${table}_delete" ON ${table};\n\n`;

      // SELECT policy
      sql += `CREATE POLICY "company_${table}_select"\n`;
      sql += `ON ${table} FOR SELECT\n`;
      sql += `USING (company_id = public.user_company_id());\n\n`;

      // INSERT policy
      sql += `CREATE POLICY "company_${table}_insert"\n`;
      sql += `ON ${table} FOR INSERT\n`;
      sql += `WITH CHECK (company_id = public.user_company_id());\n\n`;

      // UPDATE policy
      sql += `CREATE POLICY "company_${table}_update"\n`;
      sql += `ON ${table} FOR UPDATE\n`;
      sql += `USING (company_id = public.user_company_id())\n`;
      sql += `WITH CHECK (company_id = public.user_company_id());\n\n`;

      // DELETE policy
      sql += `CREATE POLICY "company_${table}_delete"\n`;
      sql += `ON ${table} FOR DELETE\n`;
      sql += `USING (company_id = public.user_company_id());\n\n`;

      console.log(`  ✅ Generated 4 policies`);
    }

    // Save to file
    const outputPath = path.join(__dirname, '../supabase/migrations/004_auto_generated_policies.sql');
    fs.writeFileSync(outputPath, sql);

    console.log(`\n✅ Generated policies for ${tables.length} tables`);
    console.log(`📄 Saved to: supabase/migrations/004_auto_generated_policies.sql`);

    // Apply the policies
    console.log(`\n📄 Applying policies to database...`);
    await client.query(sql);
    console.log(`✅ All policies applied successfully!`);

    console.log(`\n🎉 Complete!`);
    console.log(`📊 Summary:`);
    console.log(`   - ${tables.length} tables processed`);
    console.log(`   - ${tables.length * 4} policies created`);
    console.log(`   - All tables now have company-scoped RLS`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

main();

