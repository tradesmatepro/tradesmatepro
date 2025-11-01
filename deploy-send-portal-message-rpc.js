const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load credentials from AIDevTools
const credentials = JSON.parse(fs.readFileSync(path.join(__dirname, 'AIDevTools', 'credentials.json'), 'utf8'));

const projectRef = credentials.supabase.projectRef;

// Use pg client to connect directly to Supabase PostgreSQL
const client = new Client({
  host: `${projectRef}.db.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres', // Will use service role key as password
  ssl: { rejectUnauthorized: false }
});

// Actually, let's use the service role key as the password
client.password = credentials.supabase.serviceRoleKey;

const sql = `
-- Drop existing function if it exists (to ensure clean deployment)
DROP FUNCTION IF EXISTS public.send_portal_message(uuid, uuid, text, text) CASCADE;

-- Create the RPC function for sending messages from customer portal
CREATE OR REPLACE FUNCTION public.send_portal_message(
  p_work_order_id uuid,
  p_customer_id uuid,
  p_content text,
  p_portal_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_work_order RECORD;
  v_message_id uuid;
  v_customer_name text;
BEGIN
  -- Validate portal token and get work order
  SELECT * INTO v_work_order
  FROM work_orders
  WHERE id = p_work_order_id
    AND portal_token = p_portal_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid portal token or work order not found';
  END IF;

  -- Verify customer_id matches
  IF v_work_order.customer_id != p_customer_id THEN
    RAISE EXCEPTION 'Customer ID mismatch';
  END IF;

  -- Get customer name for sender_name
  SELECT name INTO v_customer_name
  FROM customers
  WHERE id = p_customer_id;

  -- Insert message into messages table
  INSERT INTO messages (
    company_id,
    customer_id,
    work_order_id,
    sender_type,
    sender_id,
    message_type,
    content,
    status,
    sent_at,
    created_at
  ) VALUES (
    v_work_order.company_id,
    p_customer_id,
    p_work_order_id,
    'customer',
    p_customer_id,
    'customer',
    p_content,
    'sent',
    now(),
    now()
  )
  RETURNING id INTO v_message_id;

  -- Return success with message details
  RETURN jsonb_build_object(
    'success', true,
    'message_id', v_message_id,
    'sender_name', v_customer_name,
    'created_at', now()
  );
END;
$$;

-- Grant execute permission to anon role (for portal access)
GRANT EXECUTE ON FUNCTION public.send_portal_message(uuid, uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.send_portal_message(uuid, uuid, text, text) TO authenticated;
`;

(async () => {
  try {
    console.log('🔗 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected!');

    console.log('\n📝 Deploying send_portal_message RPC function...');
    await client.query(sql);

    console.log('✅ RPC function deployed successfully!');
    console.log('\n🎉 Deployment complete!');

    await client.end();
    process.exit(0);

  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();

