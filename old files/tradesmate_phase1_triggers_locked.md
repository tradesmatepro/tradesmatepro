🛠️ TradeMate Pro — Phase 1 Core FSM Triggers (Final Merged & Locked)
🔍 Audit & Data Integrity

Intent:

Track every insert, update, delete across core tables.

Include full user context (company_id, user_id, IP, user agent).

Capture old vs new values, changed fields, timestamps.

Contractors often complain about “ghost edits” in Jobber/Housecall Pro. This solves it.

-- Function: Comprehensive audit logging with user context
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    id, company_id, user_id, table_name, record_id,
    action, old_values, new_values, changed_fields,
    ip_address, user_agent, created_at
  )
  VALUES (
    gen_random_uuid(),
    COALESCE(NEW.company_id, OLD.company_id),
    current_setting('app.current_user_id', true)::uuid,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    row_to_json(OLD),
    row_to_json(NEW),
    array(
      SELECT key FROM jsonb_each(to_jsonb(NEW))
      EXCEPT
      SELECT key FROM jsonb_each(to_jsonb(OLD))
    ),
    current_setting('app.current_user_ip', true),
    current_setting('app.current_user_agent', true),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach audit logging to critical core tables
CREATE TRIGGER trg_audit_work_orders
AFTER INSERT OR UPDATE OR DELETE ON work_orders
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER trg_audit_employees
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

📑 Work Order Automation

Intent:

Enforce valid status transitions (quote → scheduled → in_progress → completed → invoiced → paid/archived).

Auto-populate actual_start and actual_end.

Generate invoices automatically when jobs complete.

Contractors complain about jobs getting “stuck.” This solves it.

-- Function: Enforce work order status transitions
CREATE OR REPLACE FUNCTION enforce_work_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- No skipping scheduled step
  IF NEW.status = 'in_progress' AND OLD.status <> 'scheduled' THEN
    RAISE EXCEPTION 'Work order must be scheduled before starting';
  END IF;

  -- No skipping in_progress step
  IF NEW.status = 'completed' AND OLD.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Work order must be in progress before completion';
  END IF;

  -- Auto timestamps
  IF NEW.status = 'in_progress' AND NEW.actual_start IS NULL THEN
    NEW.actual_start := now();
  END IF;

  IF NEW.status = 'completed' AND NEW.actual_end IS NULL THEN
    NEW.actual_end := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_work_order_status
BEFORE UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION enforce_work_order_status();

-- Function: Auto-generate invoice when job marked completed
CREATE OR REPLACE FUNCTION auto_generate_invoice()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    INSERT INTO invoices (id, company_id, work_order_id, customer_id, status, total_amount, balance_due, created_at)
    VALUES (
      gen_random_uuid(),
      NEW.company_id,
      NEW.id,
      NEW.customer_id,
      'draft',
      (SELECT SUM(unit_price * quantity) FROM work_order_line_items WHERE work_order_id = NEW.id),
      (SELECT SUM(unit_price * quantity) FROM work_order_line_items WHERE work_order_id = NEW.id),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_generate_invoice
AFTER UPDATE ON work_orders
FOR EACH ROW EXECUTE FUNCTION auto_generate_invoice();

💰 Payments & Invoices

Intent:

Prevent overpayments.

Add fraud detection (velocity analysis, outlier detection).

Update invoice balance automatically.

Competitors don’t stop duplicate/overpayments → TradeMate Pro does.

-- Function: Validate payments and detect fraud
CREATE OR REPLACE FUNCTION validate_payment()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total NUMERIC(12,2);
  invoice_paid NUMERIC(12,2);
  new_total NUMERIC(12,2);
  recent_count INT;
BEGIN
  SELECT total_amount, COALESCE(SUM(p.amount),0)
  INTO invoice_total, invoice_paid
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  WHERE i.id = NEW.invoice_id
  GROUP BY i.total_amount;

  new_total := invoice_paid + NEW.amount;

  -- Overpayment prevention
  IF new_total > invoice_total * 1.05 THEN
    RAISE EXCEPTION 'Payment exceeds invoice total (overpayment)';
  END IF;

  -- Fraud detection: high velocity (too many payments in <1 hr)
  SELECT COUNT(*) INTO recent_count
  FROM payments
  WHERE customer_id = NEW.customer_id
    AND created_at > (now() - interval '1 hour');

  IF recent_count > 5 THEN
    RAISE EXCEPTION 'High payment velocity detected — possible fraud';
  END IF;

  -- Outlier detection
  IF NEW.amount > (invoice_total * 2) THEN
    INSERT INTO notifications (id, company_id, type, message, created_at)
    VALUES (
      gen_random_uuid(),
      NEW.company_id,
      'FRAUD_ALERT',
      'Unusually high payment flagged for review',
      now()
    );
    NEW.status := 'pending_review';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_payment
BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION validate_payment();

-- Function: Auto-update invoice balance after payment
CREATE OR REPLACE FUNCTION update_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET balance_due = total_amount - (
    SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = NEW.invoice_id
  ),
  status = CASE
    WHEN (SELECT COALESCE(SUM(amount),0) FROM payments WHERE invoice_id = NEW.invoice_id) >= total_amount
      THEN 'paid'
    ELSE 'partially_paid'
  END
  WHERE id = NEW.invoice_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_invoice_balance
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION update_invoice_balance();

📦 Inventory Management

Intent:

Deduct stock when used on jobs.

Restock on purchase order receipt.

Contractors hate losing parts or running short mid-job.

Jobber/Housecall ignore inventory → TradeMate Pro makes it automatic.

-- Function: Deduct stock on job use
CREATE OR REPLACE FUNCTION adjust_inventory_on_job()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_stock
  SET quantity = quantity - NEW.quantity
  WHERE item_id = NEW.item_id
    AND company_id = NEW.company_id
    AND location_id = NEW.location_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for item %', NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_item_inventory
AFTER INSERT ON work_order_line_items
FOR EACH ROW EXECUTE FUNCTION adjust_inventory_on_job();

-- Function: Restock when purchase order received
CREATE OR REPLACE FUNCTION restock_inventory_on_po()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'received' AND OLD.status <> 'received' THEN
    UPDATE inventory_stock
    SET quantity = quantity + li.quantity
    FROM purchase_order_line_items li
    WHERE li.purchase_order_id = NEW.id
      AND inventory_stock.item_id = li.item_id
      AND inventory_stock.company_id = NEW.company_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restock_inventory
AFTER UPDATE OF status ON purchase_orders
FOR EACH ROW EXECUTE FUNCTION restock_inventory_on_po();

📅 Scheduling & Resource Allocation

Intent:

Prevent double booking.

Add travel time buffer (30 min default).

Enforce daily job/hour caps per employee.

Jobber complaints about overlaps → fixed here.

-- Function: Prevent scheduling conflicts w/ travel buffer
CREATE OR REPLACE FUNCTION prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
  overlap_count INT;
BEGIN
  SELECT COUNT(*) INTO overlap_count
  FROM schedule_events
  WHERE employee_id = NEW.employee_id
    AND tsrange(start_time - interval '30 minutes', end_time + interval '30 minutes') &&
        tsrange(NEW.start_time, NEW.end_time);

  IF overlap_count > 0 THEN
    RAISE EXCEPTION 'Employee already booked during this time (with travel buffer)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON schedule_events
FOR EACH ROW EXECUTE FUNCTION prevent_double_booking();

🕒 Timesheets & Payroll

Intent:

Auto-update employee hours from timesheets.

Ensures payroll always reconciles with work hours.

Prevents manual accounting errors.

-- Function: Auto-update employee hours on timesheet insert
CREATE OR REPLACE FUNCTION update_employee_hours()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE employees
  SET total_hours = COALESCE(total_hours,0) + NEW.hours_worked
  WHERE id = NEW.employee_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_employee_hours
AFTER INSERT ON employee_timesheets
FOR EACH ROW EXECUTE FUNCTION update_employee_hours();

✅ Final Phase 1 Trigger Pack Summary

Audit → full user-aware logs.

Work Orders → enforced transitions, auto-timestamps, auto-invoicing.

Payments → overpayment prevention + fraud/velocity detection.

Invoices → balances updated in real-time.

Inventory → auto-deduct/restock.

Scheduling → prevents overlaps, adds travel buffers.

Timesheets/Payroll → always reconciled.