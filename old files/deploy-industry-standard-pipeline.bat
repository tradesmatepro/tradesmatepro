@echo off
echo ============================================================================
echo DEPLOYING INDUSTRY STANDARD PIPELINE
echo ============================================================================
echo.
echo This will:
echo   1. Add missing status enum values (sent, rejected, paid, closed)
echo   2. Add 12 new timestamp columns to work_orders
echo   3. Create 8 new tables for delivery tracking, change orders, feedback
echo   4. Create helper functions and triggers
echo.
echo Press Ctrl+C to cancel, or
pause

echo.
echo [1/3] Connecting to Supabase...
node execute-sql.js COMPLETE_INDUSTRY_STANDARD_MIGRATION.sql

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ============================================================================
  echo ✅ DEPLOYMENT SUCCESSFUL!
  echo ============================================================================
  echo.
  echo New Status Values:
  echo   - sent       (quote/invoice sent to customer)
  echo   - rejected   (customer rejected quote)
  echo   - paid       (invoice paid)
  echo   - closed     (job closed and archived)
  echo.
  echo New Tables Created:
  echo   - quote_deliveries          (track quote delivery and views)
  echo   - invoice_deliveries        (track invoice delivery and views)
  echo   - payment_deliveries        (track receipt delivery)
  echo   - quote_responses           (track customer accept/reject)
  echo   - change_orders             (change order management)
  echo   - change_order_items        (change order line items)
  echo   - job_completion_checklist  (completion requirements)
  echo   - customer_feedback         (reviews and ratings)
  echo.
  echo New Columns in work_orders:
  echo   - quote_sent_at, quote_viewed_at, quote_expires_at
  echo   - quote_accepted_at, quote_rejected_at, quote_rejection_reason
  echo   - has_change_orders, change_orders_total
  echo   - invoice_sent_at, invoice_viewed_at
  echo   - paid_at, closed_at
  echo.
  echo ============================================================================
  echo NEXT STEPS:
  echo ============================================================================
  echo.
  echo 1. Fix Frontend Code:
  echo    - Remove all 'stage' column references
  echo    - Use new status values (sent, rejected, paid, closed)
  echo    - Fix quote to job conversion (update instead of duplicate)
  echo.
  echo 2. Build Change Order UI:
  echo    - Create change order form
  echo    - Add approval workflow
  echo    - Show change orders on work order detail page
  echo.
  echo 3. Build Delivery Tracking UI:
  echo    - Show delivery history on quotes/invoices
  echo    - Track when customer views documents
  echo    - Add follow-up reminders
  echo.
  echo 4. Build Customer Portal Features:
  echo    - Quote acceptance/rejection form
  echo    - Change request form
  echo    - Digital signature capture
  echo.
  echo See FRONTEND_IMPLEMENTATION_GUIDE.md for detailed instructions.
  echo ============================================================================
) else (
  echo.
  echo ============================================================================
  echo ❌ DEPLOYMENT FAILED
  echo ============================================================================
  echo.
  echo Check the error message above.
  echo Common issues:
  echo   - Supabase credentials not configured
  echo   - execute-sql.js not found
  echo   - Network connection issues
  echo.
  echo Try running manually:
  echo   node execute-sql.js COMPLETE_INDUSTRY_STANDARD_MIGRATION.sql
  echo ============================================================================
)

echo.
pause

