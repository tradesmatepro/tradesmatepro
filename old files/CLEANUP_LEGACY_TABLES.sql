-- ============================================================================
-- LEGACY TABLE CLEANUP - TradeMate Pro Database Optimization
-- ============================================================================
-- CRITICAL: BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT
-- This script removes 80+ unused/legacy tables identified in the audit
-- ============================================================================

-- Phase 1: Remove Backup/Archive Tables (100% Safe)
-- These are clearly timestamped backup tables
DROP TABLE IF EXISTS pto_categories_backup_archive_202509 CASCADE;
DROP TABLE IF EXISTS pto_requests_backup_archive_202509 CASCADE;
DROP TABLE IF EXISTS pto_transactions_archive_202509 CASCADE;
DROP TABLE IF EXISTS marketplace_response_status_enum_backup CASCADE;

-- Phase 2: Remove Deprecated Quote System (Confirmed Legacy)
-- DatabaseSetupService.js explicitly marks these as DEPRECATED
-- Comments state: "Use work_orders with stage=QUOTE instead"
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS quote_items CASCADE;
DROP TABLE IF EXISTS jobs CASCADE; -- Legacy jobs table, use work_orders

-- Phase 3: Remove Development/Testing Artifacts
DROP TABLE IF EXISTS auto_patches CASCADE;
DROP TABLE IF EXISTS closed_jobs CASCADE;
DROP TABLE IF EXISTS jobs_with_payment_status CASCADE;
DROP TABLE IF EXISTS work_orders_history CASCADE;
DROP TABLE IF EXISTS wo_audit CASCADE; -- Duplicate of work_order_audit

-- Phase 4: Remove Unused HR/Employee Features (No Code References)
DROP TABLE IF EXISTS employee_certifications CASCADE;
DROP TABLE IF EXISTS employee_compensation CASCADE;
DROP TABLE IF EXISTS employee_development_goals CASCADE;
DROP TABLE IF EXISTS employee_performance_reviews CASCADE;
DROP TABLE IF EXISTS employee_recognition CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS employee_time_summary CASCADE;

-- Phase 5: Remove Unused Business Features (No Code References)
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS recurring_jobs CASCADE;
DROP TABLE IF EXISTS route_optimizations CASCADE;
DROP TABLE IF EXISTS sales_activities CASCADE;
DROP TABLE IF EXISTS sales_performance CASCADE;
DROP TABLE IF EXISTS sales_rep_commission_summary CASCADE;
DROP TABLE IF EXISTS sales_targets CASCADE;

-- Phase 6: Remove Unused Configuration Tables (No Code References)
DROP TABLE IF EXISTS auto_accept_rules CASCADE;
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS company_approval_settings CASCADE;
DROP TABLE IF EXISTS company_service_tags CASCADE;
DROP TABLE IF EXISTS company_tags CASCADE;
DROP TABLE IF EXISTS decline_reason_codes CASCADE;
DROP TABLE IF EXISTS default_expense_categories CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS rates_pricing_settings CASCADE;
DROP TABLE IF EXISTS ui_preferences CASCADE;
DROP TABLE IF EXISTS user_dashboard_settings CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;

-- Phase 7: Remove Unused Customer Features (No Code References)
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customer_communications CASCADE;
DROP TABLE IF EXISTS customer_service_agreements CASCADE;
DROP TABLE IF EXISTS customer_signatures CASCADE;
DROP TABLE IF EXISTS customer_tags CASCADE;
DROP TABLE IF EXISTS customers_status_history CASCADE;
DROP TABLE IF EXISTS contractor_ratings CASCADE;
DROP TABLE IF EXISTS preferred_relationships CASCADE;

-- Phase 8: Remove Unused Document Features (No Code References)
DROP TABLE IF EXISTS document_access_log CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS document_workflows CASCADE;
DROP TABLE IF EXISTS signature_requests CASCADE;
DROP TABLE IF EXISTS shared_document_templates CASCADE;

-- Phase 9: Remove Unused Financial Features (No Code References)
DROP TABLE IF EXISTS expense_categories CASCADE;
DROP TABLE IF EXISTS expense_reimbursements CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS invoice_commissions CASCADE;
DROP TABLE IF EXISTS invoice_payments CASCADE;
DROP TABLE IF EXISTS reimbursement_requests CASCADE;

-- Phase 10: Remove Advanced Inventory Features (No UI Implementation)
DROP TABLE IF EXISTS inventory_batches CASCADE;
DROP TABLE IF EXISTS inventory_cycle_counts CASCADE;
DROP TABLE IF EXISTS inventory_cycle_count_items CASCADE;
DROP TABLE IF EXISTS inventory_scan_log CASCADE;
DROP TABLE IF EXISTS inventory_serial_numbers CASCADE;
DROP TABLE IF EXISTS inventory_stock_status CASCADE;

-- Phase 11: Remove Advanced PO Features (No UI Implementation)
DROP TABLE IF EXISTS po_approval_actions CASCADE;
DROP TABLE IF EXISTS po_approval_rules CASCADE;
DROP TABLE IF EXISTS po_approval_workflows CASCADE;
DROP TABLE IF EXISTS po_approvals CASCADE;
DROP TABLE IF EXISTS po_status_history CASCADE;

-- Phase 12: Remove Unused Vendor Features (No Active Usage)
DROP TABLE IF EXISTS vendor_categories CASCADE;
DROP TABLE IF EXISTS vendor_category_assignments CASCADE;
DROP TABLE IF EXISTS vendor_contacts CASCADE;
DROP TABLE IF EXISTS vendor_items CASCADE;
DROP TABLE IF EXISTS vendor_pricing_history CASCADE;
DROP TABLE IF EXISTS vendors_status_history CASCADE;

-- Phase 13: Remove Unused Integration Features (No Code References)
DROP TABLE IF EXISTS integration_settings CASCADE;
DROP TABLE IF EXISTS integration_tokens CASCADE;

-- Phase 14: Remove Unused Job/Work Order Features (No Code References)
DROP TABLE IF EXISTS job_assignments CASCADE;
DROP TABLE IF EXISTS job_photos CASCADE;
DROP TABLE IF EXISTS job_triggers CASCADE;
DROP TABLE IF EXISTS work_order_assignments CASCADE;
DROP TABLE IF EXISTS work_order_audit CASCADE;
DROP TABLE IF EXISTS work_order_audit_log CASCADE;
DROP TABLE IF EXISTS work_order_labor CASCADE; -- Only 1 reference found
DROP TABLE IF EXISTS work_order_milestones CASCADE;
DROP TABLE IF EXISTS work_order_versions CASCADE;
DROP TABLE IF EXISTS workflow_approvals CASCADE;

-- Phase 15: Remove Unused Marketplace Features (No Code References)
DROP TABLE IF EXISTS marketplace_cancellations CASCADE;
DROP TABLE IF EXISTS marketplace_notifications CASCADE;
DROP TABLE IF EXISTS marketplace_request_decline_stats CASCADE;
DROP TABLE IF EXISTS marketplace_request_roles CASCADE;
DROP TABLE IF EXISTS marketplace_request_tags CASCADE;

-- Phase 16: Remove Unused Quote/Tool Features (No Code References)
DROP TABLE IF EXISTS quote_analytics CASCADE;
DROP TABLE IF EXISTS quote_approval_workflows CASCADE;
DROP TABLE IF EXISTS quote_follow_ups CASCADE;
DROP TABLE IF EXISTS quote_templates CASCADE;
DROP TABLE IF EXISTS quote_tool_access CASCADE;
DROP TABLE IF EXISTS quote_tool_tiers CASCADE;
DROP TABLE IF EXISTS quote_tool_usage CASCADE;
DROP TABLE IF EXISTS quote_tools CASCADE;
DROP TABLE IF EXISTS tool_preferences CASCADE;
DROP TABLE IF EXISTS tool_usage CASCADE;

-- Phase 17: Remove Unused Service Features (No Code References)
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS service_contracts CASCADE;
DROP TABLE IF EXISTS service_request_responses CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS service_tags CASCADE;

-- Phase 18: Remove Unused Subcontractor Features (No Code References)
DROP TABLE IF EXISTS subcontractor_documents CASCADE;
DROP TABLE IF EXISTS subcontractor_timesheets CASCADE;
DROP TABLE IF EXISTS subcontractor_work_orders CASCADE;
DROP TABLE IF EXISTS subcontractors CASCADE;

-- Phase 19: Remove Unused Location/Tracking Features (No Code References)
DROP TABLE IF EXISTS technician_locations CASCADE;

-- Phase 20: Remove Unused Catalog Features (No Code References)
DROP TABLE IF EXISTS items_catalog CASCADE;

-- Phase 21: Remove Unused Notification Features (No Code References)
DROP TABLE IF EXISTS notifications CASCADE;

-- Phase 22: Remove Unused E-signature Features (No Code References)
DROP TABLE IF EXISTS esignatures CASCADE;

-- Phase 23: Drop unused views (if they reference deleted tables)
DROP VIEW IF EXISTS vendor_catalog_v CASCADE;
DROP VIEW IF EXISTS work_order_crew_v CASCADE;

-- ============================================================================
-- VERIFICATION QUERIES - Run these after cleanup to verify success
-- ============================================================================

-- Count remaining tables (should be ~35-40)
SELECT COUNT(*) as remaining_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- List remaining tables for verification
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- EXPECTED REMAINING CORE TABLES (~35-40 tables)
-- ============================================================================
/*
attachments                    -- ✅ File management
companies                     -- ✅ Core business
company_customers             -- ✅ Customer relationships  
company_document_templates    -- ✅ Document templates
company_settings              -- ✅ Company configuration
customer_portal_accounts      -- ✅ Portal authentication
customer_reviews              -- ✅ Review system
customers                     -- ✅ Customer management
documents                     -- ✅ Document management
document_templates            -- ✅ Document templates
employees                     -- ✅ HR management
employee_timesheets          -- ✅ Time tracking
employee_time_off            -- ✅ PTO requests
employee_pto_balances        -- ✅ PTO balances
inventory_items              -- ✅ Inventory catalog
inventory_locations          -- ✅ Location tracking
inventory_movements          -- ✅ Movement history
inventory_stock              -- ✅ Stock levels
inventory_item_summary       -- ✅ Inventory summary
invoices                     -- ✅ Billing system
invoice_items                -- ✅ Invoice line items
marketplace_requests         -- ✅ Service requests
marketplace_responses        -- ✅ Contractor responses
marketplace_reviews          -- ✅ Review system
messages                     -- ✅ Communication
payments                     -- ✅ Payment tracking
po_items                     -- ✅ PO line items
pto_current_balances         -- ✅ Current PTO balances
pto_ledger                   -- ✅ PTO transaction history
pto_policies                 -- ✅ PTO rules
purchase_orders              -- ✅ Purchase orders
request_tags                 -- ✅ Tagging system
schedule_events              -- ✅ Calendar system
settings                     -- ✅ App configuration
tags                         -- ✅ Tag management
users                        -- ✅ Authentication
vendors                      -- ✅ Vendor management
work_orders                  -- ✅ Unified work system
work_order_items             -- ✅ Work order line items
*/
