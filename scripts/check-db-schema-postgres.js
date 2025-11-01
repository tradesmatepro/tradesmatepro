/**
 * Check ACTUAL database schema using PostgreSQL connection
 * This shows ALL columns even if tables are empty
 */

const { Client } = require('pg');

const client = new Client({
  host: 'aws-1-us-west-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cxlqzejzraczumqmsrcx',
  password: 'Alphaecho19!'
});

async function getTableColumns(tableName) {
  const query = `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `;
  
  const result = await client.query(query, [tableName]);
  return result.rows;
}

async function main() {
  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');
    console.log('='.repeat(80));
    
    const tables = ['companies', 'settings', 'company_settings'];
    const allColumns = {};
    
    for (const table of tables) {
      console.log(`\n📊 TABLE: ${table}`);
      console.log('-'.repeat(80));
      
      const columns = await getTableColumns(table);
      
      if (columns.length === 0) {
        console.log(`❌ Table does NOT exist`);
        allColumns[table] = [];
      } else {
        console.log(`✅ Table exists with ${columns.length} columns:\n`);
        allColumns[table] = columns.map(c => c.column_name);
        
        // Group by category
        const settingsFields = columns.filter(c => 
          c.column_name.includes('rate') || 
          c.column_name.includes('fee') || 
          c.column_name.includes('charge') ||
          c.column_name.includes('invoice') ||
          c.column_name.includes('payment') ||
          c.column_name.includes('tax') ||
          c.column_name.includes('buffer') ||
          c.column_name.includes('hours') ||
          c.column_name.includes('cancellation')
        );
        
        if (settingsFields.length > 0) {
          console.log(`⚙️  SETTINGS-RELATED FIELDS (${settingsFields.length}):`);
          settingsFields.forEach(c => {
            console.log(`   - ${c.column_name} (${c.data_type})`);
          });
          console.log('');
        }
        
        console.log(`📋 ALL COLUMNS:`);
        columns.forEach(c => {
          const nullable = c.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const def = c.column_default ? ` DEFAULT ${c.column_default}` : '';
          console.log(`   ${c.column_name.padEnd(40)} ${c.data_type.padEnd(20)} ${nullable}${def}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n🔍 CHECKING FOR OVERLAPPING FIELDS\n');
    
    const companiesColumns = allColumns['companies'] || [];
    const settingsColumns = allColumns['settings'] || [];
    const companySettingsColumns = allColumns['company_settings'] || [];
    
    if (companiesColumns.length > 0 && settingsColumns.length > 0) {
      const overlap1 = companiesColumns.filter(col => settingsColumns.includes(col));
      if (overlap1.length > 0) {
        console.log(`⚠️  OVERLAP: companies ↔ settings (${overlap1.length} fields)`);
        console.log(`   ${overlap1.join(', ')}\n`);
      }
    }
    
    if (companiesColumns.length > 0 && companySettingsColumns.length > 0) {
      const overlap2 = companiesColumns.filter(col => companySettingsColumns.includes(col));
      if (overlap2.length > 0) {
        console.log(`⚠️  OVERLAP: companies ↔ company_settings (${overlap2.length} fields)`);
        console.log(`   ${overlap2.join(', ')}\n`);
      }
    }
    
    if (settingsColumns.length > 0 && companySettingsColumns.length > 0) {
      const overlap3 = settingsColumns.filter(col => companySettingsColumns.includes(col));
      if (overlap3.length > 0) {
        console.log(`⚠️  OVERLAP: settings ↔ company_settings (${overlap3.length} fields)`);
        console.log(`   ${overlap3.join(', ')}\n`);
      }
    }
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();

