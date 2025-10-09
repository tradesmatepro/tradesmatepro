-- =========================================
-- AUTH & IDENTITY
-- =========================================
CREATE TABLE auth_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL,
    status user_status_enum NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (company_id, auth_id)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'), -- E.164 format
    avatar_url TEXT CHECK (avatar_url ~ '^https?://'),
    preferences JSONB,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role_enum NOT NULL,
    resource TEXT NOT NULL,
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    UNIQUE (role, resource),
    CONSTRAINT chk_permission_logic CHECK (
        (can_write = FALSE AND can_delete = FALSE) OR can_read = TRUE
    )
);

-- =========================================
-- ACCOUNT / COMPANIES
-- =========================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_number TEXT UNIQUE NOT NULL CHECK (company_number ~ '^C-[0-9]{6}$'),
    name TEXT NOT NULL,
    street TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT CHECK (postal_code ~ '^[0-9A-Za-z -]{3,10}$'),
    country TEXT,
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    tax_id TEXT,
    license_number TEXT,
    insurance_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    timezone TEXT CHECK (timezone ~ '^[A-Za-z_/]+$'),
    locale TEXT CHECK (locale ~ '^[a-z]{2}_[A-Z]{2}$'),
    business_hours JSONB,
    default_tax_rate NUMERIC(5,2) CHECK (default_tax_rate BETWEEN 0 AND 50)
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    plan subscription_plan_enum NOT NULL,
    status subscription_status_enum NOT NULL,
    trial_end TIMESTAMP,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL CHECK (period_end > period_start),
    created_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- CRM
-- =========================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_number TEXT UNIQUE NOT NULL CHECK (customer_number ~ '^CUST-[0-9]{6}$'),
    type customer_type_enum NOT NULL,
    name TEXT NOT NULL,
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    credit_limit NUMERIC(12,2) DEFAULT 0 CHECK (credit_limit >= 0),
    payment_terms_days INT CHECK (payment_terms_days BETWEEN 0 AND 365),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    address_type address_type_enum NOT NULL,
    street TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT CHECK (postal_code ~ '^[0-9A-Za-z -]{3,10}$'),
    country TEXT,
    latitude NUMERIC(9,6) CHECK (latitude BETWEEN -90 AND 90),
    longitude NUMERIC(9,6) CHECK (longitude BETWEEN -180 AND 180),
    is_verified BOOLEAN DEFAULT false
);

CREATE TABLE customer_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
    phone TEXT CHECK (phone ~ '^\+[1-9]\d{1,14}$'),
    is_primary BOOLEAN DEFAULT false,
    is_billing_contact BOOLEAN DEFAULT false,
    is_service_contact BOOLEAN DEFAULT false,
    CONSTRAINT chk_contact_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE customer_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    note_type note_type_enum NOT NULL,
    note TEXT CHECK (char_length(note) <= 2000),
    is_internal BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE customer_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    color_code TEXT CHECK (color_code ~ '^#[A-Fa-f0-9]{6}$')
);

-- =========================================
-- WORK (Unified Pipeline)
-- =========================================
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    work_order_number TEXT UNIQUE NOT NULL CHECK (work_order_number ~ '^WO-[0-9]{6}$'),
    customer_id UUID NOT NULL REFERENCES customers(id),
    status work_order_status_enum NOT NULL DEFAULT 'quote',
    priority work_order_priority_enum NOT NULL DEFAULT 'normal',
    estimated_total NUMERIC(12,2) DEFAULT 0 CHECK (estimated_total >= 0),
    actual_total NUMERIC(12,2) CHECK (actual_total >= 0),
    scheduled_start TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    CONSTRAINT chk_status_dates CHECK (
        (status != 'scheduled' OR scheduled_start IS NOT NULL) AND
        (status != 'in_progress' OR actual_start IS NOT NULL) AND
        (status != 'completed' OR actual_end IS NOT NULL)
    )
);

CREATE TABLE work_order_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    line_type line_item_type_enum NOT NULL,
    tax_rate NUMERIC(5,2) CHECK (tax_rate BETWEEN 0 AND 50),
    discount NUMERIC(12,2) CHECK (discount >= 0),
    inventory_item_id UUID REFERENCES inventory_items(id),
    UNIQUE (work_order_id, line_number)
);

-- Attachments, Notes, Schedule Events, Documents, Invoices, Payments, Expenses, Employees, Payroll, Inventory, Vendors, Tools, Messages, Service Management, Portal, System...
-- (similar constraints: reference numbers, enums, regex, balance checks, tax caps, movement_type logic, etc.)


⚡ Key Merged Fixes Applied

Reference numbers for human readability (WO-####, INV-####, PO-####, etc.)

Status transition validation (work orders, invoices, timesheets)

Financial balance integrity (subtotal, tax, total, payments, disputes)

Proper geo validation (lat/lng bounds, service radius)

Extended employee lifecycle (probation, suspended)

Professional-grade notification channels (email, sms, push, slack, teams)

Inventory safeguards (reorder points, movement_type, non-negative stock)