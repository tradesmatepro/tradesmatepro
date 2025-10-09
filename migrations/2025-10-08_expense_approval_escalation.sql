-- Expense approval escalation RPCs
-- Date: 2025-10-08

-- Approve or reject an expense approval. When approved, auto-escalate if thresholds require.
CREATE OR REPLACE FUNCTION public.process_expense_approval(
  p_approval_id UUID,
  p_decision TEXT,           -- 'approved' | 'rejected'
  p_notes TEXT DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  v_app RECORD;
  v_settings RECORD;
  v_req_emp RECORD;
  v_curr_mgr_emp RECORD;
  v_next_mgr_emp RECORD;
  v_amount NUMERIC;
  v_message TEXT := 'OK';
BEGIN
  -- Load the approval row + expense + requester employee + company
  SELECT a.*, x.company_id, x.amount, x.created_by
    INTO v_app
  FROM expense_approvals a
  JOIN expenses x ON x.id = a.expense_id
  WHERE a.id = p_approval_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Approval not found';
  END IF;

  v_amount := COALESCE(v_app.amount, 0);

  -- Get company settings (if any)
  SELECT * INTO v_settings
  FROM approval_settings s
  WHERE s.company_id = v_app.company_id
  LIMIT 1;

  -- Update current approval decision
  UPDATE expense_approvals
     SET status = CASE WHEN p_decision = 'approved' THEN 'approved' ELSE 'rejected' END,
         notes = p_notes,
         decided_at = now()
   WHERE id = p_approval_id;

  IF p_decision = 'rejected' THEN
    -- Mark expense rejected
    UPDATE expenses SET approval_status = 'rejected' WHERE id = v_app.expense_id;
    RETURN 'REJECTED';
  END IF;

  -- p_decision = approved. Determine if more approvals required
  -- Identify hierarchy: requester -> manager -> manager's manager -> ...
  SELECT e1.* INTO v_req_emp
  FROM employees e1
  WHERE e1.user_id = v_app.requester_id AND e1.company_id = v_app.company_id
  LIMIT 1;

  -- Current approver employee row
  SELECT e2.* INTO v_curr_mgr_emp
  FROM employees e2
  WHERE e2.user_id = v_app.approver_id AND e2.company_id = v_app.company_id
  LIMIT 1;

  -- Determine if escalation is required based on thresholds
  IF v_settings IS NULL THEN
    -- No settings; single-level approval. Mark expense approved.
    UPDATE expenses SET approval_status = 'approved' WHERE id = v_app.expense_id;
    RETURN 'APPROVED';
  END IF;

  -- If amount exceeds level2_threshold and we just approved by direct manager, escalate to manager's manager
  IF v_amount > COALESCE(v_settings.level2_threshold, 0) THEN
    -- Find next level manager (manager of current approver)
    IF v_curr_mgr_emp.manager_id IS NOT NULL THEN
      SELECT * INTO v_next_mgr_emp FROM employees e WHERE e.id = v_curr_mgr_emp.manager_id;
    ELSE
      v_next_mgr_emp := NULL;
    END IF;

    IF v_next_mgr_emp IS NOT NULL THEN
      INSERT INTO expense_approvals(company_id, expense_id, requester_id, approver_id, status)
      VALUES (v_app.company_id, v_app.expense_id, v_app.requester_id, v_next_mgr_emp.user_id, 'pending');
      UPDATE expenses SET approval_status = 'pending_approval' WHERE id = v_app.expense_id;
      RETURN 'ESCALATED_TO_NEXT_MANAGER';
    END IF;
  END IF;

  -- If amount exceeds level3_threshold, we could escalate one more level (optional simple logic)
  IF v_amount > COALESCE(v_settings.level3_threshold, 0) THEN
    -- Attempt to escalate one additional level above next manager (if we had one). If not, just approve.
    -- For simplicity, if the previous block didn’t find a next manager, we are at the top; approve.
    UPDATE expenses SET approval_status = 'approved' WHERE id = v_app.expense_id;
    RETURN 'APPROVED_TOP_LEVEL';
  END IF;

  -- Otherwise, approval complete
  UPDATE expenses SET approval_status = 'approved' WHERE id = v_app.expense_id;
  RETURN 'APPROVED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

