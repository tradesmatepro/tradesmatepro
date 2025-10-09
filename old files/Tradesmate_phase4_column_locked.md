📋 TradesMate Pro — Phase 4 Enterprise+ Schema (Final Lockdown)
🧠 Advanced Scheduling & AI

route_optimizations
AI-enhanced route planning.

id UUID PK

company_id UUID

optimization_number TEXT UNIQUE (RO-2025-001)

optimization_date DATE

technician_ids UUID[] → employees(id)

work_order_ids UUID[] → work_orders(id)

optimization_type ENUM(distance, time, cost, customer_priority, ai_hybrid)

max_drive_time_hours NUMERIC(5,2)

max_jobs_per_tech INT

break_duration_minutes INT

use_traffic_data, use_weather_data, use_historical_patterns BOOLEAN

learning_model_version TEXT

total_drive_time_hours, total_drive_distance_miles NUMERIC

optimization_score NUMERIC(5,2)

route_data JSONB

status ENUM(pending, calculating, completed, failed, applied)

applied_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

dynamic_scheduling_rules
Rules for real-time auto-scheduling.

id UUID PK

company_id UUID

rule_number TEXT UNIQUE (DSR-001)

rule_name, description TEXT

trigger_conditions JSONB

actions JSONB

priority INT

times_triggered INT

success_rate_percent NUMERIC(5,2)

last_triggered_at TIMESTAMPTZ

is_active BOOLEAN

created_at, updated_at TIMESTAMPTZ

🔮 Predictive Analytics

predictive_maintenance_models
Multiple ML models for preventive care.

id UUID PK

company_id UUID

model_number TEXT UNIQUE (PM-MODEL-001)

model_name, equipment_type TEXT

algorithm_type ENUM(regression, classification, neural_network, ensemble)

input_features, model_parameters JSONB

accuracy_percent, precision_percent, recall_percent, f1_score NUMERIC

training_data_size INT

last_trained_at TIMESTAMPTZ

training_duration_minutes INT

version TEXT

is_active BOOLEAN

deployed_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

maintenance_predictions
Forecasted failures/actions.

id UUID PK

customer_equipment_id UUID → customer_equipment(id)

model_id UUID → predictive_maintenance_models(id)

prediction_number TEXT UNIQUE (PRED-2025-001)

predicted_failure_date DATE

confidence_score NUMERIC(5,2)

failure_type, severity ENUM(low, medium, high, critical)

recommended_action ENUM(monitor, schedule_maintenance, immediate_service, replace)

estimated_cost NUMERIC(12,2)

actual_failure_date DATE

prediction_accuracy NUMERIC(5,2)

status ENUM(active, scheduled, completed, false_positive)

created_at, updated_at TIMESTAMPTZ

customer_churn_predictions
Retention forecasting.

id UUID PK

customer_id UUID → customers(id)

prediction_number TEXT UNIQUE (CHURN-2025-001)

churn_probability NUMERIC(5,2)

risk_level ENUM(low, medium, high, critical)

predicted_churn_date DATE

primary_risk_factors, recommended_actions JSONB

estimated_retention_cost, potential_revenue_loss NUMERIC

intervention_applied BOOLEAN

intervention_type, intervention_date DATE

actual_churn_date DATE

retention_success BOOLEAN

model_version TEXT

created_at, updated_at TIMESTAMPTZ

🌐 IoT & Equipment Monitoring

equipment_sensors
Registered IoT sensors.

id UUID PK

customer_equipment_id UUID

sensor_number TEXT UNIQUE (SENS-001)

sensor_type ENUM(temperature, pressure, vibration, flow, electrical, humidity, air_quality)

manufacturer, model, serial_number TEXT

communication_protocol ENUM(wifi, bluetooth, zigbee, lora, cellular, ethernet)

device_id TEXT

sampling_interval_seconds INT DEFAULT 300

alert_threshold_min, alert_threshold_max NUMERIC

unit_of_measure TEXT

status ENUM(active, inactive, maintenance, error, offline)

last_reading_at TIMESTAMPTZ

battery_level_percent INT

created_at, updated_at TIMESTAMPTZ

sensor_readings
Raw IoT data stream.

id UUID PK

sensor_id UUID → equipment_sensors(id)

reading_timestamp TIMESTAMPTZ

value NUMERIC(15,6)

unit TEXT

quality_score NUMERIC(3,2)

ambient_temperature, ambient_humidity NUMERIC

weather_conditions TEXT

is_anomaly BOOLEAN

anomaly_score NUMERIC(5,4)

anomaly_type ENUM(spike, drop, drift, noise, missing)

processed BOOLEAN

processed_at TIMESTAMPTZ

created_at TIMESTAMPTZ

automated_service_triggers
Workflows triggered by IoT data.

id UUID PK

company_id UUID

trigger_number TEXT UNIQUE (AST-2025-001)

trigger_name, description TEXT

sensor_id UUID → equipment_sensors(id)

condition_type ENUM(threshold_exceeded, pattern_detected, anomaly_detected, maintenance_due)

trigger_conditions JSONB

auto_create_work_order BOOLEAN

work_order_template_id UUID → job_templates(id)

priority_level ENUM(low, normal, high, urgent)

notify_customer, notify_technician BOOLEAN

notification_template TEXT

times_triggered INT

false_positive_rate NUMERIC(5,2)

is_active BOOLEAN

last_triggered_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

📈 Advanced BI & KPIs

kpi_definitions
Configurable KPIs.

id UUID PK

company_id UUID

kpi_code TEXT UNIQUE (REV_GROWTH)

kpi_name, description TEXT

calculation_method TEXT

data_sources TEXT[]

update_frequency ENUM(hourly, daily, weekly, monthly)

unit_type ENUM(number, percentage, currency, ratio)

decimal_places INT

target_value, benchmark_value NUMERIC

green_threshold, yellow_threshold, red_threshold NUMERIC

is_active BOOLEAN

created_at, updated_at TIMESTAMPTZ

kpi_values
Recorded KPI results.

id UUID PK

kpi_definition_id UUID → kpi_definitions(id)

measurement_date DATE

measurement_period ENUM(hour, day, week, month, quarter, year)

current_value, previous_value, target_value NUMERIC

variance_from_target, variance_percent NUMERIC

trend_direction ENUM(up, down, stable)

performance_status ENUM(excellent, good, warning, poor)

data_quality_score NUMERIC(3,2)

calculated_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

🔒 Enterprise Security & Compliance

security_audit_logs
Enterprise-grade logging.

id UUID PK

company_id UUID

audit_number TEXT UNIQUE (SEC-2025-001)

event_type ENUM(login_attempt, permission_change, data_access, data_export, configuration_change, security_violation)

severity ENUM(info, warning, error, critical)

user_id UUID → users(id)

session_id, ip_address, user_agent TEXT

resource_type, resource_id, action_attempted TEXT

success BOOLEAN

failure_reason TEXT

additional_data JSONB

risk_score INT CHECK (risk_score BETWEEN 0 AND 100)

event_timestamp TIMESTAMPTZ

created_at TIMESTAMPTZ

compliance_frameworks
Track frameworks like OSHA, EPA, GDPR.

id UUID PK

company_id UUID

framework_code TEXT UNIQUE (OSHA, GDPR, etc.)

framework_name, description TEXT

requirements JSONB

evidence_required TEXT[]

audit_frequency_months INT

compliance_status ENUM(compliant, non_compliant, partial, unknown, not_applicable)

last_audit_date, next_audit_due_date DATE

compliance_officer_id UUID → users(id)

external_auditor TEXT

created_at, updated_at TIMESTAMPTZ

🎯 Phase 4 Recap

AI & ML → route optimization, predictive maintenance, churn prediction.

IoT → sensors, readings, auto triggers.

BI → configurable KPIs, benchmarking.

Security & Compliance → enterprise-grade audit logs, frameworks.

Phase 4 adds ~30 tables.
This pushes TradesMate Pro beyond ServiceTitan Enterprise → next-gen FSM with AI + IoT.