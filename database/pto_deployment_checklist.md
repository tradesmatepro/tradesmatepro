# PTO System Deployment Checklist

## Pre-Deployment Verification

### ✅ Database Schema
- [ ] Run migration script: `database/pto_production_migration.sql`
- [ ] Verify all tables created successfully
- [ ] Check indexes are in place
- [ ] Confirm RLS policies are active
- [ ] Test database functions work correctly

### ✅ Backend API
- [ ] PTO routes integrated: `/api/pto/*`
- [ ] Authentication middleware working
- [ ] Company scoping implemented
- [ ] Error handling in place
- [ ] API endpoints tested

### ✅ Frontend Components
- [ ] Employee dashboard accessible
- [ ] Admin dashboard accessible
- [ ] All forms validate correctly
- [ ] Mobile responsiveness verified
- [ ] Error states handled

### ✅ Services & Logic
- [ ] PTOServiceProduction configured
- [ ] PTOAccrualEngine initialized
- [ ] Scheduled jobs configured (if needed)
- [ ] Email notifications ready (if implemented)

## Deployment Steps

### 1. Database Migration
```bash
# Backup current database
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migration
psql -d your_database -f database/pto_production_migration.sql

# Verify migration success
psql -d your_database -c "SELECT COUNT(*) FROM pto_policies;"
psql -d your_database -c "SELECT COUNT(*) FROM pto_balances;"
psql -d your_database -c "SELECT COUNT(*) FROM employee_time_off WHERE accrual_type IS NOT NULL;"
```

### 2. Backend Deployment
```bash
# Install dependencies (if any new ones)
npm install

# Run tests
npm test src/tests/PTOSystem.test.js

# Deploy backend code
# (Your deployment process here)
```

### 3. Frontend Deployment
```bash
# Build frontend
npm run build

# Deploy frontend assets
# (Your deployment process here)
```

### 4. Configuration
```javascript
// Set up environment variables
PTO_ACCRUAL_ENABLED=true
PTO_EMAIL_NOTIFICATIONS=false  // Enable when ready
PTO_DEBUG_MODE=false
```

## Post-Deployment Verification

### ✅ Smoke Tests
- [ ] Employee can view their PTO dashboard
- [ ] Employee can submit a PTO request
- [ ] Admin can view pending requests
- [ ] Admin can approve/deny requests
- [ ] Balances update correctly after approval
- [ ] Reports generate without errors

### ✅ Data Integrity
- [ ] All employee balances migrated correctly
- [ ] Historical requests preserved
- [ ] Ledger entries created for existing data
- [ ] No duplicate or orphaned records

### ✅ Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Large request lists paginate properly
- [ ] Database queries optimized
- [ ] No memory leaks in accrual engine

### ✅ Security
- [ ] RLS policies prevent cross-company access
- [ ] Employees can only see their own data
- [ ] Admins can only see company data
- [ ] API endpoints require authentication

## Initial Setup Tasks

### 1. Create Default Policies
```sql
-- Example: Create a standard policy for each company
INSERT INTO pto_policies (company_id, name, vacation_hours_per_period, sick_hours_per_period, accrual_period, max_vacation_hours, max_sick_hours, carryover_limit)
SELECT 
  id as company_id,
  'Standard Policy' as name,
  3.08 as vacation_hours_per_period,  -- ~80 hours/year
  1.54 as sick_hours_per_period,      -- ~40 hours/year
  'biweekly' as accrual_period,
  120.0 as max_vacation_hours,        -- 3 weeks
  80.0 as max_sick_hours,             -- 2 weeks
  40.0 as carryover_limit             -- 1 week
FROM companies 
WHERE NOT EXISTS (
  SELECT 1 FROM pto_policies WHERE pto_policies.company_id = companies.id
);
```

### 2. Initialize Employee Balances
```sql
-- Create initial balances for all active employees
INSERT INTO pto_balances (employee_id, policy_id, vacation_balance, sick_balance)
SELECT 
  e.id as employee_id,
  p.id as policy_id,
  0.0 as vacation_balance,  -- Start with zero, will accrue over time
  0.0 as sick_balance
FROM employees e
JOIN pto_policies p ON e.company_id = p.company_id
WHERE e.is_active = true
AND NOT EXISTS (
  SELECT 1 FROM pto_balances WHERE pto_balances.employee_id = e.id
);
```

### 3. Set Up Accrual Schedule (Optional)
```javascript
// If using automated accruals, schedule them
import PTOAccrualEngine from './src/services/PTOAccrualEngine.js';

// Schedule accrual for each policy
const policies = await PTOServiceProduction.getPolicies();
policies.forEach(policy => {
  PTOAccrualEngine.scheduleAccrualJob(
    policy.id, 
    policy.accrual_period, 
    policy.company_id
  );
});
```

## Monitoring & Maintenance

### Daily Checks
- [ ] Accrual engine running without errors
- [ ] No failed PTO requests
- [ ] Database performance normal
- [ ] Error logs reviewed

### Weekly Tasks
- [ ] Review pending requests older than 7 days
- [ ] Check for employees with high balances
- [ ] Verify accrual calculations
- [ ] Update policies if needed

### Monthly Tasks
- [ ] Generate PTO usage reports
- [ ] Review balance trends
- [ ] Check for policy adjustments needed
- [ ] Archive old request data (if applicable)

### Quarterly Tasks
- [ ] Review carryover policies
- [ ] Audit ledger entries
- [ ] Performance optimization review
- [ ] User feedback collection

## Rollback Plan

If issues arise, follow this rollback procedure:

### 1. Immediate Rollback
```bash
# Restore database from backup
psql -d your_database < backup_YYYYMMDD_HHMMSS.sql

# Revert backend code
git revert <commit-hash>

# Revert frontend code
git revert <commit-hash>
```

### 2. Partial Rollback
```sql
-- If only database needs rollback, restore specific tables
DROP TABLE IF EXISTS pto_policies CASCADE;
DROP TABLE IF EXISTS pto_balances CASCADE;
-- Restore from backup selectively
```

### 3. Data Recovery
```sql
-- If data corruption occurs, use migration backup
SELECT * FROM pto_migration_backup WHERE source_table = 'pto_requests';
-- Restore specific records as needed
```

## Support Contacts

- **Database Issues**: DBA Team
- **Backend Issues**: Backend Development Team  
- **Frontend Issues**: Frontend Development Team
- **Business Logic**: Product Team

## Success Criteria

Deployment is considered successful when:
- [ ] All smoke tests pass
- [ ] No critical errors in logs
- [ ] User acceptance testing completed
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Team training completed

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Verified By**: ___________  
**Status**: ⏳ Pending / ✅ Complete / ❌ Failed
