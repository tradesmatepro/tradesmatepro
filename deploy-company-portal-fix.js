const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

(async () => {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('🔌 Connected to Supabase\n');
    
    const sql = fs.readFileSync('migrations/2025-10-22_add_company_to_portal.sql', 'utf8');
    await client.query(sql);
    
    console.log('✅ RPC FUNCTION UPDATED WITH COMPANY INFO!\n');
    console.log('📋 Added: Company details (name, email, phone, address, logo)');
    console.log('📋 Added: Timeline events (quote sent, viewed, accepted, etc.)');
    console.log('📋 Added: Sender names to messages');
    console.log('📋 Fixed: deposit_paid → deposit_paid_at');
    console.log('📋 Fixed: Auto-set viewed_at on first portal access\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('🔌 Disconnected\n');
  }
})();

