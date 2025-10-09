🏢 Phase 2 — Enterprise Functions (Revised & Merged)

This phase builds on the Core FSM by adding enterprise-grade automation, intelligence, and predictive capabilities. It fixes complaints raised against ServiceTitan Enterprise and similar platforms by contractors who want clear SLA tracking, real-time profitability, compliance automation, and advanced analytics.

1. Predictive SLA Enforcement

Why: ServiceTitan users complain about unclear SLA penalties and reactive enforcement.
Fix: Proactive monitoring + escalation rules + predictive violation detection.

CREATE OR REPLACE FUNCTION enforce_sla_predictive(
    p_work_order_id UUID,
    p_check_type TEXT DEFAULT 'all'
)
RETURNS JSONB AS $$
-- Combines GPT's SLA enforcement with Claude's predictive + escalation logic
-- Provides: violation tracking, predictive alerts, automatic penalties, audit logs
...
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION batch_enforce_sla(
    p_company_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 100
)
RETURNS JSONB AS $$
-- Enterprise batch version for large companies
...
$$ LANGUAGE plpgsql;

2. Advanced Job Costing & Profitability

Why: Contractors complain about not seeing profit margins until jobs are closed.
Fix: Real-time revenue vs cost tracking with margin tiers and pricing recommendations.

CREATE OR REPLACE FUNCTION calculate_job_costing_advanced(
    p_work_order_id UUID,
    p_include_overhead BOOLEAN DEFAULT TRUE,
    p_update_pricing BOOLEAN DEFAULT FALSE
)
RETURNS JSONB AS $$
-- Combines GPT's job costing with Claude’s advanced profitability + margin optimization
...
$$ LANGUAGE plpgsql;

3. Certification & Compliance Tracking

Why: Industry complaint = licenses expire without notice.
Fix: Compliance automation + proactive notifications.

CREATE OR REPLACE FUNCTION check_certifications()
RETURNS VOID AS $$
-- Alerts admins 30 days before certification expiry
-- Claude’s version adds workflow automation hooks for compliance dashboards
...
$$ LANGUAGE plpgsql;

4. Employee Performance Aggregation

Why: Contractors want dashboards showing KPI trends.
Fix: Aggregate reviews into normalized scores for dashboards.

CREATE OR REPLACE FUNCTION refresh_employee_performance(p_employee_id UUID)
RETURNS VOID AS $$
-- Updates average rating + review counts
-- Enhanced with KPI weights for consistency
...
$$ LANGUAGE plpgsql;

5. Multi-Currency Invoice Conversion

Why: Complaints about bad international invoicing.
Fix: Handles exchange rates properly with audit logging.

CREATE OR REPLACE FUNCTION convert_invoice_currency(p_invoice_id UUID, p_target_currency TEXT)
RETURNS NUMERIC AS $$
-- Uses GPT’s exchange rate logic
-- Claude adds integration hook for 3rd-party FX APIs
...
$$ LANGUAGE plpgsql;

✅ Phase 2 Function Set (Final)
Function	Purpose	Pain Point Fixed
enforce_sla_predictive	SLA monitoring, predictive violations	ServiceTitan SLA opacity
batch_enforce_sla	Enterprise batch SLA checks	Scale for large orgs
calculate_job_costing_advanced	Real-time profitability + margin tiers	Profit visibility
check_certifications	Expiring license alerts, compliance	Avoid violations
refresh_employee_performance	Aggregate KPI dashboards	Performance tracking
convert_invoice_currency	International invoice conversion	Foreign contractor support

📊 Competitive Advantage

vs ServiceTitan → Predictive SLA + real-time profit margins (they only do retroactive).

vs Jobber → Enterprise compliance workflows + international support.

vs FieldEdge → Better escalation + KPI dashboards.