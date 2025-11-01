# 🔍 Backend Alignment Audit - October 28, 2025

## Executive Summary

**Status**: ⚠️ CRITICAL MISALIGNMENTS FOUND

Your instinct was correct. The backend has **significant overlaps and conflicts** that are breaking the frontend:

- ✅ **Good News**: Core tables exist (users, employees, profiles, work_orders, invoices)
- ❌ **Bad News**: Multiple overlapping settings tables, missing RPC functions, frontend doing backend JOINs
- 🔧 **Solution**: Deploy consolidation migration + update frontend to use RPC functions

---

## 📊 Database Schema Status

### ✅ Core Tables (Exist & Functional)
| Table | Columns | Status | Notes |
|-------|---------|--------|-------|
| users | 35 | ✅ | Auth + company mapping |
| employees | 29 | ✅ | Has user_id, is_schedulable, job_title, hourly_rate |
| profiles | 13 | ✅ | User preferences, timezone, language |
| companies | 55 | ✅ | Full company info |
| work_orders | 205 | ✅ | Unified pipeline (quotes/jobs/invoices) |
| invoices | 34 | ✅ | Invoice management |
| schedule_events | 16 | ✅ | Calendar events |
| employee_time_off | 16 | ✅ | PTO management |

### ❌ Missing Tables (Frontend Expects These)
- `quotes` - MISSING (use work_orders with stage='QUOTE')
- `jobs` - MISSING (use work_orders with stage='JOB')
- `employee_availability` - MISSING (need to create)
- `business_settings` - MISSING (consolidated into settings/company_settings)

### ⚠️ Overlapping Settings Tables (CRITICAL ISSUE)
**9 settings tables found** - Frontend doesn't know which to use:
1. `settings` (107 columns) - Main settings table
2. `company_settings` (118 columns) - Company-specific settings
3. `company_settings_old` - Legacy/duplicate
4. `approval_settings` - Approval workflows
5. `marketplace_settings` - Marketplace config
6. `payment_settings` - Payment config
7. `user_dashboard_settings` - User preferences
8. `work_settings` - Work-related settings
9. `settings_old` - Legacy

**Problem**: Frontend doesn't know which table to query for what data.

### ⚠️ Overlapping User Tables (ISSUE)
**7 user-related tables** - Potential data duplication:
1. `users` - Auth + company mapping
2. `profiles` - User preferences
3. `user_profiles` - Duplicate?
4. `user_activity_log` - Activity tracking
5. `user_dashboard_settings` - Dashboard prefs
6. `user_devices` - Device tracking
7. `user_sessions` - Session management

---

## 🔴 Critical Issues

### Issue #1: Frontend Doing Backend JOINs
**Problem**: Calendar.js, Scheduling.js doing:
```javascript
const employees = await dal.query('employees')
  .select('id,user_id,job_title,is_schedulable,users(...)')
  .where('is_schedulable', true)
```

**Why It's Wrong**: 
- Frontend shouldn't do JOINs (security risk)
- Backend should provide pre-joined data via RPC
- Causes N+1 query problems

**Solution**: Create RPC functions for all queries

### Issue #2: Settings Table Confusion
**Problem**: 9 different settings tables with overlapping data

**Why It's Wrong**:
- Frontend doesn't know which table to query
- Data duplication across tables
- Inconsistent updates

**Solution**: Consolidate to 2 tables: `settings` (global) + `company_settings` (per-company)

### Issue #3: Missing RPC Functions
**Problem**: 0 RPC functions found (should have 10+)

**Why It's Wrong**:
- Frontend must query tables directly (security issue)
- No business logic in backend
- Hard to maintain

**Solution**: Create RPC functions for all common queries

---

## ✅ What's Already Fixed

The `CONSOLIDATION_MIGRATION_COMPLETE.sql` file already has:
- ✅ Add missing columns to employees table
- ✅ Create 3 RPC functions (get_schedulable_employees, get_all_employees, get_employee_by_id)
- ✅ Create performance indexes
- ✅ Migrate data from users to employees

---

## 🎯 Next Steps

### Step 1: Deploy Database Migration (5 min)
Apply `CONSOLIDATION_MIGRATION_COMPLETE.sql` to Supabase

### Step 2: Update Frontend (30-45 min)
Update 4 files to use RPC functions:
- `src/pages/Calendar.js`
- `src/pages/Scheduling.js`
- `src/components/SmartSchedulingAssistant.js`
- `src/components/JobsDatabasePanel.js`

### Step 3: Test & Deploy (10 min)
Run UI tests, commit, push to main

---

## 📋 Files to Deploy

1. **CONSOLIDATION_MIGRATION_COMPLETE.sql** - Database migration
2. **FRONTEND_UPDATES_QUICK_REFERENCE.md** - Frontend changes
3. **Updated component files** - Use RPC instead of direct queries

---

**Status**: Ready to proceed with Phase 2 (Alignment Report) and Phase 3 (Deploy)

