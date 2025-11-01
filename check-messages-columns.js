const {Client}=require('pg');
require('dotenv').config();
const c=new Client({
  connectionString:`postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl:{rejectUnauthorized:false}
});
(async()=>{
  await c.connect();
  const r=await c.query(`SELECT column_name FROM information_schema.columns WHERE table_name='messages' ORDER BY ordinal_position`);
  console.log('Messages table columns:');
  r.rows.forEach(row=>console.log('  -',row.column_name));
  await c.end();
})();

