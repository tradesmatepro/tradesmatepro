# Production PTO System Documentation

## Overview

The TradeMate Pro PTO (Paid Time Off) system is a comprehensive, production-ready solution for managing employee time off requests, balances, and policies. It includes automated accrual processing, approval workflows, and detailed reporting capabilities.

## 🎯 Key Features

### ✅ **Schema Cleanup & Migration**
- Migrated data from `pto_requests` to `employee_time_off`
- Dropped duplicate `pto_requests` table
- Replaced `pto_categories` with ENUM constraints
- Fixed `pto_balances` schema with vacation/sick split
- Added comprehensive ledger logging

### ✅ **Automated Accrual Engine**
- Scheduled accrual processing (weekly, biweekly, monthly)
- Enforces maximum balances and carryover limits
- Complete audit trail via `pto_ledger`
- Payroll integration support
- Year-end carryover processing

### ✅ **Approval Workflow**
- Request submission with balance validation
- Admin approval/denial with notes
- Automatic balance deduction on approval
- Email notifications (ready for integration)
- Request history and status tracking

### ✅ **Employee Self-Service Portal**
- Balance overview with progress bars
- Request submission form with validation
- Request history and status tracking
- Business days calculation
- Mobile-responsive design

### ✅ **Admin Management Interface**
- Policy management (create, edit, configure)
- Request approval dashboard
- Employee balance overview and adjustments
- Comprehensive reporting and analytics
- Manual accrual processing

## 📊 Database Schema

### Core Tables

#### `pto_policies`
```sql
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key)
- name (TEXT) -- "Standard", "Senior", etc.
- vacation_hours_per_period (NUMERIC)
- sick_hours_per_period (NUMERIC)
- accrual_period (TEXT) -- 'weekly', 'biweekly', 'monthly'
- max_vacation_hours (NUMERIC)
- max_sick_hours (NUMERIC)
- carryover_limit (NUMERIC)
- created_at (TIMESTAMPTZ)
```

#### `pto_balances`
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key)
- policy_id (UUID, Foreign Key)
- vacation_balance (NUMERIC)
- sick_balance (NUMERIC)
- last_accrual (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

#### `employee_time_off`
```sql
- id (UUID, Primary Key)
- company_id (UUID, Foreign Key)
- employee_id (UUID, Foreign Key)
- policy_id (UUID, Foreign Key)
- accrual_type (TEXT) -- ENUM: 'vacation', 'sick', 'personal', 'bereavement', 'other'
- starts_at (TIMESTAMPTZ)
- ends_at (TIMESTAMPTZ)
- hours_requested (NUMERIC)
- hours_approved (NUMERIC)
- status (TEXT) -- 'PENDING', 'APPROVED', 'DENIED', 'CANCELLED'
- note (TEXT)
- denial_reason (TEXT)
- created_by (UUID)
- approved_by (UUID)
- created_at (TIMESTAMPTZ)
- approved_at (TIMESTAMPTZ)
- denied_at (TIMESTAMPTZ)
```

#### `pto_ledger`
```sql
- id (UUID, Primary Key)
- employee_id (UUID, Foreign Key)
- policy_id (UUID, Foreign Key)
- entry_type (TEXT) -- 'accrual', 'deduction', 'adjustment'
- hours (NUMERIC)
- effective_date (DATE)
- balance_after (NUMERIC)
- notes (TEXT)
- description (TEXT)
- related_request_id (UUID)
- processed_by (UUID)
- company_id (UUID)
- created_at (TIMESTAMPTZ)
```

## 🚀 API Endpoints

### Policy Management
- `GET /api/pto/policies` - List company policies
- `POST /api/pto/policies` - Create new policy
- `PUT /api/pto/policies/:id` - Update policy

### Balance Management
- `GET /api/pto/balances` - List all employee balances
- `GET /api/pto/balances/:employee_id` - Get employee balance
- `PUT /api/pto/balances/:employee_id` - Update balance (admin)

### Request Management
- `GET /api/pto/requests` - List requests (with filters)
- `POST /api/pto/request` - Submit new request
- `POST /api/pto/approve/:id` - Approve request
- `POST /api/pto/deny/:id` - Deny request

### Accrual Processing
- `POST /api/pto/accrue` - Run accrual engine

## 🔧 Installation & Setup

### 1. Database Migration
```bash
# Run the production migration
psql -d your_database -f database/pto_production_migration.sql
```

### 2. Backend Setup
```javascript
// Add to your Express app
import ptoRoutes from './src/api/ptoRoutes.js';
app.use('/api/pto', ptoRoutes);
```

### 3. Frontend Integration
```javascript
// Import components
import EmployeePTODashboard from './src/components/PTO/EmployeePTODashboard';
import AdminPTODashboard from './src/components/PTO/AdminPTODashboard';

// Use in your routing
<Route path="/pto" component={EmployeePTODashboard} />
<Route path="/admin/pto" component={AdminPTODashboard} />
```

## 🎮 Usage Guide

### For Employees

1. **View Balances**: See current vacation and sick leave balances
2. **Submit Requests**: Use the request form with automatic validation
3. **Track Status**: Monitor request approval status
4. **View History**: Access complete request history

### For Administrators

1. **Manage Policies**: Create and configure PTO policies
2. **Approve Requests**: Review and approve/deny employee requests
3. **Monitor Balances**: View and adjust employee balances
4. **Run Reports**: Generate comprehensive PTO analytics
5. **Process Accruals**: Run manual or scheduled accrual processing

## ⚙️ Configuration

### Accrual Policies
```javascript
const policyExample = {
  name: "Standard Policy",
  vacation_hours_per_period: 3.08, // ~80 hours/year biweekly
  sick_hours_per_period: 1.54,     // ~40 hours/year biweekly
  accrual_period: "biweekly",
  max_vacation_hours: 120,         // 3 weeks max
  max_sick_hours: 80,              // 2 weeks max
  carryover_limit: 40              // 1 week carryover
};
```

### Scheduled Accruals
```javascript
// Schedule automatic accruals
PTOAccrualEngine.scheduleAccrualJob(policyId, 'biweekly', companyId);

// Process manually
await PTOAccrualEngine.processAllAccruals(companyId);
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
npm test src/tests/PTOSystem.test.js
```

Tests cover:
- Policy CRUD operations
- Balance management
- Request workflows
- Accrual processing
- Validation logic
- Integration scenarios

## 🔒 Security Features

- **Row Level Security**: All queries scoped by company_id
- **Role-based Access**: Employees see only their data, admins see all
- **Input Validation**: Comprehensive validation on all inputs
- **Audit Trail**: Complete ledger of all PTO transactions
- **Balance Protection**: Prevents negative balances and over-requests

## 📈 Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Batch Processing**: Efficient accrual processing for multiple employees
- **Caching**: Service-level caching for frequently accessed data
- **Lazy Loading**: Components load data on demand

## 🔄 Migration Notes

The migration script safely:
1. Backs up existing data
2. Migrates `pto_requests` → `employee_time_off`
3. Drops duplicate tables only after verification
4. Creates default policies for existing companies
5. Preserves all historical data

## 🚨 Troubleshooting

### Common Issues

1. **Migration Fails**: Check database permissions and existing data
2. **Accrual Not Running**: Verify policy configuration and employee assignments
3. **Balance Discrepancies**: Check ledger entries for audit trail
4. **API Errors**: Verify authentication tokens and company scoping

### Debug Mode
```javascript
// Enable detailed logging
PTOAccrualEngine.debugMode = true;
```

## 🔮 Future Enhancements

- **Email Notifications**: Automated notifications for requests/approvals
- **Calendar Integration**: Sync with company calendars
- **Mobile App**: Native mobile application
- **Advanced Reporting**: More detailed analytics and forecasting
- **Integration APIs**: Connect with payroll and HR systems

## 📞 Support

For technical support or questions about the PTO system:
1. Check the test suite for usage examples
2. Review the API documentation
3. Examine the database schema and views
4. Contact the development team

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2024
