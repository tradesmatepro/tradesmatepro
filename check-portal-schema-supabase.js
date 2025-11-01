const { createClient } = require('@supabase/supabase-js');
const creds = require('./AIDevTools/credentials.json');

(async () => {
  const supabase = createClient(
    creds.supabase.url,
    creds.supabase.serviceRoleKey
  );

  try {
    // Get work_orders table info
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching work_orders:', error);
      return;
    }

    console.log('\n📋 WORK_ORDERS TABLE STRUCTURE:');
    console.log('================================');
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      columns.forEach(col => {
        const value = data[0][col];
        const type = value === null ? 'null' : typeof value;
        console.log(`  ✅ ${col.padEnd(35)} (${type})`);
      });
    }

    // Check for portal-related columns
    const portalCols = Object.keys(data[0] || {}).filter(col => 
      col.includes('portal') || 
      col.includes('token') ||
      col.includes('expires')
    );
    
    console.log('\n🔗 PORTAL-RELATED COLUMNS:');
    console.log('================================');
    if (portalCols.length === 0) {
      console.log('  ❌ NO PORTAL COLUMNS FOUND - Need to add them!');
    } else {
      portalCols.forEach(col => {
        console.log(`  ✅ ${col}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
})();

