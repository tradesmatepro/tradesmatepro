# 🚀 Quick Reference: RPC Functions

## Employee Functions

### get_schedulable_employees(p_company_id)
**Purpose**: Get all employees available for scheduling
**Used By**: Calendar, Scheduling, SmartSchedulingAssistant, JobsDatabasePanel
**Returns**: Array of employees with user data joined
```javascript
const { data, error } = await supabase.rpc('get_schedulable_employees', {
  p_company_id: user.company_id
});
```

### get_all_employees(p_company_id)
**Purpose**: Get all employees (including non-schedulable)
**Used By**: Employee management pages
**Returns**: Array of all employees
```javascript
const { data, error } = await supabase.rpc('get_all_employees', {
  p_company_id: user.company_id
});
```

### update_employee_schedulable(p_employee_id, p_is_schedulable)
**Purpose**: Toggle employee schedulable status
**Used By**: Employee settings
**Returns**: Updated employee record
```javascript
const { data, error } = await supabase.rpc('update_employee_schedulable', {
  p_employee_id: employee_id,
  p_is_schedulable: true
});
```

---

## Work Order Functions

### get_unscheduled_work_orders(p_company_id)
**Purpose**: Get work orders without scheduled times (backlog)
**Used By**: Calendar backlog
**Returns**: Array of unscheduled work orders
```javascript
const { data, error } = await supabase.rpc('get_unscheduled_work_orders', {
  p_company_id: user.company_id
});
```

### get_work_orders_by_status(p_company_id, p_statuses)
**Purpose**: Get work orders filtered by status
**Used By**: WorkOrders page
**Returns**: Array of work orders with customer/user data
```javascript
const { data, error } = await supabase.rpc('get_work_orders_by_status', {
  p_company_id: user.company_id,
  p_statuses: ['approved', 'scheduled', 'in_progress', 'completed', 'invoiced', 'paid']
});
```

### get_work_orders_with_crew(p_company_id, p_status)
**Purpose**: Get work orders with assigned crew
**Used By**: Crew assignment pages
**Returns**: Array of work orders with crew data
```javascript
const { data, error } = await supabase.rpc('get_work_orders_with_crew', {
  p_company_id: user.company_id,
  p_status: 'scheduled'
});
```

### get_work_orders_for_calendar(p_company_id, p_start_date, p_end_date, p_employee_id)
**Purpose**: Get work orders for calendar view
**Used By**: Calendar component
**Returns**: Array of work orders for date range
```javascript
const { data, error } = await supabase.rpc('get_work_orders_for_calendar', {
  p_company_id: user.company_id,
  p_start_date: '2025-10-28',
  p_end_date: '2025-11-28',
  p_employee_id: null  // null = all employees
});
```

---

## Customer Functions

### get_customers_with_work_order_count(p_company_id)
**Purpose**: Get customers with count of their work orders
**Used By**: Customer list pages
**Returns**: Array of customers with work order counts
```javascript
const { data, error } = await supabase.rpc('get_customers_with_work_order_count', {
  p_company_id: user.company_id
});
```

---

## Error Handling Pattern

All RPC calls should follow this pattern:

```javascript
const supabase = getSupabaseClient();
const { data, error } = await supabase.rpc('function_name', {
  p_company_id: user.company_id,
  // other parameters...
});

if (error) {
  console.error('❌ Error:', error);
  // Handle error
  return;
}

console.log('✅ Data:', data);
// Use data
```

---

## Import Pattern

All components using RPC functions should import:

```javascript
import { getSupabaseClient } from '../utils/supabaseClient';
```

Then use:

```javascript
const supabase = getSupabaseClient();
const { data, error } = await supabase.rpc('function_name', { /* params */ });
```

---

## Components Using RPC Functions

| Component | Functions Used |
|-----------|-----------------|
| Calendar.js | get_schedulable_employees, get_unscheduled_work_orders |
| SmartSchedulingAssistant.js | get_schedulable_employees |
| Scheduling.js | get_schedulable_employees |
| JobsDatabasePanel.js | get_schedulable_employees |
| WorkOrders.js | get_work_orders_by_status |

---

## Status Values

Valid status values for work orders:
- `approved` - Quote approved, not yet scheduled
- `scheduled` - Scheduled but not started
- `in_progress` - Currently being worked on
- `on_hold` - Paused
- `needs_rescheduling` - Needs to be rescheduled
- `completed` - Work done, ready to invoice
- `invoiced` - Invoice sent
- `paid` - Payment received
- `closed` - Fully completed

---

## Performance Tips

1. **Use RPC functions** instead of direct table queries
2. **Filter at database level** not in frontend
3. **Use date ranges** for calendar queries
4. **Cache results** when appropriate
5. **Avoid N+1 queries** by using RPC functions

---

## Troubleshooting

### RPC function not found
- Check function name spelling
- Verify function is deployed to Supabase
- Check Supabase logs for errors

### No data returned
- Check company_id is correct
- Check parameters are correct
- Check RLS policies allow access

### Slow performance
- Check database indexes
- Check query complexity
- Use date ranges for large datasets

---

**Last Updated**: 2025-10-28
**Status**: ✅ All RPC functions deployed and working

