# TradeMate Pro: Quotes → Jobs → Invoices Pipeline Documentation

## 📋 **EXECUTIVE SUMMARY**

TradeMate Pro uses a **unified `work_orders` table** for the entire pipeline. There is **NO separate quotes or jobs table** - everything flows through `work_orders` with different `stage` values.

## 🗄️ **DATABASE SCHEMA**

### **Primary Table: `work_orders`**
- **Single source of truth** for quotes, jobs, and work orders
- **Stage-driven workflow** using `stage` enum: `QUOTE` → `JOB` → `WORK_ORDER` → `INVOICED` → `PAID`
- **Stage-specific status fields**: `quote_status`, `job_status`, `work_status`

### **Supporting Tables:**
- **`work_order_items`** - Line items for quotes/jobs (labor, materials, parts)
- **`invoices`** - Separate invoice records linked via `work_orders.invoice_id`
- **`work_order_audit`** - Stage transition history and audit trail
- **`work_order_versions`** - Version history for quotes

### **⚠️ LEGACY TABLES (ARCHIVED):**
- **`quotes`** table - **DEPRECATED** and archived to `legacy_archive`
- **`quote_items`** table - **DEPRECATED** and archived to `legacy_archive`
- **`jobs`** table - **DEPRECATED** and archived to `legacy_archive`

## 🔄 **PIPELINE FLOW**

### **1. Quote Creation**
```sql
INSERT INTO work_orders (
  stage = 'QUOTE',
  quote_status = 'DRAFT',
  title, description, customer_id, ...
)
```

### **2. Quote → Job Promotion**
**Trigger:** `quote_status = 'ACCEPTED'`
```sql
-- Automatic via database trigger
UPDATE work_orders 
SET stage = 'JOB', job_status = 'DRAFT'
WHERE quote_status = 'ACCEPTED'

-- OR manual via RPC function
SELECT promote_quote_to_job(quote_id, 'DRAFT')
```

### **3. Job → Work Order Promotion**
**Trigger:** `job_status = 'SCHEDULED'` OR scheduling times set
```sql
-- Automatic via database trigger
UPDATE work_orders 
SET stage = 'WORK_ORDER', work_status = 'ASSIGNED'
WHERE job_status = 'SCHEDULED' OR (start_time IS NOT NULL AND end_time IS NOT NULL)
```

### **4. Work Order → Invoice Creation**
```sql
-- Create invoice record
INSERT INTO invoices (job_id, customer_id, total_amount, ...)

-- Link back to work order
UPDATE work_orders 
SET invoice_id = new_invoice_id, stage = 'INVOICED'
```

## 🎯 **KEY COLUMNS**

### **Stage Management:**
- **`stage`** - Primary workflow stage (`QUOTE`, `JOB`, `WORK_ORDER`, `INVOICED`, `PAID`)
- **`quote_status`** - Quote-specific status (`DRAFT`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`)
- **`job_status`** - Job-specific status (`DRAFT`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`)
- **`work_status`** - Work order status (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)

### **Linking Fields:**
- **`invoice_id`** - Links to `invoices` table
- **`customer_id`** - Links to customer
- **`assigned_technician_id`** - Assigned worker

### **Financial Fields:**
- **`subtotal`**, **`total_amount`** - Quote/job totals
- **`labor_subtotal`** - Labor costs
- **`tax_rate`**, **`tax_amount`** - Tax calculations

## 🖥️ **FRONTEND COMPONENTS**

### **Quote Management:**
- **`src/pages/Quotes.js`** - Main quotes page
- **`src/components/QuotesDatabasePanel.js`** - Quote CRUD operations
- **Queries:** `work_orders` WHERE `stage = 'QUOTE'`

### **Job Management:**
- **`src/pages/Jobs.js`** - Main jobs page  
- **`src/components/JobsDatabasePanel.js`** - Job CRUD operations
- **Queries:** `work_orders` WHERE `stage = 'JOB'`

### **Invoice Management:**
- **`src/services/InvoicesService.js`** - Invoice operations
- **Queries:** `invoices` table + linked `work_orders`

## 🔧 **DATABASE FUNCTIONS**

### **Stage Promotion Functions:**
```sql
-- Quote to Job
promote_quote_to_job(p_id uuid, p_job_status job_status_enum)

-- Job to Work Order  
promote_job_to_work_order(p_id uuid, p_work_status work_status_enum)

-- Status changes
wo_change_status(p_id uuid, p_to text)
```

### **Automatic Triggers:**
- **`wo_stage_status_auto()`** - Auto-promotes based on status changes
- **`trg_wo_stage_status_auto`** - Trigger on work_orders table

## 📦 **INVENTORY INTEGRATION POINTS**

### **Current State:**
- **Job Allocation Modal** exists but uses mock data
- **Inventory movements** can link to `work_order_id`
- **No automatic cost tracking** from inventory to jobs/invoices

### **Recommended Integration Points:**

#### **1. Quote Stage - Estimate Costs**
- **Purpose:** Estimate material costs for quotes
- **Implementation:** Link `work_order_items` to `inventory_items` for cost estimation
- **Benefit:** Accurate quote pricing

#### **2. Job Stage - Allocate Materials** ⭐ **RECOMMENDED**
- **Purpose:** Reserve/allocate materials when job is confirmed
- **Implementation:** Create `inventory_movements` with `movement_type = 'ALLOCATION'`
- **Benefit:** Prevents overselling, tracks job costs

#### **3. Work Order Stage - Consume Materials**
- **Purpose:** Track actual material usage during work
- **Implementation:** Convert allocations to `movement_type = 'USAGE'`
- **Benefit:** Real-time cost tracking, accurate job profitability

#### **4. Invoice Stage - Cost Reconciliation**
- **Purpose:** Ensure invoice reflects actual material costs
- **Implementation:** Auto-populate invoice items from inventory movements
- **Benefit:** Accurate billing, profit tracking

## 🎯 **RECOMMENDED INVENTORY ALLOCATION STRATEGY**

### **Best Integration Point: JOB STAGE**

**Why Job Stage:**
1. **Quote accepted** - Customer committed, safe to allocate
2. **Before work starts** - Materials reserved but not consumed
3. **Cancellation possible** - Can release allocations if job cancelled
4. **Cost tracking** - Real job costs vs estimates

**Implementation:**
```sql
-- When quote becomes job, create allocations
INSERT INTO inventory_movements (
  item_id, location_id, work_order_id,
  movement_type = 'ALLOCATION',
  quantity, unit_cost
)

-- When work starts, convert to usage
UPDATE inventory_movements 
SET movement_type = 'USAGE'
WHERE work_order_id = ? AND movement_type = 'ALLOCATION'
```

## ⚠️ **CRITICAL NOTES**

1. **NO LEGACY TABLES** - Do not use `quotes`, `quote_items`, or `jobs` tables
2. **Single Source of Truth** - All data flows through `work_orders`
3. **Stage-Driven** - Use `stage` field to filter records, not separate tables
4. **Automatic Promotion** - Database triggers handle most stage transitions
5. **Audit Trail** - All changes tracked in `work_order_audit`

## 🔗 **RELATED FILES**

- **Schema:** `supabase schema.csv`
- **Triggers:** `db/migrations/enhanced_wo_stage_status_trigger.sql`
- **Functions:** `db/migrations/wo_change_status_rpc.sql`
- **Frontend:** `src/components/QuotesDatabasePanel.js`, `src/components/JobsDatabasePanel.js`
- **Inventory:** `src/services/InventoryService.js`

---
**Last Updated:** 2025-01-08  
**Pipeline Status:** ✅ Active and Functional  
**Inventory Integration:** 🚧 Partial (Job Allocation Modal exists, needs full integration)
