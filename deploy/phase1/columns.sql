-- =========================================
-- PHASE 1: CORE FSM COLUMN ADDITIONS
-- Additional columns for existing tables (if needed)
-- =========================================

-- This file handles column additions that might be needed
-- after initial table creation or for schema evolution

-- Add any missing columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS business_license TEXT;

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS tax_id TEXT;

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS default_tax_rate DECIMAL(5,4) DEFAULT 0.0875;

-- Add any missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add any missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hire_date DATE;

-- Add any missing columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS preferred_contact_method TEXT DEFAULT 'phone';

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS customer_since DATE DEFAULT CURRENT_DATE;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2);

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS payment_terms INTEGER DEFAULT 30; -- Net 30 days

-- Add any missing columns to work_orders table
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS estimated_duration_hours DECIMAL(4,2);

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS requires_signature BOOLEAN DEFAULT FALSE;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS customer_signature_url TEXT;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS technician_signature_url TEXT;

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS completion_photos TEXT[]; -- Array of photo URLs

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5);

ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS customer_feedback TEXT;

-- Add any missing columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS late_fee_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Add any missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS processing_fee DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS gateway_response JSONB;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS refund_date DATE;

-- Add any missing columns to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS attachments TEXT[]; -- Array of attachment URLs

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Add any missing columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5);

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- =========================================
-- ADMIN DASHBOARD REQUIRED COLUMNS
-- Standard audit and relationship fields for FSM apps
-- =========================================

-- Add created_by to companies table (standard audit field)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='created_by') THEN
        ALTER TABLE companies ADD COLUMN created_by UUID REFERENCES users(id);
    END IF;
END $$;

-- Add missing columns to profiles table for admin dashboard
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role_enum DEFAULT 'technician';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company_id') THEN
        ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id);
    END IF;
END $$;

-- Add indexes for new columns (only if columns exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'tax_id') THEN
        CREATE INDEX IF NOT EXISTS idx_companies_tax_id ON companies(tax_id);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login_at') THEN
        CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'hire_date') THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_hire_date ON profiles(hire_date);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'customer_since') THEN
        CREATE INDEX IF NOT EXISTS idx_customers_customer_since ON customers(customer_since);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferred_contact_method') THEN
        CREATE INDEX IF NOT EXISTS idx_customers_preferred_contact_method ON customers(preferred_contact_method);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'customer_rating') THEN
        CREATE INDEX IF NOT EXISTS idx_work_orders_customer_rating ON work_orders(customer_rating);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'work_orders' AND column_name = 'requires_signature') THEN
        CREATE INDEX IF NOT EXISTS idx_work_orders_requires_signature ON work_orders(requires_signature);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'pdf_url') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_invoices_pdf_url ON invoices(pdf_url) WHERE pdf_url IS NOT NULL';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'refund_date') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_payments_refund_date ON payments(refund_date) WHERE refund_date IS NOT NULL';
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'read_at') THEN
        CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'expires_at') THEN
        CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
    END IF;
END $$;

-- Update existing records with default values where appropriate
-- Only update if columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'default_tax_rate') THEN
        UPDATE companies
        SET default_tax_rate = 0.0875
        WHERE default_tax_rate IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'customer_since') THEN
        UPDATE customers
        SET customer_since = created_at::DATE
        WHERE customer_since IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'preferred_contact_method') THEN
        UPDATE customers
        SET preferred_contact_method = 'phone'
        WHERE preferred_contact_method IS NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'payment_terms') THEN
        UPDATE customers
        SET payment_terms = 30
        WHERE payment_terms IS NULL;
    END IF;
END $$;

-- Add comments to document the new columns
COMMENT ON COLUMN companies.business_license IS 'Business license number';
COMMENT ON COLUMN companies.tax_id IS 'Tax identification number';
COMMENT ON COLUMN companies.default_tax_rate IS 'Default tax rate as decimal (e.g., 0.0875 for 8.75%)';

COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
COMMENT ON COLUMN users.login_count IS 'Total number of successful logins';

COMMENT ON COLUMN profiles.emergency_contact_name IS 'Emergency contact full name';
COMMENT ON COLUMN profiles.emergency_contact_phone IS 'Emergency contact phone number';
COMMENT ON COLUMN profiles.hire_date IS 'Employee hire date';

COMMENT ON COLUMN customers.preferred_contact_method IS 'Preferred method of contact (phone, email, sms)';
COMMENT ON COLUMN customers.customer_since IS 'Date customer was first added to system';
COMMENT ON COLUMN customers.notes IS 'General notes about the customer';
COMMENT ON COLUMN customers.credit_limit IS 'Customer credit limit for invoicing';
COMMENT ON COLUMN customers.payment_terms IS 'Payment terms in days (e.g., 30 for Net 30)';

COMMENT ON COLUMN work_orders.estimated_duration_hours IS 'Estimated duration in hours';
COMMENT ON COLUMN work_orders.requires_signature IS 'Whether work order requires customer signature';
COMMENT ON COLUMN work_orders.customer_signature_url IS 'URL to customer signature image';
COMMENT ON COLUMN work_orders.technician_signature_url IS 'URL to technician signature image';
COMMENT ON COLUMN work_orders.completion_photos IS 'Array of URLs to completion photos';
COMMENT ON COLUMN work_orders.customer_rating IS 'Customer rating from 1-5 stars';
COMMENT ON COLUMN work_orders.customer_feedback IS 'Customer feedback text';

COMMENT ON COLUMN invoices.discount_amount IS 'Fixed discount amount';
COMMENT ON COLUMN invoices.discount_percentage IS 'Percentage discount applied';
COMMENT ON COLUMN invoices.late_fee_amount IS 'Late fee amount if overdue';
COMMENT ON COLUMN invoices.pdf_url IS 'URL to generated PDF invoice';

COMMENT ON COLUMN payments.processing_fee IS 'Payment processing fee charged';
COMMENT ON COLUMN payments.gateway_response IS 'JSON response from payment gateway';
COMMENT ON COLUMN payments.refund_amount IS 'Amount refunded if applicable';
COMMENT ON COLUMN payments.refund_date IS 'Date refund was processed';

COMMENT ON COLUMN messages.attachments IS 'Array of attachment file URLs';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was read';
COMMENT ON COLUMN messages.delivered_at IS 'Timestamp when message was delivered';

COMMENT ON COLUMN notifications.priority IS 'Notification priority (1=low, 5=urgent)';
COMMENT ON COLUMN notifications.expires_at IS 'When notification expires and should be removed';
COMMENT ON COLUMN notifications.action_url IS 'URL for notification action button';
