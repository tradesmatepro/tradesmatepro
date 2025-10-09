-- CREATE CUSTOMER MESSAGES TABLE
-- Run this SQL in Supabase SQL Editor to fix Customer Dashboard 400 errors

-- =====================================================
-- 1. CREATE CUSTOMER MESSAGES TABLE
-- =====================================================
-- This table enables two-way communication between:
-- - Customer Portal app (customers send messages)
-- - TradeMate Pro main app (contractors receive/respond)

CREATE TABLE IF NOT EXISTS public.customer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  work_order_id uuid REFERENCES public.work_orders(id) ON DELETE SET NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'contractor')),
  sender_id uuid, -- customer_id or user_id depending on sender_type
  message_text text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- 2. CREATE PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customer_messages_company_id ON public.customer_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_customer_id ON public.customer_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_work_order_id ON public.customer_messages(work_order_id);
CREATE INDEX IF NOT EXISTS idx_customer_messages_created_at ON public.customer_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_messages_sender_type ON public.customer_messages(sender_type);

-- =====================================================
-- 3. CREATE RLS POLICIES (Row Level Security)
-- =====================================================
-- Enable RLS
ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Companies can only see their own messages
CREATE POLICY "Companies can manage their customer messages" ON public.customer_messages
  FOR ALL USING (company_id = auth.jwt() ->> 'company_id'::text);

-- Policy: Service role can access all (for admin operations)
CREATE POLICY "Service role can access all customer messages" ON public.customer_messages
  FOR ALL TO service_role USING (true);

-- =====================================================
-- 4. CREATE UPDATED_AT TRIGGER
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_customer_messages_updated_at 
  BEFORE UPDATE ON public.customer_messages 
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 5. GRANT PERMISSIONS
-- =====================================================
-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.customer_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_messages TO service_role;

-- =====================================================
-- 6. VERIFICATION QUERY
-- =====================================================
-- Run this to verify the table was created successfully:
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'customer_messages' 
-- ORDER BY ordinal_position;

-- =====================================================
-- DONE! 
-- =====================================================
-- After running this SQL:
-- 1. Customer Dashboard 400 errors should be fixed
-- 2. Customer messaging system will be enabled
-- 3. Two-way communication between Customer Portal and TradeMate Pro will work
