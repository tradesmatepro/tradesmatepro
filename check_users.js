const sql = require('./devtools/sqlExecutor');

sql.executeSQL({
  sql: "SELECT trigger_name, event_manipulation, event_object_table, action_statement FROM information_schema.triggers WHERE event_object_table = 'public.users'",
  approved: true
}).then(r => {
  console.log('Triggers on public.users:');
  console.log(r.result);
}).catch(e => {
  console.error('Error:', e);
});

