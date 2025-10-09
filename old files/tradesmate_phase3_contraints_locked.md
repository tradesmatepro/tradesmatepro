# Phase 3 – Marketplace Schema (Merged Final)

## Base Schema (from GPT)
-- =========================================
-- MARKETPLACE CORE
-- =========================================

CREATE TABLE marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    typical_value_range NUMERIC(12,2)[],
    expected_response_time INTERVAL
);

CREATE TABLE marketplace_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES marketplace_categories(id),
    title TEXT NOT NULL,
    description TEXT,
    status marketplace_request_status_enum NOT NULL DEFAULT 'open',
    priority marketplace_request_priority_enum NOT NULL DEFAULT 'normal',
    budget NUMERIC(12,2) CHECK (budget >= 0),
    expiration_date TIMESTAMP,
    lead_quality_score INT CHECK (lead_quality_score BETWEEN 0 AND 100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE marketplace_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    provider_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status marketplace_response_status_enum NOT NULL DEFAULT 'submitted',
    proposed_price NUMERIC(12,2) CHECK (proposed_price >= 0),
    expiration_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (request_id, provider_company_id)
);

-- Counter-offer thread
CREATE TABLE marketplace_counter_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES marketplace_responses(id) ON DELETE CASCADE,
    offered_by UUID NOT NULL REFERENCES users(id),
    amount NUMERIC(12,2) CHECK (amount >= 0),
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Conversation threads
CREATE TABLE marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type marketplace_message_type_enum NOT NULL,
    body TEXT,
    file_url TEXT,
    status marketplace_message_status_enum NOT NULL DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT now()
);

-- Attachments separate for large files
CREATE TABLE marketplace_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES marketplace_messages(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- REVIEWS & VERIFICATION
-- =========================================

CREATE TABLE marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_type review_type_enum NOT NULL,
    rating_quality INT CHECK (rating_quality BETWEEN 1 AND 5),
    rating_timeliness INT CHECK (rating_timeliness BETWEEN 1 AND 5),
    rating_communication INT CHECK (rating_communication BETWEEN 1 AND 5),
    rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
    comments TEXT,
    status review_status_enum NOT NULL DEFAULT 'pending_moderation',
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE (request_id, reviewer_id, review_type)
);

CREATE TABLE provider_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
    bio TEXT,
    years_in_business INT,
    license_number TEXT,
    insurance_verified BOOLEAN DEFAULT false,
    performance_score NUMERIC(5,2) CHECK (performance_score BETWEEN 0 AND 100)
);

CREATE TABLE verification_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    status verification_status_enum NOT NULL DEFAULT 'pending',
    documents JSONB,
    started_at TIMESTAMP DEFAULT now(),
    completed_at TIMESTAMP
);

-- =========================================
-- TRANSACTIONS
-- =========================================

CREATE TABLE marketplace_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    response_id UUID NOT NULL REFERENCES marketplace_responses(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status commission_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    request_id UUID REFERENCES marketplace_requests(id),
    response_id UUID REFERENCES marketplace_responses(id),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status credit_transaction_status_enum NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- ANALYTICS
-- =========================================

CREATE TABLE marketplace_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    total_requests INT DEFAULT 0,
    total_responses INT DEFAULT 0,
    win_rate NUMERIC(5,2) CHECK (win_rate BETWEEN 0 AND 100),
    avg_response_time INTERVAL,
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE (company_id)
);


✅ This Phase 3 dump adds:

Requests & Responses with priorities, budgets, expirations, lead quality scoring.

Counter-offers + threaded messaging (fixes rigid one-shot bidding).

Reviews tied to real requests, with multi-dimension scoring.

Provider profiles with verification, licenses, insurance.

Transactions with credits/refunds — no more contractors eating losses.

Analytics for ROI tracking (win rate, response time).

---

## Enhanced Constraints (from Claude)
# 🏗️ Claude's TradeMate Pro Phase 3 Constraints (Anti-Angi/Thumbtack Solution)

**Marketplace Constraint Analysis: Solving Real Contractor Pain Points from Angi/Thumbtack Research**

## 🚨 **Critical Marketplace Pain Points from Research:**

### **💸 Angi/Thumbtack Contractor Complaints:**
- **Poor lead quality** - "Bogus leads, dead numbers, unresponsive prospects"
- **Excessive lead costs** - "Paying for potential leads but not actual jobs"
- **Lead over-distribution** - "Same lead sold to multiple contractors"
- **Geographic mismatches** - "Leads outside service area or specialty"
- **Account suspensions** - "Deactivated without notice, no appeals"
- **Review manipulation** - "Unfair negative reviews, no recourse"
- **Hidden fees** - "Locked contracts, termination fees, billing disputes"
- **Contractor scams** - "Cash upfront, no work performed"

### **🎯 TradeMate Pro's Solution Strategy:**
- **Lead quality validation** - Score and verify before contractors see them
- **Transparent pricing** - No hidden fees, refund unused credits
- **Geographic enforcement** - Strict service area matching
- **Limited competition** - Cap contractors per lead, exclusivity windows
- **Fair account management** - Clear policies, appeals process
- **Review integrity** - Two-sided reviews, moderation, dispute resolution
- **Contractor verification** - Background checks, insurance validation
- **Escrow protection** - Hold funds until work completion

## 🚀 **Claude's Anti-Angi/Thumbtack Phase 3 Constraints**

### **🏪 Lead Quality & Validation (Solving "Bogus Leads" Problem)**
```sql
-- ANTI-ANGI: Lead quality validation and scoring
CREATE TABLE marketplace_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_code TEXT NOT NULL CHECK (category_code ~ '^MKT-[A-Z]{2,6}$'),
    name TEXT NOT NULL CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100),
    description TEXT CHECK (LENGTH(description) <= 500),
    -- ANTI-THUMBTACK: Transparent pricing expectations
    typical_value_min NUMERIC(12,2) DEFAULT 0 CHECK (typical_value_min >= 0),
    typical_value_max NUMERIC(12,2) CHECK (typical_value_max IS NULL OR typical_value_max > typical_value_min),
    average_response_time_hours INTEGER DEFAULT 24 CHECK (average_response_time_hours > 0 AND average_response_time_hours <= 168),
    -- ANTI-ANGI: Strict qualification requirements
    requires_license BOOLEAN DEFAULT FALSE,
    requires_insurance BOOLEAN DEFAULT TRUE,
    requires_background_check BOOLEAN DEFAULT TRUE,
    minimum_experience_years INTEGER DEFAULT 0 CHECK (minimum_experience_years >= 0 AND minimum_experience_years <= 50),
    -- LEAD QUALITY: Historical performance tracking
    average_conversion_rate NUMERIC(5,2) DEFAULT 0 CHECK (average_conversion_rate >= 0 AND average_conversion_rate <= 100),
    average_lead_quality_score NUMERIC(5,2) DEFAULT 0 CHECK (average_lead_quality_score >= 0 AND average_lead_quality_score <= 100),
    -- ANTI-SCAM: Category-specific fraud indicators
    common_scam_patterns TEXT[],
    red_flag_keywords TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(category_code),
    UNIQUE(name)
);

-- ANTI-ANGI: Lead quality validation and geographic enforcement
CREATE TABLE marketplace_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    request_number TEXT NOT NULL CHECK (request_number ~ '^REQ-[0-9]{4,8}$'),
    category_id UUID NOT NULL REFERENCES marketplace_categories(id),
    title TEXT NOT NULL CHECK (LENGTH(title) >= 5 AND LENGTH(title) <= 200),
    description TEXT NOT NULL CHECK (LENGTH(description) >= 20 AND LENGTH(description) <= 5000),
    status marketplace_request_status_enum NOT NULL DEFAULT 'draft',
    priority marketplace_request_priority_enum NOT NULL DEFAULT 'normal',
    -- ANTI-THUMBTACK: Transparent, realistic budget validation
    budget_type TEXT DEFAULT 'range' CHECK (budget_type IN ('fixed','range','hourly','negotiable')),
    budget_min NUMERIC(12,2) CHECK (budget_min >= 50), -- Minimum $50 to prevent fake leads
    budget_max NUMERIC(12,2) CHECK (budget_max IS NULL OR budget_max >= budget_min),
    hourly_rate_max NUMERIC(8,2) CHECK (hourly_rate_max >= 15), -- Minimum wage protection
    budget_verified BOOLEAN DEFAULT FALSE, -- Customer must verify they have budget
    -- ANTI-ANGI: Customer verification and quality scoring
    customer_phone_verified BOOLEAN DEFAULT FALSE,
    customer_email_verified BOOLEAN DEFAULT FALSE,
    customer_payment_method_verified BOOLEAN DEFAULT FALSE,
    customer_previous_jobs INTEGER DEFAULT 0 CHECK (customer_previous_jobs >= 0),
    customer_avg_rating NUMERIC(3,2) CHECK (customer_avg_rating >= 1 AND customer_avg_rating <= 5),
    -- LEAD QUALITY: Comprehensive scoring system
    lead_quality_score INTEGER DEFAULT 0 CHECK (lead_quality_score BETWEEN 0 AND 100),
    lead_urgency_verified BOOLEAN DEFAULT FALSE, -- Is this really urgent?
    lead_scope_clarity_score INTEGER CHECK (lead_scope_clarity_score BETWEEN 0 AND 100),
    lead_budget_realism_score INTEGER CHECK (lead_budget_realism_score BETWEEN 0 AND 100),
    -- ANTI-ANGI: Strict geographic validation
    service_address JSONB NOT NULL,
    latitude NUMERIC(9,6) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude NUMERIC(9,6) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    address_verified BOOLEAN DEFAULT FALSE, -- Address must be real
    travel_radius_miles INTEGER DEFAULT 25 CHECK (travel_radius_miles > 0 AND travel_radius_miles <= 100),
    -- ANTI-SCAM: Fraud detection
    scam_risk_score INTEGER DEFAULT 0 CHECK (scam_risk_score BETWEEN 0 AND 100),
    contains_red_flags BOOLEAN DEFAULT FALSE,
    red_flag_reasons TEXT[],
    -- COMPETITION CONTROL: Limit contractor exposure
    max_contractors_allowed INTEGER DEFAULT 5 CHECK (max_contractors_allowed BETWEEN 1 AND 10),
    contractors_invited INTEGER DEFAULT 0 CHECK (contractors_invited >= 0),
    exclusive_window_hours INTEGER DEFAULT 2 CHECK (exclusive_window_hours BETWEEN 0 AND 24),
    -- LIFECYCLE: Enhanced tracking
    expires_at TIMESTAMPTZ,
    awarded_to_company_id UUID REFERENCES companies(id),
    awarded_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
    response_count INTEGER DEFAULT 0 CHECK (response_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ANTI-ANGI: Lead quality enforcement
    CONSTRAINT lead_quality_threshold CHECK (
        status != 'open' OR lead_quality_score >= 60 -- Only quality leads go live
    ),
    CONSTRAINT customer_verification_required CHECK (
        status != 'open' OR (customer_phone_verified = TRUE AND customer_email_verified = TRUE)
    ),
    CONSTRAINT budget_verification_required CHECK (
        budget_min < 500 OR budget_verified = TRUE -- Large jobs must verify budget
    ),
    CONSTRAINT address_verification_required CHECK (
        status != 'open' OR address_verified = TRUE
    ),
    -- ANTI-SCAM: Fraud prevention
    CONSTRAINT scam_prevention CHECK (
        scam_risk_score < 70 OR status = 'cancelled' -- High risk leads blocked
    ),
    CONSTRAINT contractor_limit_enforcement CHECK (
        contractors_invited <= max_contractors_allowed
    ),
    -- BUSINESS LOGIC: Standard validations
    CONSTRAINT valid_completion_date CHECK (
        requested_completion_date IS NULL OR
        requested_start_date IS NULL OR
        requested_completion_date >= requested_start_date
    ),
    CONSTRAINT valid_budget_range CHECK (
        budget_type != 'range' OR (budget_min IS NOT NULL AND budget_max IS NOT NULL)
    ),
    CONSTRAINT valid_award CHECK (
        (awarded_to_company_id IS NULL AND awarded_at IS NULL) OR
        (awarded_to_company_id IS NOT NULL AND awarded_at IS NOT NULL)
    ),

    UNIQUE(company_id, request_number)
);

-- ANTI-THUMBTACK: Fair bidding with quality controls
CREATE TABLE marketplace_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    responder_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    responder_employee_id UUID REFERENCES employees(id),
    response_number TEXT NOT NULL CHECK (response_number ~ '^BID-[0-9]{4,8}$'),
    status marketplace_response_status_enum NOT NULL DEFAULT 'draft',
    -- ANTI-THUMBTACK: Realistic bid validation
    bid_type TEXT DEFAULT 'fixed' CHECK (bid_type IN ('fixed','hourly','time_and_materials')),
    bid_amount NUMERIC(12,2) NOT NULL CHECK (bid_amount >= 25), -- Minimum viable bid
    hourly_rate NUMERIC(8,2) CHECK (hourly_rate >= 15), -- Minimum wage protection
    estimated_hours NUMERIC(8,2) CHECK (estimated_hours > 0 AND estimated_hours <= 1000),
    -- BID QUALITY: Competitiveness and realism scoring
    bid_competitiveness_score INTEGER CHECK (bid_competitiveness_score BETWEEN 0 AND 100),
    bid_realism_score INTEGER CHECK (bid_realism_score BETWEEN 0 AND 100),
    market_rate_comparison NUMERIC(5,2), -- % above/below market rate
    -- ANTI-ANGI: Service area validation
    contractor_distance_miles NUMERIC(8,2) CHECK (contractor_distance_miles >= 0),
    within_service_area BOOLEAN DEFAULT FALSE,
    travel_time_minutes INTEGER CHECK (travel_time_minutes >= 0),
    -- QUALITY CONTROL: Proposal validation
    proposal_summary TEXT NOT NULL CHECK (LENGTH(proposal_summary) >= 50 AND LENGTH(proposal_summary) <= 1000),
    detailed_approach TEXT CHECK (LENGTH(detailed_approach) >= 100 AND LENGTH(detailed_approach) <= 3000),
    materials_included BOOLEAN DEFAULT TRUE,
    warranty_offered TEXT CHECK (LENGTH(warranty_offered) >= 20 AND LENGTH(warranty_offered) <= 500),
    insurance_coverage_amount NUMERIC(12,2) CHECK (insurance_coverage_amount >= 100000),
    -- CONTRACTOR CREDIBILITY: Track record validation
    similar_projects_completed INTEGER DEFAULT 0 CHECK (similar_projects_completed >= 0),
    portfolio_urls TEXT[] CHECK (array_length(portfolio_urls, 1) <= 10),
    references_provided INTEGER DEFAULT 0 CHECK (references_provided >= 0 AND references_provided <= 5),
    -- ANTI-SPAM: Response limits and quality
    response_quality_score INTEGER CHECK (response_quality_score BETWEEN 0 AND 100),
    is_template_response BOOLEAN DEFAULT FALSE, -- Detect copy-paste responses
    personalization_score INTEGER CHECK (personalization_score BETWEEN 0 AND 100),
    -- LIFECYCLE: Enhanced tracking
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    submitted_at TIMESTAMPTZ,
    viewed_by_requester BOOLEAN DEFAULT FALSE,
    viewed_at TIMESTAMPTZ,
    follow_up_count INTEGER DEFAULT 0 CHECK (follow_up_count >= 0 AND follow_up_count <= 3), -- Limit spam
    last_follow_up_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ANTI-THUMBTACK: Quality and fairness enforcement
    CONSTRAINT service_area_validation CHECK (
        status != 'submitted' OR within_service_area = TRUE
    ),
    CONSTRAINT bid_quality_threshold CHECK (
        status != 'submitted' OR (bid_realism_score >= 70 AND response_quality_score >= 60)
    ),
    CONSTRAINT template_response_limit CHECK (
        is_template_response = FALSE OR personalization_score >= 40
    ),
    CONSTRAINT insurance_requirement CHECK (
        bid_amount < 1000 OR insurance_coverage_amount >= 100000
    ),
    -- BUSINESS LOGIC: Standard validations
    CONSTRAINT valid_bid_type CHECK (
        (bid_type != 'hourly' OR hourly_rate IS NOT NULL) AND
        (bid_type != 'time_and_materials' OR (hourly_rate IS NOT NULL AND estimated_hours IS NOT NULL))
    ),
    CONSTRAINT valid_expiration CHECK (expires_at > created_at),
    CONSTRAINT valid_submission CHECK (
        status != 'submitted' OR submitted_at IS NOT NULL
    ),
    CONSTRAINT follow_up_spam_prevention CHECK (
        follow_up_count <= 3 -- Stricter than competitors
    ),

    UNIQUE(responder_company_id, response_number),
    UNIQUE(request_id, responder_company_id) -- One response per company per request
);

-- ANTI-ANGI: Lead cost and refund management
CREATE TABLE marketplace_lead_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    contractor_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    cost_number TEXT NOT NULL CHECK (cost_number ~ '^LC-[0-9]{4,8}$'),
    -- TRANSPARENT PRICING: Clear cost structure
    base_lead_cost NUMERIC(8,2) NOT NULL CHECK (base_lead_cost >= 0),
    quality_premium NUMERIC(8,2) DEFAULT 0 CHECK (quality_premium >= 0),
    exclusivity_premium NUMERIC(8,2) DEFAULT 0 CHECK (exclusivity_premium >= 0),
    total_cost NUMERIC(8,2) GENERATED ALWAYS AS (base_lead_cost + quality_premium + exclusivity_premium) STORED,
    -- REFUND PROTECTION: Track conversion and refunds
    charged_at TIMESTAMPTZ DEFAULT NOW(),
    customer_responded BOOLEAN DEFAULT FALSE,
    customer_response_at TIMESTAMPTZ,
    job_awarded BOOLEAN DEFAULT FALSE,
    job_awarded_at TIMESTAMPTZ,
    -- REFUND ELIGIBILITY: Clear refund criteria
    refund_eligible BOOLEAN DEFAULT TRUE,
    refund_reason refund_reason_enum,
    refund_amount NUMERIC(8,2) CHECK (refund_amount >= 0 AND refund_amount <= total_cost),
    refunded_at TIMESTAMPTZ,
    -- QUALITY TRACKING: Lead performance
    lead_conversion_rate NUMERIC(5,2) CHECK (lead_conversion_rate >= 0 AND lead_conversion_rate <= 100),
    contractor_satisfaction_rating INTEGER CHECK (contractor_satisfaction_rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- REFUND LOGIC: Automatic refund triggers
    CONSTRAINT auto_refund_no_response CHECK (
        customer_responded = TRUE OR
        charged_at + INTERVAL '48 hours' > NOW() OR
        refund_eligible = TRUE
    ),
    CONSTRAINT refund_validation CHECK (
        refund_amount IS NULL OR refunded_at IS NOT NULL
    ),

    UNIQUE(contractor_company_id, cost_number),
    UNIQUE(request_id, contractor_company_id)
);

-- ENHANCED: Counter-offer validation
CREATE TABLE marketplace_counter_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES marketplace_responses(id) ON DELETE CASCADE,
    counter_offer_number TEXT NOT NULL CHECK (counter_offer_number ~ '^CO-[0-9]{4,8}$'),
    offered_by_company_id UUID NOT NULL REFERENCES companies(id),
    offered_by_user_id UUID NOT NULL REFERENCES users(id),
    -- ENHANCED: Offer details
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    offer_type TEXT DEFAULT 'price_adjustment' CHECK (offer_type IN ('price_adjustment','timeline_change','scope_change','terms_change')),
    message TEXT NOT NULL CHECK (LENGTH(message) >= 10 AND LENGTH(message) <= 1000),
    -- ENHANCED: Negotiation tracking
    counter_number INTEGER NOT NULL CHECK (counter_number > 0 AND counter_number <= 10), -- Max 10 rounds
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '48 hours'),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','expired','withdrawn')),
    -- ENHANCED: Response tracking
    responded_at TIMESTAMPTZ,
    response_message TEXT CHECK (LENGTH(response_message) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT valid_expiration CHECK (expires_at > created_at),
    CONSTRAINT negotiation_limit CHECK (counter_number <= 10), -- Prevent endless negotiation
    CONSTRAINT valid_response CHECK (
        status NOT IN ('accepted','rejected') OR responded_at IS NOT NULL
    ),

    UNIQUE(response_id, counter_number)
);
```

### **💬 Communication & Reviews (Enhanced)**
```sql
-- ENHANCED: Marketplace message validation
CREATE TABLE marketplace_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    conversation_id UUID, -- For threading
    sender_company_id UUID NOT NULL REFERENCES companies(id),
    sender_user_id UUID NOT NULL REFERENCES users(id),
    message_number TEXT NOT NULL CHECK (message_number ~ '^MSG-[0-9]{4,8}$'),
    -- ENHANCED: Message content
    subject TEXT CHECK (LENGTH(subject) <= 200),
    message_body TEXT NOT NULL CHECK (LENGTH(message_body) >= 1 AND LENGTH(message_body) <= 5000),
    message_type marketplace_message_type_enum NOT NULL DEFAULT 'text',
    -- ENHANCED: Attachments
    has_attachments BOOLEAN DEFAULT FALSE,
    attachment_count INTEGER DEFAULT 0 CHECK (attachment_count >= 0 AND attachment_count <= 10),
    -- ENHANCED: Delivery tracking
    status marketplace_message_status_enum NOT NULL DEFAULT 'sent',
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    -- ENHANCED: Threading
    reply_to_message_id UUID REFERENCES marketplace_messages(id),
    thread_depth INTEGER DEFAULT 0 CHECK (thread_depth >= 0 AND thread_depth <= 10),
    -- ENHANCED: Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT,
    moderated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT attachment_consistency CHECK (
        (has_attachments = FALSE AND attachment_count = 0) OR
        (has_attachments = TRUE AND attachment_count > 0)
    ),
    CONSTRAINT delivery_logic CHECK (
        status != 'delivered' OR delivered_at IS NOT NULL
    ),
    CONSTRAINT read_logic CHECK (
        read_at IS NULL OR (delivered_at IS NOT NULL AND read_at >= delivered_at)
    ),
    CONSTRAINT threading_logic CHECK (
        (reply_to_message_id IS NULL AND thread_depth = 0) OR
        (reply_to_message_id IS NOT NULL AND thread_depth > 0)
    ),
    CONSTRAINT moderation_logic CHECK (
        is_flagged = FALSE OR flagged_reason IS NOT NULL
    ),

    UNIQUE(request_id, message_number)
);

-- ENHANCED: Review validation
CREATE TABLE marketplace_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    reviewer_company_id UUID NOT NULL REFERENCES companies(id),
    reviewee_company_id UUID NOT NULL REFERENCES companies(id),
    review_number TEXT NOT NULL CHECK (review_number ~ '^REV-[0-9]{4,8}$'),
    review_type review_type_enum NOT NULL,
    -- ENHANCED: Multi-dimensional ratings
    overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    timeliness_rating INTEGER CHECK (timeliness_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    professionalism_rating INTEGER CHECK (professionalism_rating BETWEEN 1 AND 5),
    -- ENHANCED: Written feedback
    title TEXT CHECK (LENGTH(title) <= 200),
    comments TEXT CHECK (LENGTH(comments) <= 2000),
    pros TEXT CHECK (LENGTH(pros) <= 1000),
    cons TEXT CHECK (LENGTH(cons) <= 1000),
    would_recommend BOOLEAN,
    -- ENHANCED: Context
    project_value NUMERIC(12,2) CHECK (project_value >= 0),
    project_duration_days INTEGER CHECK (project_duration_days > 0),
    -- ENHANCED: Moderation
    status review_status_enum NOT NULL DEFAULT 'draft',
    flagged_reason TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMPTZ,
    -- ENHANCED: Response tracking
    response_from_reviewee TEXT CHECK (LENGTH(response_from_reviewee) <= 1000),
    response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- ENHANCED: Business logic constraints
    CONSTRAINT rating_consistency CHECK (
        quality_rating IS NOT NULL AND timeliness_rating IS NOT NULL AND
        communication_rating IS NOT NULL AND value_rating IS NOT NULL
    ),
    CONSTRAINT no_self_review CHECK (reviewer_company_id != reviewee_company_id),
    CONSTRAINT moderation_logic CHECK (
        status NOT IN ('flagged','removed') OR moderated_by IS NOT NULL
    ),
    CONSTRAINT response_logic CHECK (
        response_from_reviewee IS NULL OR response_at IS NOT NULL
    ),

    UNIQUE(reviewer_company_id, review_number),
    UNIQUE(request_id, reviewer_company_id, reviewee_company_id, review_type) -- One review per relationship per request
);
```

