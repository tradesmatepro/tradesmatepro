const fs = require('fs');
const sql = require('./devtools/sqlExecutor');

(async () => {
  try {
    const rpcSql = fs.readFileSync('sql files/create_or_update_company_user_rpc.sql', 'utf8');
    
    console.log('🚀 Deploying create_or_update_company_user RPC function...\n');
    
    const result = await sql.executeSQL({
      sql: rpcSql,
      approved: true
    });
    
    console.log('✅ RPC deployed successfully!');
    console.log('\nResult:', result);
    
  } catch (error) {
    console.error('❌ Error deploying RPC:', error.message);
    process.exit(1);
  }
})();

