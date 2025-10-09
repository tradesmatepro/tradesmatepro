📊 Phase 4 – AI/IoT Indexes (Final Revised)
🔧 Sensor Readings & Predictive Maintenance

Intent: IoT sensors generate massive datasets. Contractors complain about laggy dashboards and slow anomaly detection in ServiceTitan. These indexes make real-time alerts possible.

-- Fast lookups by type + time
CREATE INDEX idx_sensor_readings_type_time
  ON sensor_readings(sensor_type, reading_time DESC);

-- Detect anomalies per device
CREATE INDEX idx_sensor_readings_device_id
  ON sensor_readings(device_id, reading_value);

-- GiST/BRIN for large time-series
CREATE INDEX idx_sensor_readings_time_brin
  ON sensor_readings USING brin (reading_time);

-- Multi-dimensional sensor data with real-time analytics
CREATE INDEX idx_sensor_readings_device_type_time_value 
  ON sensor_readings(device_id, sensor_type, reading_timestamp DESC, reading_value)
  WHERE reading_timestamp >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
  INCLUDE (location_id, data_quality_score, anomaly_flag);

🤖 AI/ML Intelligence & Predictive Analytics

Intent: Competitors don’t optimize for AI workloads. We add model tracking, churn scoring, and predictive maintenance.

-- Machine learning model performance + versioning
CREATE INDEX idx_ml_models_company_type_performance_version 
  ON ml_models(company_id, model_type, model_performance_score DESC, model_version DESC, is_active)
  WHERE is_active = true
  INCLUDE (training_date, accuracy_score, confidence_interval, deployment_status);

-- Real-time AI inference optimization
CREATE INDEX idx_ai_predictions_model_timestamp_confidence 
  ON ai_predictions(model_id, prediction_timestamp DESC, confidence_score DESC, prediction_category)
  WHERE confidence_score >= 0.7
  INCLUDE (input_features, predicted_value, actual_value, prediction_accuracy);

-- Churn prediction
CREATE INDEX idx_churn_predictions_customer_risk_behavior 
  ON churn_predictions(customer_id, churn_probability DESC, prediction_date DESC, behavioral_change_score DESC)
  WHERE churn_probability > 0.4
  INCLUDE (risk_factors, intervention_recommendations, retention_cost_estimate);

-- Predictive maintenance with failure probability
CREATE INDEX idx_predictive_maintenance_equipment_failure_prob 
  ON predictive_maintenance(equipment_id, failure_probability DESC, prediction_date DESC, maintenance_urgency)
  WHERE failure_probability > 0.3
  INCLUDE (predicted_failure_date, recommended_action, cost_estimate);

🌍 Route Optimization & Environmental Impact

Intent: Complaints about fuel costs + inefficient routing. We add eco-routing + CO₂ tracking, which no competitor offers.

-- Route optimization queries
CREATE INDEX idx_route_optimization_tasks_company
  ON route_optimization_tasks(company_id, status);

-- Environmental CO₂ tracking
CREATE INDEX idx_route_optimization_results_co2
  ON route_optimization_results(schedule_event_id, estimated_co2);

-- Carbon footprint tracking
CREATE INDEX idx_carbon_footprint_company_period_emissions_reduction 
  ON carbon_footprint(company_id, measurement_period DESC, total_emissions_kg DESC, emissions_reduction_percent DESC)
  INCLUDE (fuel_consumption, electric_usage, offset_credits, sustainability_score);

🛡 Compliance & Safety

Intent: Auditors complain about poor access in ServiceTitan. We fix with instant lookup indexes.

-- Expired cert checks
CREATE INDEX idx_employee_certifications_validity
  ON employee_certifications(expiration_date);

-- Safety incidents by severity
CREATE INDEX idx_safety_incidents_company_severity
  ON safety_incidents(company_id, severity);

-- Compliance evidence tracking
CREATE INDEX idx_compliance_tasks_company_status
  ON compliance_tasks(company_id, status);

🔒 Security & Behavioral Monitoring

Intent: Contractors complain about suspicious logins not flagged. We add risk scoring + anomaly detection.

-- Login anomaly detection
CREATE INDEX idx_login_audit_user_time
  ON login_audit(user_id, login_time DESC);

-- Risk scoring
CREATE INDEX idx_login_audit_risk
  ON login_audit(company_id, risk_score DESC);

-- MFA/reset tracking
CREATE INDEX idx_users_mfa_lockouts
  ON users(id, requires_mfa_reset, status);

-- Behavioral security analysis
CREATE INDEX idx_user_behavior_analysis_user_risk_pattern 
  ON user_behavior_analysis(user_id, risk_score DESC, analysis_timestamp DESC, behavior_pattern_type)
  WHERE risk_score > 50
  INCLUDE (anomaly_indicators, baseline_deviation, recommended_action);

📊 Business Intelligence & Optimization

Intent: Contractors complain about slow reports. We add A/B testing, BI dashboards, and performance indexes.

-- A/B experiment performance
CREATE INDEX idx_ab_experiments_company_experiment_performance 
  ON ab_experiments(company_id, experiment_name, statistical_significance DESC, experiment_status, end_date DESC)
  WHERE experiment_status IN ('running', 'completed')
  INCLUDE (control_group_size, test_group_size, conversion_improvement);

-- BI dashboards
CREATE INDEX idx_bi_dashboards_company_dashboard_refresh_performance
  ON business_intelligence_dashboards(company_id, dashboard_name, refresh_performance_score DESC, last_refresh DESC)
  WHERE is_active = true
  INCLUDE (data_freshness_minutes, query_execution_time, user_engagement_score);

-- Customer lifetime value prediction
CREATE INDEX idx_clv_predictions_customer_predicted_value_probability
  ON customer_lifetime_value_predictions(customer_id, predicted_clv DESC, prediction_probability DESC, prediction_date DESC)
  WHERE prediction_probability >= 0.75
  INCLUDE (current_value, growth_potential, retention_strategies);

✅ Phase 4 Indexes Summary

IoT → BRIN & multi-dimensional indexes for scale

AI/ML → model versioning, inference, predictive maintenance

Environment → carbon tracking + eco-routing

Compliance → fast audits

Security → anomaly detection + MFA

BI → dashboards, churn, A/B testing

📊 Competitive Edge:

Better than ServiceTitan → predictive + sustainability

Better than Jobber/Housecall → compliance + churn intelligence

Beyond Angi/Thumbtack → AI + IoT marketplace synergy

gptphase4

claude_phase4_indexes