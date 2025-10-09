-- =========================================
-- PHASE 1: CORE FSM TRIGGERS
-- Automated business logic triggers for field service management
-- =========================================

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER trigger_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_work_orders_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_dashboard_settings_updated_at
    BEFORE UPDATE ON user_dashboard_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate reference numbers
CREATE OR REPLACE FUNCTION auto_generate_reference_numbers()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate work order number
    IF TG_TABLE_NAME = 'work_orders' AND (NEW.work_order_number IS NULL OR NEW.work_order_number = '') THEN
        NEW.work_order_number := generate_smart_reference_number(NEW.company_id, 'work_order');
    END IF;
    
    -- Generate invoice number
    IF TG_TABLE_NAME = 'invoices' AND (NEW.invoice_number IS NULL OR NEW.invoice_number = '') THEN
        NEW.invoice_number := generate_smart_reference_number(NEW.company_id, 'invoice');
    END IF;
    
    -- Generate customer number
    IF TG_TABLE_NAME = 'customers' AND (NEW.customer_number IS NULL OR NEW.customer_number = '') THEN
        NEW.customer_number := generate_smart_reference_number(NEW.company_id, 'customer');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply reference number generation triggers
CREATE TRIGGER trigger_work_orders_generate_number
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_reference_numbers();

CREATE TRIGGER trigger_invoices_generate_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_reference_numbers();

CREATE TRIGGER trigger_customers_generate_number
    BEFORE INSERT ON customers
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_reference_numbers();

-- Work Order Line Items Total Calculation
CREATE OR REPLACE FUNCTION calculate_line_item_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate total price for line item
    NEW.total_price := NEW.quantity * NEW.unit_price;
    
    -- Update work order totals after line item changes
    PERFORM update_work_order_totals(NEW.work_order_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_order_line_items_calculate_total
    BEFORE INSERT OR UPDATE ON work_order_line_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_line_item_total();

-- Update work order totals when line items are deleted
CREATE OR REPLACE FUNCTION update_work_order_totals_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_work_order_totals(OLD.work_order_id);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_order_line_items_delete_update_totals
    AFTER DELETE ON work_order_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_work_order_totals_on_delete();

-- Work Order Status Validation
CREATE OR REPLACE FUNCTION validate_work_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip validation for new records
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
    -- Validate status transition
    IF OLD.status != NEW.status THEN
        IF NOT validate_work_order_status_transition(OLD.status, NEW.status) THEN
            RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        
        -- Auto-set timestamps based on status
        CASE NEW.status
            WHEN 'in_progress' THEN
                IF NEW.actual_start IS NULL THEN
                    NEW.actual_start := NOW();
                END IF;
            WHEN 'completed' THEN
                IF NEW.actual_end IS NULL THEN
                    NEW.actual_end := NOW();
                END IF;
            ELSE
                -- No automatic timestamp updates for other statuses
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_orders_validate_status
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_work_order_status_change();

-- Payment Processing Trigger
CREATE OR REPLACE FUNCTION process_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Update invoice balance when payment is added/updated
    IF NEW.invoice_id IS NOT NULL THEN
        PERFORM calculate_invoice_balance(NEW.invoice_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_process
    AFTER INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION process_payment();

-- Update invoice balance when payment is deleted
CREATE OR REPLACE FUNCTION process_payment_deletion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.invoice_id IS NOT NULL THEN
        PERFORM calculate_invoice_balance(OLD.invoice_id);
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payments_delete_process
    AFTER DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION process_payment_deletion();

-- Audit Logging Triggers
CREATE OR REPLACE FUNCTION create_audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id UUID;
    v_user_id UUID;
    v_action audit_action_enum;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    -- Determine action
    v_action := CASE TG_OP
        WHEN 'INSERT' THEN 'create'::audit_action_enum
        WHEN 'UPDATE' THEN 'update'::audit_action_enum
        WHEN 'DELETE' THEN 'delete'::audit_action_enum
    END;
    
    -- Get company_id and user_id from the record
    IF TG_OP = 'DELETE' THEN
        v_company_id := OLD.company_id;
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
    ELSE
        v_company_id := NEW.company_id;
        v_old_values := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END;
        v_new_values := to_jsonb(NEW);
    END IF;
    
    -- Try to get current user from session (this would need to be set by the application)
    -- For now, we'll leave user_id as NULL since we don't have session context
    v_user_id := NULL;
    
    -- Create audit log entry
    PERFORM create_audit_log(
        v_company_id,
        v_user_id,
        v_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_old_values,
        v_new_values
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to key tables
CREATE TRIGGER trigger_work_orders_audit
    AFTER INSERT OR UPDATE OR DELETE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log_trigger();

CREATE TRIGGER trigger_customers_audit
    AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log_trigger();

CREATE TRIGGER trigger_invoices_audit
    AFTER INSERT OR UPDATE OR DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log_trigger();

CREATE TRIGGER trigger_payments_audit
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION create_audit_log_trigger();

-- Notification Creation Trigger
CREATE OR REPLACE FUNCTION create_status_change_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Skip for new records
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;
    
    -- Create notifications for important status changes
    IF TG_TABLE_NAME = 'work_orders' AND OLD.status != NEW.status THEN
        -- Notify assigned technician
        IF NEW.assigned_to IS NOT NULL THEN
            INSERT INTO notifications (
                company_id,
                user_id,
                type,
                title,
                message,
                data
            ) VALUES (
                NEW.company_id,
                NEW.assigned_to,
                'in_app'::notification_type_enum,
                'Work Order Status Changed',
                'Work Order ' || NEW.work_order_number || ' status changed to ' || NEW.status,
                json_build_object(
                    'work_order_id', NEW.id,
                    'old_status', OLD.status,
                    'new_status', NEW.status
                )::jsonb
            );
        END IF;
        
        -- Notify managers for completed work orders
        IF NEW.status = 'completed' THEN
            INSERT INTO notifications (
                company_id,
                user_id,
                type,
                title,
                message,
                data
            )
            SELECT 
                NEW.company_id,
                u.id,
                'in_app'::notification_type_enum,
                'Work Order Completed',
                'Work Order ' || NEW.work_order_number || ' has been completed',
                json_build_object(
                    'work_order_id', NEW.id,
                    'total_amount', NEW.total_amount
                )::jsonb
            FROM users u
            WHERE u.company_id = NEW.company_id 
              AND u.role IN ('manager', 'admin', 'owner');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_work_orders_status_notifications
    AFTER UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION create_status_change_notifications();
