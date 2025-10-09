🏢 Phase 2 – Enterprise Indexes (Revised & Finalized)
🕒 SLA & Service Agreements

Intent: Enterprise complaints about SLA tracking & penalties. We fix with multi-dimensional SLA reporting, violation escalation, and tier-based compliance.

-- SLA lookups by work order
CREATE INDEX idx_service_agreements_work_order_id 
ON service_agreements(work_order_id);

-- SLA penalty tracking
CREATE INDEX idx_sla_penalties_agreement 
ON service_agreements(agreement_id, penalties_applied);

-- SLA performance dashboard (multi-tier reporting)
CREATE INDEX idx_service_agreements_company_tier_performance 
ON service_agreements(company_id, customer_tier, sla_compliance_percent DESC)
WHERE status = 'active'
INCLUDE (response_time_hours, penalties_applied, total_penalty_amount);

-- SLA violation monitoring
CREATE INDEX idx_sla_violations_agreement_severity_date 
ON sla_violations(agreement_id, violation_severity, violation_date DESC)
INCLUDE (response_delay, escalation_level, penalty_amount);

👥 Workforce Management (Certifications, Skills, Performance)

Intent: ServiceTitan lets expired techs get dispatched — we fix with expiry tracking, skill-based routing, and workforce KPIs.

-- Certification expiry checks
CREATE INDEX idx_employee_certifications_expiry 
ON employee_certifications(expiry_date);

-- Certification compliance monitoring
CREATE INDEX idx_employee_certifications_expiry_compliance 
ON employee_certifications(expiry_date, certification_type, compliance_impact)
WHERE expiry_date >= CURRENT_DATE - INTERVAL '90 days'
INCLUDE (employee_id, renewal_status);

-- Skills-based routing
CREATE INDEX idx_employee_skills_skill_proficiency_availability 
ON employee_skills(skill_name, proficiency_level DESC, employee_id)
WHERE is_active = true;

-- Performance reviews
CREATE INDEX idx_performance_reviews_employee_period_rating 
ON performance_reviews(employee_id, review_period, overall_rating DESC);

-- Employee availability for scheduling
CREATE INDEX idx_employee_availability_date_capacity_utilization 
ON employee_availability(available_date, total_capacity, utilization_percent)
WHERE is_available = true;

💵 Payroll & Compensation

Intent: Payroll bottlenecks at scale → fixed with compensation & run optimizations.

-- Compensation plans
CREATE INDEX idx_compensation_plans_employee_id 
ON compensation_plans(employee_id);

-- Payroll runs (per company & period)
CREATE INDEX idx_payroll_runs_company_period 
ON payroll_runs(company_id, period_start, period_end);

-- Payroll line items
CREATE INDEX idx_payroll_line_items_employee_run 
ON payroll_line_items(employee_id, payroll_run_id);

💰 Financial Management

Intent: ServiceTitan users complain about rate card conflicts, slow reports, and missing cost tracking. We fix with indexes for multi-currency, budgets, costing, and approvals.

-- Rate cards by type & effective dates
CREATE INDEX idx_rate_cards_type_dates 
ON rate_cards(type, effective_from, effective_to);

-- Rate card management (enterprise priority)
CREATE INDEX idx_rate_cards_company_type_effective_priority 
ON rate_cards(company_id, rate_type, effective_from DESC, priority)
WHERE effective_to IS NULL OR effective_to > CURRENT_DATE;

-- Job costing
CREATE INDEX idx_job_costing_work_order_id 
ON job_costing(work_order_id);

CREATE INDEX idx_job_costing_company_period_margin 
ON job_costing(company_id, DATE_TRUNC('month', job_date), profit_margin_percent DESC)
WHERE status = 'completed';

-- Multi-currency reporting
CREATE INDEX idx_exchange_rates_currency 
ON exchange_rates(currency_code, effective_date);

-- Expense approvals
CREATE INDEX idx_expense_approvals_expense_id 
ON expense_approvals(expense_id);

CREATE INDEX idx_expense_approvals_approver_id 
ON expense_approvals(approver_id);

📊 Performance Analytics & KPI Dashboards

Intent: Contractors want real-time dashboards. ServiceTitan reports are slow. We fix with optimized analytics indexes.

-- KPI trending
CREATE INDEX idx_kpi_measurements_company_kpi_period_value 
ON kpi_measurements(company_id, kpi_type, measurement_period DESC, measured_value);

-- Performance dashboards
CREATE INDEX idx_performance_dashboards_company_dashboard_refresh 
ON performance_dashboards(company_id, dashboard_type, last_refresh DESC)
WHERE is_active = true;

-- Forecasting models
CREATE INDEX idx_forecasting_models_company_model_accuracy 
ON forecasting_models(company_id, model_type, accuracy_percent DESC)
WHERE is_active = true;

📱 Mobile & Field Operations

Intent: Large mobile teams = sync conflicts & GPS tracking issues. We fix with MDM, conflict resolution, and GPS accuracy indexes.

-- Sync conflict resolution
CREATE INDEX idx_sync_logs_user_status 
ON sync_logs(user_id, status);

CREATE INDEX idx_sync_logs_user_status_priority_timestamp 
ON sync_logs(user_id, sync_status, priority, created_at DESC)
WHERE sync_status IN ('pending', 'conflict');

-- GPS tracking
CREATE INDEX idx_gps_locations_employee_timestamp_accuracy 
ON gps_locations(employee_id, recorded_at DESC, location_accuracy)
WHERE location_accuracy <= 10;

🔗 Integrations & Monitoring

Intent: Keep external APIs healthy with token expiry and service monitoring.

-- Integration tokens
CREATE INDEX idx_integration_tokens_company_status 
ON integration_tokens(company_id, status);

CREATE INDEX idx_integration_tokens_company_service_expires
ON integration_tokens(company_id, service_name, expires_at)
WHERE status = 'active';

-- Health monitoring
CREATE INDEX idx_integration_health_company_id 
ON integration_health(company_id);

✅ Phase 2 Indexes – Summary

SLA Excellence → Multi-tier tracking & penalty escalation.

Workforce Optimization → Expiry + skills + performance analytics.

Payroll & Finance → Real-time costing, budgets, approvals.

Analytics Dashboards → Query results in milliseconds.

Mobile & Integrations → Conflict resolution, GPS accuracy, API monitoring.

📊 Competitive Edge

vs ServiceTitan Enterprise → Better SLA, workforce analytics, and BI.

vs Jobber → Adds advanced financial & compliance control.

vs FieldEdge → Superior mobile conflict handling + API health checks.