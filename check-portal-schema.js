const { Client } = require('pg');
const creds = require('./AIDevTools/credentials.json');

(async () => {
  const client = new Client({
    host: creds.db_host,
    port: creds.db_port,
    user: creds.db_user,
    password: creds.db_password,
    database: creds.db_name,
  });

  try {
    await client.connect();
    
    // Check work_orders table for portal fields
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'work_orders'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 WORK_ORDERS TABLE COLUMNS:');
    console.log('================================');
    result.rows.forEach(col => {
      const hasDefault = col.column_default ? ' (default: ' + col.column_default + ')' : '';
      console.log(`  ${col.column_name.padEnd(30)} | ${col.data_type.padEnd(20)} | nullable: ${col.is_nullable}${hasDefault}`);
    });
    
    // Check for portal-related columns
    const portalCols = result.rows.filter(col => 
      col.column_name.includes('portal') || 
      col.column_name.includes('token') ||
      col.column_name.includes('expires')
    );
    
    console.log('\n🔗 PORTAL-RELATED COLUMNS:');
    console.log('================================');
    if (portalCols.length === 0) {
      console.log('  ❌ NO PORTAL COLUMNS FOUND');
    } else {
      portalCols.forEach(col => {
        console.log(`  ✅ ${col.column_name} (${col.data_type})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
})();

