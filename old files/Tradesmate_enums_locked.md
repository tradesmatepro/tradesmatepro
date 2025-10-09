📋 Master Enum System — TradesMate Pro (Final Lockdown)
Phase 1 – Core FSM (~35 tables)
Work Orders

work_order_status_enum → draft, quote, approved, scheduled, parts_ordered, on_hold, in_progress, requires_approval, rework_needed, completed, invoiced, cancelled

work_order_priority_enum → low, normal, high, urgent, emergency, seasonal_peak

work_order_line_item_type_enum → labor, material, equipment, service, permit, disposal, travel, fee, discount, tax

Finance

invoice_status_enum → draft, sent, viewed, partially_paid, paid, overdue, disputed, written_off, cancelled

payment_status_enum → pending, processing, completed, partially_completed, failed, cancelled, refunded, disputed

expense_type_enum → labor, material, equipment, subcontractor, permit, travel, fuel, insurance, overhead, training, other

tax_type_enum → vat, sales_tax, gst, hst, pst, excise, import_duty, none

Team

employee_status_enum → probation, active, inactive, suspended, terminated, on_leave, retired

timesheet_status_enum → draft, submitted, under_review, approved, rejected, requires_correction, paid

payroll_run_status_enum → draft, calculating, pending_approval, approved, processing, completed, failed, cancelled

Operations

inventory_movement_type_enum → purchase, sale, transfer, adjustment, return, waste, theft, damage, warranty_replacement

vendor_type_enum → supplier, subcontractor, manufacturer, distributor, service_provider, rental_company

tool_status_enum → available, assigned, in_use, maintenance, repair, calibration, lost, stolen, retired

System

notification_type_enum → email, sms, in_app, push, webhook, slack, teams

notification_status_enum → pending, sent, delivered, read, clicked, failed, bounced, unsubscribed

audit_action_enum → insert, update, delete, login, logout, permission_change, export, import, backup, restore

Phase 2 – Enterprise (~25 tables)
Service Management

job_template_type_enum → installation, repair, maintenance, inspection, diagnostic, emergency, warranty, upgrade

rate_card_type_enum → hourly, flat_fee, per_unit, tiered, time_and_materials, value_based, subscription

pricing_rule_type_enum → discount, surcharge, tax, dynamic, override, bulk_discount, loyalty_discount, seasonal_adjustment

service_agreement_status_enum → draft, pending_approval, active, suspended, expired, cancelled, renewed

Team / HR

employee_time_off_type_enum → vacation, sick, personal, unpaid, jury_duty, bereavement, maternity, paternity, military, other

employee_certification_status_enum → pending, active, expiring_soon, expired, revoked, suspended, under_review

availability_status_enum → available, unavailable, partial, on_call, emergency_only, training, meeting

subcontractor_assignment_status_enum → invited, accepted, rejected, in_progress, completed, cancelled, disputed

Finance

payment_method_type_enum → credit_card, debit_card, ach, wire, check, cash, digital_wallet, cryptocurrency, financing, trade_credit

recurring_invoice_interval_enum → daily, weekly, biweekly, monthly, quarterly, semi_annually, annually, custom

change_order_status_enum → draft, submitted, under_review, approved, rejected, applied, cancelled, disputed

tax_jurisdiction_type_enum → federal, state, provincial, county, city, district, special_district, other

Field / Mobile

gps_location_type_enum → check_in, check_out, en_route, job_site, depot, break, lunch, fuel_stop, supply_run, emergency

sync_log_status_enum → pending, in_progress, success, partial_success, failed, conflict, timeout, cancelled

equipment_assignment_status_enum → assigned, in_use, returned, maintenance, repair, lost, stolen, damaged

Integrations

webhook_event_enum → work_order_created, work_order_completed, invoice_sent, invoice_paid, customer_created, customer_updated, inventory_low, employee_clocked_in, payment_failed, subscription_expired

integration_status_enum → active, inactive, error, expired, rate_limited, maintenance, deprecated

Phase 3 – Marketplace (~18 tables)
Core

marketplace_request_status_enum → draft, open, reviewing_bids, shortlisted, awarded, in_progress, on_hold, completed, cancelled, expired, disputed

marketplace_request_priority_enum → low, normal, high, urgent, emergency, flexible_timing

marketplace_response_status_enum → draft, submitted, under_review, shortlisted, awarded, rejected, withdrawn, expired, counter_offered

marketplace_message_type_enum → text, quote_update, schedule_change, file_attachment, system, counter_offer, clarification, progress_update

marketplace_message_status_enum → draft, sent, delivered, read, replied, archived, flagged

Reviews / Verification

review_type_enum → requester_to_provider, provider_to_requester, peer_review, platform_review

review_status_enum → draft, published, pending_moderation, flagged, disputed, removed, archived

commission_status_enum → pending, calculated, approved, paid, disputed, refunded, adjusted

credit_transaction_status_enum → pending, processing, completed, failed, cancelled, refunded, expired, disputed

verification_status_enum → pending, documents_requested, under_review, approved, rejected, expired, suspended, requires_update

Phase 4 – Enterprise+ (~30 tables)
Scheduling & AI

route_optimization_type_enum → distance, time, cost, fuel_efficiency, customer_priority, skill_matching, ai_hybrid, environmental_impact

route_optimization_status_enum → pending, calculating, completed, failed, applied, cancelled, superseded

dynamic_rule_priority_enum → lowest, low, normal, high, highest, critical

Predictive Analytics

predictive_model_type_enum → linear_regression, logistic_regression, decision_tree, random_forest, neural_network, ensemble, deep_learning, time_series

prediction_severity_enum → informational, low, medium, high, critical, catastrophic

prediction_action_enum → monitor, schedule_inspection, schedule_maintenance, immediate_service, replace, upgrade, no_action

prediction_status_enum → active, scheduled, in_progress, completed, false_positive, cancelled, superseded

churn_risk_level_enum → very_low, low, medium, high, very_high, critical, imminent

IoT & Monitoring

sensor_type_enum → temperature, pressure, vibration, flow, electrical, humidity, air_quality, noise, motion, light, ph, conductivity

sensor_protocol_enum → wifi, bluetooth, bluetooth_le, zigbee, z_wave, lora, lorawan, cellular, ethernet, modbus, bacnet

sensor_status_enum → active, inactive, maintenance, calibration, error, offline, low_battery, end_of_life

anomaly_type_enum → spike, drop, drift, noise, missing, pattern_break, seasonal_deviation, correlation_break

service_trigger_type_enum → threshold_exceeded, pattern_detected, anomaly_detected, maintenance_due, equipment_failure, efficiency_drop, safety_concern

Business Intelligence

kpi_unit_type_enum → number, percentage, currency, ratio, rate, duration, distance, weight, volume

kpi_trend_enum → strongly_up, up, slightly_up, stable, slightly_down, down, strongly_down, volatile

performance_status_enum → exceptional, excellent, good, satisfactory, warning, poor, critical

Security & Compliance

security_event_type_enum → login_attempt, login_success, login_failure, logout, permission_change, role_change, data_access, data_export, data_import, configuration_change, security_violation, suspicious_activity

security_severity_enum → informational, low, medium, high, critical, emergency

compliance_status_enum → compliant, non_compliant, partially_compliant, under_review, pending_audit, unknown, not_applicable, exempted

🎯 Why This Wins

Fixes contractor pain points (waiting states, rework, disputes, approvals).

Adds real-world granularity (partial payments, emergency vs urgent, probation employees).

Covers modern workflows (Slack notifications, crypto payments, counter-offers).

Future-proof with AI/IoT, environmental impact, advanced compliance.