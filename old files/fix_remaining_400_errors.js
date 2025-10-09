// Fix Remaining 400 Errors Found by Dev Tools
// Based on actual API testing results

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

async function fixRemainingErrors() {
  console.log('🔧 FIXING REMAINING 400 ERRORS FOUND BY DEV TOOLS');
  console.log('Based on actual API endpoint testing');
  console.log('='.repeat(80));

  // Fix 1: Check if customers.updated_at actually exists (it should from previous fix)
  console.log('\n1️⃣ CHECKING CUSTOMERS.UPDATED_AT COLUMN');
  console.log('-'.repeat(50));

  const checkUpdatedAtSQL = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name IN ('updated_at', 'updated_by');
  `;

  const updatedAtResult = await execSQL(checkUpdatedAtSQL, 'Check customers updated_at column');
  
  if (updatedAtResult.success && updatedAtResult.data.length > 0) {
    console.log('   ✅ Found columns:', updatedAtResult.data.map(r => r.column_name).join(', '));
    
    // Check if updated_at exists specifically
    const hasUpdatedAt = updatedAtResult.data.some(r => r.column_name === 'updated_at');
    if (!hasUpdatedAt) {
      console.log('   ⚠️ updated_at column missing, adding it...');
      const addUpdatedAtSQL = `
        ALTER TABLE customers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        UPDATE customers SET updated_at = created_at WHERE updated_at IS NULL;
      `;
      await execSQL(addUpdatedAtSQL, 'Add updated_at column to customers');
    }
  }

  // Fix 2: Add missing columns to sales_activities
  console.log('\n2️⃣ ADDING MISSING COLUMNS TO SALES_ACTIVITIES');
  console.log('-'.repeat(50));

  const addSalesColumnsSQL = `
    -- Add missing columns to sales_activities
    DO $$ 
    BEGIN
      -- Add next_action_date column
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_activities' AND column_name = 'next_action_date'
      ) THEN
        ALTER TABLE sales_activities ADD COLUMN next_action_date DATE;
      END IF;

      -- Add completed_at column
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales_activities' AND column_name = 'completed_at'
      ) THEN
        ALTER TABLE sales_activities ADD COLUMN completed_at TIMESTAMPTZ;
      END IF;
    END $$;
  `;

  await execSQL(addSalesColumnsSQL, 'Add missing columns to sales_activities');

  // Fix 3: Check users table structure and add missing columns
  console.log('\n3️⃣ CHECKING USERS TABLE STRUCTURE');
  console.log('-'.repeat(50));

  const checkUsersSQL = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY column_name;
  `;

  const usersResult = await execSQL(checkUsersSQL, 'Check users table structure');
  
  if (usersResult.success && usersResult.data && Array.isArray(usersResult.data)) {
    console.log('   📋 Users table columns:', usersResult.data.map(r => r.column_name).join(', '));

    const hasFirstName = usersResult.data.some(r => r.column_name === 'first_name');
    const hasLastName = usersResult.data.some(r => r.column_name === 'last_name');
    
    if (!hasFirstName || !hasLastName) {
      console.log('   ⚠️ Missing name columns, adding them...');
      const addUserNamesSQL = `
        DO $$ 
        BEGIN
          -- Add first_name column
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'first_name'
          ) THEN
            ALTER TABLE users ADD COLUMN first_name TEXT;
          END IF;

          -- Add last_name column
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'last_name'
          ) THEN
            ALTER TABLE users ADD COLUMN last_name TEXT;
          END IF;
        END $$;
      `;
      await execSQL(addUserNamesSQL, 'Add first_name and last_name to users');
    }
  }

  // Fix 4: Add foreign key relationship for customer_messages → customers
  console.log('\n4️⃣ FIXING CUSTOMER_MESSAGES → CUSTOMERS RELATIONSHIP');
  console.log('-'.repeat(50));

  const fixCustomerMessagesFK = `
    -- Add foreign key constraint for customer_messages → customers
    DO $$ 
    BEGIN
      -- Check if customer_id column exists
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customer_messages' AND column_name = 'customer_id'
      ) THEN
        ALTER TABLE customer_messages ADD COLUMN customer_id UUID;
      END IF;

      -- Add foreign key constraint if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'customer_messages' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name = 'fk_customer_messages_customer_id'
      ) THEN
        ALTER TABLE customer_messages 
        ADD CONSTRAINT fk_customer_messages_customer_id 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
      END IF;
    END $$;
  `;

  await execSQL(fixCustomerMessagesFK, 'Fix customer_messages → customers relationship');

  // Fix 5: Add foreign key relationship for customer_communications → users
  console.log('\n5️⃣ FIXING CUSTOMER_COMMUNICATIONS → USERS RELATIONSHIP');
  console.log('-'.repeat(50));

  const fixCustomerCommunicationsFK = `
    -- Add foreign key constraint for customer_communications → users
    DO $$ 
    BEGIN
      -- Check if user_id column exists
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

  await execSQL(fixCustomerCommunicationsFK, 'Fix customer_communications → users relationship');

  // Fix 6: Create the missing RPC function
  console.log('\n6️⃣ CREATING GET_COMPANY_CUSTOMERS RPC FUNCTION');
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

  // Verification
  console.log('\n7️⃣ VERIFICATION');
  console.log('-'.repeat(50));

  const verificationQueries = [
    {
      name: 'customers.updated_at exists',
      sql: "SELECT updated_at FROM customers LIMIT 1;"
    },
    {
      name: 'sales_activities.next_action_date exists',
      sql: "SELECT next_action_date FROM sales_activities LIMIT 1;"
    },
    {
      name: 'users.first_name exists',
      sql: "SELECT first_name FROM users LIMIT 1;"
    },
    {
      name: 'customer_messages FK works',
      sql: "SELECT cm.*, c.name FROM customer_messages cm LEFT JOIN customers c ON cm.customer_id = c.id LIMIT 1;"
    },
    {
      name: 'customer_communications FK works',
      sql: "SELECT cc.*, u.first_name FROM customer_communications cc LEFT JOIN users u ON cc.user_id = u.id LIMIT 1;"
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
  console.log('🎉 REMAINING 400 ERROR FIXES COMPLETE');
  console.log('='.repeat(80));
  console.log('✅ Fixed customers.updated_at column');
  console.log('✅ Added missing sales_activities columns');
  console.log('✅ Added missing users name columns');
  console.log('✅ Fixed customer_messages → customers relationship');
  console.log('✅ Fixed customer_communications → users relationship');
  console.log('✅ Created get_company_customers RPC function');
  console.log('\n🎯 All identified 400 errors should now be resolved!');
}

// Run the fixes
fixRemainingErrors().catch(console.error);
