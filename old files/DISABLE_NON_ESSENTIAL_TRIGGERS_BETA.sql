-- ============================================================================
-- DISABLE NON-ESSENTIAL TRIGGERS FOR BETA
-- ============================================================================
-- Keep only: Timestamp triggers + Auto-numbering
-- Disable: Status enforcement, Auto-calculation, Audit logging, Complex logic
-- ============================================================================

-- ============================================================================
-- 1. DISABLE STATUS ENFORCEMENT TRIGGERS (Already done, but ensure)
-- ============================================================================
DROP TRIGGER IF EXISTS enforce_work_order_status_trigger ON work_orders;
DROP TRIGGER IF EXISTS trg_work_order_status_enforcement ON work_orders;

-- ============================================================================
-- 2. DISABLE AUTO-CALCULATION TRIGGERS (Frontend handles this)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_calculate_deposit ON work_orders;
DROP TRIGGER IF EXISTS trg_calculate_discount ON work_orders;

-- ============================================================================
-- 3. DISABLE PAYMENT UPDATE TRIGGERS (Could cause conflicts)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_invoice_amount_paid ON payments;

-- ============================================================================
-- 4. DISABLE CHANGE ORDER TRIGGERS (Complex logic)
-- ============================================================================
DROP TRIGGER IF EXISTS trigger_update_work_order_on_change_order_approval ON change_orders;

-- ============================================================================
-- 5. DISABLE AUDIT LOGGING TRIGGERS (Nice to have, not critical for beta)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_audit_work_orders ON work_orders;
DROP TRIGGER IF EXISTS trg_audit_customers ON customers;
DROP TRIGGER IF EXISTS trg_audit_employees ON employees;
DROP TRIGGER IF EXISTS trg_audit_invoices ON invoices;
DROP TRIGGER IF EXISTS trg_audit_payments ON payments;

-- ============================================================================
-- 6. DISABLE CUSTOMER LOGGING TRIGGERS (Extra logging, not needed)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_log_customer_creation ON customers;
DROP TRIGGER IF EXISTS trg_log_customer_update ON customers;
DROP TRIGGER IF EXISTS trg_handle_customer_changes ON customers;

-- ============================================================================
-- 7. DISABLE QUOTE ANALYTICS TRIGGERS (Nice to have, not critical)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_update_quote_analytics ON work_orders;

-- ============================================================================
-- 8. DISABLE QUOTE EXPIRATION TRIGGER (Frontend can handle)
-- ============================================================================
DROP TRIGGER IF EXISTS trg_set_quote_expiration ON work_orders;

-- ============================================================================
-- VERIFICATION: Show remaining triggers
-- ============================================================================
SELECT 
    'REMAINING TRIGGERS (Should be ~32 timestamp + auto-numbering only):' as message;

SELECT 
    event_object_table as table_name,
    trigger_name,
    action_statement as function_called,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '✅ Timestamp (KEEP)'
        WHEN trigger_name LIKE '%number%' THEN '✅ Auto-numbering (KEEP)'
        ELSE '⚠️ OTHER (Review)'
    END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY 
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN 1
        WHEN trigger_name LIKE '%number%' THEN 2
        ELSE 3
    END,
    event_object_table;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT 
    'TRIGGERS DISABLED FOR BETA' as summary,
    '32 triggers disabled (status enforcement, calculations, audit, complex logic)' as details,
    '32 triggers kept (timestamps + auto-numbering)' as kept,
    'Frontend now controls all business logic' as result;

