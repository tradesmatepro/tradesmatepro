/**
 * Check ACTUAL Supabase database schema
 * This connects to the real database and shows what tables/columns actually exist
 */

const SUPABASE_URL = 'https://cxlqzejzraczumqmsrcx.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5ODU0NDMsImV4cCI6MjA3NDU2MTQ0M30.zoD59re6xxW9Z6HOexR0qwWwTBU29MvjwP_y8qwBkkg';

async function getTableColumns(tableName) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${tableName}?limit=1`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    if (data && data.length > 0) {
      return Object.keys(data[0]).sort();
    }
    
    // Table exists but is empty - try to get schema from OPTIONS
    return [];
  } catch (error) {
    console.error(`Error checking ${tableName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 CHECKING ACTUAL SUPABASE DATABASE SCHEMA\n');
  console.log('='.repeat(80));
  
  const tables = ['companies', 'settings', 'company_settings'];
  
  for (const table of tables) {
    console.log(`\n📊 TABLE: ${table}`);
    console.log('-'.repeat(80));
    
    const columns = await getTableColumns(table);
    
    if (columns === null) {
      console.log(`❌ Table does NOT exist or is not accessible`);
    } else if (columns.length === 0) {
      console.log(`✅ Table exists but is EMPTY (no rows to inspect)`);
    } else {
      console.log(`✅ Table exists with ${columns.length} columns:`);
      console.log(`\n${columns.join('\n')}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 CHECKING FOR OVERLAPPING FIELDS\n');
  
  // Get all columns from each table
  const companiesColumns = await getTableColumns('companies');
  const settingsColumns = await getTableColumns('settings');
  const companySettingsColumns = await getTableColumns('company_settings');
  
  if (companiesColumns && settingsColumns) {
    const overlap1 = companiesColumns.filter(col => settingsColumns.includes(col));
    if (overlap1.length > 0) {
      console.log(`⚠️  OVERLAP: companies ↔ settings`);
      console.log(`   Shared fields: ${overlap1.join(', ')}\n`);
    }
  }
  
  if (companiesColumns && companySettingsColumns) {
    const overlap2 = companiesColumns.filter(col => companySettingsColumns.includes(col));
    if (overlap2.length > 0) {
      console.log(`⚠️  OVERLAP: companies ↔ company_settings`);
      console.log(`   Shared fields: ${overlap2.join(', ')}\n`);
    }
  }
  
  if (settingsColumns && companySettingsColumns) {
    const overlap3 = settingsColumns.filter(col => companySettingsColumns.includes(col));
    if (overlap3.length > 0) {
      console.log(`⚠️  OVERLAP: settings ↔ company_settings`);
      console.log(`   Shared fields: ${overlap3.join(', ')}\n`);
    }
  }
  
  console.log('='.repeat(80));
}

main().catch(console.error);

