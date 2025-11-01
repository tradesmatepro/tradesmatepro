/**
 * DEPLOY QUOTE APPROVAL NOTIFICATIONS
 * 
 * Updates the notification trigger to send notifications to owner/managers
 * when a quote is approved by a customer via the portal.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cxlqzejzraczumqmsrcx.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bHF6ZWp6cmFjenVtcW1zcmN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyOTU0MzI2NCwiZXhwIjoyMDQ1MTE5MjY0fQ.sb_secret_hPS1mDFURu9aQulTRNE7EQ_zczVFhxR';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const SQL = `
-- Update notification trigger to include quote approvals
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
        
        -- Notify managers/owners when quote is approved
        IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
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
                'Quote Approved! 🎉',
                'Quote ' || NEW.work_order_number || ' was approved by the customer',
                json_build_object(
                    'work_order_id', NEW.id,
                    'quote_number', NEW.work_order_number,
                    'total_amount', NEW.total_amount,
                    'customer_id', NEW.customer_id
                )::jsonb
            FROM users u
            WHERE u.company_id = NEW.company_id 
              AND u.role IN ('manager', 'admin', 'owner');
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
`;

async function deploy() {
  console.log('\n🚀 DEPLOYING QUOTE APPROVAL NOTIFICATIONS');
  console.log('='.repeat(80));

  try {
    console.log('\n📝 Updating notification trigger...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: SQL });

    if (error) {
      // Try direct execution if exec_sql doesn't exist
      console.log('   ℹ️  exec_sql not available, trying direct execution...');
      const { error: directError } = await supabase.from('_sql').insert({ query: SQL });
      
      if (directError) {
        throw directError;
      }
    }

    console.log('   ✅ Trigger updated successfully!');

    console.log('\n📋 What Changed:');
    console.log('   • Added quote approval notification case');
    console.log('   • Notifications sent to: manager, admin, owner roles');
    console.log('   • Notification title: "Quote Approved! 🎉"');
    console.log('   • Includes: quote number, total amount, customer ID');

    console.log('\n🧪 Test Instructions:');
    console.log('   1. Approve a quote via customer portal');
    console.log('   2. Check notification bell in React app');
    console.log('   3. Should see "Quote Approved! 🎉" notification');
    console.log('   4. Notification should appear for owner/manager/admin users');

    console.log('\n✅ DEPLOYMENT COMPLETE!');

  } catch (error) {
    console.error('\n❌ DEPLOYMENT FAILED:', error.message);
    console.error('\n📝 Manual Deployment Required:');
    console.error('   1. Go to Supabase SQL Editor');
    console.error('   2. Copy the SQL from deploy/phase1/triggers.sql (lines 271-357)');
    console.error('   3. Execute the SQL manually');
    process.exit(1);
  }
}

deploy();

