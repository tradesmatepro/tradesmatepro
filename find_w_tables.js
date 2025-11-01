const sql = require('./devtools/sqlExecutor');

(async () => {
  try {
    const result = await sql.executeSQL({
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'w%' ORDER BY table_name",
      approved: true
    });
    
    console.log('Tables starting with w:');
    console.log(JSON.stringify(result.result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
})();

