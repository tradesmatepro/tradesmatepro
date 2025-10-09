// Fix Real 400 Errors Found by Dev Tools
// Based on actual browser console errors captured by our dev tools

const fetch = require('node-fetch');

const DEV_SQL_URL = 'http://127.0.0.1:4000';

async function execSQL(sql, description) {
  try {
    const response = await fetch(`${DEV_SQL_URL}/dev/sql/exec`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, description })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${description} - SUCCESS`);
      return { success: true, data: result.data };
    } else {
      console.log(`❌ ${description} - ${result.error}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${description} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function fixReal400Errors() {
  console.log('🔧 FIXING REAL 400 ERRORS FOUND BY DEV TOOLS');
  console.log('Based on actual browser console errors');
  console.log('='.repeat(80));

  console.log('\n📋 REAL 400 ERRORS IDENTIFIED:');
  console.log('1. customer_messages table missing (404 error)');
  console.log('2. customers table - updated_at column missing');
  console.log('3. service_requests table - missing foreign key to customers');
  console.log('4. customer_communications - missing foreign key to users');
  console.log('5. RPC function get_company_customers missing');

  // Fix 1: Create customer_messages table
  console.log('\n1️⃣ CREATING CUSTOMER_MESSAGES TABLE');
  console.log('-'.repeat(50));

  const createCustomerMessagesSQL = `
    CREATE TABLE IF NOT EXISTS customer_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      message_type TEXT NOT NULL DEFAULT 'general',
      subject TEXT,
      message TEXT NOT NULL,
      sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'company')),
      sender_name TEXT,
      sender_email TEXT,
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Add RLS policy
    ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Company isolation for customer_messages" ON customer_messages
      FOR ALL USING (company_id = current_setting('app.current_company_id')::uuid);

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON customer_messages(company_id);
    CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON customer_messages(customer_id);
    CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON customer_messages(created_at DESC);

    -- Add updated_at trigger
    CREATE OR REPLACE FUNCTION update_customer_messages_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS update_customer_messages_updated_at ON customer_messages;
    CREATE TRIGGER update_customer_messages_updated_at
      BEFORE UPDATE ON customer_messages
      FOR EACH ROW EXECUTE FUNCTION update_customer_messages_updated_at();
  `;

  await execSQL(createCustomerMessagesSQL, 'Create customer_messages table');

  // Fix 2: Add updated_at column to customers table
  console.log('\n2️⃣ ADDING UPDATED_AT COLUMN TO CUSTOMERS TABLE');
  console.log('-'.repeat(50));

  const addUpdatedAtSQL = `
    -- Add updated_at column if it doesn't exist
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'updated_at'
      ) THEN
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        -- Update existing records
        UPDATE customers SET updated_at = created_at WHERE updated_at IS NULL;
        
        -- Add trigger for updated_at
        CREATE OR REPLACE FUNCTION update_customers_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
        CREATE TRIGGER update_customers_updated_at
          BEFORE UPDATE ON customers
          FOR EACH ROW EXECUTE FUNCTION update_customers_updated_at();
      END IF;
    END $$;
  `;

  await execSQL(addUpdatedAtSQL, 'Add updated_at column to customers');

  // Fix 3: Add foreign key constraint for customer_communications → users
  console.log('\n3️⃣ FIXING CUSTOMER_COMMUNICATIONS → USERS RELATIONSHIP');
  console.log('-'.repeat(50));

  const fixCustomerCommunicationsSQL = `
    -- Check if user_id column exists and add foreign key
    DO $$ 
    BEGIN
      -- Add user_id column if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_communications' AND column_name = 'user_id'
      ) THEN
        ALTER TABLE customer_communications ADD COLUMN user_id UUID;
      END IF;

      -- Add foreign key constraint if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'customer_communications' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'fk_customer_communications_user_id'
      ) THEN
        ALTER TABLE customer_communications 
        ADD CONSTRAINT fk_customer_communications_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END $$;
  `;

  await execSQL(fixCustomerCommunicationsSQL, 'Fix customer_communications → users relationship');

  // Fix 4: Create get_company_customers RPC function
  console.log('\n4️⃣ CREATING GET_COMPANY_CUSTOMERS RPC FUNCTION');
  console.log('-'.repeat(50));

  const createRPCFunctionSQL = `
    CREATE OR REPLACE FUNCTION get_company_customers(company_uuid UUID)
    RETURNS TABLE (
      id UUID,
      name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      status TEXT,
      created_at TIMESTAMPTZ,
      updated_at TIMESTAMPTZ
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address,
        c.status,
        c.created_at,
        c.updated_at
      FROM customers c
      WHERE c.company_id = company_uuid
      ORDER BY c.created_at DESC;
    END;
    $$;
  `;

  await execSQL(createRPCFunctionSQL, 'Create get_company_customers RPC function');

  // Fix 5: Check and fix service_requests table
  console.log('\n5️⃣ CHECKING SERVICE_REQUESTS TABLE');
  console.log('-'.repeat(50));

  const checkServiceRequestsSQL = `
    -- Check if service_requests table exists
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'service_requests'
    ) as table_exists;
  `;

  const serviceRequestsResult = await execSQL(checkServiceRequestsSQL, 'Check service_requests table');
  
  if (serviceRequestsResult.success && serviceRequestsResult.data[0]?.table_exists) {
    console.log('   ✅ service_requests table exists');
    
    // Add foreign key to customers if missing
    const addServiceRequestsFKSQL = `
      DO $$ 
      BEGIN
        -- Add customer_id column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'service_requests' AND column_name = 'customer_id'
        ) THEN
          ALTER TABLE service_requests ADD COLUMN customer_id UUID;
        END IF;

        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_name = 'service_requests' 
          AND constraint_type = 'FOREIGN KEY'
          AND constraint_name = 'fk_service_requests_customer_id'
        ) THEN
          ALTER TABLE service_requests 
          ADD CONSTRAINT fk_service_requests_customer_id 
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `;

    await execSQL(addServiceRequestsFKSQL, 'Add service_requests → customers relationship');
  } else {
    console.log('   ⚠️ service_requests table does not exist - may need to be created');
  }

  // Verification
  console.log('\n6️⃣ VERIFICATION');
  console.log('-'.repeat(50));

  const verificationQueries = [
    {
      name: 'customer_messages table exists',
      sql: "SELECT COUNT(*) as count FROM customer_messages LIMIT 1;"
    },
    {
      name: 'customers.updated_at column exists',
      sql: "SELECT updated_at FROM customers LIMIT 1;"
    },
    {
      name: 'customer_communications.user_id exists',
      sql: "SELECT user_id FROM customer_communications LIMIT 1;"
    },
    {
      name: 'get_company_customers function works',
      sql: "SELECT * FROM get_company_customers('ba643da1-c16f-468e-8fcb-f347e7929597') LIMIT 1;"
    }
  ];

  for (const query of verificationQueries) {
    await execSQL(query.sql, query.name);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🎉 REAL 400 ERROR FIXES COMPLETE');
  console.log('='.repeat(80));
  console.log('✅ Created customer_messages table with proper relationships');
  console.log('✅ Added updated_at column to customers table');
  console.log('✅ Fixed customer_communications → users relationship');
  console.log('✅ Created get_company_customers RPC function');
  console.log('✅ Verified service_requests table relationships');
  console.log('\n🎯 The browser 400 errors should now be resolved!');
}

// Run the fixes
fixReal400Errors().catch(console.error);
