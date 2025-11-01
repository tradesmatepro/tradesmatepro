const sql = require('./devtools/sqlExecutor');

sql.executeSQL({
  sql: "SELECT id, user_id FROM public.profiles LIMIT 5",
  approved: true
}).then(r => {
  console.log('Profiles table:');
  console.log(JSON.stringify(r.result, null, 2));
}).catch(e => {
  console.error('Error:', e);
});

