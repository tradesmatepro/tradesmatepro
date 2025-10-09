# Phase 2 – Enterprise Schema (Merged Final)

## Base Schema (from GPT)
-- =========================================
-- SERVICE MANAGEMENT (Enterprise Extensions)
-- =========================================

CREATE TABLE job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_type job_template_type_enum NOT NULL,
    default_duration INTERVAL,
    default_rate NUMERIC(12,2) CHECK (default_rate >= 0),
    description TEXT,
    UNIQUE (company_id, name)
);

CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type rate_card_type_enum NOT NULL,
    base_rate NUMERIC(12,2) CHECK (base_rate >= 0),
    effective_from DATE NOT NULL,
    effective_to DATE,
    CHECK (effective_to IS NULL OR effective_to >= effective_from),
    UNIQUE (company_id, name, effective_from)
);

CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_type pricing_rule_type_enum NOT NULL,
    description TEXT,
    percentage NUMERIC(5,2) CHECK (percentage BETWEEN -100 AND 100),
    applies_to TEXT CHECK (applies_to IN ('labor','material','equipment','service','all'))
);

CREATE TABLE service_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    status service_agreement_status_enum NOT NULL DEFAULT 'draft',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT false,
    response_time INTERVAL, -- SLA requirement
    penalty_clause TEXT,
    CHECK (end_date >= start_date)
);

CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agreement_id UUID NOT NULL REFERENCES service_agreements(id) ON DELETE CASCADE,
    service_type_id UUID REFERENCES service_types(id),
    interval INTERVAL NOT NULL,
    next_due DATE NOT NULL,
    last_completed DATE
);

-- =========================================
-- TEAM / HR ENHANCEMENTS
-- =========================================

CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
    UNIQUE (employee_id, skill_name)
);

CREATE TABLE employee_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    certification_name TEXT NOT NULL,
    status employee_certification_status_enum NOT NULL DEFAULT 'active',
    issued_date DATE,
    expiry_date DATE,
    UNIQUE (employee_id, certification_name)
);

CREATE TABLE employee_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status availability_status_enum NOT NULL DEFAULT 'available',
    CHECK (end_time > start_time)
);

CREATE TABLE subcontractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    vendor_id UUID REFERENCES vendors(id),
    contact_email TEXT,
    contact_phone TEXT,
    UNIQUE (company_id, name)
);

CREATE TABLE subcontractor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcontractor_id UUID NOT NULL REFERENCES subcontractors(id) ON DELETE CASCADE,
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    status subcontractor_assignment_status_enum NOT NULL DEFAULT 'invited',
    assigned_at TIMESTAMP DEFAULT now(),
    UNIQUE (subcontractor_id, work_order_id)
);

CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    reviewer_id UUID REFERENCES users(id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    notes TEXT
);

CREATE TABLE compensation_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    plan_type TEXT CHECK (plan_type IN ('salary','hourly','commission','bonus','mixed')),
    base_amount NUMERIC(12,2) CHECK (base_amount >= 0),
    commission_rate NUMERIC(5,2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- =========================================
-- FINANCIAL ENHANCEMENTS
-- =========================================

CREATE TABLE recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id),
    interval recurring_invoice_interval_enum NOT NULL,
    next_issue_date DATE NOT NULL,
    end_date DATE,
    template_invoice_id UUID REFERENCES invoices(id),
    CHECK (end_date IS NULL OR end_date >= next_issue_date)
);

CREATE TABLE change_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    status change_order_status_enum NOT NULL DEFAULT 'draft',
    description TEXT NOT NULL,
    submitted_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type payment_method_type_enum NOT NULL,
    token TEXT NOT NULL, -- PCI handled externally
    is_default BOOLEAN DEFAULT false,
    UNIQUE (customer_id, type, token)
);

CREATE TABLE tax_jurisdictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    jurisdiction_type tax_jurisdiction_type_enum NOT NULL,
    rate NUMERIC(5,2) CHECK (rate >= 0),
    UNIQUE (company_id, name, jurisdiction_type)
);

CREATE TABLE job_costing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    labor_cost NUMERIC(12,2) DEFAULT 0,
    material_cost NUMERIC(12,2) DEFAULT 0,
    equipment_cost NUMERIC(12,2) DEFAULT 0,
    subcontractor_cost NUMERIC(12,2) DEFAULT 0,
    overhead_cost NUMERIC(12,2) DEFAULT 0,
    profit NUMERIC(12,2) GENERATED ALWAYS AS 
        ( (SELECT SUM(unit_price * quantity) FROM work_order_line_items WHERE work_order_id = job_costing.work_order_id) 
          - (labor_cost + material_cost + equipment_cost + subcontractor_cost + overhead_cost) ) STORED
);

-- =========================================
-- FIELD / MOBILE
-- =========================================

CREATE TABLE gps_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type gps_location_type_enum NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    status sync_log_status_enum NOT NULL DEFAULT 'pending',
    record_type TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE equipment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    status equipment_assignment_status_enum NOT NULL DEFAULT 'assigned',
    assigned_at TIMESTAMP DEFAULT now(),
    returned_at TIMESTAMP
);

-- =========================================
-- INTEGRATIONS
-- =========================================

CREATE TABLE webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    event webhook_event_enum NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE integration_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    token TEXT NOT NULL,
    status integration_status_enum NOT NULL DEFAULT 'active',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (company_id, provider)
);

CREATE TABLE integration_health_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES integration_tokens(id) ON DELETE CASCADE,
    status integration_status_enum NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);


✅ This Phase 2 dump adds:

Service agreements + SLAs with penalties and response times.

Skills, certifications, availability for employees.

Subcontractor assignments (separate from vendors).

Financial upgrades like change orders, recurring invoices, tax jurisdictions, job costing.

Field/mobile resilience with GPS logs, sync logs, equipment assignment.

Integrations with tokens, endpoints, and health monitoring.

---

## Enhanced Constraints (from Claude)
# 🏗️ Claude's TradeMate Pro Phase 2 Constraints (Enterprise-Grade)

**Advanced Constraint Analysis: GPT vs ServiceTitan Standards + Professional Requirements**

## 🎯 **GPT Analysis: 80% Right, Missing Professional Standards**

### ✅ **What GPT Got Right:**
- **Basic enterprise validation** - Rate cards, service agreements
- **Employee skill tracking** - Proficiency levels, certifications
- **Financial enhancements** - Job costing, recurring invoices
- **Integration support** - Webhook endpoints, tokens

### ❌ **Critical Issues I Found:**

#### **1. Missing Professional Validation**
- **Service Agreements**: No SLA validation logic
- **Rate Cards**: No overlap prevention
- **Job Costing**: No profit margin validation
- **Certifications**: No expiration warnings

#### **2. Inadequate Business Logic**
- **Subcontractors**: No capacity validation
- **GPS Tracking**: No geofencing validation
- **Performance Reviews**: No rating consistency
- **Integration Health**: No failure thresholds

## 🚀 **Claude's Enhanced Phase 2 Constraints**

### **🔧 Service Management (Enhanced)**
```sql
-- ENHANCED: Job template validation
CREATE TABLE job_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    template_number TEXT NOT NULL CHECK (template_number ~ '^JT-[0-9]{3,6}$'),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    template_type job_template_type_enum NOT NULL,
    -- ENHANCED: Duration and cost validation
    default_duration_hours NUMERIC(8,2) CHECK (default_duration_hours > 0 AND default_duration_hours <= 168), -- Max 1 week
    buffer_time_before_minutes INTEGER DEFAULT 0 CHECK (buffer_time_before_minutes >= 0 AND buffer_time_before_minutes <= 480),
    buffer_time_after_minutes INTEGER DEFAULT 0 CHECK (buffer_time_after_minutes >= 0 AND buffer_time_after_minutes <= 480),
    default_rate NUMERIC(12,2) CHECK (default_rate >= 0 AND default_rate <= 999999),
    -- ENHANCED: Requirements
    requires_permit BOOLEAN DEFAULT FALSE,
    requires_certification TEXT[],
    minimum_skill_level INTEGER CHECK (minimum_skill_level >= 1 AND minimum_skill_level <= 5),
    -- ENHANCED: Template configuration
    default_line_items JSONB DEFAULT '[]',
    safety_requirements TEXT,
    description TEXT CHECK (LENGTH(description) <= 2000),
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1 CHECK (version > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (company_id, template_number),
    UNIQUE (company_id, name, version)
);

-- ENHANCED: Rate card validation
CREATE TABLE rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rate_card_number TEXT NOT NULL CHECK (rate_card_number ~ '^RC-[0-9]{3,6}$'),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    type rate_card_type_enum NOT NULL,
    -- ENHANCED: Rate structure
    base_rate NUMERIC(12,2) NOT NULL CHECK (base_rate >= 0 AND base_rate <= 999999),
    overtime_multiplier NUMERIC(4,2) DEFAULT 1.5 CHECK (overtime_multiplier >= 1.0 AND overtime_multiplier <= 5.0),
    holiday_multiplier NUMERIC(4,2) DEFAULT 2.0 CHECK (holiday_multiplier >= 1.0 AND holiday_multiplier <= 5.0),
    weekend_multiplier NUMERIC(4,2) DEFAULT 1.0 CHECK (weekend_multiplier >= 1.0 AND weekend_multiplier <= 3.0),
    -- ENHANCED: Effective period validation
    effective_from DATE NOT NULL,
    effective_to DATE,
    -- ENHANCED: Geographic and service constraints
    service_area JSONB,
    applies_to_services TEXT[],
    minimum_job_value NUMERIC(12,2) DEFAULT 0 CHECK (minimum_job_value >= 0),
    maximum_job_value NUMERIC(12,2) CHECK (maximum_job_value IS NULL OR maximum_job_value > minimum_job_value),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_effective_period CHECK (effective_to IS NULL OR effective_to >= effective_from),
    CONSTRAINT no_overlapping_periods CHECK (
        -- Prevent overlapping rate cards for same company and type
        NOT EXISTS (
            SELECT 1 FROM rate_cards rc2 
            WHERE rc2.company_id = rate_cards.company_id 
            AND rc2.type = rate_cards.type 
            AND rc2.id != rate_cards.id
            AND (
                (rate_cards.effective_from BETWEEN rc2.effective_from AND COALESCE(rc2.effective_to, '2099-12-31')) OR
                (COALESCE(rate_cards.effective_to, '2099-12-31') BETWEEN rc2.effective_from AND COALESCE(rc2.effective_to, '2099-12-31'))
            )
        )
    ),
    
    UNIQUE (company_id, rate_card_number),
    UNIQUE (company_id, name, effective_from)
);

-- ENHANCED: Service agreement validation
CREATE TABLE service_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_number TEXT NOT NULL CHECK (agreement_number ~ '^SA-[0-9]{4,8}$'),
    status service_agreement_status_enum NOT NULL DEFAULT 'draft',
    -- ENHANCED: Agreement terms
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    renewal_notice_days INTEGER DEFAULT 30 CHECK (renewal_notice_days >= 0 AND renewal_notice_days <= 365),
    -- ENHANCED: SLA requirements
    emergency_response_hours INTEGER CHECK (emergency_response_hours > 0 AND emergency_response_hours <= 24),
    urgent_response_hours INTEGER CHECK (urgent_response_hours > 0 AND urgent_response_hours <= 72),
    normal_response_hours INTEGER CHECK (normal_response_hours > 0 AND normal_response_hours <= 168),
    -- ENHANCED: Service windows
    service_hours_start TIME DEFAULT '08:00',
    service_hours_end TIME DEFAULT '17:00',
    service_days INTEGER[] DEFAULT '{1,2,3,4,5}' CHECK (service_days <@ '{1,2,3,4,5,6,7}'),
    -- ENHANCED: Penalties and credits
    penalty_rate NUMERIC(5,2) DEFAULT 0 CHECK (penalty_rate >= 0 AND penalty_rate <= 100),
    credit_rate NUMERIC(5,2) DEFAULT 0 CHECK (credit_rate >= 0 AND credit_rate <= 100),
    maximum_penalty_amount NUMERIC(12,2) CHECK (maximum_penalty_amount >= 0),
    -- ENHANCED: Financial terms
    monthly_fee NUMERIC(12,2) DEFAULT 0 CHECK (monthly_fee >= 0),
    discount_rate NUMERIC(5,2) DEFAULT 0 CHECK (discount_rate >= 0 AND discount_rate <= 50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_agreement_period CHECK (end_date > start_date),
    CONSTRAINT valid_service_hours CHECK (service_hours_end > service_hours_start),
    CONSTRAINT valid_response_times CHECK (
        (emergency_response_hours IS NULL OR urgent_response_hours IS NULL OR emergency_response_hours <= urgent_response_hours) AND
        (urgent_response_hours IS NULL OR normal_response_hours IS NULL OR urgent_response_hours <= normal_response_hours)
    ),
    CONSTRAINT logical_penalties CHECK (
        penalty_rate = 0 OR maximum_penalty_amount IS NOT NULL
    ),
    
    UNIQUE (company_id, agreement_number)
);

-- ENHANCED: Maintenance schedule validation
CREATE TABLE maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    agreement_id UUID REFERENCES service_agreements(id) ON DELETE CASCADE,
    schedule_number TEXT NOT NULL CHECK (schedule_number ~ '^MS-[0-9]{4,8}$'),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    -- ENHANCED: Schedule configuration
    frequency_type TEXT NOT NULL CHECK (frequency_type IN ('daily','weekly','monthly','quarterly','semi_annually','annually','custom')),
    frequency_value INTEGER DEFAULT 1 CHECK (frequency_value > 0 AND frequency_value <= 365),
    custom_schedule TEXT, -- Cron-like expression
    -- ENHANCED: Scheduling details
    next_due_date DATE NOT NULL,
    last_completed_date DATE,
    completion_window_days INTEGER DEFAULT 7 CHECK (completion_window_days > 0 AND completion_window_days <= 30),
    -- ENHANCED: Service details
    service_type_id UUID REFERENCES service_types(id),
    job_template_id UUID REFERENCES job_templates(id),
    estimated_duration_hours NUMERIC(8,2) CHECK (estimated_duration_hours > 0),
    estimated_cost NUMERIC(12,2) CHECK (estimated_cost >= 0),
    -- ENHANCED: Status and tracking
    status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','completed','cancelled')),
    consecutive_missed INTEGER DEFAULT 0 CHECK (consecutive_missed >= 0),
    total_completed INTEGER DEFAULT 0 CHECK (total_completed >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_completion_date CHECK (
        last_completed_date IS NULL OR last_completed_date <= CURRENT_DATE
    ),
    CONSTRAINT valid_next_due CHECK (
        next_due_date >= CURRENT_DATE OR status IN ('completed','cancelled')
    ),
    CONSTRAINT custom_schedule_logic CHECK (
        frequency_type != 'custom' OR custom_schedule IS NOT NULL
    ),
    
    UNIQUE (company_id, schedule_number)
);
```

### **👥 Team Management (Enhanced)**
```sql
-- ENHANCED: Employee skills validation
CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL CHECK (LENGTH(skill_name) >= 2 AND LENGTH(skill_name) <= 100),
    skill_category TEXT CHECK (skill_category IN ('technical','safety','customer_service','leadership','administrative')),
    proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    -- ENHANCED: Certification tracking
    is_certified BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    certification_expires DATE,
    certifying_body TEXT CHECK (LENGTH(certifying_body) <= 100),
    -- ENHANCED: Verification
    verified_by UUID REFERENCES users(id),
    verified_date DATE,
    requires_renewal BOOLEAN DEFAULT FALSE,
    -- ENHANCED: Performance tracking
    last_assessed_date DATE,
    assessment_score NUMERIC(5,2) CHECK (assessment_score >= 0 AND assessment_score <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT certification_logic CHECK (
        (is_certified = FALSE) OR
        (is_certified = TRUE AND certification_date IS NOT NULL)
    ),
    CONSTRAINT expiration_logic CHECK (
        certification_expires IS NULL OR
        certification_expires > certification_date
    ),
    CONSTRAINT verification_logic CHECK (
        verified_by IS NULL OR verified_date IS NOT NULL
    ),

    UNIQUE (employee_id, skill_name)
);

-- ENHANCED: Employee certification validation
CREATE TABLE employee_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    certification_number TEXT NOT NULL CHECK (certification_number ~ '^CERT-[A-Z0-9]{4,12}$'),
    certification_name TEXT NOT NULL CHECK (LENGTH(certification_name) >= 2 AND LENGTH(certification_name) <= 100),
    status employee_certification_status_enum NOT NULL DEFAULT 'active',
    -- ENHANCED: Certification details
    issuing_authority TEXT NOT NULL CHECK (LENGTH(issuing_authority) >= 2),
    license_number TEXT,
    issued_date DATE NOT NULL,
    expiry_date DATE,
    renewal_required BOOLEAN DEFAULT TRUE,
    -- ENHANCED: Renewal tracking
    renewal_notice_days INTEGER DEFAULT 30 CHECK (renewal_notice_days >= 0 AND renewal_notice_days <= 365),
    last_renewal_date DATE,
    renewal_cost NUMERIC(8,2) CHECK (renewal_cost >= 0),
    -- ENHANCED: Verification
    verification_document_url TEXT,
    verified_by UUID REFERENCES users(id),
    verified_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_dates CHECK (
        expiry_date IS NULL OR expiry_date > issued_date
    ),
    CONSTRAINT renewal_logic CHECK (
        last_renewal_date IS NULL OR last_renewal_date >= issued_date
    ),
    CONSTRAINT status_logic CHECK (
        CASE status
            WHEN 'expired' THEN expiry_date IS NOT NULL AND expiry_date < CURRENT_DATE
            WHEN 'expiring_soon' THEN expiry_date IS NOT NULL AND expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
            ELSE TRUE
        END
    ),

    UNIQUE (employee_id, certification_number),
    UNIQUE (employee_id, certification_name, issued_date)
);

-- ENHANCED: Performance review validation
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_number TEXT NOT NULL CHECK (review_number ~ '^PR-[0-9]{4}-[0-9]{3}$'),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    -- ENHANCED: Rating system
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    technical_skills_rating INTEGER CHECK (technical_skills_rating BETWEEN 1 AND 5),
    customer_service_rating INTEGER CHECK (customer_service_rating BETWEEN 1 AND 5),
    teamwork_rating INTEGER CHECK (teamwork_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    -- ENHANCED: Detailed feedback
    strengths TEXT CHECK (LENGTH(strengths) <= 2000),
    areas_for_improvement TEXT CHECK (LENGTH(areas_for_improvement) <= 2000),
    goals_next_period TEXT CHECK (LENGTH(goals_next_period) <= 2000),
    development_plan TEXT CHECK (LENGTH(development_plan) <= 2000),
    -- ENHANCED: Review process
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','completed','acknowledged','disputed')),
    completed_date DATE,
    acknowledged_date DATE,
    employee_comments TEXT CHECK (LENGTH(employee_comments) <= 2000),
    -- ENHANCED: Follow-up
    next_review_date DATE,
    salary_adjustment_percent NUMERIC(5,2) CHECK (salary_adjustment_percent BETWEEN -50 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_review_period CHECK (review_period_end > review_period_start),
    CONSTRAINT valid_completion CHECK (
        status != 'completed' OR completed_date IS NOT NULL
    ),
    CONSTRAINT valid_acknowledgment CHECK (
        acknowledged_date IS NULL OR
        (completed_date IS NOT NULL AND acknowledged_date >= completed_date)
    ),
    CONSTRAINT rating_consistency CHECK (
        (overall_rating IS NULL) OR
        (technical_skills_rating IS NOT NULL AND customer_service_rating IS NOT NULL AND teamwork_rating IS NOT NULL)
    ),

    UNIQUE (employee_id, review_number)
);
```

### **💰 Financial Enhancements (Enhanced)**
```sql
-- ENHANCED: Job costing validation
CREATE TABLE job_costing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL UNIQUE REFERENCES work_orders(id) ON DELETE CASCADE,
    -- ENHANCED: Cost breakdown
    labor_hours NUMERIC(8,2) DEFAULT 0 CHECK (labor_hours >= 0 AND labor_hours <= 999),
    labor_cost NUMERIC(12,2) DEFAULT 0 CHECK (labor_cost >= 0),
    overtime_hours NUMERIC(8,2) DEFAULT 0 CHECK (overtime_hours >= 0 AND overtime_hours <= 999),
    overtime_cost NUMERIC(12,2) DEFAULT 0 CHECK (overtime_cost >= 0),
    material_cost NUMERIC(12,2) DEFAULT 0 CHECK (material_cost >= 0),
    material_markup_percent NUMERIC(5,2) DEFAULT 0 CHECK (material_markup_percent >= 0 AND material_markup_percent <= 500),
    equipment_cost NUMERIC(12,2) DEFAULT 0 CHECK (equipment_cost >= 0),
    subcontractor_cost NUMERIC(12,2) DEFAULT 0 CHECK (subcontractor_cost >= 0),
    permit_cost NUMERIC(12,2) DEFAULT 0 CHECK (permit_cost >= 0),
    travel_cost NUMERIC(12,2) DEFAULT 0 CHECK (travel_cost >= 0),
    other_costs NUMERIC(12,2) DEFAULT 0 CHECK (other_costs >= 0),
    -- ENHANCED: Calculated totals
    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (
        labor_cost + overtime_cost + material_cost + equipment_cost +
        subcontractor_cost + permit_cost + travel_cost + other_costs
    ) STORED,
    total_revenue NUMERIC(12,2) DEFAULT 0 CHECK (total_revenue >= 0),
    gross_profit NUMERIC(12,2) GENERATED ALWAYS AS (total_revenue - total_cost) STORED,
    profit_margin_percent NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN total_revenue > 0 THEN ((total_revenue - total_cost) / total_revenue * 100) ELSE 0 END
    ) STORED,
    -- ENHANCED: Tracking
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    is_final BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT reasonable_profit_margin CHECK (
        profit_margin_percent >= -100 AND profit_margin_percent <= 1000
    ),
    CONSTRAINT labor_cost_logic CHECK (
        (labor_hours = 0 AND labor_cost = 0) OR
        (labor_hours > 0 AND labor_cost > 0)
    )
);
```

