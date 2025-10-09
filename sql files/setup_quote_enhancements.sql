-- SQL to enhance work_orders (quotes) with versioning and e-sign audit trail
-- Run this in your Supabase SQL editor

-- 1. Add versioning and audit fields to work_orders table (for quotes stage)
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS accepted_by TEXT; -- customer name/email
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS accepted_ip TEXT;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS sent_to TEXT; -- customer email

-- 2. Create work_order_audit_log table for tracking all changes (including quotes)
CREATE TABLE IF NOT EXISTS work_order_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created', 'updated', 'sent', 'accepted', 'rejected', 'expired'
  old_status TEXT,
  new_status TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on work_order_audit_log
ALTER TABLE work_order_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access audit logs for their company
CREATE POLICY "Users can access work order audit logs for their company" ON work_order_audit_log
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 3. Create work_order_versions table for version history (including quotes)
CREATE TABLE IF NOT EXISTS work_order_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  subtotal DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  items JSONB DEFAULT '[]',
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on work_order_versions
ALTER TABLE work_order_versions ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can only access work order versions for their company
CREATE POLICY "Users can access work order versions for their company" ON work_order_versions
  FOR ALL USING (company_id = (SELECT company_id FROM users WHERE id = auth.uid()));

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_order_audit_log_work_order_id ON work_order_audit_log(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_audit_log_company_id ON work_order_audit_log(company_id);
CREATE INDEX IF NOT EXISTS idx_work_order_audit_log_created_at ON work_order_audit_log(created_at);

CREATE INDEX IF NOT EXISTS idx_work_order_versions_work_order_id ON work_order_versions(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_versions_company_id ON work_order_versions(company_id);
CREATE INDEX IF NOT EXISTS idx_work_order_versions_version ON work_order_versions(work_order_id, version);

-- 5. Create function to automatically log work order changes (including quotes)
CREATE OR REPLACE FUNCTION log_work_order_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log status changes (for quotes, jobs, and work orders)
  IF TG_OP = 'UPDATE' AND (OLD.quote_status != NEW.quote_status OR OLD.job_status != NEW.job_status OR OLD.work_status != NEW.work_status) THEN
    INSERT INTO work_order_audit_log (
      work_order_id,
      company_id,
      action,
      old_status,
      new_status,
      details
    ) VALUES (
      NEW.id,
      NEW.company_id,
      'status_changed',
      COALESCE(OLD.quote_status::text, OLD.job_status::text, OLD.work_status::text, OLD.status),
      COALESCE(NEW.quote_status::text, NEW.job_status::text, NEW.work_status::text, NEW.status),
      jsonb_build_object(
        'old_total', OLD.total_amount,
        'new_total', NEW.total_amount,
        'version', NEW.version,
        'stage', NEW.stage
      )
    );
  END IF;

  -- Log acceptance (for quotes)
  IF TG_OP = 'UPDATE' AND NEW.quote_status = 'ACCEPTED' AND OLD.quote_status != 'ACCEPTED' THEN
    UPDATE work_orders SET accepted_at = now() WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic audit logging
DROP TRIGGER IF EXISTS work_order_audit_trigger ON work_orders;
CREATE TRIGGER work_order_audit_trigger
  AFTER UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION log_work_order_change();

-- 7. Create function to create new work order version (including quotes)
CREATE OR REPLACE FUNCTION create_work_order_version(
  p_work_order_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_work_order work_orders%ROWTYPE;
  v_new_version INTEGER;
BEGIN
  -- Get current work order
  SELECT * INTO v_work_order FROM work_orders WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found';
  END IF;

  -- Increment version
  v_new_version := v_work_order.version + 1;

  -- Create version record
  INSERT INTO work_order_versions (
    work_order_id,
    company_id,
    version,
    title,
    description,
    subtotal,
    total_amount,
    notes,
    created_by
  ) VALUES (
    v_work_order.id,
    v_work_order.company_id,
    v_new_version,
    v_work_order.title,
    v_work_order.description,
    v_work_order.subtotal,
    v_work_order.total_amount,
    v_work_order.notes,
    p_user_id
  );

  -- Update work order version
  UPDATE work_orders SET
    version = v_new_version,
    updated_at = now()
  WHERE id = p_work_order_id;

  -- Log the versioning
  INSERT INTO work_order_audit_log (
    work_order_id,
    company_id,
    action,
    user_id,
    details
  ) VALUES (
    p_work_order_id,
    v_work_order.company_id,
    'version_created',
    p_user_id,
    jsonb_build_object('version', v_new_version)
  );
  
  RETURN v_new_version;
END;
$$ LANGUAGE plpgsql;

-- 8. Verify setup
SELECT 'Work order enhancements created' as status;
SELECT COUNT(*) as audit_log_count FROM work_order_audit_log;
SELECT COUNT(*) as versions_count FROM work_order_versions;
