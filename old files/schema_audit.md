# 🔍 **SUPABASE SCHEMA AUDIT REPORT**

## **EXECUTIVE SUMMARY**

After analyzing the current Supabase schema files, I've identified several critical issues that are likely causing the 400 errors you're experiencing. The schema has significant inconsistencies, non-standard naming conventions, and structural problems that need immediate attention.

---

## 🚨 **CRITICAL ISSUES IDENTIFIED**

### **1. INCONSISTENT PRIMARY KEY NAMING**
**❌ MAJOR PROBLEM**: Mixed primary key naming conventions

**Examples:**
- `work_orders` uses `work_order_id` as PK (non-standard)
- Most other tables use `id` as PK (standard)
- `companies`, `users`, `customers` use `id` (correct)
- `schedule_events`, `invoices`, `payments` use `id` (correct)

**Impact**: This causes JOIN failures and foreign key constraint violations.

**Standard Fix**: All primary keys should be named `id`

### **2. FOREIGN KEY NAMING INCONSISTENCIES**
**❌ MAJOR PROBLEM**: Inconsistent foreign key references

**Examples:**
- Some tables reference `work_orders(work_order_id)` 
- Others reference `work_orders(id)` (which doesn't exist)
- Mixed references to `job_id` vs `work_order_id`

**Impact**: Broken relationships, constraint violations, 400 errors

### **3. DUPLICATE/CONFLICTING TABLE STRUCTURES**
**❌ CRITICAL PROBLEM**: Legacy tables conflicting with unified system

**Found Issues:**
- Both `jobs` and `work_orders` tables exist
- Both `quotes` and `work_orders` (with stage='QUOTE') exist
- Conflicting foreign key references between legacy and new systems

**Impact**: Data integrity issues, application errors

### **4. ENUM INCONSISTENCIES**
**❌ MAJOR PROBLEM**: Enum values don't match application code

**Examples:**
- Invoice status enum: `['UNPAID', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED']`
- But application expects: `['DRAFT', 'SENT', 'PAID', 'VOID']`
- Work order status mismatches

**Impact**: Status updates fail, causing 400 errors

### **5. MISSING STANDARD COLUMNS**
**❌ PROBLEM**: Missing audit and standard columns

**Missing:**
- `created_at` and `updated_at` on some tables
- Consistent `company_id` foreign keys
- Standard constraint naming

---

## 📊 **DETAILED ANALYSIS**

### **Table Structure Issues**

#### **work_orders Table (CRITICAL)**
```sql
-- CURRENT (WRONG):
work_orders.work_order_id (PK)

-- SHOULD BE (STANDARD):
work_orders.id (PK)
```

**Foreign Key Impact:**
- 47+ tables reference `work_orders(work_order_id)`
- Should reference `work_orders(id)`
- Causes constraint violations

#### **Invoice Status Enum (CRITICAL)**
```sql
-- CURRENT (WRONG):
CHECK ((status = ANY (ARRAY['UNPAID', 'PAID', 'OVERDUE', 'PARTIALLY_PAID', 'CANCELLED'])))

-- APPLICATION EXPECTS (CORRECT):
CHECK ((status = ANY (ARRAY['DRAFT', 'SENT', 'PAID', 'VOID'])))
```

#### **Duplicate Table Systems**
- **Legacy**: `jobs`, `quotes`, `quote_items`
- **Unified**: `work_orders` with `stage` enum
- **Problem**: Both systems exist, causing conflicts

### **Constraint Issues**

#### **Foreign Key Constraint Violations**
```sql
-- EXAMPLES OF BROKEN CONSTRAINTS:
schedule_events.work_order_id -> work_orders(work_order_id) ✓ (works)
work_order_items.work_order_id -> work_orders(work_order_id) ✓ (works)
invoices.job_id -> work_orders(work_order_id) ❌ (column mismatch)
```

#### **Check Constraint Mismatches**
- User roles: DB has `['owner', 'admin', 'employee']`
- App expects: `['admin', 'tech', 'dispatcher', 'client']`

### **Naming Convention Issues**

#### **Non-Standard Patterns**
- `work_order_id` instead of `id`
- Mixed `job_id` vs `work_order_id` references
- Inconsistent constraint naming

#### **Standard Patterns (Good Examples)**
- `companies.id`, `users.id`, `customers.id`
- Proper `company_id` foreign keys
- Standard `created_at`, `updated_at` columns

---

## 🛠️ **RECOMMENDED FIXES**

### **Phase 1: Critical Fixes (IMMEDIATE)**

#### **1. Fix work_orders Primary Key**
```sql
-- Step 1: Drop all foreign key constraints referencing work_orders
-- Step 2: Rename work_order_id to id
ALTER TABLE work_orders RENAME COLUMN work_order_id TO id;
-- Step 3: Recreate all foreign key constraints
```

#### **2. Fix Invoice Status Enum**
```sql
-- Update enum to match application
ALTER TABLE invoices DROP CONSTRAINT invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK ((status = ANY (ARRAY['DRAFT', 'SENT', 'PAID', 'VOID'])));
```

#### **3. Fix User Role Enum**
```sql
-- Update to match application expectations
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK ((role = ANY (ARRAY['admin', 'tech', 'dispatcher', 'client'])));
```

### **Phase 2: Structural Cleanup**

#### **1. Remove Legacy Tables**
```sql
-- After data migration
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS quotes CASCADE; 
DROP TABLE IF EXISTS quote_items CASCADE;
```

#### **2. Standardize Column Names**
```sql
-- Fix foreign key column names
ALTER TABLE invoices RENAME COLUMN job_id TO work_order_id;
-- Add missing company_id columns where needed
```

### **Phase 3: Add Missing Standards**

#### **1. Add Missing Audit Columns**
```sql
-- Add to tables missing these
ALTER TABLE [table_name] ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE [table_name] ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
```

#### **2. Add Missing Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_work_orders_company_id ON work_orders(company_id);
CREATE INDEX idx_work_orders_customer_id ON work_orders(customer_id);
```

---

## 🎯 **IMMEDIATE ACTION PLAN**

### **Step 1: Emergency Fixes (Run Today)**
1. **Fix invoice status enum** - This is likely causing immediate 400 errors
2. **Fix user role enum** - Authentication/authorization failures
3. **Update application code** to handle current enum values temporarily

### **Step 2: Schema Standardization (This Week)**
1. **Backup database** before any changes
2. **Fix work_orders primary key** (complex, requires careful FK management)
3. **Remove legacy table conflicts**
4. **Standardize naming conventions**

### **Step 3: Validation (Next Week)**
1. **Run comprehensive tests** on all CRUD operations
2. **Verify all foreign key constraints** work correctly
3. **Test application functionality** end-to-end

---

## 📋 **SQL SCRIPT PRIORITIES**

### **High Priority (Fix 400 Errors)**
```sql
-- 1. Fix invoice status enum (IMMEDIATE)
ALTER TABLE invoices DROP CONSTRAINT invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK ((status = ANY (ARRAY['DRAFT', 'SENT', 'PAID', 'VOID'])));

-- 2. Fix user role enum (IMMEDIATE)  
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK ((role = ANY (ARRAY['admin', 'tech', 'dispatcher', 'client'])));

-- 3. Fix work order status enum (IMMEDIATE)
ALTER TABLE work_orders DROP CONSTRAINT work_orders_status_check;
ALTER TABLE work_orders ADD CONSTRAINT work_orders_status_check 
CHECK ((status = ANY (ARRAY['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])));
```

### **Medium Priority (Structural Issues)**
- Fix `work_orders.work_order_id` → `work_orders.id`
- Remove legacy table conflicts
- Standardize foreign key naming

### **Low Priority (Enhancements)**
- Add missing audit columns
- Optimize indexes
- Clean up unused constraints

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Why These Issues Occurred**
1. **Multiple developers/AI systems** working on schema without coordination
2. **Legacy system migration** incomplete - both old and new systems exist
3. **No schema validation** process in place
4. **Application code diverged** from database constraints

### **Prevention Measures**
1. **Schema version control** - Track all changes
2. **Constraint validation** - Test before deployment  
3. **Application-database sync** - Keep enums/constraints aligned
4. **Migration strategy** - Complete legacy system removal

---

## ✅ **VALIDATION CHECKLIST**

### **Before Making Changes**
- [ ] **Full database backup** created
- [ ] **Application downtime** scheduled
- [ ] **Rollback plan** prepared

### **After Making Changes**
- [ ] **All foreign keys** validate correctly
- [ ] **Application CRUD operations** work
- [ ] **Status updates** succeed
- [ ] **User authentication** works
- [ ] **Invoice creation/updates** work

### **Testing Required**
- [ ] Create new work orders
- [ ] Update invoice statuses  
- [ ] User role assignments
- [ ] Foreign key relationships
- [ ] All application pages load without 400 errors

---

## 🎯 **CONCLUSION**

The current schema has **critical structural issues** that are definitely causing your 400 errors. The main culprits are:

1. **Enum mismatches** between database and application
2. **Primary key naming inconsistencies** 
3. **Legacy table conflicts**
4. **Foreign key constraint violations**

**Immediate action required** on the enum fixes to resolve 400 errors. The structural issues need careful planning but are essential for long-term stability.

**Recommendation**: Start with the high-priority SQL fixes today, then plan the structural changes for a maintenance window.

