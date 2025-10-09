-- TradesMatePro Schema Cleanup & Unification (idempotent)
-- Grounded in supabase schema.csv. Safe to apply in beta.
-- Skips RLS/integrations/security.

-- 1) Monetary & Quantity Standardization to NUMERIC(12,4)
DO $$ BEGIN
  -- Inventory
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='inventory_items' AND column_name='cost' AND numeric_precision IS NULL
  ) THEN
    ALTER TABLE inventory_items ALTER COLUMN cost TYPE NUMERIC(12,4) USING cost::NUMERIC(12,4);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='inventory_items' AND column_name='sell_price' AND numeric_precision IS NULL
  ) THEN
    ALTER TABLE inventory_items ALTER COLUMN sell_price TYPE NUMERIC(12,4) USING sell_price::NUMERIC(12,4);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='inventory_stock' AND column_name='quantity' AND numeric_precision IS NULL
  ) THEN
    ALTER TABLE inventory_stock ALTER COLUMN quantity TYPE NUMERIC(12,4) USING quantity::NUMERIC(12,4);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='inventory_movements' AND column_name='unit_cost' AND numeric_precision IS NULL
  ) THEN
    ALTER TABLE inventory_movements ALTER COLUMN unit_cost TYPE NUMERIC(12,4) USING unit_cost::NUMERIC(12,4);
  END IF;

  -- Invoices & items
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='invoices' AND column_name='subtotal'
  ) THEN
    ALTER TABLE invoices
      ALTER COLUMN subtotal TYPE NUMERIC(12,4) USING subtotal::NUMERIC(12,4),
      ALTER COLUMN total_amount TYPE NUMERIC(12,4) USING total_amount::NUMERIC(12,4),
      ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='invoice_items' AND column_name='unit_price'
  ) THEN
    ALTER TABLE invoice_items
      ALTER COLUMN unit_price TYPE NUMERIC(12,4) USING unit_price::NUMERIC(12,4),
      ALTER COLUMN line_total TYPE NUMERIC(12,4) USING line_total::NUMERIC(12,4),
      ALTER COLUMN tax_rate TYPE NUMERIC(12,4) USING tax_rate::NUMERIC(12,4),
      ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  END IF;

  -- Expenses
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='expenses' AND column_name='amount'
  ) THEN
    ALTER TABLE expenses
      ALTER COLUMN amount TYPE NUMERIC(12,4) USING amount::NUMERIC(12,4),
      ALTER COLUMN tax_amount TYPE NUMERIC(12,4) USING tax_amount::NUMERIC(12,4);
  END IF;
END $$;

-- 2) Quotes compatibility view (work_orders as quotes)
CREATE OR REPLACE VIEW quotes_compat_v AS
SELECT id, company_id, customer_id, title, description, subtotal, total_amount, created_at, updated_at
FROM work_orders
WHERE stage = 'QUOTE';
COMMENT ON VIEW quotes_compat_v IS 'Compatibility view mapping work_orders (stage=QUOTE) to legacy quotes for read paths.';

-- 3) Unified settings view
CREATE OR REPLACE VIEW app_settings_v AS
SELECT bs.company_id,
       COALESCE(bs.timezone, s.timezone) AS timezone,
       COALESCE(bs.currency, s.currency) AS currency,
       COALESCE(bs.date_format, s.date_format) AS date_format,
       COALESCE(bs.time_format, s.time_format) AS time_format,
       COALESCE(cs.default_invoice_terms, s.invoice_terms) AS invoice_terms,
       COALESCE(cs.default_invoice_due_days, s.default_invoice_due_days) AS default_invoice_due_days,
       bs.send_auto_reminders,
       bs.send_quote_notifications,
       bs.send_invoice_notifications,
       bs.preferred_contact_method,
       bs.number_format,
       bs.require_customer_approval,
       bs.allow_partial_payments,
       bs.auto_generate_work_orders,
       bs.require_photo_documentation,
       bs.quality_control_enabled,
       bs.multi_location_enabled,
       bs.franchise_mode,
       bs.compliance_tracking,
       bs.safety_protocols,
       bs.custom_workflows,
       bs.created_at,
       bs.updated_at
FROM business_settings bs
LEFT JOIN company_settings cs ON cs.company_id = bs.company_id
LEFT JOIN settings s ON s.company_id = bs.company_id;
COMMENT ON VIEW app_settings_v IS 'Unified settings surface for UI. Prefer this over table-specific reads.';

-- 4) Inventory named view for REST-safe selection
CREATE OR REPLACE VIEW inventory_stock_status_named_v AS
SELECT iss.item_id,
       ii.name AS item_name,
       ii.sku,
       ii.category,
       ii.reorder_point,
       iss.location_id,
       il.name AS location_name,
       il.type AS location_type,
       iss.company_id,
       iss.on_hand,
       iss.reserved,
       iss.available,
       iss.updated_at
FROM inventory_stock_status iss
LEFT JOIN inventory_items ii ON ii.id = iss.item_id
LEFT JOIN inventory_locations il ON il.id = iss.location_id;
COMMENT ON VIEW inventory_stock_status_named_v IS 'Per-location stock with item and location names for REST-safe selection.';

-- 5) Calendar linkage to work orders
ALTER TABLE schedule_events
  ADD COLUMN IF NOT EXISTS work_order_id uuid;

-- 6) PTO: computed balances view (keep ledger as source of truth)
CREATE OR REPLACE VIEW pto_current_balances_v AS
SELECT employee_id, company_id, category_code,
       COALESCE(SUM(CASE WHEN entry_type IN ('ACCRUAL','ADJUSTMENT','CARRYOVER') THEN hours WHEN entry_type='USAGE' THEN -hours END),0) AS current_balance
FROM pto_ledger
GROUP BY employee_id, company_id, category_code;
COMMENT ON VIEW pto_current_balances_v IS 'Computed balances from pto_ledger; prefer over stored balance tables.';

-- 7) Performance indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_company_stage ON work_orders(company_id, stage);
CREATE INDEX IF NOT EXISTS idx_work_orders_customer ON work_orders(company_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_company_item ON inventory_stock(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_company_item ON inventory_movements(company_id, item_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_company_date ON expenses(company_id, date);
CREATE INDEX IF NOT EXISTS idx_schedule_events_company_time ON schedule_events(company_id, start_time);

-- Rollback notes (manual): DROP VIEW IF EXISTS quotes_compat_v, app_settings_v, inventory_stock_status_named_v, pto_current_balances_v; types can be cast back if needed (risk of precision loss).
