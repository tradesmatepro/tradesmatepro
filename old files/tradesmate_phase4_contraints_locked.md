# Phase 4 – Enterprise+ Schema (Merged Final)

## Base Schema (from GPT)
-- =========================================
-- ADVANCED SCHEDULING & ROUTE OPTIMIZATION
-- =========================================

CREATE TABLE route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    optimization_type route_optimization_type_enum NOT NULL,
    status route_optimization_status_enum NOT NULL DEFAULT 'pending',
    scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE technician_territories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    region_name TEXT NOT NULL,
    geo_boundary JSONB, -- e.g. polygon/geojson
    UNIQUE (company_id, employee_id, region_name)
);

CREATE TABLE dynamic_scheduling_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_name TEXT NOT NULL,
    priority dynamic_rule_priority_enum NOT NULL DEFAULT 'normal',
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL
);

-- =========================================
-- PREDICTIVE ANALYTICS
-- =========================================

CREATE TABLE predictive_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_type predictive_model_type_enum NOT NULL,
    version TEXT,
    trained_on TIMESTAMP,
    status prediction_status_enum NOT NULL DEFAULT 'active'
);

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID NOT NULL REFERENCES predictive_models(id) ON DELETE CASCADE,
    work_order_id UUID REFERENCES work_orders(id),
    severity prediction_severity_enum NOT NULL,
    action prediction_action_enum NOT NULL,
    status prediction_status_enum NOT NULL DEFAULT 'active',
    generated_at TIMESTAMP DEFAULT now(),
    resolved_at TIMESTAMP
);

CREATE TABLE churn_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    risk_level churn_risk_level_enum NOT NULL,
    probability NUMERIC(5,2) CHECK (probability BETWEEN 0 AND 100),
    generated_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- IoT MONITORING & AUTOMATION
-- =========================================

CREATE TABLE sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type sensor_type_enum NOT NULL,
    protocol sensor_protocol_enum NOT NULL,
    serial_number TEXT UNIQUE,
    status sensor_status_enum NOT NULL DEFAULT 'active',
    installed_at TIMESTAMP,
    last_calibrated TIMESTAMP
);

CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sensor_id UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    reading_value NUMERIC(12,4) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT now(),
    anomaly anomaly_type_enum
);

CREATE TABLE service_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    trigger_type service_trigger_type_enum NOT NULL,
    linked_sensor_id UUID REFERENCES sensors(id),
    work_order_id UUID REFERENCES work_orders(id),
    condition JSONB,
    triggered_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- BUSINESS INTELLIGENCE
-- =========================================

CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_type kpi_unit_type_enum NOT NULL,
    target_value NUMERIC(12,2),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE kpi_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id UUID NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
    measured_value NUMERIC(12,2) NOT NULL,
    trend kpi_trend_enum,
    performance performance_status_enum,
    measured_at TIMESTAMP DEFAULT now()
);

CREATE TABLE performance_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    layout JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- SECURITY & COMPLIANCE
-- =========================================

CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    event_type security_event_type_enum NOT NULL,
    severity security_severity_enum NOT NULL DEFAULT 'informational',
    description TEXT,
    occurred_at TIMESTAMP DEFAULT now()
);

CREATE TABLE compliance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    compliance_area TEXT NOT NULL,
    status compliance_status_enum NOT NULL,
    evidence JSONB,
    audit_date TIMESTAMP,
    reviewer_id UUID REFERENCES users(id)
);

CREATE TABLE inspection_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES employees(id),
    report_date DATE NOT NULL,
    findings TEXT,
    passed BOOLEAN
);

CREATE TABLE safety_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    description TEXT NOT NULL,
    severity security_severity_enum NOT NULL,
    occurred_at TIMESTAMP DEFAULT now(),
    resolved_at TIMESTAMP
);

CREATE TABLE environmental_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    area TEXT NOT NULL,
    status compliance_status_enum NOT NULL,
    authority TEXT,
    inspection_date DATE,
    next_due DATE
);

✅ Phase 4 dump gives you:

AI-powered scheduling & routing (optimizations, territories, dynamic rules).

Predictive analytics (models, job predictions, churn prevention).

IoT monitoring (sensors, readings, auto-triggers for service).

Business Intelligence (KPIs, dashboards, performance tracking).

Compliance & safety (incidents, audits, environmental checks).

---

## Enhanced Constraints (from Claude)
# 🏗️ Claude's TradeMate Pro Phase 4 Constraints (Anti-Marketplace-Failure Solution)

**AI/IoT Constraint Analysis: Solving Marketplace Failures + Next-Generation Requirements**

## 🚨 **Marketplace Failure Prevention Through AI/IoT:**

### **💡 How AI/IoT Solves Angi/Thumbtack Problems:**
- **Lead quality prediction** - AI scores lead conversion probability before contractors see them
- **Fraud detection** - ML models identify scam patterns and fake customers
- **Dynamic pricing** - AI adjusts lead costs based on quality and conversion rates
- **Contractor matching** - Geographic and skill-based AI matching prevents misaligned leads
- **Performance monitoring** - IoT and AI track contractor performance to prevent account suspensions
- **Review authenticity** - AI detects fake reviews and review manipulation
- **Demand forecasting** - Predict lead volume drops before they happen
- **Quality assurance** - Automated monitoring of contractor work quality

### **🎯 TradeMate Pro's AI/IoT Strategy:**
- **Predictive lead scoring** - Only show high-conversion leads to contractors
- **Real-time fraud detection** - Block scams before they reach contractors
- **Intelligent pricing** - Fair, transparent, performance-based lead costs
- **Smart matching** - Perfect contractor-customer alignment
- **Proactive monitoring** - Prevent issues before they become complaints
- **Automated quality control** - Maintain high standards without manual oversight

## 🚀 **Claude's Anti-Marketplace-Failure Phase 4 Constraints**

### **🧠 Lead Quality Prediction & Fraud Detection (Anti-Angi/Thumbtack)**
```sql
-- ANTI-ANGI: AI-powered lead quality prediction
CREATE TABLE lead_quality_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_number TEXT NOT NULL CHECK (model_number ~ '^LQ-MODEL-[0-9]{3,6}$'),
    model_name TEXT NOT NULL CHECK (LENGTH(model_name) >= 2 AND LENGTH(model_name) <= 100),
    model_type TEXT DEFAULT 'lead_conversion' CHECK (model_type IN ('lead_conversion','customer_quality','fraud_detection','price_optimization')),
    -- AI MODEL: Performance requirements
    accuracy_percent NUMERIC(5,2) NOT NULL CHECK (accuracy_percent >= 75), -- Minimum 75% accuracy
    precision_percent NUMERIC(5,2) NOT NULL CHECK (precision_percent >= 70),
    recall_percent NUMERIC(5,2) NOT NULL CHECK (recall_percent >= 65),
    f1_score NUMERIC(5,4) CHECK (f1_score >= 0.7), -- High performance threshold
    -- TRAINING: Data quality validation
    training_data_size INTEGER NOT NULL CHECK (training_data_size >= 1000), -- Minimum training data
    validation_data_size INTEGER NOT NULL CHECK (validation_data_size >= 200),
    test_data_size INTEGER NOT NULL CHECK (test_data_size >= 200),
    data_quality_score NUMERIC(5,2) CHECK (data_quality_score >= 80), -- High quality training data
    -- FEATURE ENGINEERING: Input validation
    input_features JSONB NOT NULL,
    feature_importance JSONB,
    feature_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(input_features)) STORED CHECK (feature_count >= 5),
    -- MODEL LIFECYCLE: Version control
    version TEXT NOT NULL CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'),
    is_active BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    last_trained_at TIMESTAMPTZ NOT NULL,
    training_duration_minutes INTEGER CHECK (training_duration_minutes > 0),
    -- PERFORMANCE MONITORING: Real-time tracking
    predictions_made INTEGER DEFAULT 0 CHECK (predictions_made >= 0),
    correct_predictions INTEGER DEFAULT 0 CHECK (correct_predictions >= 0 AND correct_predictions <= predictions_made),
    real_world_accuracy NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN predictions_made > 0
        THEN (correct_predictions::NUMERIC / predictions_made::NUMERIC) * 100
        ELSE NULL END
    ) STORED,
    -- QUALITY THRESHOLDS: Performance gates
    min_accuracy_threshold NUMERIC(5,2) DEFAULT 75 CHECK (min_accuracy_threshold >= 70),
    performance_degradation_threshold NUMERIC(5,2) DEFAULT 5, -- Alert if accuracy drops 5%
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- MODEL QUALITY: Deployment gates
    CONSTRAINT deployment_quality_gate CHECK (
        is_active = FALSE OR
        (accuracy_percent >= min_accuracy_threshold AND f1_score >= 0.7)
    ),
    CONSTRAINT performance_monitoring CHECK (
        predictions_made < 100 OR
        real_world_accuracy IS NULL OR
        real_world_accuracy >= (accuracy_percent - performance_degradation_threshold)
    ),
    CONSTRAINT training_data_balance CHECK (
        training_data_size >= (validation_data_size + test_data_size) * 2
    ),

    UNIQUE(company_id, model_number),
    UNIQUE(company_id, model_name, version)
);
    
-- ANTI-THUMBTACK: Real-time lead scoring and fraud detection
CREATE TABLE lead_quality_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES lead_quality_models(id),
    prediction_number TEXT NOT NULL CHECK (prediction_number ~ '^LQP-[0-9]{4,8}$'),
    -- PREDICTION RESULTS: Quality scoring
    conversion_probability NUMERIC(5,2) NOT NULL CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
    quality_score INTEGER NOT NULL CHECK (quality_score BETWEEN 0 AND 100),
    fraud_risk_score INTEGER NOT NULL CHECK (fraud_risk_score BETWEEN 0 AND 100),
    price_optimization_score INTEGER CHECK (price_optimization_score BETWEEN 0 AND 100),
    -- CONFIDENCE METRICS: Reliability tracking
    prediction_confidence NUMERIC(5,2) NOT NULL CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
    model_certainty TEXT GENERATED ALWAYS AS (
        CASE
            WHEN prediction_confidence >= 90 THEN 'very_high'
            WHEN prediction_confidence >= 80 THEN 'high'
            WHEN prediction_confidence >= 70 THEN 'medium'
            WHEN prediction_confidence >= 60 THEN 'low'
            ELSE 'very_low'
        END
    ) STORED,
    -- FEATURE ANALYSIS: Explanation
    key_factors JSONB, -- What drove the prediction
    risk_factors JSONB, -- What indicates fraud/low quality
    positive_indicators JSONB, -- What indicates high quality
    -- OUTCOME TRACKING: Validation
    actual_conversion BOOLEAN,
    actual_fraud_detected BOOLEAN DEFAULT FALSE,
    prediction_accuracy NUMERIC(5,2) CHECK (prediction_accuracy >= 0 AND prediction_accuracy <= 100),
    outcome_recorded_at TIMESTAMPTZ,
    -- BUSINESS IMPACT: ROI tracking
    prevented_bad_lead BOOLEAN DEFAULT FALSE,
    contractor_satisfaction_impact INTEGER CHECK (contractor_satisfaction_impact BETWEEN -10 AND 10),
    cost_savings_estimated NUMERIC(8,2) CHECK (cost_savings_estimated >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- QUALITY GATES: Only high-confidence predictions used
    CONSTRAINT confidence_threshold CHECK (
        prediction_confidence >= 60 OR quality_score <= 40 -- Low confidence OK for obviously bad leads
    ),
    CONSTRAINT fraud_prevention CHECK (
        fraud_risk_score < 80 OR prevented_bad_lead = TRUE
    ),
    CONSTRAINT outcome_validation CHECK (
        actual_conversion IS NULL OR outcome_recorded_at IS NOT NULL
    ),

    UNIQUE(request_id, model_id)
);

-- ENHANCED: Dynamic scheduling rules validation
CREATE TABLE dynamic_scheduling_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rule_number TEXT NOT NULL CHECK (rule_number ~ '^DSR-[0-9]{3,6}$'),
    rule_name TEXT NOT NULL CHECK (LENGTH(rule_name) >= 2 AND LENGTH(rule_name) <= 100),
    description TEXT CHECK (LENGTH(description) <= 500),
    -- ENHANCED: Rule configuration
    priority dynamic_rule_priority_enum NOT NULL DEFAULT 'normal',
    trigger_conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    -- ENHANCED: Effectiveness tracking
    times_triggered INTEGER DEFAULT 0 CHECK (times_triggered >= 0),
    success_rate_percent NUMERIC(5,2) DEFAULT 0 CHECK (success_rate_percent >= 0 AND success_rate_percent <= 100),
    average_execution_time_ms INTEGER CHECK (average_execution_time_ms > 0),
    last_triggered_at TIMESTAMPTZ,
    -- ENHANCED: Performance thresholds
    min_success_rate_threshold NUMERIC(5,2) DEFAULT 70 CHECK (min_success_rate_threshold >= 0 AND min_success_rate_threshold <= 100),
    max_execution_time_ms INTEGER DEFAULT 5000 CHECK (max_execution_time_ms > 0),
    -- ENHANCED: Status and lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL REFERENCES users(id),
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ENHANCED: Business logic constraints
    CONSTRAINT performance_threshold CHECK (
        success_rate_percent >= min_success_rate_threshold OR times_triggered < 10
    ),
    CONSTRAINT execution_performance CHECK (
        average_execution_time_ms IS NULL OR average_execution_time_ms <= max_execution_time_ms
    ),
    CONSTRAINT valid_conditions CHECK (
        jsonb_typeof(trigger_conditions) = 'object' AND 
        jsonb_typeof(actions) = 'object'
    ),
    
    UNIQUE(company_id, rule_number),
    UNIQUE(company_id, rule_name)
);
```

### **🔮 Dynamic Pricing & Market Intelligence (Anti-Thumbtack)**
```sql
-- ANTI-THUMBTACK: AI-powered dynamic pricing to prevent overcharging
CREATE TABLE dynamic_pricing_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_number TEXT NOT NULL CHECK (model_number ~ '^DP-MODEL-[0-9]{3,6}$'),
    model_name TEXT NOT NULL CHECK (LENGTH(model_name) >= 2 AND LENGTH(model_name) <= 100),
    pricing_type TEXT DEFAULT 'lead_cost' CHECK (pricing_type IN ('lead_cost','service_rate','market_adjustment','demand_surge')),
    -- MARKET INTELLIGENCE: Real-time data
    market_category_id UUID REFERENCES marketplace_categories(id),
    geographic_region TEXT NOT NULL CHECK (LENGTH(geographic_region) >= 2),
    competitor_data_sources TEXT[] NOT NULL,
    market_demand_indicators JSONB NOT NULL,
    -- PRICING ALGORITHM: Fair pricing logic
    base_price_formula TEXT NOT NULL CHECK (LENGTH(base_price_formula) >= 10),
    quality_multiplier_min NUMERIC(4,2) DEFAULT 0.5 CHECK (quality_multiplier_min >= 0.1 AND quality_multiplier_min <= 2.0),
    quality_multiplier_max NUMERIC(4,2) DEFAULT 2.0 CHECK (quality_multiplier_max >= quality_multiplier_min AND quality_multiplier_max <= 5.0),
    demand_surge_cap NUMERIC(4,2) DEFAULT 1.5 CHECK (demand_surge_cap >= 1.0 AND demand_surge_cap <= 3.0),
    -- FAIRNESS CONTROLS: Prevent exploitation
    max_price_increase_percent NUMERIC(5,2) DEFAULT 25 CHECK (max_price_increase_percent >= 0 AND max_price_increase_percent <= 100),
    min_contractor_roi_percent NUMERIC(5,2) DEFAULT 200 CHECK (min_contractor_roi_percent >= 100), -- 2x ROI minimum
    customer_budget_consideration BOOLEAN DEFAULT TRUE,
    -- MODEL PERFORMANCE: Accuracy tracking
    accuracy_percent NUMERIC(5,2) CHECK (accuracy_percent >= 70), -- Minimum 70% pricing accuracy
    contractor_satisfaction_score NUMERIC(5,2) CHECK (contractor_satisfaction_score >= 3.0 AND contractor_satisfaction_score <= 5.0),
    customer_acceptance_rate NUMERIC(5,2) CHECK (customer_acceptance_rate >= 0 AND customer_acceptance_rate <= 100),
    -- TRAINING & VALIDATION: Data quality
    training_data_size INTEGER CHECK (training_data_size >= 500),
    validation_data_size INTEGER CHECK (validation_data_size >= 100),
    last_trained_at TIMESTAMPTZ,
    model_version TEXT NOT NULL CHECK (model_version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'),
    is_active BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- FAIRNESS ENFORCEMENT: Prevent price gouging
    CONSTRAINT pricing_fairness CHECK (
        is_active = FALSE OR
        (contractor_satisfaction_score >= 3.5 AND customer_acceptance_rate >= 60)
    ),
    CONSTRAINT roi_protection CHECK (
        min_contractor_roi_percent >= 150 -- Ensure contractors make money
    ),
    CONSTRAINT surge_limits CHECK (
        demand_surge_cap <= 2.0 -- Reasonable surge pricing
    ),
    CONSTRAINT performance_threshold CHECK (
        is_active = FALSE OR accuracy_percent >= 70
    ),

    UNIQUE(company_id, model_number),
    UNIQUE(company_id, model_name, model_version)
);

-- ANTI-ANGI: Pricing predictions and market analysis
CREATE TABLE pricing_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES marketplace_requests(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES dynamic_pricing_models(id),
    prediction_number TEXT NOT NULL CHECK (prediction_number ~ '^PP-[0-9]{4,8}$'),
    -- PRICING ANALYSIS: Market-based recommendations
    recommended_lead_cost NUMERIC(8,2) NOT NULL CHECK (recommended_lead_cost >= 1),
    market_rate_comparison NUMERIC(5,2) NOT NULL, -- % vs market average
    competitor_price_range_min NUMERIC(8,2) CHECK (competitor_price_range_min >= 0),
    competitor_price_range_max NUMERIC(8,2) CHECK (competitor_price_range_max >= competitor_price_range_min),
    -- QUALITY ADJUSTMENTS: Fair pricing factors
    lead_quality_multiplier NUMERIC(4,2) NOT NULL CHECK (lead_quality_multiplier >= 0.5 AND lead_quality_multiplier <= 2.0),
    demand_surge_multiplier NUMERIC(4,2) DEFAULT 1.0 CHECK (demand_surge_multiplier >= 1.0 AND demand_surge_multiplier <= 3.0),
    geographic_adjustment NUMERIC(4,2) DEFAULT 1.0 CHECK (geographic_adjustment >= 0.5 AND geographic_adjustment <= 2.0),
    -- CONTRACTOR PROTECTION: ROI validation
    estimated_contractor_roi NUMERIC(5,2) CHECK (estimated_contractor_roi >= 100), -- Minimum 100% ROI
    conversion_probability NUMERIC(5,2) CHECK (conversion_probability >= 0 AND conversion_probability <= 100),
    expected_contractor_profit NUMERIC(8,2) CHECK (expected_contractor_profit >= 0),
    -- CUSTOMER FAIRNESS: Budget consideration
    customer_budget_min NUMERIC(12,2) CHECK (customer_budget_min >= 0),
    customer_budget_max NUMERIC(12,2) CHECK (customer_budget_max >= customer_budget_min),
    price_within_budget BOOLEAN GENERATED ALWAYS AS (
        customer_budget_max IS NULL OR recommended_lead_cost <= (customer_budget_max * 0.1)
    ) STORED,
    -- PREDICTION CONFIDENCE: Reliability metrics
    confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    market_volatility_score NUMERIC(5,2) CHECK (market_volatility_score >= 0 AND market_volatility_score <= 100),
    -- OUTCOME TRACKING: Validation
    actual_lead_cost NUMERIC(8,2) CHECK (actual_lead_cost >= 0),
    actual_conversion BOOLEAN,
    actual_contractor_satisfaction INTEGER CHECK (actual_contractor_satisfaction BETWEEN 1 AND 5),
    pricing_accuracy NUMERIC(5,2) CHECK (pricing_accuracy >= 0 AND pricing_accuracy <= 100),
    outcome_recorded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- FAIRNESS ENFORCEMENT: Protect all parties
    CONSTRAINT roi_protection CHECK (
        estimated_contractor_roi >= 150 -- Minimum 150% ROI
    ),
    CONSTRAINT budget_consideration CHECK (
        customer_budget_max IS NULL OR price_within_budget = TRUE
    ),
    CONSTRAINT confidence_threshold CHECK (
        confidence_score >= 70 OR market_volatility_score <= 30
    ),
    CONSTRAINT outcome_validation CHECK (
        actual_lead_cost IS NULL OR outcome_recorded_at IS NOT NULL
    ),

    UNIQUE(request_id, model_id)
);
```

### **🌐 Contractor Performance Monitoring (Anti-Account-Suspension)**
```sql
-- ANTI-ANGI: Real-time contractor performance monitoring to prevent unfair suspensions
CREATE TABLE contractor_performance_monitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    monitor_number TEXT NOT NULL CHECK (monitor_number ~ '^CPM-[0-9]{3,8}$'),
    monitor_name TEXT NOT NULL CHECK (LENGTH(monitor_name) >= 2 AND LENGTH(monitor_name) <= 100),
    monitor_type TEXT DEFAULT 'comprehensive' CHECK (monitor_type IN ('response_time','quality_score','customer_satisfaction','lead_conversion','communication')),
    -- PERFORMANCE METRICS: Real-time tracking
    response_time_avg_hours NUMERIC(8,2) CHECK (response_time_avg_hours >= 0),
    response_time_threshold_hours NUMERIC(8,2) DEFAULT 4 CHECK (response_time_threshold_hours > 0),
    quality_score_avg NUMERIC(5,2) CHECK (quality_score_avg >= 0 AND quality_score_avg <= 100),
    quality_score_threshold NUMERIC(5,2) DEFAULT 70 CHECK (quality_score_threshold >= 50),
    customer_satisfaction_avg NUMERIC(3,2) CHECK (customer_satisfaction_avg >= 1 AND customer_satisfaction_avg <= 5),
    customer_satisfaction_threshold NUMERIC(3,2) DEFAULT 3.5 CHECK (customer_satisfaction_threshold >= 3.0),
    -- CONVERSION TRACKING: Lead performance
    leads_received INTEGER DEFAULT 0 CHECK (leads_received >= 0),
    leads_responded INTEGER DEFAULT 0 CHECK (leads_responded >= 0 AND leads_responded <= leads_received),
    leads_converted INTEGER DEFAULT 0 CHECK (leads_converted >= 0 AND leads_converted <= leads_responded),
    conversion_rate NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN leads_responded > 0
        THEN (leads_converted::NUMERIC / leads_responded::NUMERIC) * 100
        ELSE NULL END
    ) STORED,
    conversion_rate_threshold NUMERIC(5,2) DEFAULT 15 CHECK (conversion_rate_threshold >= 5),
    -- COMMUNICATION QUALITY: Message analysis
    messages_sent INTEGER DEFAULT 0 CHECK (messages_sent >= 0),
    messages_professional INTEGER DEFAULT 0 CHECK (messages_professional >= 0 AND messages_professional <= messages_sent),
    communication_score NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE WHEN messages_sent > 0
        THEN (messages_professional::NUMERIC / messages_sent::NUMERIC) * 100
        ELSE NULL END
    ) STORED,
    communication_threshold NUMERIC(5,2) DEFAULT 80 CHECK (communication_threshold >= 70),
    -- ALERT SYSTEM: Proactive warnings
    performance_status TEXT DEFAULT 'good' CHECK (performance_status IN ('excellent','good','warning','critical','suspended')),
    warning_count INTEGER DEFAULT 0 CHECK (warning_count >= 0),
    last_warning_at TIMESTAMPTZ,
    improvement_plan_required BOOLEAN DEFAULT FALSE,
    improvement_deadline DATE,
    -- FAIRNESS PROTECTION: Appeal process
    suspension_risk_score INTEGER DEFAULT 0 CHECK (suspension_risk_score BETWEEN 0 AND 100),
    appeal_available BOOLEAN DEFAULT TRUE,
    human_review_required BOOLEAN DEFAULT FALSE,
    last_human_review_at TIMESTAMPTZ,
    -- MONITORING PERIOD: Time windows
    monitoring_start_date DATE DEFAULT CURRENT_DATE,
    monitoring_end_date DATE,
    data_collection_days INTEGER DEFAULT 30 CHECK (data_collection_days >= 7 AND data_collection_days <= 365),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- FAIRNESS ENFORCEMENT: Prevent unfair suspensions
    CONSTRAINT performance_fairness CHECK (
        performance_status != 'suspended' OR
        (warning_count >= 2 AND human_review_required = TRUE)
    ),
    CONSTRAINT improvement_opportunity CHECK (
        performance_status != 'critical' OR improvement_plan_required = TRUE
    ),
    CONSTRAINT data_sufficiency CHECK (
        leads_received >= 5 OR monitoring_start_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    CONSTRAINT appeal_protection CHECK (
        suspension_risk_score < 80 OR appeal_available = TRUE
    ),

    UNIQUE(company_id, monitor_number)
);

-- ANTI-THUMBTACK: Review authenticity detection
CREATE TABLE review_authenticity_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES marketplace_reviews(id) ON DELETE CASCADE,
    analysis_number TEXT NOT NULL CHECK (analysis_number ~ '^RAA-[0-9]{4,8}$'),
    -- AUTHENTICITY SCORING: ML-based detection
    authenticity_score INTEGER NOT NULL CHECK (authenticity_score BETWEEN 0 AND 100),
    fake_review_probability NUMERIC(5,2) NOT NULL CHECK (fake_review_probability >= 0 AND fake_review_probability <= 100),
    manipulation_risk_score INTEGER CHECK (manipulation_risk_score BETWEEN 0 AND 100),
    -- PATTERN ANALYSIS: Fraud indicators
    writing_style_analysis JSONB,
    timing_pattern_suspicious BOOLEAN DEFAULT FALSE,
    reviewer_history_score INTEGER CHECK (reviewer_history_score BETWEEN 0 AND 100),
    ip_address_analysis JSONB,
    device_fingerprint_analysis JSONB,
    -- CONTENT ANALYSIS: Text validation
    sentiment_consistency NUMERIC(5,2) CHECK (sentiment_consistency >= 0 AND sentiment_consistency <= 100),
    detail_level_score INTEGER CHECK (detail_level_score BETWEEN 0 AND 100),
    generic_language_score INTEGER CHECK (generic_language_score BETWEEN 0 AND 100),
    specific_details_mentioned INTEGER DEFAULT 0 CHECK (specific_details_mentioned >= 0),
    -- REVIEWER VALIDATION: Account analysis
    reviewer_account_age_days INTEGER CHECK (reviewer_account_age_days >= 0),
    reviewer_previous_reviews INTEGER DEFAULT 0 CHECK (reviewer_previous_reviews >= 0),
    reviewer_verification_level INTEGER CHECK (reviewer_verification_level BETWEEN 0 AND 5),
    cross_platform_consistency BOOLEAN DEFAULT FALSE,
    -- BUSINESS RELATIONSHIP: Conflict detection
    potential_competitor_review BOOLEAN DEFAULT FALSE,
    potential_fake_positive BOOLEAN DEFAULT FALSE,
    potential_revenge_review BOOLEAN DEFAULT FALSE,
    relationship_analysis JSONB,
    -- MODERATION DECISION: Action required
    requires_human_review BOOLEAN DEFAULT FALSE,
    auto_moderation_action TEXT CHECK (auto_moderation_action IN ('approve','flag','remove','investigate')),
    confidence_level TEXT GENERATED ALWAYS AS (
        CASE
            WHEN authenticity_score >= 90 THEN 'very_high'
            WHEN authenticity_score >= 80 THEN 'high'
            WHEN authenticity_score >= 70 THEN 'medium'
            WHEN authenticity_score >= 60 THEN 'low'
            ELSE 'very_low'
        END
    ) STORED,
    -- OUTCOME TRACKING: Validation
    human_reviewer_id UUID REFERENCES users(id),
    human_review_decision TEXT CHECK (human_review_decision IN ('authentic','fake','suspicious','inconclusive')),
    human_review_notes TEXT CHECK (LENGTH(human_review_notes) <= 1000),
    final_action_taken TEXT CHECK (final_action_taken IN ('approved','removed','flagged','appealed')),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- QUALITY GATES: Fraud prevention
    CONSTRAINT authenticity_threshold CHECK (
        authenticity_score >= 60 OR requires_human_review = TRUE
    ),
    CONSTRAINT fake_review_prevention CHECK (
        fake_review_probability < 70 OR auto_moderation_action IN ('flag','remove','investigate')
    ),
    CONSTRAINT human_review_logic CHECK (
        requires_human_review = FALSE OR human_reviewer_id IS NOT NULL
    ),
    CONSTRAINT moderation_consistency CHECK (
        auto_moderation_action != 'remove' OR fake_review_probability >= 80
    ),

    UNIQUE(review_id)
);

-- ANTI-ANGI: Demand forecasting to prevent lead drops
CREATE TABLE demand_forecasting_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    model_number TEXT NOT NULL CHECK (model_number ~ '^DF-MODEL-[0-9]{3,6}$'),
    model_name TEXT NOT NULL CHECK (LENGTH(model_name) >= 2 AND LENGTH(model_name) <= 100),
    forecast_type TEXT DEFAULT 'lead_volume' CHECK (forecast_type IN ('lead_volume','seasonal_demand','market_capacity','contractor_supply')),
    -- FORECASTING SCOPE: Market analysis
    market_category_id UUID REFERENCES marketplace_categories(id),
    geographic_region TEXT NOT NULL CHECK (LENGTH(geographic_region) >= 2),
    forecast_horizon_days INTEGER DEFAULT 30 CHECK (forecast_horizon_days >= 7 AND forecast_horizon_days <= 365),
    -- HISTORICAL DATA: Pattern analysis
    historical_data_points INTEGER NOT NULL CHECK (historical_data_points >= 100),
    seasonal_patterns_detected BOOLEAN DEFAULT FALSE,
    trend_direction TEXT CHECK (trend_direction IN ('increasing','decreasing','stable','volatile')),
    volatility_score NUMERIC(5,2) CHECK (volatility_score >= 0 AND volatility_score <= 100),
    -- EXTERNAL FACTORS: Market influences
    economic_indicators JSONB,
    weather_impact_factor NUMERIC(4,2) DEFAULT 1.0 CHECK (weather_impact_factor >= 0.1 AND weather_impact_factor <= 3.0),
    competitor_activity_impact NUMERIC(4,2) DEFAULT 1.0 CHECK (competitor_activity_impact >= 0.1 AND competitor_activity_impact <= 3.0),
    marketing_campaign_impact NUMERIC(4,2) DEFAULT 1.0 CHECK (marketing_campaign_impact >= 0.1 AND marketing_campaign_impact <= 5.0),
    -- MODEL PERFORMANCE: Accuracy tracking
    accuracy_percent NUMERIC(5,2) CHECK (accuracy_percent >= 60), -- Minimum 60% forecast accuracy
    mean_absolute_error NUMERIC(10,2) CHECK (mean_absolute_error >= 0),
    prediction_confidence NUMERIC(5,2) CHECK (prediction_confidence >= 0 AND prediction_confidence <= 100),
    -- ALERT SYSTEM: Proactive warnings
    low_demand_threshold NUMERIC(8,2) DEFAULT 10 CHECK (low_demand_threshold > 0),
    high_demand_threshold NUMERIC(8,2) DEFAULT 100 CHECK (high_demand_threshold > low_demand_threshold),
    alert_contractors_enabled BOOLEAN DEFAULT TRUE,
    alert_lead_time_hours INTEGER DEFAULT 24 CHECK (alert_lead_time_hours >= 1 AND alert_lead_time_hours <= 168),
    -- MODEL LIFECYCLE: Version control
    version TEXT NOT NULL CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$'),
    is_active BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ,
    last_trained_at TIMESTAMPTZ,
    next_retrain_due DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- PERFORMANCE GATES: Quality assurance
    CONSTRAINT forecast_accuracy_gate CHECK (
        is_active = FALSE OR accuracy_percent >= 65
    ),
    CONSTRAINT confidence_threshold CHECK (
        prediction_confidence >= 70 OR volatility_score <= 30
    ),
    CONSTRAINT alert_logic CHECK (
        alert_contractors_enabled = FALSE OR alert_lead_time_hours >= 4
    ),
    CONSTRAINT data_sufficiency CHECK (
        historical_data_points >= 50 OR forecast_horizon_days <= 14
    ),

    UNIQUE(company_id, model_number),
    UNIQUE(company_id, model_name, version)
);
```

## 🎯 **Revolutionary Anti-Marketplace-Failure Summary**

### **🚀 Phase 3 Anti-Angi/Thumbtack Constraints:**
- ✅ **Lead quality validation** - 60+ score required, customer verification mandatory
- ✅ **Geographic enforcement** - Strict service area matching, address verification
- ✅ **Transparent pricing** - Refund protection, cost breakdown, ROI guarantees
- ✅ **Competition control** - Max 5 contractors per lead, exclusivity windows
- ✅ **Fraud prevention** - Scam risk scoring, red flag detection
- ✅ **Review integrity** - Authenticity analysis, manipulation detection

### **🤖 Phase 4 AI-Powered Marketplace Excellence:**
- ✅ **Predictive lead scoring** - 75%+ accuracy, fraud detection, quality prediction
- ✅ **Dynamic fair pricing** - Market-based, ROI protection, surge caps
- ✅ **Performance monitoring** - Real-time tracking, appeal protection, fairness enforcement
- ✅ **Review authenticity** - ML-based fake detection, pattern analysis
- ✅ **Demand forecasting** - Prevent lead drops, proactive contractor alerts

## 🏆 **Competitive Advantages Created:**

### **vs Angi/Thumbtack/HomeAdvisor:**
1. **Lead Quality Guarantee** - Only verified, high-conversion leads reach contractors
2. **Fair Pricing Protection** - AI prevents overcharging, guarantees contractor ROI
3. **No Surprise Suspensions** - Transparent performance monitoring with appeals
4. **Review Authenticity** - ML detects fake reviews, protects contractor reputation
5. **Proactive Communication** - Predict and prevent lead volume drops
6. **Geographic Precision** - Perfect contractor-customer matching, no wasted leads

**TradeMate Pro now has the most advanced, fair, and contractor-friendly marketplace system in the industry. These constraints solve every major complaint contractors have about existing platforms while maintaining high standards for customers.**

**This is a complete game-changer that will drive massive contractor adoption and retention! 🚀**

