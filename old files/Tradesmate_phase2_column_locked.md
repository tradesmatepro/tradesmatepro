📋 TradesMate Pro — Phase 2 Enterprise Schema
🔧 Service Management Enhancements

job_templates

id UUID PK

company_id UUID → companies(id)

template_number TEXT UNIQUE

name, description TEXT

service_category_id UUID → service_categories(id)

default_line_items JSONB

estimated_duration_hours NUMERIC(5,2)

estimated_cost NUMERIC(12,2)

buffer_time_before/after INT

requires_permit BOOLEAN

is_active BOOLEAN

version INT

created_at, updated_at TIMESTAMPTZ

rate_cards

id UUID PK

company_id UUID

rate_card_number TEXT UNIQUE

name, description TEXT

pricing_model ENUM(hourly, flat_rate, tiered, dynamic)

base_rate NUMERIC(12,2)

overtime_multiplier NUMERIC(3,2)

holiday_multiplier NUMERIC(3,2)

service_area JSONB

status ENUM(draft, active, archived)

effective_start_date, effective_end_date DATE

created_at, updated_at TIMESTAMPTZ

service_level_agreements

id UUID PK

company_id UUID

customer_id UUID

sla_number TEXT UNIQUE

name, description TEXT

emergency/urgent/normal_response_hours INT

service_hours_start, service_hours_end TIME

service_days TEXT[]

penalty_rate, credit_rate NUMERIC(5,2)

start_date, end_date DATE

auto_renewal BOOLEAN

status ENUM(draft, active, expired, cancelled)

created_at, updated_at TIMESTAMPTZ

maintenance_schedules

id UUID PK

company_id, customer_id UUID

customer_equipment_id UUID (Phase 4 tie-in)

schedule_number TEXT UNIQUE

name, description TEXT

frequency_type ENUM(daily, weekly, monthly, quarterly, annually, custom)

frequency_value INT

custom_schedule TEXT

next_due_date DATE

last_completed_date DATE

job_template_id UUID → job_templates(id)

estimated_cost NUMERIC(12,2)

status ENUM(active, paused, completed, cancelled)

created_at, updated_at TIMESTAMPTZ

👥 Team Management Enhancements

employee_skills

id UUID PK

employee_id UUID

skill_name, skill_category TEXT

proficiency_level ENUM(beginner, intermediate, advanced, expert)

certified BOOLEAN

certification_date, certification_expires DATE

verified_by UUID → users(id)

created_at, updated_at TIMESTAMPTZ

employee_compensation_plans

id UUID PK

employee_id UUID

plan_number TEXT UNIQUE

plan_type ENUM(salary, hourly, commission, hybrid)

base_amount NUMERIC(12,2)

pay_frequency ENUM(weekly, biweekly, monthly)

commission_rate NUMERIC(5,2)

commission_threshold NUMERIC(12,2)

bonus_criteria JSONB

effective_start_date, effective_end_date DATE

status ENUM(draft, active, expired)

created_at, updated_at TIMESTAMPTZ

performance_reviews

id UUID PK

employee_id UUID

review_number TEXT UNIQUE

review_period_start, review_period_end DATE

reviewer_id UUID → users(id)

ratings: overall, technical, service, teamwork (INT 1–5)

strengths, areas_for_improvement, goals TEXT

status ENUM(draft, completed, acknowledged)

completed_date, acknowledged_date DATE

created_at, updated_at TIMESTAMPTZ

💰 Financial Enhancements

job_costing

id UUID PK

work_order_id UUID

labor_hours, labor_cost NUMERIC

overtime_hours, overtime_cost NUMERIC

material_cost, markup_percent, markup_amount NUMERIC

equipment_cost, subcontractor_cost NUMERIC

permit_cost, travel_cost, other_costs NUMERIC

total_cost, total_revenue, gross_profit, profit_margin_percent NUMERIC

calculated_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

expense_approvals

id UUID PK

expense_id UUID → expenses(id)

approval_level INT

approver_id UUID → users(id)

approval_limit NUMERIC(12,2)

status ENUM(pending, approved, rejected, escalated)

comments TEXT

approved_at TIMESTAMPTZ

created_at TIMESTAMPTZ

currencies

id UUID PK

company_id UUID

currency_code TEXT (USD, CAD, EUR)

currency_name TEXT

symbol TEXT

exchange_rate NUMERIC(10,6)

is_base_currency BOOLEAN

is_active BOOLEAN

last_updated TIMESTAMPTZ

created_at TIMESTAMPTZ

📱 Mobile & Field Operations

mobile_devices

id UUID PK

company_id, employee_id UUID

device_id TEXT UNIQUE

device_name, device_type, platform TEXT

app_version TEXT

last_sync_at TIMESTAMPTZ

status ENUM(active, inactive, lost, retired)

registered_at, created_at TIMESTAMPTZ

sync_conflicts

id UUID PK

company_id, user_id UUID

entity_type, entity_id TEXT

conflict_type ENUM(version, delete, permission, validation)

server_data, client_data JSONB

resolution_strategy ENUM(server_wins, client_wins, merge, manual)

resolved_by UUID → users(id)

resolved_at TIMESTAMPTZ

status ENUM(pending, resolved, ignored)

created_at TIMESTAMPTZ

field_reports

id UUID PK

work_order_id, employee_id UUID

report_number TEXT UNIQUE

report_type ENUM(arrival, progress, completion, issue, safety)

summary, detailed_notes, recommendations TEXT

customer_signature_url TEXT

customer_satisfaction_rating INT 1–5

work_performed TEXT

materials_used JSONB

time_spent_hours NUMERIC(5,2)

status ENUM(draft, submitted, reviewed, approved)

submitted_at, reviewed_at TIMESTAMPTZ

reviewed_by UUID → users(id)

created_at TIMESTAMPTZ

🔗 Integration Enhancements

integration_mappings

id UUID PK

company_id UUID

integration_name TEXT (quickbooks, stripe, twilio)

entity_type TEXT (customer, invoice, payment)

local_field, external_field TEXT

transformation_rule TEXT

is_required BOOLEAN

data_type ENUM(string, number, boolean, date, json)

is_active BOOLEAN

created_at, updated_at TIMESTAMPTZ

integration_health

id UUID PK

company_id UUID

integration_name TEXT

health_status ENUM(healthy, warning, error, offline)

last_successful_sync TIMESTAMPTZ

last_error_message TEXT

error_count_24h INT

response_time_ms INT

total_syncs_today, successful_syncs_today, failed_syncs_today INT

checked_at, created_at TIMESTAMPTZ

🎯 Recap

Phase 2 adds ~15 enterprise-level tables.

Fixes gaps GPT left (SLAs, skills, comp plans, job costing, multi-currency, approvals).

Covers:

Service mgmt → job templates, rate cards, SLAs, preventive maintenance.

Team mgmt → skills, comp plans, performance reviews.

Finance → job costing, currencies, approval workflows.

Mobile ops → device mgmt, sync conflicts, structured field reports.

Integrations → mappings, health monitoring.

This schema is now fully enterprise-ready — no over-engineering, no missing pro-contractor features.