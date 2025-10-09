// Database Setup Service for TradeMate Pro
// Creates all necessary Supabase tables based on the comprehensive schema

import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../utils/env';

/* legacy hardcoded SUPABASE consts disabled

const SUPABASE_URL = "https://amgtktrwpdsigcomavlg.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZ3RrdHJ3cGRzaWdjb21hdmxnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDA4MTU4NywiZXhwIjoyMDY5NjU3NTg3fQ.6oSnaYhbZzoC0S52iAZBQi8D006yK9fIqrvSDdt5Y64";
*/

// TODO: remove legacy hardcoded SUPABASE_* lines below; use env import only


class DatabaseSetupService {
  constructor() {
    this.setupComplete = false;
  }

  async executeSQL(sql) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sql })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SQL execution failed:', errorText);
        // If exec_sql RPC is missing (404) or not defined (PGRST202), continue without blocking
        if (response.status === 404 || (errorText && errorText.includes('exec_sql'))) {
          return false; // treat as no-op
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
  }

  async createAllTables() {
    console.log('🚀 Starting TradeMate Pro database setup...');

    const schemas = [
      this.getCompaniesSchema(),
      this.getUsersSchema(),
      this.getCustomersSchema(),
      this.getSettingsSchema(),
      this.getQuotesSchema(),
      this.getQuoteItemsSchema(),
      this.getJobsSchema(),
      this.getJobPhotosSchema(),
      this.getInvoicesSchema(),
      this.getPaymentsSchema(),
      this.getScheduleEventsSchema(),
      this.getMessagesSchema(),
      this.getCustomerReviewsSchema(),
      this.getServiceContractsSchema(),
      this.getAttachmentsSchema(),
      this.getTechnicianLocationsSchema()
    ];

    let successCount = 0;
    for (const schema of schemas) {
      const success = await this.executeSQL(schema);
      if (success) {
        successCount++;
      }
    }

    console.log(`✅ Database setup complete: ${successCount}/${schemas.length} tables created`);
    this.setupComplete = true;
    return successCount === schemas.length;
  }

  getCompaniesSchema() {
    return `
      CREATE TABLE IF NOT EXISTS companies (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        street_address TEXT,
        city TEXT,
        state TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'United States',
        phone TEXT,
        email TEXT,
        website TEXT,
        license_number TEXT,
        licenses JSONB DEFAULT '[]'::jsonb,
        tax_id TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getProfilesSchema() {
    return `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'EMPLOYEE')),
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        settings JSONB DEFAULT '{}',
        status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
        last_login TIMESTAMP WITH TIME ZONE
      );
    `;
  }

  getCustomersSchema() {
    return `
      CREATE TABLE IF NOT EXISTS customers (
        id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID NULL,
        name TEXT NOT NULL,
        phone TEXT NULL,
        email TEXT NULL,
        address TEXT NULL,
        preferred_contact_method TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
        notes TEXT NULL,
        preferred_technician UUID NULL,
        preferred_times TEXT NULL,
        street_address TEXT NULL,
        city TEXT NULL,
        state TEXT NULL,
        zip_code TEXT NULL,
        country TEXT NULL DEFAULT 'United States',
        latitude DOUBLE PRECISION NULL,
        longitude DOUBLE PRECISION NULL,
        last_service_date DATE NULL,
        rating INTEGER NULL DEFAULT 5,
        lifetime_revenue NUMERIC NULL DEFAULT 0,
        total_jobs INTEGER NULL DEFAULT 0,
        status TEXT NULL DEFAULT 'ACTIVE',
        preferred_service_time TEXT NULL,
        special_instructions TEXT NULL,
        CONSTRAINT customers_pkey PRIMARY KEY (id),
        CONSTRAINT customers_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
        CONSTRAINT customers_preferred_tech_id_fkey FOREIGN KEY (preferred_technician) REFERENCES users (id)
      );
    `;
  }

  getSettingsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

        -- Rate Settings
        default_hourly_rate NUMERIC DEFAULT 75.0,
        default_overtime_rate NUMERIC DEFAULT 112.5,
        default_tax_rate NUMERIC DEFAULT 8.25,
        parts_markup_percent NUMERIC DEFAULT 30.0,
        labor_markup_percentage NUMERIC DEFAULT 0,
        travel_fee NUMERIC DEFAULT 0,

        -- Business Settings
        timezone TEXT DEFAULT 'America/Los_Angeles',
        currency TEXT DEFAULT 'USD',
        date_format TEXT DEFAULT 'MM/DD/YYYY',

        -- Communication Settings
        allow_tech_notes BOOLEAN DEFAULT TRUE,
        send_auto_reminders BOOLEAN DEFAULT FALSE,
        send_quote_notifications BOOLEAN DEFAULT TRUE,
        preferred_contact_method TEXT DEFAULT 'email',

        -- App Settings
        offline_mode_enabled BOOLEAN DEFAULT TRUE,
        auto_sync_enabled BOOLEAN DEFAULT TRUE,
        dark_mode BOOLEAN DEFAULT FALSE,

        -- Integration Toggles
        enable_quickbooks BOOLEAN DEFAULT FALSE,
        enable_sms BOOLEAN DEFAULT FALSE,
        enable_google_calendar BOOLEAN DEFAULT FALSE,
        enable_cloud_storage BOOLEAN DEFAULT FALSE,
        enable_crm BOOLEAN DEFAULT FALSE,
        enable_zapier BOOLEAN DEFAULT FALSE,

        -- Document Templates
        quote_terms TEXT DEFAULT '',
        invoice_footer TEXT DEFAULT '',
        default_invoice_terms TEXT DEFAULT 'Net 15 days',

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getQuotesSchema() {
    // DEPRECATED: This method creates legacy quotes table
    // Use work_orders with stage='QUOTE' instead
    console.warn('⚠️ DEPRECATED: getQuotesSchema() creates legacy quotes table. Use unified work_orders pipeline instead.');

    return `
      CREATE TABLE IF NOT EXISTS quotes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        quote_number TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED')),
        subtotal NUMERIC DEFAULT 0,
        total_amount NUMERIC DEFAULT 0,
        notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Mark table as deprecated
      COMMENT ON TABLE quotes IS 'DEPRECATED: Use work_orders with stage=QUOTE instead. This table causes data inconsistency.';
    `;
  }

  getQuoteItemsSchema() {
    // DEPRECATED: This method creates legacy quote_items table
    // Use work_order_items instead
    console.warn('⚠️ DEPRECATED: getQuoteItemsSchema() creates legacy quote_items table. Use work_order_items instead.');

    return `
      CREATE TABLE IF NOT EXISTS quote_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        rate NUMERIC DEFAULT 0,
        is_overtime BOOLEAN DEFAULT FALSE,
        description TEXT DEFAULT '',
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Mark table as deprecated
      COMMENT ON TABLE quote_items IS 'DEPRECATED: Use work_order_items instead. This table causes data inconsistency.';
    `;
  }

  getJobsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS jobs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
        technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
        scheduled_start TIMESTAMP WITH TIME ZONE,
        scheduled_end TIMESTAMP WITH TIME ZONE,
        actual_start TIMESTAMP WITH TIME ZONE,
        actual_end TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getJobPhotosSchema() {
    return `
      CREATE TABLE IF NOT EXISTS job_photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        photo_url TEXT NOT NULL,
        tag TEXT CHECK (tag IN ('BEFORE','DURING','AFTER')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getInvoicesSchema() {
    return `
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        invoice_number TEXT NOT NULL UNIQUE,
        total_amount NUMERIC DEFAULT 0,
        status TEXT DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE', 'CANCELLED')),
        issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        due_date TIMESTAMP WITH TIME ZONE
      );
    `;
  }

  getPaymentsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS payments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        payment_method TEXT,
        transaction_id TEXT,
        paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getScheduleEventsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS schedule_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        start_time TIMESTAMP WITH TIME ZONE NOT NULL,
        end_time TIMESTAMP WITH TIME ZONE NOT NULL,
        employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        event_type TEXT DEFAULT 'appointment',
        status TEXT DEFAULT 'scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getMessagesSchema() {
    return `
      CREATE TABLE IF NOT EXISTS messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
        receiver_id UUID REFERENCES users(id) ON DELETE SET NULL,
        job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getCustomerReviewsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS customer_reviews (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getServiceContractsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS service_contracts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
        title TEXT,
        details TEXT,
        recurrence TEXT,
        next_due_date DATE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getAttachmentsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        file_url TEXT NOT NULL,
        file_type TEXT,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  getTechnicianLocationsSchema() {
    return `
      CREATE TABLE IF NOT EXISTS technician_locations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        latitude NUMERIC,
        longitude NUMERIC,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
  }

  async createIndexes() {
    const idx = (table, column, indexName) => `DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = '${column}'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS ${indexName} ON public.${table}(${column})';
  END IF;
END $$;`;

    const indexes = [
      idx('customers', 'company_id', 'idx_customers_company_id'),
      idx('quotes', 'customer_id', 'idx_quotes_customer_id'),
      idx('quotes', 'status', 'idx_quotes_status'),
      idx('quote_items', 'quote_id', 'idx_quote_items_quote_id'),
      idx('jobs', 'customer_id', 'idx_jobs_customer_id'),
      // Align with actual schema: assigned_technician_id, job_status
      idx('jobs', 'assigned_technician_id', 'idx_jobs_assigned_technician_id'),
      idx('jobs', 'job_status', 'idx_jobs_job_status'),
      idx('job_photos', 'job_id', 'idx_job_photos_job_id'),
      idx('invoices', 'customer_id', 'idx_invoices_customer_id'),
      idx('invoices', 'status', 'idx_invoices_status'),
      idx('payments', 'invoice_id', 'idx_payments_invoice_id'),
      idx('messages', 'job_id', 'idx_messages_job_id'),
      idx('customer_reviews', 'job_id', 'idx_customer_reviews_job_id'),
      idx('service_contracts', 'customer_id', 'idx_service_contracts_customer_id'),
      idx('attachments', 'job_id', 'idx_attachments_job_id')
    ];

    let successCount = 0;
    for (const index of indexes) {
      const success = await this.executeSQL(index);
      if (success) successCount++;
    }

    console.log(`✅ Indexes created: ${successCount}/${indexes.length}`);
    return successCount === indexes.length;
  }

  async setupDatabase() {
    const tablesCreated = await this.createAllTables();
    const indexesCreated = await this.createIndexes();

    // Apply PO Settings System Enhancement
    const poSettingsSQL = `
-- Purchase Order Settings System Enhancement
-- Add PO-related columns to business_settings table
ALTER TABLE business_settings
ADD COLUMN IF NOT EXISTS po_number_prefix TEXT DEFAULT 'PO-',
ADD COLUMN IF NOT EXISTS next_po_number INTEGER DEFAULT 1001,
ADD COLUMN IF NOT EXISTS po_auto_numbering BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_approval_threshold NUMERIC DEFAULT 1000.00,
ADD COLUMN IF NOT EXISTS po_default_terms TEXT DEFAULT 'NET_30',
ADD COLUMN IF NOT EXISTS po_auto_send_to_vendor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_require_receipt_confirmation BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_allow_partial_receiving BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS po_default_shipping_method TEXT DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS po_tax_calculation_method TEXT DEFAULT 'AUTOMATIC',
ADD COLUMN IF NOT EXISTS po_currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS po_payment_terms_options JSONB DEFAULT '["NET_15", "NET_30", "NET_45", "NET_60", "DUE_ON_RECEIPT", "2_10_NET_30"]'::jsonb,
ADD COLUMN IF NOT EXISTS po_default_notes TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS po_footer_text TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS po_email_template TEXT DEFAULT 'Please find attached Purchase Order #{po_number}. Please confirm receipt and expected delivery date.',
ADD COLUMN IF NOT EXISTS po_reminder_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS po_overdue_notification_days INTEGER DEFAULT 14;

-- Add PO-related columns to settings table (legacy support)
ALTER TABLE settings
ADD COLUMN IF NOT EXISTS po_number_prefix TEXT DEFAULT 'PO-',
ADD COLUMN IF NOT EXISTS next_po_number INTEGER DEFAULT 1001,
ADD COLUMN IF NOT EXISTS po_default_terms TEXT DEFAULT 'NET_30',
ADD COLUMN IF NOT EXISTS po_require_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS po_approval_threshold NUMERIC DEFAULT 1000.00;

-- Create PO number sequence function
CREATE OR REPLACE FUNCTION generate_po_number(company_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    settings_record RECORD;
    new_number INTEGER;
    po_number TEXT;
BEGIN
    -- Get current settings
    SELECT po_number_prefix, next_po_number, po_auto_numbering
    INTO settings_record
    FROM business_settings
    WHERE company_id = company_id_param;

    -- Fallback to legacy settings table if business_settings not found
    IF NOT FOUND THEN
        SELECT po_number_prefix, next_po_number, true as po_auto_numbering
        INTO settings_record
        FROM settings
        WHERE company_id = company_id_param;
    END IF;

    -- Use defaults if no settings found
    IF NOT FOUND THEN
        settings_record.po_number_prefix := 'PO-';
        settings_record.next_po_number := 1001;
        settings_record.po_auto_numbering := true;
    END IF;

    -- Generate PO number
    IF settings_record.po_auto_numbering THEN
        new_number := settings_record.next_po_number;
        po_number := settings_record.po_number_prefix || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(new_number::TEXT, 4, '0');

        -- Update next number in business_settings
        UPDATE business_settings
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;

        -- Also update legacy settings table
        UPDATE settings
        SET next_po_number = new_number + 1, updated_at = NOW()
        WHERE company_id = company_id_param;
    ELSE
        -- Manual numbering - return template
        po_number := settings_record.po_number_prefix || 'MANUAL';
    END IF;

    RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate PO numbers
CREATE OR REPLACE FUNCTION auto_generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate if po_number is null or empty
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := generate_po_number(NEW.company_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on purchase_orders table
DROP TRIGGER IF EXISTS trigger_auto_generate_po_number ON purchase_orders;
CREATE TRIGGER trigger_auto_generate_po_number
    BEFORE INSERT ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_po_number();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_po_number(UUID) TO authenticated;

-- Update existing settings records with PO defaults
UPDATE business_settings
SET
    po_number_prefix = COALESCE(po_number_prefix, 'PO-'),
    next_po_number = COALESCE(next_po_number, 1001),
    po_auto_numbering = COALESCE(po_auto_numbering, true),
    po_require_approval = COALESCE(po_require_approval, false),
    po_approval_threshold = COALESCE(po_approval_threshold, 1000.00),
    po_default_terms = COALESCE(po_default_terms, 'NET_30'),
    updated_at = NOW()
WHERE po_number_prefix IS NULL;

-- Update legacy settings table as well
UPDATE settings
SET
    po_number_prefix = COALESCE(po_number_prefix, 'PO-'),
    next_po_number = COALESCE(next_po_number, 1001),
    po_require_approval = COALESCE(po_require_approval, false),
    po_approval_threshold = COALESCE(po_approval_threshold, 1000.00),
    po_default_terms = COALESCE(po_default_terms, 'NET_30'),
    updated_at = NOW()
WHERE po_number_prefix IS NULL;
    `;

    console.log('🔧 Applying PO Settings System Enhancement...');
    const poSettingsApplied = await this.executeSQL(poSettingsSQL);
    if (poSettingsApplied) {
      console.log('✅ PO Settings System Enhancement applied successfully');
    } else {
      console.log('⚠️ PO Settings System Enhancement skipped (may already exist)');
    }

    // Apply PO Budget Enhancement
    const poBudgetSQL = `
-- Purchase Order Budget Enhancement
-- Add budget_amount field to purchase_orders table
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS budget_amount NUMERIC DEFAULT NULL;

-- Create index for budget queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_budget ON purchase_orders(budget_amount) WHERE budget_amount IS NOT NULL;

-- Create function to check budget compliance
CREATE OR REPLACE FUNCTION check_po_budget_compliance(po_id UUID)
RETURNS JSONB AS $$
DECLARE
    po_record RECORD;
    result JSONB;
BEGIN
    -- Get PO details
    SELECT budget_amount, total_amount, po_number
    INTO po_record
    FROM purchase_orders
    WHERE id = po_id;

    -- If no budget set, return compliant
    IF po_record.budget_amount IS NULL THEN
        result := jsonb_build_object(
            'compliant', true,
            'budget_amount', null,
            'total_amount', po_record.total_amount,
            'variance', null,
            'message', 'No budget limit set'
        );
    ELSE
        -- Check compliance
        result := jsonb_build_object(
            'compliant', po_record.total_amount <= po_record.budget_amount,
            'budget_amount', po_record.budget_amount,
            'total_amount', po_record.total_amount,
            'variance', po_record.total_amount - po_record.budget_amount,
            'message', CASE
                WHEN po_record.total_amount <= po_record.budget_amount THEN 'Within budget'
                ELSE 'Exceeds budget by $' || (po_record.total_amount - po_record.budget_amount)::TEXT
            END
        );
    END IF;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_po_budget_compliance(UUID) TO authenticated;
    `;

    console.log('🔧 Applying PO Budget Enhancement...');
    const poBudgetApplied = await this.executeSQL(poBudgetSQL);
    if (poBudgetApplied) {
      console.log('✅ PO Budget Enhancement applied successfully');
    } else {
      console.log('⚠️ PO Budget Enhancement skipped (may already exist)');
    }

    if (tablesCreated && indexesCreated) {
      console.log('🎉 TradeMate Pro database setup completed successfully!');
      return true;
    } else {
      console.error('❌ Database setup encountered errors');
      return false;
    }
  }
}

// Export singleton instance
const databaseSetupService = new DatabaseSetupService();
export default databaseSetupService;
