📋 TradesMate Pro — Final Locked Schema (All Phases)
Phase 1 – Core (Must Have, ~30 tables)

Foundation — what Jobber/Housecall equivalents run on

Auth & Identity

auth.users

users

profiles

permissions

Account / Company

companies

company_settings

subscriptions / billing_plans

CRM

customers

customer_addresses

customer_contacts

customer_notes

customer_tags

Work (Unified Pipeline)

work_orders

work_order_line_items

work_order_attachments

work_order_notes

schedule_events

documents

Finance

invoices

invoice_line_items

payments

expenses

taxes

Team

employees

employee_timesheets

payroll_runs

payroll_line_items

Operations

inventory_items

inventory_locations

inventory_stock

inventory_movements

vendors

purchase_orders

purchase_order_line_items

tools

messages

Service Management (Core Trade Features)

service_categories (Plumbing, Electrical, HVAC, etc.)

service_types (Repair, Installation, Maintenance, etc.)

Customer Portal Support

customer_portal_accounts (Portal login credentials)

portal_sessions (Session management)

customer_service_requests (Portal-submitted requests)

System

audit_logs (single polymorphic log)

notifications

Phase 2 – Enterprise / Secondary (~25 tables)

Adds ServiceTitan-level depth, compliance, advanced finance, integrations

Service Management

service_categories

service_types

job_templates

rate_cards

pricing_rules

Enhanced CRM

customer_portal_accounts

customer_service_requests

service_agreements (recurring/contract work)

Team / HR

employee_time_off

employee_compensation_history

employee_certifications

employee_availability

subcontractors

subcontractor_assignments

Finance Enhancements

payment_methods

recurring_invoices

change_orders

tax_jurisdictions

Mobile / Field Ops

gps_locations

mobile_sync_logs

equipment_assignments

Integration Support

webhook_endpoints

integration_tokens

sync_logs

Account Extras

company_profiles

business_settings

integration_settings

feature_flags

Reporting

reports

Phase 3 – Marketplace (~10 tables)

Two-sided Angi/Thumbtack style system, unique to TradesMate Pro

Marketplace Core

marketplace_requests

marketplace_responses

marketplace_messages

marketplace_reviews

provider_profiles

Marketplace Add-ons

commission_records

credits

credits_purchase

verification_documents

🎯 Final Totals

Phase 1 (Core FSM) → ~35 tables (added service management + customer portal)

Phase 2 (Enterprise) → ~25 tables

Phase 3 (Marketplace) → ~10 tables
Grand Total = ~70 tables

This is enterprise-grade but standardized:

Jobber/Housecall equivalent = Phase 1

ServiceTitan equivalent = Phase 1 + Phase 2

TradesMate Pro unique advantage = Phase 3

---

## 🚀 Phase 4 Enterprise (GPT + Claude Merged)

**ServiceTitan Enterprise Parity** (~22 tables, smart consolidation)

### **Advanced Scheduling & Routing**
```
recurring_schedules          # Maintenance contracts (separate from work_orders)
service_windows             # Customer availability slots
technician_territories      # Geographic assignments & routing
```

### **Advanced Financial Management**
```
payment_plans              # Installment billing
tax_jurisdictions          # Location-based tax rules
cost_centers               # Department/profit center tracking
```

### **Advanced Workforce Management**
```
employee_certifications    # Licenses & training records
training_modules           # Skill development programs
performance_metrics        # KPI tracking per employee
fleet_tracking             # Vehicle/equipment assignments
```

### **Asset & Warranty Management** (ServiceTitan Territory)
```
customer_equipment         # HVAC units, systems serviced
warranty_records           # Equipment warranty tracking
equipment_maintenance      # Service history per asset
```

### **Mobile & Field Operations**
```
gps_tracking_logs          # Location history
mobile_sync_logs           # Offline sync management
safety_incidents           # Incident reporting
```

### **Business Intelligence & Analytics**
```
forecasting_models         # Revenue prediction
profitability_analysis     # Job/customer profitability
ai_recommendations         # Smart suggestions
feature_usage_logs         # App analytics
```

### **Compliance & Quality** (Regulated Trades)
```
quality_checklists         # Service standards
inspection_reports         # Quality audits
environmental_compliance   # EPA/regulatory tracking
```

### **Customer Experience**
```
customer_feedback_surveys  # Post-job surveys
loyalty_programs           # Rewards/discounts
```

**Phase 4 Total: ~22 additional tables**
**Grand Enterprise Total: ~87 tables**

**Key Consolidations Made:**
- Photos → use existing attachments table
- Estimates → use work_orders with estimate status
- Customer contracts → use service_agreements from Phase 2
- Performance dashboards → generate dynamically from metrics

This would put you at ServiceTitan Enterprise level with unique marketplace advantage.