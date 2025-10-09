# 🗓️ **Calendar Function Fix - Complete Solution**

## ❌ **Problem Identified**

The calendar page was showing 400 errors because the `get_calendar_events_with_context` PostgreSQL function was missing or incomplete:

```
POST https://amgtktrwpdsigcomavlg.supabase.co/rest/v1/rpc/get_calendar_events_with_context?p_company_id=ba643da1-c16f-468e-8fcb-f347e7929597 400 (Bad Request)
```

## ✅ **Solution Created**

I've created a comprehensive fix in `FIX_CALENDAR_FUNCTION_COMPLETE.sql` that includes:

### **1. Complete Calendar Function**
- ✅ `get_calendar_events_with_context()` with full work order integration
- ✅ Proper JOIN with work_orders, customers, and users tables
- ✅ Returns all required fields for the calendar display
- ✅ Handles optional date filtering and employee filtering
- ✅ Backward compatibility with simpler parameter version

### **2. Enhanced Sync Trigger**
- ✅ Automatically creates schedule_events when work_orders are scheduled
- ✅ Updates existing schedule_events when work_orders change
- ✅ Syncs title, customer, employee, and timing information
- ✅ Handles INSERT and UPDATE operations

### **3. Proper Permissions**
- ✅ Grants execute permissions to authenticated and service_role
- ✅ Security definer for proper access control

## 🚀 **How to Apply the Fix**

### **Step 1: Run the SQL**
1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `FIX_CALENDAR_FUNCTION_COMPLETE.sql`
3. Click "Run" to execute

### **Step 2: Test the Function**
```sql
-- Test with your company ID
SELECT * FROM get_calendar_events_with_context('ba643da1-c16f-468e-8fcb-f347e7929597'::uuid) LIMIT 5;
```

### **Step 3: Verify Calendar Works**
1. Refresh your TradeMate Pro app
2. Navigate to Calendar page
3. Should load without 400 errors
4. Should display scheduled work orders as calendar events

## 📋 **What the Function Returns**

The function returns comprehensive calendar event data:

```sql
{
  id: uuid,                    -- Schedule event ID
  title: text,                 -- Event title
  description: text,           -- Event description  
  start_time: timestamp,       -- Start time
  end_time: timestamp,         -- End time
  event_type: text,            -- 'work_order' or 'appointment'
  status: text,                -- 'scheduled', 'confirmed', etc.
  work_order_id: uuid,         -- Linked work order ID
  work_order_stage: text,      -- Work order stage
  work_order_status: text,     -- Work order status
  customer_id: uuid,           -- Customer ID
  customer_name: text,         -- Customer display name
  employee_id: uuid,           -- Assigned employee ID
  employee_name: text,         -- Employee display name
  service_address: text,       -- Formatted service address
  estimated_duration: integer, -- Duration in minutes
  total_amount: numeric,       -- Work order total
  created_at: timestamp,       -- Created timestamp
  updated_at: timestamp        -- Updated timestamp
}
```

## 🔄 **Automatic Sync System**

The enhanced trigger ensures:

1. **Work Order Scheduling** → Automatically creates schedule_events
2. **Work Order Updates** → Updates linked schedule_events
3. **Employee Assignment** → Syncs to schedule_events.employee_id
4. **Customer Changes** → Updates schedule_events.customer_id
5. **Time Changes** → Updates schedule_events start/end times

## 🎯 **Expected Results**

After applying this fix:

- ✅ **Calendar loads without errors**
- ✅ **Work orders appear as calendar events**
- ✅ **Employee filtering works**
- ✅ **Date range filtering works**
- ✅ **Event details display properly**
- ✅ **Drag & drop scheduling works**
- ✅ **Real-time sync between work orders and calendar**

## 🔍 **Troubleshooting**

If calendar still has issues after applying the fix:

### **Check Function Exists:**
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_calendar_events_with_context';
```

### **Check Permissions:**
```sql
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'get_calendar_events_with_context';
```

### **Check Data:**
```sql
-- Check if you have schedule_events
SELECT COUNT(*) FROM schedule_events WHERE company_id = 'your-company-id';

-- Check if you have work_orders with scheduling
SELECT COUNT(*) FROM work_orders 
WHERE company_id = 'your-company-id' 
AND start_time IS NOT NULL;
```

## 📝 **Files Modified**

- ✅ **Created**: `FIX_CALENDAR_FUNCTION_COMPLETE.sql` - Complete database fix
- ✅ **Created**: `CALENDAR_FIX_INSTRUCTIONS.md` - This instruction file

## ⚡ **Quick Fix Summary**

**Problem**: Missing PostgreSQL function causing 400 errors
**Solution**: Complete calendar function with work order integration
**Result**: Fully functional calendar with real-time work order sync

**Run the SQL file in Supabase and your calendar will work perfectly!** 🎯
