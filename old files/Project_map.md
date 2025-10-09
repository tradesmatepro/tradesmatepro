# 🗺️ TradeMate Pro - Complete Database Architecture Map

**Comprehensive Guide: How Every Table Works Together**

---

## 🎯 **Database Architecture Overview**

This map explains **what each table does**, **how they interact**, and **why they're designed this way** to prevent architectural drift and ensure consistent development.

---

## 🏗️ **CORE ARCHITECTURE PATTERNS**

### **🔐 Multi-Tenant Security Pattern**
```
Every business table → company_id → companies(id)
├── Ensures data isolation between companies
├── Enables SaaS multi-tenancy 
└── Prevents data leakage between tenants
```

### **📋 Unified Work Pipeline Pattern**
```
work_orders.status (enum) → Controls entire business flow
├── draft → Initial creation, can be edited freely
├── quote → Customer approval pending
├── approved → Ready for scheduling
├── scheduled → Assigned to technician with time slot
├── in_progress → Technician actively working
├── completed → Work finished, ready for invoicing
├── invoiced → Invoice generated and sent
└── cancelled → Work cancelled at any stage
```

### **👤 User Identity Pattern**
```
auth.users (Supabase) → users → profiles
├── auth.users: Authentication credentials (managed by Supabase)
├── users: Business role and company association
└── profiles: Personal information and preferences
```

---

## 📊 **TABLE PURPOSES & INTERACTIONS**

### **🔐 AUTHENTICATION & IDENTITY LAYER**

#### **auth.users** (Supabase Managed)
- **Purpose**: Handles login credentials, password resets, email verification
- **Interactions**: Referenced by `users.auth_user_id`
- **Why Separate**: Supabase manages security, we manage business logic

#### **users**
- **Purpose**: Links authentication to business context (company + role)
- **Key Fields**: `company_id`, `role`, `status`
- **Interactions**: 
  - → `companies(id)` - Which company they belong to
  - → `auth.users(id)` - Their login credentials
  - ← Referenced by all activity tables for "who did this"
- **Business Rule**: One auth user can have multiple business users (different companies)

#### **profiles**
- **Purpose**: Personal information, preferences, contact details
- **Key Fields**: `first_name`, `last_name`, `phone`, `preferences`
- **Interactions**: → `users(id)` - One profile per user
- **Why Separate**: Personal data separate from business role data

#### **permissions**
- **Purpose**: Defines what each role can do (RBAC system)
- **Key Fields**: `name`, `level` (0-100 hierarchy)
- **Interactions**: Used by application to check `users.role` permissions
- **Business Rule**: Higher level = more permissions

---

### **🏢 COMPANY & BILLING LAYER**

#### **companies**
- **Purpose**: Central tenant entity - every business record belongs to a company
- **Key Fields**: `company_number`, `name`, `time_zone`, `currency`
- **Interactions**: Referenced by ALL business tables via `company_id`
- **Business Rule**: Company deletion cascades to all related data

#### **company_settings**
- **Purpose**: Configurable business rules and preferences
- **Key Fields**: `business_hours`, `tax_rate`, `emergency_multiplier`
- **Interactions**: → `companies(id)` - One settings record per company
- **Usage**: Controls pricing, scheduling, and business logic

#### **billing_plans**
- **Purpose**: Defines subscription tiers and feature limits
- **Key Fields**: `price_monthly`, `features`, `max_users`
- **Interactions**: ← Referenced by `subscriptions.billing_plan_id`
- **Business Rule**: Features JSONB controls what company can access

#### **subscriptions**
- **Purpose**: Links companies to their billing plan and payment status
- **Key Fields**: `status`, `current_period_end`, `trial_end`
- **Interactions**: 
  - → `companies(id)` - Which company
  - → `billing_plans(id)` - What they're paying for
- **Business Rule**: Controls feature access and billing cycles

---

### **👥 CUSTOMER RELATIONSHIP LAYER**

#### **customers**
- **Purpose**: Central customer entity - all customer data branches from here
- **Key Fields**: `customer_number`, `type`, `first_name`/`company_name`
- **Interactions**: 
  - → `companies(id)` - Which company owns this customer
  - ← Referenced by `work_orders`, `invoices`, `payments`
- **Business Rule**: Either personal names OR company name required

#### **customer_addresses**
- **Purpose**: Multiple addresses per customer (billing, service, mailing)
- **Key Fields**: `type`, `address_line1`, `latitude`, `longitude`
- **Interactions**: 
  - → `customers(id)` - Which customer
  - ← Referenced by `work_orders.customer_address_id`
- **Business Rule**: GPS coordinates enable route optimization

#### **customer_contacts**
- **Purpose**: Multiple contact people per customer (especially commercial)
- **Key Fields**: `name`, `title`, `email`, `phone`, `is_primary`
- **Interactions**: → `customers(id)` - Which customer
- **Business Rule**: Primary contact used for default communications

#### **customer_tags** + **customer_tag_assignments**
- **Purpose**: Flexible customer categorization and filtering
- **Key Fields**: `name`, `color`, `priority`
- **Interactions**: Many-to-many between customers and tags
- **Usage**: "VIP", "Payment Risk", "Referral Source" for business intelligence

#### **customer_notes**
- **Purpose**: Historical record of all customer interactions
- **Key Fields**: `note_type`, `content`, `is_important`
- **Interactions**: 
  - → `customers(id)` - Which customer
  - → `users(id)` - Who wrote the note
- **Business Rule**: Permanent audit trail of customer relationship

---

### **🛠️ SERVICE CATALOG LAYER**

#### **service_categories**
- **Purpose**: High-level service groupings (Plumbing, Electrical, HVAC)
- **Key Fields**: `name`, `icon_url`, `sort_order`
- **Interactions**: 
  - → `companies(id)` - Company-specific categories
  - ← Referenced by `service_types`, `work_orders`
- **Business Rule**: Companies can customize their service offerings

#### **service_types**
- **Purpose**: Specific services within categories (Drain Cleaning, Panel Upgrade)
- **Key Fields**: `name`, `base_price`, `estimated_duration`
- **Interactions**: 
  - → `service_categories(id)` - Which category
  - ← Referenced by `work_orders.service_type_id`
- **Usage**: Pre-fills work order pricing and time estimates

---

### **📋 UNIFIED WORK PIPELINE (Core Business Logic)**

#### **work_orders** (Central Business Entity)
- **Purpose**: Single source of truth for all work - replaces separate quotes/jobs/invoices
- **Key Fields**: `status` (enum), `priority`, `scheduled_start`, `total_amount`
- **Status Flow**: draft → quote → approved → scheduled → in_progress → completed → invoiced
- **Interactions**: 
  - → `companies(id)` - Which company
  - → `customers(id)` - For whom
  - → `customer_addresses(id)` - Where
  - → `service_categories(id)` + `service_types(id)` - What type of work
  - → `users(id)` - Who's assigned and who created
  - ← Referenced by line items, attachments, notes, schedule events
- **Business Rule**: Status enum controls what actions are allowed

#### **work_order_line_items**
- **Purpose**: Itemized breakdown of work (labor, materials, fees)
- **Key Fields**: `line_type` (enum), `quantity`, `unit_price`, `total_price`
- **Interactions**: → `work_orders(id)` - Which work order
- **Business Rule**: `total_price` auto-calculated, rolls up to work order total

#### **work_order_attachments**
- **Purpose**: Photos, documents, contracts attached to work
- **Key Fields**: `file_name`, `file_url`, `file_type`
- **Interactions**: 
  - → `work_orders(id)` - Which work order
  - → `users(id)` - Who uploaded
- **Usage**: Before/after photos, signed contracts, permits

#### **work_order_notes**
- **Purpose**: Communication log and technical notes
- **Key Fields**: `note_type`, `content`, `is_internal`
- **Interactions**: 
  - → `work_orders(id)` - Which work order
  - → `users(id)` - Who wrote it
- **Business Rule**: Internal notes hidden from customer portal

---

### **📅 SCHEDULING LAYER**

#### **schedule_events**
- **Purpose**: Calendar integration and time slot management
- **Key Fields**: `start_time`, `end_time`, `status`, `assigned_to`
- **Interactions**: 
  - → `work_orders(id)` - What work is scheduled
  - → `users(id)` - Which technician
- **Business Rule**: Links work orders to calendar, enables dispatch optimization

#### **documents**
- **Purpose**: Template library and generated documents
- **Key Fields**: `template_type`, `content`, `is_template`
- **Interactions**: → `companies(id)` - Company-specific templates
- **Usage**: Service agreements, invoices, estimates with variable substitution

---

### **💰 FINANCE & BILLING LAYER**

#### **invoices**
- **Purpose**: Formal billing documents generated from completed work orders
- **Key Fields**: `invoice_number`, `status`, `due_date`, `balance_due`
- **Interactions**: 
  - → `work_orders(id)` - What work is being billed
  - → `customers(id)` - Who to bill
  - ← Referenced by `payments`, `invoice_line_items`
- **Business Rule**: Auto-generated when work order status = completed

#### **invoice_line_items**
- **Purpose**: Itemized billing details (copied from work order line items)
- **Key Fields**: `description`, `quantity`, `unit_price`, `tax_rate`
- **Interactions**: → `invoices(id)` - Which invoice
- **Business Rule**: Immutable once invoice is sent (audit trail)

#### **payments**
- **Purpose**: Record of all money received from customers
- **Key Fields**: `amount`, `payment_date`, `status`, `payment_method_id`
- **Interactions**: 
  - → `invoices(id)` - What's being paid
  - → `customers(id)` - Who paid
  - → `payment_methods(id)` - How they paid
- **Business Rule**: Auto-updates invoice status when fully paid

#### **payment_methods**
- **Purpose**: Available payment options and processing fees
- **Key Fields**: `name`, `processing_fee`, `is_active`
- **Interactions**: ← Referenced by `payments.payment_method_id`
- **Usage**: "Credit Card (2.9% fee)", "ACH (0.5% fee)"

#### **taxes**
- **Purpose**: Tax rates and rules per company/location
- **Key Fields**: `name`, `rate`, `is_active`
- **Interactions**: → `companies(id)` - Company-specific tax setup
- **Usage**: Applied to line items based on business rules

#### **expenses**
- **Purpose**: Track company costs (materials, labor, overhead)
- **Key Fields**: `type` (enum), `amount`, `is_billable`, `is_reimbursable`
- **Interactions**: 
  - → `work_orders(id)` - Job-related expenses
  - → `users(id)` - Who incurred the expense
- **Business Rule**: Billable expenses can be added to customer invoices

---

### **👥 TEAM & WORKFORCE LAYER**

#### **employees**
- **Purpose**: Workforce management separate from user accounts
- **Key Fields**: `employee_number`, `role`, `hourly_rate`, `status`
- **Interactions**:
  - → `companies(id)` - Which company employs them
  - → `users(id)` - Optional link to user account (not all employees have logins)
  - ← Referenced by `work_orders.assigned_to`, `employee_timesheets`
- **Business Rule**: Can exist without user account (contractors, part-time workers)

#### **employee_timesheets**
- **Purpose**: Time tracking for payroll and job costing
- **Key Fields**: `date`, `hours_worked`, `hourly_rate`, `status`
- **Interactions**:
  - → `employees(id)` - Who worked
  - → `work_orders(id)` - What job (optional)
- **Business Rule**: Links time to specific jobs for accurate costing

---

### **📦 INVENTORY & OPERATIONS LAYER**

#### **inventory_items**
- **Purpose**: Parts, materials, and tools catalog with stock tracking
- **Key Fields**: `sku`, `unit_cost`, `selling_price`, `current_stock`, `reorder_point`
- **Interactions**:
  - → `companies(id)` - Company-specific inventory
  - ← Referenced by `inventory_movements`, work order line items
- **Business Rule**: Stock levels auto-update via inventory movements

#### **inventory_locations**
- **Purpose**: Where inventory is stored (warehouse, trucks, job sites)
- **Key Fields**: `name`, `address`, `is_mobile`
- **Interactions**:
  - → `companies(id)` - Company locations
  - ← Referenced by `inventory_movements` (from/to locations)
- **Usage**: Track inventory across multiple locations and mobile units

#### **inventory_movements**
- **Purpose**: All inventory transactions (purchases, usage, transfers)
- **Key Fields**: `movement_type` (enum), `quantity`, `from_location_id`, `to_location_id`
- **Interactions**:
  - → `inventory_items(id)` - What moved
  - → `work_orders(id)` - Job that used materials
  - → `inventory_locations(id)` - Where it moved from/to
- **Business Rule**: Every stock change must have a movement record (audit trail)

#### **vendors**
- **Purpose**: Supplier and subcontractor directory
- **Key Fields**: `name`, `contact_name`, `payment_terms`, `is_active`
- **Interactions**:
  - → `companies(id)` - Company-specific vendors
  - ← Referenced by purchase orders, expenses
- **Usage**: Track supplier relationships and payment terms

#### **tools**
- **Purpose**: Company equipment and tool tracking
- **Key Fields**: `tool_number`, `assigned_to`, `status`, `next_maintenance_date`
- **Interactions**:
  - → `companies(id)` - Company tools
  - → `employees(id)` - Who has it assigned
- **Business Rule**: Preventive maintenance scheduling and assignment tracking

---

## 🚀 **ADVANCED LAYERS (PHASES 2-4)**

### **🎯 ENTERPRISE SERVICE MANAGEMENT (Phase 2)**

#### **job_templates**
- **Purpose**: Standardized work procedures and pricing
- **Key Fields**: `template_type`, `default_line_items`, `estimated_duration_hours`
- **Interactions**: → `service_categories(id)` - What type of work
- **Usage**: Pre-populate work orders with standard procedures and pricing

#### **rate_cards**
- **Purpose**: Dynamic pricing based on time, conditions, customer type
- **Key Fields**: `rate_type`, `base_rate`, `overtime_multiplier`, `emergency_multiplier`
- **Interactions**: → `companies(id)` - Company-specific pricing
- **Business Rule**: Applied to work orders based on scheduling and conditions

#### **sla_policies**
- **Purpose**: Service level agreements and response time commitments
- **Key Fields**: `priority`, `response_time_hours`, `resolution_time_hours`
- **Interactions**: Applied to work orders based on customer type and priority
- **Usage**: Automatic escalation and performance tracking

#### **certifications**
- **Purpose**: Track employee licenses and qualifications
- **Key Fields**: `certification_name`, `expiration_date`, `status`
- **Interactions**: → `employees(id)` - Who has the certification
- **Business Rule**: Required certifications checked before job assignment

#### **performance_reviews**
- **Purpose**: Employee evaluation and development tracking
- **Key Fields**: `overall_rating`, `technical_skills_rating`, `goals_achieved`
- **Interactions**: → `employees(id)` - Who was reviewed
- **Usage**: Performance-based scheduling and development planning

---

### **🏪 MARKETPLACE FUNCTIONALITY (Phase 3)**

#### **marketplace_categories**
- **Purpose**: Service categories specific to marketplace operations
- **Key Fields**: `commission_rate`, `average_response_time_hours`, `typical_job_value_min/max`
- **Interactions**: ← Referenced by `marketplace_requests`
- **Business Rule**: Different from internal service categories - marketplace-focused

#### **marketplace_requests**
- **Purpose**: Customer job postings seeking contractor bids
- **Key Fields**: `title`, `description`, `budget_min/max`, `status`, `urgency`
- **Status Flow**: draft → posted → bidding_open → contractor_selected → completed
- **Interactions**:
  - → `customers(id)` - Who posted the request
  - → `marketplace_categories(id)` - What type of work
  - ← Referenced by `marketplace_bids`, `escrow_transactions`

#### **marketplace_bids**
- **Purpose**: Contractor proposals for marketplace requests
- **Key Fields**: `bid_amount`, `estimated_duration`, `proposed_start_date`, `status`
- **Interactions**:
  - → `marketplace_requests(id)` - What they're bidding on
  - → `companies(id)` - Which contractor is bidding
- **Business Rule**: Multiple bids per request, customer selects winner

#### **marketplace_reviews**
- **Purpose**: Customer feedback and contractor ratings
- **Key Fields**: `rating`, `review_text`, `response_text`, `is_verified`
- **Interactions**:
  - → `marketplace_requests(id)` - What job was reviewed
  - → `companies(id)` - Which contractor was reviewed
- **Usage**: Contractor reputation and customer decision-making

#### **escrow_transactions**
- **Purpose**: Secure payment holding for marketplace jobs
- **Key Fields**: `amount`, `status`, `funded_at`, `released_at`
- **Status Flow**: pending → funded → held → released_to_contractor OR refunded_to_customer
- **Interactions**: Links customers, contractors, and marketplace requests
- **Business Rule**: Payment protection for both parties

---

### **🧠 AI/IOT INTELLIGENCE (Phase 4)**

#### **route_optimizations**
- **Purpose**: AI-powered scheduling and routing optimization
- **Key Fields**: `optimization_type`, `technician_ids`, `work_order_ids`, `results`
- **Interactions**:
  - → `employees(id)` - Which technicians
  - → `work_orders(id)` - Which jobs to optimize
- **Usage**: Minimize drive time, maximize efficiency, reduce fuel costs

#### **sensor_types**
- **Purpose**: Define IoT sensor capabilities and normal ranges
- **Key Fields**: `name`, `unit_of_measure`, `normal_range_min/max`
- **Interactions**: ← Referenced by `iot_devices`, `sensor_readings`
- **Usage**: Temperature, pressure, voltage monitoring definitions

#### **iot_devices**
- **Purpose**: Connected equipment and monitoring devices
- **Key Fields**: `device_name`, `device_type`, `location_description`, `status`
- **Interactions**:
  - → `customers(id)` - Whose equipment is being monitored
  - ← Referenced by `sensor_readings`, `predictive_alerts`
- **Business Rule**: Enables predictive maintenance and remote monitoring

#### **sensor_readings**
- **Purpose**: Time-series data from IoT devices
- **Key Fields**: `reading_value`, `reading_timestamp`, `is_anomaly`
- **Interactions**:
  - → `iot_devices(id)` - Which device
  - → `sensor_types(id)` - What type of reading
- **Usage**: Trend analysis, anomaly detection, predictive maintenance

#### **predictive_alerts**
- **Purpose**: AI-generated maintenance recommendations
- **Key Fields**: `alert_type`, `severity`, `predicted_failure_date`, `confidence_score`
- **Interactions**:
  - → `iot_devices(id)` - Which device needs attention
  - → `work_orders(id)` - Auto-generated preventive work order
- **Business Rule**: Proactive maintenance prevents emergency breakdowns

---

## 🔧 **SYSTEM & AUDIT LAYER**

#### **notifications**
- **Purpose**: Multi-channel communication system
- **Key Fields**: `type` (email/sms/push), `title`, `message`, `status`
- **Interactions**: → `users(id)` - Who to notify
- **Usage**: Work order updates, payment reminders, system alerts

#### **audit_logs**
- **Purpose**: Complete audit trail of all system changes
- **Key Fields**: `action`, `table_name`, `old_values`, `new_values`
- **Interactions**: → `users(id)` - Who made the change
- **Business Rule**: Immutable log of all data changes for compliance

#### **feature_flags**
- **Purpose**: Control feature rollout and A/B testing
- **Key Fields**: `name`, `is_enabled`, `rollout_percentage`
- **Usage**: Gradual feature deployment, beta testing, emergency shutoffs

---

## 🎯 **KEY ARCHITECTURAL PRINCIPLES**

### **1. Single Source of Truth**
- **work_orders** = Central business entity (not separate quotes/jobs/invoices)
- **customers** = All customer data branches from here
- **companies** = Every business record belongs to a company

### **2. Enum-Driven State Management**
- **Status enums** control business flow and available actions
- **Priority enums** drive SLA and scheduling decisions
- **Type enums** categorize and route data appropriately

### **3. Audit Trail Everything**
- **audit_logs** = Immutable record of all changes
- **notes tables** = Communication and decision history
- **movement tables** = Track all inventory and financial transactions

### **4. Flexible but Structured**
- **JSONB fields** for extensible data (preferences, features, results)
- **Tag systems** for flexible categorization
- **Template systems** for customizable documents

### **5. Performance by Design**
- **company_id** on every table for efficient multi-tenant queries
- **Generated columns** for calculated fields (balance_due, total_price)
- **Proper indexing** on foreign keys and frequently queried fields

---

## 🚀 **BUSINESS FLOW EXAMPLES**

### **Complete Work Order Lifecycle:**
```
1. Customer calls → Create customer record
2. Create work_order (status: draft)
3. Add line items → Calculate totals
4. Send quote → Update status to 'quote'
5. Customer approves → Status to 'approved'
6. Schedule technician → Status to 'scheduled', create schedule_event
7. Technician starts → Status to 'in_progress'
8. Complete work → Status to 'completed', add photos/notes
9. Auto-generate invoice → Status to 'invoiced'
10. Customer pays → Record payment, update invoice status
```

### **Inventory Usage Flow:**
```
1. Purchase materials → Create inventory_movement (type: purchase)
2. Stock arrives → Update inventory_items.current_stock
3. Job uses materials → Create movement (type: sale), link to work_order
4. Stock depletes → Auto-alert when below reorder_point
5. Reorder triggered → Create purchase order to vendor
```

### **Marketplace Transaction Flow:**
```
1. Customer posts job → Create marketplace_request
2. Contractors bid → Create marketplace_bids
3. Customer selects → Update request.selected_bid_id
4. Payment escrowed → Create escrow_transaction (status: funded)
5. Work completed → Convert to regular work_order
6. Customer approves → Release escrow to contractor
7. Leave review → Create marketplace_review
```

**This map ensures every developer understands exactly how the database works together as a cohesive system!** 🎯
