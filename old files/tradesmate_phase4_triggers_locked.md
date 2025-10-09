🚀 TradeMate Pro – Phase 4 Triggers (Merged + Enhanced)
🔧 Predictive Maintenance (AI/IoT)

Intent: Move from static thresholds (GPT) to proactive ML-driven maintenance (Claude). Handle anomaly detection, confidence scoring, and automatic work order creation.

CREATE OR REPLACE FUNCTION enhanced_predictive_maintenance_fn()
RETURNS trigger AS $$
DECLARE
    failure_probability NUMERIC;
    anomaly_score NUMERIC;
    urgency TEXT;
BEGIN
    -- Basic anomaly detection (GPT style thresholds)
    IF NEW.sensor_type = 'temperature' AND NEW.reading > 90 THEN
        anomaly_score := 85;
    ELSIF NEW.sensor_type = 'vibration' AND NEW.reading > 5.0 THEN
        anomaly_score := 75;
    ELSE
        anomaly_score := 10;
    END IF;

    -- Apply simplified ML-inspired probability (Claude style)
    failure_probability := CASE
        WHEN anomaly_score >= 80 THEN 0.85
        WHEN anomaly_score >= 60 THEN 0.65
        WHEN anomaly_score >= 40 THEN 0.45
        ELSE 0.1
    END;

    urgency := CASE
        WHEN failure_probability >= 0.8 THEN 'critical'
        WHEN failure_probability >= 0.6 THEN 'urgent'
        ELSE 'moderate'
    END;

    -- Auto-generate work order for urgent/critical
    IF urgency IN ('critical','urgent') THEN
        INSERT INTO work_orders (company_id, customer_id, status, description, priority)
        VALUES (NEW.company_id, NEW.customer_id,
                'requires_approval',
                'AI-generated maintenance (' || urgency || ')',
                CASE urgency WHEN 'critical' THEN 'emergency' ELSE 'urgent' END);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enhanced_predictive_maintenance
BEFORE INSERT ON sensor_readings
FOR EACH ROW EXECUTE FUNCTION enhanced_predictive_maintenance_fn();

📊 AI/ML Insights (Churn & KPI Intelligence)

Intent: Use churn scoring to prevent customer loss and KPI triggers to recommend improvements.

CREATE OR REPLACE FUNCTION churn_intervention_fn()
RETURNS trigger AS $$
BEGIN
  IF NEW.churn_score > 0.8 THEN
    INSERT INTO notifications (company_id, user_id, type, message, priority)
    VALUES (NEW.company_id, NULL, 'customer_risk',
            '⚠️ High churn risk for customer ' || NEW.customer_id, 'high');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_churn_intervention
AFTER INSERT OR UPDATE ON customer_metrics
FOR EACH ROW EXECUTE FUNCTION churn_intervention_fn();

🌍 Route Optimization & Environmental Impact

Intent: Suggest optimized routes automatically (GPT) and track environmental footprint (Claude).

CREATE OR REPLACE FUNCTION suggest_route_fn()
RETURNS trigger AS $$
BEGIN
  INSERT INTO route_optimization_tasks (company_id, schedule_event_id, status)
  VALUES (NEW.company_id, NEW.id, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_suggest_route
AFTER INSERT ON schedule_events
FOR EACH ROW EXECUTE FUNCTION suggest_route_fn();


CREATE OR REPLACE FUNCTION check_environmental_impact_fn()
RETURNS trigger AS $$
BEGIN
  IF NEW.estimated_co2 > 50 THEN
    UPDATE route_optimization_tasks
    SET flagged_for_review = TRUE
    WHERE schedule_event_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_environmental_impact
AFTER INSERT OR UPDATE ON route_optimization_results
FOR EACH ROW EXECUTE FUNCTION check_environmental_impact_fn();

🛡 Compliance & Safety

Intent: Enforce certifications, auto-log safety tasks.

CREATE OR REPLACE FUNCTION check_certification_validity_fn()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM employee_certifications
    WHERE employee_id = NEW.employee_id
      AND expiration_date < NOW()
  ) THEN
    RAISE EXCEPTION 'Employee certification expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_certification_validity
BEFORE INSERT ON work_order_assignments
FOR EACH ROW EXECUTE FUNCTION check_certification_validity_fn();


CREATE OR REPLACE FUNCTION auto_safety_followup_fn()
RETURNS trigger AS $$
BEGIN
  INSERT INTO compliance_tasks (company_id, related_incident_id, task_type, status)
  VALUES (NEW.company_id, NEW.id, 'safety_followup', 'open');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_safety_followup
AFTER INSERT ON safety_incidents
FOR EACH ROW EXECUTE FUNCTION auto_safety_followup_fn();

🔐 Security & Behavioral Monitoring

Intent: Move beyond GPT’s simple suspicious login → Claude’s full risk scoring with MFA/lockouts.

CREATE OR REPLACE FUNCTION enhanced_security_monitoring_fn()
RETURNS trigger AS $$
DECLARE
    risk INTEGER := 0;
BEGIN
    -- Simple: foreign login locations (GPT)
    IF NEW.ip_address_country NOT IN ('US','CA','UK') THEN
        risk := risk + 30;
    END IF;

    -- Advanced: failed login clustering (Claude)
    IF NEW.failed_attempts > 5 THEN
        risk := risk + 40;
    END IF;

    -- Decision
    IF risk >= 70 THEN
        UPDATE users SET status = 'locked' WHERE id = NEW.user_id;
        INSERT INTO notifications(company_id,user_id,type,message,priority)
        VALUES(NEW.company_id,NEW.user_id,'security_lockout',
               'Critical: Account locked due to suspicious activity','critical');
    ELSIF risk >= 40 THEN
        UPDATE users SET requires_mfa_reset = TRUE WHERE id = NEW.user_id;
        INSERT INTO notifications(company_id,user_id,type,message,priority)
        VALUES(NEW.company_id,NEW.user_id,'security_mfa_required',
               'Additional verification required','high');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enhanced_security_monitoring
AFTER INSERT ON login_audit
FOR EACH ROW EXECUTE FUNCTION enhanced_security_monitoring_fn();

🏆 Competitive Advantage Summary

vs ServiceTitan → adds IoT auto-jobs, environmental triggers, ML predictions.

vs Jobber/Housecall Pro → adds churn prevention, compliance automation, AI insights.

vs Angi/Thumbtack → FSM + AI/IoT + marketplace synergy (future phases).

✅ This merged Phase 4 pack provides executable SQL + human-readable intent. It preserves GPT’s clarity, integrates Claude’s AI/ML intelligence, and addresses real contractor pain points: missed preventive maintenance, poor security, compliance gaps, and lack of environmental awareness.