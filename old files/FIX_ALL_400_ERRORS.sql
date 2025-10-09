-- FIX ALL 400 ERRORS - Run this in Supabase SQL Editor
-- Based on real browser console errors captured by dev tools

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO CUSTOMERS TABLE
-- ============================================================================

-- Add updated_at column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger function for updated_at (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for customers updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at 
  BEFORE UPDATE ON customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. ADD MISSING COLUMNS TO SALES_ACTIVITIES TABLE
-- ============================================================================

-- Add missing columns to sales_activities table
ALTER TABLE sales_activities ADD COLUMN IF NOT EXISTS next_action_date DATE;
ALTER TABLE sales_activities ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- 3. ADD MISSING COLUMNS TO USERS TABLE
-- ============================================================================

-- Add first_name and last_name columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;

-- ============================================================================
-- 4. CREATE CUSTOMER_MESSAGES TABLE
-- ============================================================================

-- Create customer_messages table for customer portal integration
CREATE TABLE IF NOT EXISTS customer_messages (
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
);

-- Enable RLS on customer_messages
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for customer_messages
DROP POLICY IF EXISTS "customer_messages_company_isolation" ON customer_messages;
CREATE POLICY "customer_messages_company_isolation" ON customer_messages
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON customer_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON customer_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_sent_at ON customer_messages(sent_at);

-- ============================================================================
-- 5. CREATE GET_COMPANY_CUSTOMERS RPC FUNCTION
-- ============================================================================

-- Create RPC function for getting company customers
CREATE OR REPLACE FUNCTION get_company_customers(company_uuid UUID)
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. VERIFY ALL CHANGES
-- ============================================================================

-- Check that all columns were added successfully
DO $$
BEGIN
  -- Check customers.updated_at
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
    RAISE NOTICE '✅ customers.updated_at column exists';
  ELSE
    RAISE NOTICE '❌ customers.updated_at column missing';
  END IF;

  -- Check sales_activities columns
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'sales_activities' AND column_name = 'next_action_date') THEN
    RAISE NOTICE '✅ sales_activities.next_action_date column exists';
  ELSE
    RAISE NOTICE '❌ sales_activities.next_action_date column missing';
  END IF;

  -- Check users columns
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'users' AND column_name = 'first_name') THEN
    RAISE NOTICE '✅ users.first_name column exists';
  ELSE
    RAISE NOTICE '❌ users.first_name column missing';
  END IF;

  -- Check customer_messages table
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_name = 'customer_messages') THEN
    RAISE NOTICE '✅ customer_messages table exists';
  ELSE
    RAISE NOTICE '❌ customer_messages table missing';
  END IF;

  -- Check RPC function
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_company_customers') THEN
    RAISE NOTICE '✅ get_company_customers function exists';
  ELSE
    RAISE NOTICE '❌ get_company_customers function missing';
  END IF;
END $$;
