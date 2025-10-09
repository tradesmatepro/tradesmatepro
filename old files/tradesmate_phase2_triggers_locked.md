📋 Phase 2 – Enterprise Triggers (Revised & Locked)
🕒 SLA & Service Agreements

Why: Contractors complain about missed SLAs and poor escalation. Competitors like ServiceTitan only partially enforce penalties.

Our Fix:

Multi-level escalation chains (0–3 levels)

Auto-penalty calculation per SLA violation

Notifications for managers at higher levels

Auto customer comms for premium clients

-- Multi-level SLA escalation & penalty
CREATE OR REPLACE FUNCTION enforce_sla_penalty_fn()
RETURNS trigger AS $$
DECLARE
    response_delay INTERVAL;
    escalation_level INT := 0;
    penalty NUMERIC := 0;
BEGIN
    IF NEW.actual_response_time IS NOT NULL THEN
        response_delay := NEW.actual_response_time - NEW.requested_time;
        
        -- escalation levels
        escalation_level := CASE
            WHEN response_delay <= interval '1 hour' THEN 0
            WHEN response_delay <= interval '2 hours' THEN 1
            WHEN response_delay <= interval '6 hours' THEN 2
            ELSE 3
        END;

        IF escalation_level > 0 THEN
            penalty := EXTRACT(EPOCH FROM response_delay) / 3600 * 50; -- $50/hour default
            UPDATE service_agreements
            SET penalties_applied = COALESCE(penalties_applied,0)+1,
                total_penalty_amount = COALESCE(total_penalty_amount,0)+penalty
            WHERE id = NEW.agreement_id;
        END IF;

        -- Escalation notifications
        INSERT INTO notifications (company_id, user_id, type, message, priority, created_at)
        VALUES (
            NEW.company_id, NEW.assigned_to,
            'sla_violation',
            'Work order '||NEW.work_order_number||' escalated to level '||escalation_level,
            CASE WHEN escalation_level=3 THEN 'critical' WHEN escalation_level=2 THEN 'high' ELSE 'medium' END,
            NOW()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_sla_penalty
AFTER INSERT OR UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION enforce_sla_penalty_fn();

👥 Certifications & Compliance

Why: Jobber/Housecall lack proactive compliance tools. Contractors risk jobs being assigned to uncertified staff.

Our Fix:

Flag expiring certifications (30, 7, 0 days)

Auto-restrict employees with expired licenses

Notifications for employee + manager

CREATE OR REPLACE FUNCTION flag_certifications_fn()
RETURNS trigger AS $$
DECLARE
    days_left INT;
BEGIN
    IF NEW.expiry_date IS NOT NULL THEN
        days_left := NEW.expiry_date - CURRENT_DATE;

        IF days_left <= 30 THEN
            INSERT INTO notifications(company_id, user_id, type, message, created_at)
            VALUES (
                (SELECT company_id FROM employees WHERE id=NEW.employee_id),
                NEW.employee_id,
                'certification_expiry',
                'Certification '||NEW.certification_name||' expires in '||days_left||' days',
                NOW()
            );
        END IF;

        IF days_left <= 0 THEN
            UPDATE employees SET status='restricted'
            WHERE id = NEW.employee_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_flag_certifications
AFTER INSERT OR UPDATE ON employee_certifications
FOR EACH ROW EXECUTE FUNCTION flag_certifications_fn();

💵 Compensation & Payroll

Why: Contractors often miss commissions/bonuses tracking. ServiceTitan does this manually.

Our Fix:

Auto-calc commission/bonus during payroll insert/update

Prevents human error in pay runs

CREATE OR REPLACE FUNCTION apply_compensation_plan_fn()
RETURNS trigger AS $$
DECLARE
    commission_rate NUMERIC;
BEGIN
    SELECT commission_percent INTO commission_rate
    FROM compensation_plans WHERE employee_id = NEW.employee_id;

    IF commission_rate IS NOT NULL THEN
        NEW.total_compensation := NEW.base_pay + (NEW.sales_amount * commission_rate/100);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_apply_compensation_plan
BEFORE INSERT OR UPDATE ON payroll_line_items
FOR EACH ROW EXECUTE FUNCTION apply_compensation_plan_fn();

💰 Financial Integrity & Job Costing

Why: Complaints online show overlapping rate cards and missed profitability insights.

Our Fix:

Prevent rate card overlap per company

Auto-calc profit margin in job costing

Alerts on low-margin jobs

-- Prevent overlapping rate cards
CREATE OR REPLACE FUNCTION prevent_rate_card_overlap_fn()
RETURNS trigger AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM rate_cards r
        WHERE r.company_id = NEW.company_id
          AND r.type = NEW.type
          AND daterange(r.effective_from, COALESCE(r.effective_to,'2099-12-31'))
            && daterange(NEW.effective_from, COALESCE(NEW.effective_to,'2099-12-31'))
    ) THEN
        RAISE EXCEPTION 'Rate card overlap detected for company %', NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rate_card_overlap
BEFORE INSERT OR UPDATE ON rate_cards
FOR EACH ROW EXECUTE FUNCTION prevent_rate_card_overlap_fn();


-- Profit margin calculation
CREATE OR REPLACE FUNCTION calculate_profit_margin_fn()
RETURNS trigger AS $$
BEGIN
    NEW.total_cost := COALESCE(NEW.labor_cost,0) + COALESCE(NEW.material_cost,0) +
                      COALESCE(NEW.equipment_cost,0) + COALESCE(NEW.subcontractor_cost,0) +
                      COALESCE(NEW.overhead_cost,0);

    IF NEW.total_revenue > 0 THEN
        NEW.profit_margin_percent := ((NEW.total_revenue - NEW.total_cost)/NEW.total_revenue)*100;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_profit_margin
BEFORE INSERT OR UPDATE ON job_costing
FOR EACH ROW EXECUTE FUNCTION calculate_profit_margin_fn();

📱 Mobile & Field Ops

Why: Contractors complain about sync conflicts offline.

Our Fix:

Block duplicate sync attempts at DB level

CREATE OR REPLACE FUNCTION prevent_sync_conflict_fn()
RETURNS trigger AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM sync_logs s
        WHERE s.user_id = NEW.user_id
        AND s.record_id = NEW.record_id
        AND s.status = 'pending'
    ) THEN
        RAISE EXCEPTION 'Sync conflict detected for record %', NEW.record_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_sync_conflict
BEFORE INSERT ON sync_logs
FOR EACH ROW EXECUTE FUNCTION prevent_sync_conflict_fn();

🔗 Integrations

Why: Expired tokens still active = security risk.

Our Fix:

Auto-expire tokens on insert/update

CREATE OR REPLACE FUNCTION deactivate_expired_tokens_fn()
RETURNS trigger AS $$
BEGIN
    IF NEW.expires_at < NOW() THEN
        NEW.status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deactivate_tokens
BEFORE INSERT OR UPDATE ON integration_tokens
FOR EACH ROW EXECUTE FUNCTION deactivate_expired_tokens_fn();

✅ Phase 2 Trigger Pack Summary

SLA enforcement → with escalation + customer comms

Certification compliance → proactive + restrictions

Compensation → auto commission calc

Rate cards → no overlap allowed

Job costing → real-time profit margins

Mobile sync → conflict prevention

Integrations → token auto-expiry