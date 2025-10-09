-- =========================================
-- PHASE 1: CORE FSM CONSTRAINTS
-- Business rule constraints for field service management
-- =========================================

-- Company Constraints
ALTER TABLE companies 
ADD CONSTRAINT IF NOT EXISTS chk_companies_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0);

ALTER TABLE companies 
ADD CONSTRAINT IF NOT EXISTS chk_companies_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- User Constraints
ALTER TABLE users 
ADD CONSTRAINT IF NOT EXISTS chk_users_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Profile Constraints
-- Fix foreign key relationship between users and profiles for admin dashboard
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS chk_profiles_name_not_empty 
CHECK (LENGTH(TRIM(first_name)) > 0 AND LENGTH(TRIM(last_name)) > 0);

ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS chk_profiles_phone_format 
CHECK (phone IS NULL OR phone ~ '^[\+]?[1-9][\d]{0,15}$');

-- Customer Constraints
ALTER TABLE customers 
ADD CONSTRAINT IF NOT EXISTS chk_customers_has_name 
CHECK (
    (first_name IS NOT NULL AND LENGTH(TRIM(first_name)) > 0) OR 
    (company_name IS NOT NULL AND LENGTH(TRIM(company_name)) > 0)
);

ALTER TABLE customers 
ADD CONSTRAINT IF NOT EXISTS chk_customers_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE customers 
ADD CONSTRAINT IF NOT EXISTS chk_customers_phone_format 
CHECK (phone IS NULL OR phone ~ '^[\+]?[1-9][\d]{0,15}$');

ALTER TABLE customers 
ADD CONSTRAINT IF NOT EXISTS chk_customers_mobile_phone_format 
CHECK (mobile_phone IS NULL OR mobile_phone ~ '^[\+]?[1-9][\d]{0,15}$');

-- Customer Address Constraints
ALTER TABLE customer_addresses 
ADD CONSTRAINT IF NOT EXISTS chk_customer_addresses_required_fields 
CHECK (
    LENGTH(TRIM(address_line1)) > 0 AND 
    LENGTH(TRIM(city)) > 0 AND 
    LENGTH(TRIM(state_province)) > 0 AND 
    LENGTH(TRIM(postal_code)) > 0
);

-- Work Order Constraints
ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_scheduled_dates 
CHECK (scheduled_end IS NULL OR scheduled_start IS NULL OR scheduled_end >= scheduled_start);

ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_actual_dates 
CHECK (actual_end IS NULL OR actual_start IS NULL OR actual_end >= actual_start);

ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_amounts_positive 
CHECK (
    subtotal >= 0 AND 
    tax_amount >= 0 AND 
    total_amount >= 0
);

ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_total_calculation 
CHECK (total_amount = subtotal + tax_amount);

-- Work Order Line Item Constraints
ALTER TABLE work_order_line_items 
ADD CONSTRAINT IF NOT EXISTS chk_work_order_line_items_description_not_empty 
CHECK (LENGTH(TRIM(description)) > 0);

ALTER TABLE work_order_line_items 
ADD CONSTRAINT IF NOT EXISTS chk_work_order_line_items_quantity_positive 
CHECK (quantity > 0);

ALTER TABLE work_order_line_items 
ADD CONSTRAINT IF NOT EXISTS chk_work_order_line_items_unit_price_non_negative 
CHECK (unit_price >= 0);

ALTER TABLE work_order_line_items 
ADD CONSTRAINT IF NOT EXISTS chk_work_order_line_items_total_calculation 
CHECK (total_price = quantity * unit_price);

-- Invoice Constraints
ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_amounts_non_negative 
CHECK (
    subtotal >= 0 AND 
    tax_amount >= 0 AND 
    total_amount >= 0 AND 
    amount_paid >= 0 AND 
    balance_due >= 0
);

ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_total_calculation 
CHECK (total_amount = subtotal + COALESCE(tax_amount, 0));

ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_balance_calculation 
CHECK (balance_due = total_amount - amount_paid);

ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_due_date_after_issue 
CHECK (due_date IS NULL OR due_date >= issue_date);

-- Payment Constraints
ALTER TABLE payments 
ADD CONSTRAINT IF NOT EXISTS chk_payments_amount_positive 
CHECK (amount > 0);

ALTER TABLE payments 
ADD CONSTRAINT IF NOT EXISTS chk_payments_payment_method_not_empty 
CHECK (LENGTH(TRIM(payment_method)) > 0);

-- Message Constraints
ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS chk_messages_content_not_empty 
CHECK (LENGTH(TRIM(content)) > 0);

ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS chk_messages_sender_type_valid 
CHECK (sender_type IN ('user', 'customer', 'system'));

-- Notification Constraints
ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_title_not_empty 
CHECK (LENGTH(TRIM(title)) > 0);

ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_message_not_empty 
CHECK (LENGTH(TRIM(message)) > 0);

ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_read_after_sent 
CHECK (read_at IS NULL OR sent_at IS NULL OR read_at >= sent_at);

-- Audit Log Constraints
ALTER TABLE audit_logs 
ADD CONSTRAINT IF NOT EXISTS chk_audit_logs_table_name_not_empty 
CHECK (LENGTH(TRIM(table_name)) > 0);

-- Business Logic Constraints

-- Ensure only one primary address per customer
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_one_primary 
ON customer_addresses (customer_id) 
WHERE is_primary = TRUE;

-- Ensure work order numbers are unique within company
CREATE UNIQUE INDEX IF NOT EXISTS idx_work_orders_unique_number_per_company 
ON work_orders (company_id, work_order_number);

-- Ensure invoice numbers are unique within company
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_unique_number_per_company 
ON invoices (company_id, invoice_number);

-- Ensure customer numbers are unique within company
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_unique_number_per_company 
ON customers (company_id, customer_number);

-- Ensure user emails are unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_unique_email 
ON users (email);

-- Ensure one profile per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_one_per_user 
ON profiles (user_id);

-- Ensure one dashboard settings per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_dashboard_settings_one_per_user 
ON user_dashboard_settings (user_id);

-- Additional Business Rules

-- Work orders must have a customer
ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_has_customer 
CHECK (customer_id IS NOT NULL);

-- Invoices must have either a work order or a customer (or both)
ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_has_work_order_or_customer 
CHECK (work_order_id IS NOT NULL OR customer_id IS NOT NULL);

-- Payments must reference either an invoice or a customer
ALTER TABLE payments 
ADD CONSTRAINT IF NOT EXISTS chk_payments_has_invoice_or_customer 
CHECK (invoice_id IS NOT NULL OR customer_id IS NOT NULL);

-- Messages must reference either a customer or work order
ALTER TABLE messages 
ADD CONSTRAINT IF NOT EXISTS chk_messages_has_customer_or_work_order 
CHECK (customer_id IS NOT NULL OR work_order_id IS NOT NULL);

-- Work order line items must have positive quantities and prices
ALTER TABLE work_order_line_items 
ADD CONSTRAINT IF NOT EXISTS chk_work_order_line_items_valid_amounts 
CHECK (quantity > 0 AND unit_price >= 0 AND total_price >= 0);

-- Scheduled work orders must have start time
ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_scheduled_has_start_time 
CHECK (
    status != 'scheduled' OR 
    scheduled_start IS NOT NULL
);

-- Completed work orders must have actual end time
ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_completed_has_end_time 
CHECK (
    status != 'completed' OR 
    actual_end IS NOT NULL
);

-- In-progress work orders must have actual start time
ALTER TABLE work_orders 
ADD CONSTRAINT IF NOT EXISTS chk_work_orders_in_progress_has_start_time 
CHECK (
    status != 'in_progress' OR 
    actual_start IS NOT NULL
);

-- Sent invoices must have issue date
ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_sent_has_issue_date 
CHECK (
    status = 'draft' OR 
    issue_date IS NOT NULL
);

-- Paid invoices must have amount paid equal to total
ALTER TABLE invoices 
ADD CONSTRAINT IF NOT EXISTS chk_invoices_paid_balance_zero 
CHECK (
    status != 'paid' OR 
    balance_due = 0
);

-- Notifications must be scheduled for future or now
ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_scheduled_for_valid 
CHECK (scheduled_for >= created_at);

-- Sent notifications must have sent_at timestamp
ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_sent_has_timestamp 
CHECK (
    status != 'sent' OR 
    sent_at IS NOT NULL
);

-- Read notifications must have been sent first
ALTER TABLE notifications 
ADD CONSTRAINT IF NOT EXISTS chk_notifications_read_was_sent 
CHECK (
    read_at IS NULL OR 
    (sent_at IS NOT NULL AND read_at >= sent_at)
);
