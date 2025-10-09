// Apply the real database fixes for 400 errors
const fetch = require('node-fetch');

async function execSQL(sql, description) {
  try {
    console.log(`\n🔧 ${description}`);
    console.log(`   SQL: ${sql}`);
    
    const response = await fetch('http://127.0.0.1:4000/dev/sql/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sql: sql,
        description: description
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('   ✅ SUCCESS');
      if (result.data && result.data.length > 0) {
        console.log('   Result:', JSON.stringify(result.data, null, 2));
      }
    } else {
      console.log('   ❌ FAILED');
      console.log('   Error:', result.error || result.message);
    }
    
    return result;
  } catch (error) {
    console.log('   ❌ NETWORK ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 APPLYING REAL DATABASE FIXES FOR 400 ERRORS');
  console.log('='.repeat(80));

  // 1. Add updated_at column to customers table
  await execSQL(
    `ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    'Add updated_at column to customers table'
  );

  // 2. Create trigger for customers updated_at
  await execSQL(
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
     END;
     $$ language 'plpgsql'`,
    'Create updated_at trigger function'
  );

  await execSQL(
    `DROP TRIGGER IF EXISTS update_customers_updated_at ON customers`,
    'Drop existing customers trigger if exists'
  );

  await execSQL(
    `CREATE TRIGGER update_customers_updated_at 
     BEFORE UPDATE ON customers 
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`,
    'Create customers updated_at trigger'
  );

  // 3. Add missing columns to sales_activities table
  await execSQL(
    `ALTER TABLE sales_activities ADD COLUMN next_action_date DATE`,
    'Add next_action_date column to sales_activities'
  );

  await execSQL(
    `ALTER TABLE sales_activities ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE`,
    'Add completed_at column to sales_activities'
  );

  // 4. Add first_name and last_name columns to users table
  await execSQL(
    `ALTER TABLE users ADD COLUMN first_name TEXT`,
    'Add first_name column to users table'
  );

  await execSQL(
    `ALTER TABLE users ADD COLUMN last_name TEXT`,
    'Add last_name column to users table'
  );

  // 5. Create customer_messages table
  await execSQL(
    `CREATE TABLE IF NOT EXISTS customer_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
      message_text TEXT NOT NULL,
      message_type TEXT DEFAULT 'text',
      sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      read_at TIMESTAMP WITH TIME ZONE,
      status TEXT DEFAULT 'sent',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    'Create customer_messages table'
  );

  // 6. Create RLS policy for customer_messages
  await execSQL(
    `ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY`,
    'Enable RLS on customer_messages'
  );

  await execSQL(
    `DROP POLICY IF EXISTS "customer_messages_company_isolation" ON customer_messages`,
    'Drop existing customer_messages RLS policy'
  );

  await execSQL(
    `CREATE POLICY "customer_messages_company_isolation" ON customer_messages
     FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()))`,
    'Create customer_messages RLS policy'
  );

  // 7. Create indexes for performance
  await execSQL(
    `CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON customer_messages(company_id)`,
    'Create customer_messages company_id index'
  );

  await execSQL(
    `CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON customer_messages(customer_id)`,
    'Create customer_messages customer_id index'
  );

  // 8. Create get_company_customers RPC function
  await execSQL(
    `CREATE OR REPLACE FUNCTION get_company_customers(company_uuid UUID)
     RETURNS TABLE(
       id UUID,
       name TEXT,
       email TEXT,
       phone TEXT,
       created_at TIMESTAMP WITH TIME ZONE,
       updated_at TIMESTAMP WITH TIME ZONE
     ) AS $$
     BEGIN
       RETURN QUERY
       SELECT c.id, c.name, c.email, c.phone, c.created_at, c.updated_at
       FROM customers c
       WHERE c.company_id = company_uuid
       ORDER BY c.created_at DESC;
     END;
     $$ LANGUAGE plpgsql SECURITY DEFINER`,
    'Create get_company_customers RPC function'
  );

  console.log('\n' + '='.repeat(80));
  console.log('🎉 ALL DATABASE FIXES APPLIED!');
  console.log('='.repeat(80));
}

main().catch(console.error);
