// Create customer_messages table - PROPER FIX for Customer Dashboard 400 errors
const fetch = require('node-fetch');

const DEV_PROXY_URL = 'http://127.0.0.1:4000/dev/sql/exec';

async function execSQL(sql) {
  try {
    const response = await fetch(DEV_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql })
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SQL execution error:', error);
    return { success: false, error: error.message };
  }
}

async function createCustomerMessagesTable() {
  console.log('🔧 CREATING CUSTOMER MESSAGES TABLE - PROPER FIX\n');

  // Create the customer_messages table with the designed schema
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS public.customer_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
      work_order_id uuid REFERENCES public.work_orders(work_order_id) ON DELETE SET NULL,
      sender_type text NOT NULL CHECK (sender_type IN ('customer', 'contractor')),
      sender_id uuid,
      message_text text NOT NULL,
      attachments jsonb DEFAULT '[]'::jsonb,
      read_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  console.log('1️⃣ Creating customer_messages table...');
  const createResult = await execSQL(createTableSQL);
  
  if (createResult.success) {
    console.log('✅ customer_messages table created successfully');
  } else {
    console.log('❌ Failed to create table:', createResult.error);
    return;
  }

  // Create indexes for performance
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON public.customer_messages(company_id)',
    'CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON public.customer_messages(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_customer_messages_work_order_id ON public.customer_messages(work_order_id)',
    'CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON public.customer_messages(created_at DESC)'
  ];

  console.log('\n2️⃣ Creating performance indexes...');
  for (const indexSQL of indexes) {
    const indexResult = await execSQL(indexSQL);
    if (indexResult.success) {
      console.log('✅ Index created');
    } else {
      console.log('❌ Index failed:', indexResult.error);
    }
  }

  // Verify the table was created
  console.log('\n3️⃣ Verifying table structure...');
  const verifyResult = await execSQL(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'customer_messages' 
    ORDER BY ordinal_position
  `);

  if (verifyResult.success && verifyResult.data) {
    console.log('\n📋 Table structure verified:');
    verifyResult.data.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
  }

  console.log('\n🎉 CUSTOMER MESSAGES TABLE CREATED SUCCESSFULLY!');
  console.log('\n🎯 This enables two-way communication between:');
  console.log('   - Customer Portal app (customers send messages)');
  console.log('   - TradeMate Pro main app (contractors receive/respond)');
  console.log('\n✅ Customer Dashboard 400 errors should now be fixed!');
}

// Run the creation
createCustomerMessagesTable().catch(console.error);
