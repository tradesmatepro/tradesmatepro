# Current Database Schema

**Generated:** 2025-09-30T03:21:00.363Z

**Database:** postgres

---

## 📊 Summary

- **Tables:** 62
- **Enums:** 38
- **Foreign Keys:** 143

## 📋 Tables

### audit_logs

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| user_id | uuid | YES | - |
| table_name | text | NO | - |
| record_id | uuid | YES | - |
| action | USER-DEFINED | NO | - |
| old_values | jsonb | YES | - |
| new_values | jsonb | YES | - |
| ip_address | inet | YES | - |
| user_agent | text | YES | - |
| created_at | timestamp with time zone | YES | now() |

### billing_plans

**Rows:** 3

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | - |
| description | text | YES | - |
| price_monthly | numeric | NO | - |
| price_yearly | numeric | YES | - |
| features | jsonb | YES | '{}'::jsonb |
| max_users | integer | YES | 1 |
| max_work_orders | integer | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### companies

**Rows:** 1

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_number | text | NO | generate_company_number() |
| name | text | NO | - |
| legal_name | text | YES | - |
| tax_id | text | YES | - |
| phone | text | YES | - |
| email | text | YES | - |
| website | text | YES | - |
| address_line1 | text | YES | - |
| address_line2 | text | YES | - |
| city | text | YES | - |
| state_province | text | YES | - |
| postal_code | text | YES | - |
| country | text | YES | 'US'::text |
| time_zone | text | YES | 'UTC'::text |
| currency | text | YES | 'USD'::text |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| default_tax_rate | numeric | YES | 0.0875 |
| created_by | uuid | YES | - |
| tagline | text | YES | - |
| logo_url | text | YES | - |
| industry | text | YES | - |
| industry_tags | ARRAY | YES | - |

### company_settings

**Rows:** 1

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| business_hours | jsonb | YES | '{"monday": {"open": "08:00", "close": "17:00"}}'::jsonb |
| default_tax_rate | numeric | YES | 0.0000 |
| invoice_terms | text | YES | 'NET30'::text |
| auto_invoice | boolean | YES | false |
| require_signatures | boolean | YES | true |
| allow_online_payments | boolean | YES | true |
| emergency_rate_multiplier | numeric | YES | 1.50 |
| travel_charge_per_mile | numeric | YES | 0.65 |
| minimum_travel_charge | numeric | YES | 25.00 |
| cancellation_fee | numeric | YES | 50.00 |
| transparency_mode | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| onboarding_progress | jsonb | YES | '{"steps": {"1": {"name": "Company Basics", "completed": false, "completed_at": null}, "2": {"name": "Services & Pricing", "completed": false, "completed_at": null}, "3": {"name": "Team Setup", "completed": false, "completed_at": null}, "4": {"name": "Business Preferences", "completed": false, "completed_at": null}, "5": {"name": "Financial Setup", "completed": false, "completed_at": null}, "6": {"name": "Go Live", "completed": false, "completed_at": null}}, "skipped": false, "started_at": null, "completed_at": null, "current_step": 1, "completed_steps": []}'::jsonb |
| timezone | text | YES | 'America/New_York'::text |
| display_name | text | YES | - |
| labor_rate | numeric | YES | 75.00 |
| overtime_multiplier | numeric | YES | 1.5 |
| parts_markup | numeric | YES | 25.00 |

### customer_addresses

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| customer_id | uuid | YES | - |
| address_type | text | YES | 'SERVICE'::text |
| address_line_1 | text | NO | - |
| address_line2 | text | YES | - |
| city | text | NO | - |
| state | text | NO | - |
| zip_code | text | NO | - |
| country | text | YES | 'US'::text |
| is_primary | boolean | YES | false |
| latitude | numeric | YES | - |
| longitude | numeric | YES | - |
| access_notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| company_id | uuid | YES | - |
| address_name | text | YES | - |

### customer_equipment

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| customer_id | uuid | YES | - |
| customer_address_id | uuid | YES | - |
| equipment_type | text | YES | - |
| manufacturer | text | YES | - |
| model_number | text | YES | - |
| serial_number | text | YES | - |
| install_date | date | YES | - |
| installed_by | uuid | YES | - |
| warranty_start_date | date | YES | - |
| warranty_end_date | date | YES | - |
| warranty_provider | text | YES | - |
| location_description | text | YES | - |
| status | text | YES | 'active'::text |
| notes | text | YES | - |
| photos | ARRAY | YES | - |
| documents | ARRAY | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| last_service_date | date | YES | - |

### customer_tag_assignments

**Rows:** 5

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| customer_id | uuid | YES | - |
| tag_id | uuid | YES | - |
| assigned_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

### customer_tags

**Rows:** 20

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | - |
| description | text | YES | - |
| color | text | YES | '#6b7280'::text |
| priority | integer | YES | 50 |
| created_at | timestamp with time zone | YES | now() |
| company_id | uuid | NO | - |

### customers

**Rows:** 2

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| customer_number | text | NO | - |
| type | text | YES | 'residential'::text |
| first_name | text | YES | - |
| last_name | text | YES | - |
| company_name | text | YES | - |
| email | text | YES | - |
| phone | text | YES | - |
| mobile_phone | text | YES | - |
| preferred_contact | text | YES | 'phone'::text |
| source | text | YES | - |
| notes | text | YES | - |
| credit_limit | numeric | YES | 0.00 |
| payment_terms | text | YES | 'NET30'::text |
| tax_exempt | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| customer_since | date | YES | CURRENT_DATE |
| status | text | YES | 'active'::text |
| billing_address_line_1 | text | YES | - |
| billing_address_line_2 | text | YES | - |
| billing_city | text | YES | - |
| billing_state | text | YES | - |
| billing_zip_code | text | YES | - |
| billing_country | text | YES | 'United States'::text |
| primary_contact_name | text | YES | - |
| primary_contact_phone | text | YES | - |
| primary_contact_email | text | YES | - |
| preferred_contact_method | text | YES | 'email'::text |
| preferred_contact_time | text | YES | - |
| communication_preferences | jsonb | YES | '{"marketing_emails": false, "sms_notifications": false, "email_notifications": true}'::jsonb |

### document_templates

**Rows:** 2

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| name | text | NO | - |
| type | text | NO | - |
| header_text | text | YES | - |
| footer_text | text | YES | - |
| terms | text | YES | - |
| logo_url | text | YES | - |
| is_default | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### documents

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| customer_id | uuid | YES | - |
| document_type | text | NO | - |
| title | text | NO | - |
| file_name | text | NO | - |
| file_url | text | NO | - |
| file_size | integer | YES | - |
| mime_type | text | YES | - |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

### employee_timesheets

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| employee_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| date | date | NO | - |
| clock_in | timestamp with time zone | YES | - |
| clock_out | timestamp with time zone | YES | - |
| break_duration | integer | YES | 0 |
| regular_hours | numeric | YES | 0.00 |
| overtime_hours | numeric | YES | 0.00 |
| status | USER-DEFINED | YES | 'draft'::timesheet_status_enum |
| notes | text | YES | - |
| approved_by | uuid | YES | - |
| approved_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### employees

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| user_id | uuid | YES | - |
| employee_number | text | NO | - |
| hire_date | date | YES | CURRENT_DATE |
| termination_date | date | YES | - |
| job_title | text | YES | - |
| department | text | YES | - |
| hourly_rate | numeric | YES | 0.00 |
| overtime_rate | numeric | YES | - |
| emergency_contact_name | text | YES | - |
| emergency_contact_phone | text | YES | - |
| certifications | ARRAY | YES | - |
| skills | ARRAY | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| employee_type | text | YES | - |
| pay_type | text | YES | - |

### expenses

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| employee_id | uuid | YES | - |
| expense_type | USER-DEFINED | NO | - |
| description | text | NO | - |
| amount | numeric | NO | - |
| expense_date | date | YES | CURRENT_DATE |
| receipt_url | text | YES | - |
| is_billable | boolean | YES | false |
| is_reimbursable | boolean | YES | true |
| status | text | YES | 'pending'::text |
| approved_by | uuid | YES | - |
| approved_at | timestamp with time zone | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |

### inventory_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| sku | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| category | text | YES | - |
| unit_of_measure | text | YES | 'each'::text |
| cost_price | numeric | YES | 0.00 |
| sell_price | numeric | YES | 0.00 |
| reorder_point | integer | YES | 0 |
| reorder_quantity | integer | YES | 0 |
| barcode | text | YES | - |
| manufacturer | text | YES | - |
| model_number | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### inventory_locations

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| address_line1 | text | YES | - |
| address_line2 | text | YES | - |
| city | text | YES | - |
| state_province | text | YES | - |
| postal_code | text | YES | - |
| is_mobile | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### inventory_movements

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| item_id | uuid | YES | - |
| location_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| movement_type | USER-DEFINED | NO | - |
| quantity | integer | NO | - |
| unit_cost | numeric | YES | 0.00 |
| reference_number | text | YES | - |
| notes | text | YES | - |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

### inventory_stock

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| item_id | uuid | YES | - |
| location_id | uuid | YES | - |
| quantity_on_hand | integer | YES | 0 |
| quantity_allocated | integer | YES | 0 |
| quantity_available | integer | YES | - |
| last_counted_at | timestamp with time zone | YES | - |
| last_counted_by | uuid | YES | - |
| updated_at | timestamp with time zone | YES | now() |

### invoice_line_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| invoice_id | uuid | YES | - |
| description | text | NO | - |
| quantity | numeric | YES | 1.000 |
| unit_price | numeric | NO | - |
| total_price | numeric | YES | - |
| tax_rate | numeric | YES | 0.0000 |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| item_type | text | YES | - |
| line_number | integer | YES | - |

### invoices

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| customer_id | uuid | NO | - |
| invoice_number | text | NO | - |
| status | USER-DEFINED | YES | 'draft'::invoice_status_enum |
| issue_date | date | YES | CURRENT_DATE |
| due_date | date | YES | - |
| subtotal | numeric | YES | 0.00 |
| tax_amount | numeric | YES | 0.00 |
| total_amount | numeric | YES | 0.00 |
| amount_paid | numeric | YES | 0.00 |
| balance_due | numeric | YES | - |
| terms | text | YES | 'NET30'::text |
| notes | text | YES | - |
| sent_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| discount_percentage | numeric | YES | 0 |
| late_fee_amount | numeric | YES | 0 |
| pdf_url | text | YES | - |
| customer_name_snapshot | text | YES | - |
| customer_address_snapshot | text | YES | - |
| customer_tax_id_snapshot | text | YES | - |
| company_name_snapshot | text | YES | - |
| company_address_snapshot | text | YES | - |
| company_tax_id_snapshot | text | YES | - |

### marketplace_messages

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| request_id | uuid | YES | - |
| response_id | uuid | YES | - |
| sender_company_id | uuid | YES | - |
| sender_user_id | uuid | YES | - |
| message | text | NO | - |
| attachments | ARRAY | YES | - |
| is_read | boolean | YES | false |
| read_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |

### marketplace_requests

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| customer_id | uuid | YES | - |
| title | text | NO | - |
| description | text | YES | - |
| service_category_id | uuid | YES | - |
| service_type_id | uuid | YES | - |
| service_address | text | YES | - |
| service_city | text | YES | - |
| service_state | text | YES | - |
| service_zip | text | YES | - |
| service_location_lat | numeric | YES | - |
| service_location_lng | numeric | YES | - |
| preferred_date | date | YES | - |
| preferred_time_start | time without time zone | YES | - |
| preferred_time_end | time without time zone | YES | - |
| is_flexible | boolean | YES | true |
| is_emergency | boolean | YES | false |
| budget_min | numeric | YES | - |
| budget_max | numeric | YES | - |
| status | text | YES | 'OPEN'::text |
| photos | ARRAY | YES | - |
| attachments | ARRAY | YES | - |
| response_count | integer | YES | 0 |
| view_count | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| expires_at | timestamp with time zone | YES | - |
| closed_at | timestamp with time zone | YES | - |

### marketplace_responses

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| request_id | uuid | YES | - |
| contractor_company_id | uuid | YES | - |
| message | text | YES | - |
| estimated_cost | numeric | YES | - |
| estimated_duration | integer | YES | - |
| available_date | date | YES | - |
| available_time_start | time without time zone | YES | - |
| available_time_end | time without time zone | YES | - |
| status | text | YES | 'PENDING'::text |
| response_time_minutes | integer | YES | - |
| photos | ARRAY | YES | - |
| attachments | ARRAY | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| viewed_at | timestamp with time zone | YES | - |
| accepted_at | timestamp with time zone | YES | - |
| rejected_at | timestamp with time zone | YES | - |

### marketplace_settings

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| emergency_rate_multiplier | numeric | YES | 1.0 |
| transparency_mode | boolean | YES | false |
| auto_accept_jobs | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### messages

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| customer_id | uuid | YES | - |
| sender_id | uuid | YES | - |
| recipient_type | text | NO | - |
| recipient_id | uuid | YES | - |
| subject | text | YES | - |
| content | text | NO | - |
| message_type | text | YES | 'email'::text |
| status | text | YES | 'draft'::text |
| sent_at | timestamp with time zone | YES | - |
| read_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| delivered_at | timestamp with time zone | YES | - |

### notifications

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| user_id | uuid | YES | - |
| type | USER-DEFINED | YES | 'in_app'::notification_type_enum |
| title | text | NO | - |
| message | text | NO | - |
| data | jsonb | YES | '{}'::jsonb |
| status | USER-DEFINED | YES | 'pending'::notification_status_enum |
| scheduled_for | timestamp with time zone | YES | now() |
| sent_at | timestamp with time zone | YES | - |
| read_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| expires_at | timestamp with time zone | YES | - |
| action_url | text | YES | - |

### onboarding_progress

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| current_step | integer | YES | 1 |
| steps | jsonb | YES | '{}'::jsonb |
| skipped | boolean | YES | false |
| started_at | timestamp with time zone | YES | now() |
| completed_at | timestamp with time zone | YES | - |

### payment_settings

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| default_payment_method | text | YES | 'CARD'::text |
| invoice_template_id | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### payments

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| invoice_id | uuid | YES | - |
| customer_id | uuid | NO | - |
| payment_method | text | YES | 'cash'::text |
| amount | numeric | NO | - |
| status | USER-DEFINED | YES | 'pending'::payment_status_enum |
| reference_number | text | YES | - |
| transaction_id | text | YES | - |
| payment_date | date | YES | CURRENT_DATE |
| notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| received_at | timestamp with time zone | YES | now() |
| gateway_response | jsonb | YES | - |
| refund_amount | numeric | YES | 0 |
| refund_date | date | YES | - |

### payroll_line_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| payroll_run_id | uuid | YES | - |
| employee_id | uuid | YES | - |
| regular_hours | numeric | YES | 0.00 |
| overtime_hours | numeric | YES | 0.00 |
| regular_pay | numeric | YES | 0.00 |
| overtime_pay | numeric | YES | 0.00 |
| gross_pay | numeric | YES | 0.00 |
| deductions | numeric | YES | 0.00 |
| net_pay | numeric | YES | 0.00 |
| created_at | timestamp with time zone | YES | now() |

### payroll_runs

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| pay_period_start | date | NO | - |
| pay_period_end | date | NO | - |
| pay_date | date | NO | - |
| status | USER-DEFINED | YES | 'draft'::payroll_run_status_enum |
| total_gross | numeric | YES | 0.00 |
| total_deductions | numeric | YES | 0.00 |
| total_net | numeric | YES | 0.00 |
| processed_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### permissions

**Rows:** 9

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| name | text | NO | - |
| description | text | YES | - |
| level | integer | NO | - |
| created_at | timestamp with time zone | YES | now() |

### profiles

**Rows:** 3

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | YES | - |
| first_name | text | NO | - |
| last_name | text | NO | - |
| phone | text | YES | - |
| avatar_url | text | YES | - |
| preferences | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| status | USER-DEFINED | YES | 'active'::employee_status_enum |
| emergency_contact_phone | text | YES | - |
| hire_date | date | YES | - |
| company_id | uuid | YES | - |
| email | text | YES | - |
| role | USER-DEFINED | YES | 'technician'::user_role_enum |

### purchase_order_line_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| purchase_order_id | uuid | YES | - |
| inventory_item_id | uuid | YES | - |
| description | text | NO | - |
| quantity | numeric | NO | - |
| unit_price | numeric | NO | - |
| total_price | numeric | YES | - |
| quantity_received | numeric | YES | 0 |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### purchase_orders

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| vendor_id | uuid | NO | - |
| work_order_id | uuid | YES | - |
| po_number | text | NO | - |
| status | text | YES | 'draft'::text |
| order_date | date | YES | CURRENT_DATE |
| expected_date | date | YES | - |
| subtotal | numeric | YES | 0.00 |
| tax_amount | numeric | YES | 0.00 |
| shipping_amount | numeric | YES | 0.00 |
| total_amount | numeric | YES | 0.00 |
| notes | text | YES | - |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_analytics

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| company_id | uuid | YES | - |
| quote_created_at | timestamp with time zone | NO | - |
| quote_sent_at | timestamp with time zone | YES | - |
| quote_viewed_at | timestamp with time zone | YES | - |
| quote_accepted_at | timestamp with time zone | YES | - |
| quote_rejected_at | timestamp with time zone | YES | - |
| time_to_send_hours | numeric | YES | - |
| time_to_view_hours | numeric | YES | - |
| time_to_decision_hours | numeric | YES | - |
| conversion_rate | numeric | YES | - |
| quote_value | numeric | YES | - |
| quote_version | integer | YES | 1 |
| revision_count | integer | YES | 0 |
| view_count | integer | YES | 0 |
| follow_up_count | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_approval_workflows

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| work_order_id | uuid | NO | - |
| workflow_name | character varying | NO | - |
| approval_threshold | numeric | YES | - |
| current_step | integer | YES | 1 |
| total_steps | integer | NO | - |
| overall_status | character varying | YES | 'pending'::character varying |
| approver_user_id | uuid | YES | - |
| approver_role | character varying | YES | - |
| submitted_at | timestamp with time zone | YES | now() |
| approved_at | timestamp with time zone | YES | - |
| rejected_at | timestamp with time zone | YES | - |
| approval_notes | text | YES | - |
| rejection_reason | text | YES | - |
| escalated | boolean | YES | false |
| escalated_at | timestamp with time zone | YES | - |
| escalated_to | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_approvals

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| company_id | uuid | YES | - |
| approver_id | uuid | YES | - |
| approver_role | text | YES | - |
| status | text | YES | 'PENDING'::text |
| approved_at | timestamp with time zone | YES | - |
| rejected_at | timestamp with time zone | YES | - |
| decision_notes | text | YES | - |
| auto_approved | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_defaults

**Rows:** 1

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| default_tax_rate | numeric | YES | 0.00 |
| default_payment_terms | text | YES | 'Net 30'::text |
| default_deposit_percentage | numeric | YES | - |
| require_deposit | boolean | YES | false |
| default_terms_and_conditions | text | YES | - |
| default_warranty_info | text | YES | - |
| default_cancellation_policy | text | YES | - |
| default_quote_expiration_days | integer | YES | 30 |
| auto_send_follow_ups | boolean | YES | true |
| follow_up_days | ARRAY | YES | ARRAY[3, 7, 14] |
| require_manager_approval | boolean | YES | false |
| approval_threshold_amount | numeric | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_follow_ups

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| company_id | uuid | YES | - |
| follow_up_type | text | YES | - |
| scheduled_date | timestamp with time zone | NO | - |
| completed_date | timestamp with time zone | YES | - |
| status | text | YES | 'SCHEDULED'::text |
| outcome | text | YES | - |
| subject | text | YES | - |
| message | text | YES | - |
| notes | text | YES | - |
| assigned_to | uuid | YES | - |
| is_automated | boolean | YES | false |
| attempt_number | integer | YES | 1 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### quote_template_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| template_id | uuid | YES | - |
| line_type | text | NO | - |
| description | text | NO | - |
| quantity | numeric | YES | 1.000 |
| unit_price | numeric | NO | - |
| is_optional | boolean | YES | false |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### quote_templates

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| category | text | YES | - |
| default_pricing_model | text | YES | 'TIME_MATERIALS'::text |
| default_terms | text | YES | 'Net 30'::text |
| default_notes | text | YES | - |
| is_active | boolean | YES | true |
| use_count | integer | YES | 0 |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### rate_cards

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| service_category_id | uuid | NO | - |
| service_type_id | uuid | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| base_rate | numeric | NO | - |
| unit_type | text | NO | - |
| unit_label | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| category | USER-DEFINED | NO | 'OTHER'::service_category_enum |
| effective_date | date | YES | CURRENT_DATE |
| expiration_date | date | YES | - |

### recurring_schedules

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| customer_id | uuid | YES | - |
| title | text | NO | - |
| description | text | YES | - |
| service_type_id | uuid | YES | - |
| frequency | text | YES | - |
| interval | integer | YES | 1 |
| day_of_week | integer | YES | - |
| day_of_month | integer | YES | - |
| start_date | date | NO | - |
| end_date | date | YES | - |
| next_occurrence | date | YES | - |
| assigned_to | uuid | YES | - |
| price_per_occurrence | numeric | YES | - |
| is_active | boolean | YES | true |
| status | text | YES | 'active'::text |
| occurrences_completed | integer | YES | 0 |
| last_occurrence_date | date | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### schedule_events

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| user_id | uuid | YES | - |
| title | text | NO | - |
| description | text | YES | - |
| start_time | timestamp with time zone | NO | - |
| end_time | timestamp with time zone | NO | - |
| all_day | boolean | YES | false |
| location | text | YES | - |
| status | text | YES | 'scheduled'::text |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### service_agreements

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| customer_id | uuid | NO | - |
| agreement_number | text | NO | - |
| title | text | NO | - |
| description | text | YES | - |
| agreement_type | text | NO | - |
| status | text | YES | 'active'::text |
| start_date | date | NO | - |
| end_date | date | YES | - |
| auto_renew | boolean | YES | false |
| renewal_period_months | integer | YES | 12 |
| service_frequency | text | YES | - |
| contract_value | numeric | YES | 0.00 |
| billing_frequency | text | YES | 'monthly'::text |
| next_service_date | date | YES | - |
| last_service_date | date | YES | - |
| terms_and_conditions | text | YES | - |
| created_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| renewal_date | date | YES | - |
| cancellation_date | date | YES | - |
| cancellation_reason | text | YES | - |

### service_categories

**Rows:** 9

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| icon_url | text | YES | - |
| color | text | YES | '#6b7280'::text |
| sort_order | integer | YES | 0 |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### service_types

**Rows:** 36

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| category_id | uuid | YES | - |
| name | text | NO | - |
| description | text | YES | - |
| base_price | numeric | YES | 0.00 |
| estimated_duration | text | YES | '2 hours'::text |
| requires_permit | boolean | YES | false |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### subscriptions

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| billing_plan_id | uuid | YES | - |
| status | text | YES | 'active'::text |
| current_period_start | timestamp with time zone | YES | - |
| current_period_end | timestamp with time zone | YES | - |
| trial_end | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### taxes

**Rows:** 4

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| name | text | NO | - |
| tax_type | USER-DEFINED | YES | 'sales_tax'::tax_type_enum |
| rate | numeric | NO | - |
| description | text | YES | - |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |

### tools

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| tool_number | text | NO | - |
| name | text | NO | - |
| description | text | YES | - |
| category | text | YES | - |
| manufacturer | text | YES | - |
| model | text | YES | - |
| serial_number | text | YES | - |
| purchase_date | date | YES | - |
| purchase_price | numeric | YES | 0.00 |
| current_value | numeric | YES | 0.00 |
| status | USER-DEFINED | YES | 'available'::tool_status_enum |
| assigned_to | uuid | YES | - |
| location | text | YES | - |
| maintenance_schedule | text | YES | - |
| last_maintenance | date | YES | - |
| next_maintenance | date | YES | - |
| warranty_expiry | date | YES | - |
| notes | text | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### user_dashboard_settings

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | - |
| dashboard_config | jsonb | YES | '{}'::jsonb |
| widget_preferences | jsonb | YES | '{}'::jsonb |
| layout_settings | jsonb | YES | '{}'::jsonb |
| theme_settings | jsonb | YES | '{}'::jsonb |
| notification_preferences | jsonb | YES | '{}'::jsonb |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### users

**Rows:** 2

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| auth_user_id | uuid | YES | - |
| company_id | uuid | YES | - |
| role | USER-DEFINED | NO | 'technician'::user_role_enum |
| status | USER-DEFINED | NO | 'active'::employee_status_enum |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| login_count | integer | YES | 0 |

### vendors

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| vendor_number | text | NO | - |
| name | text | NO | - |
| vendor_type | USER-DEFINED | YES | 'supplier'::vendor_type_enum |
| contact_name | text | YES | - |
| email | text | YES | - |
| phone | text | YES | - |
| website | text | YES | - |
| address_line1 | text | YES | - |
| address_line2 | text | YES | - |
| city | text | YES | - |
| state_province | text | YES | - |
| postal_code | text | YES | - |
| country | text | YES | 'US'::text |
| tax_id | text | YES | - |
| payment_terms | text | YES | 'NET30'::text |
| credit_limit | numeric | YES | 0.00 |
| is_active | boolean | YES | true |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### work_order_attachments

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| file_name | text | NO | - |
| file_url | text | NO | - |
| file_type | text | YES | - |
| file_size | integer | YES | - |
| uploaded_by | uuid | YES | - |
| created_at | timestamp with time zone | YES | now() |

### work_order_line_items

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| line_type | USER-DEFINED | NO | - |
| description | text | NO | - |
| quantity | numeric | YES | 1.000 |
| unit_price | numeric | NO | - |
| total_price | numeric | YES | - |
| tax_rate | numeric | YES | 0.0000 |
| sort_order | integer | YES | 0 |
| created_at | timestamp with time zone | YES | now() |

### work_order_notes

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| work_order_id | uuid | YES | - |
| user_id | uuid | YES | - |
| note_type | text | YES | 'general'::text |
| content | text | NO | - |
| is_internal | boolean | YES | false |
| created_at | timestamp with time zone | YES | now() |

### work_order_products

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| inventory_item_id | uuid | YES | - |
| product_name | text | NO | - |
| product_sku | text | YES | - |
| quantity_planned | numeric | YES | - |
| quantity_used | numeric | YES | - |
| unit_of_measure | text | YES | - |
| unit_cost | numeric | YES | - |
| unit_price | numeric | YES | - |
| total_cost | numeric | YES | - |
| total_price | numeric | YES | - |
| status | text | YES | 'planned'::text |
| notes | text | YES | - |
| allocated_at | timestamp with time zone | YES | - |
| used_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### work_order_services

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| service_name | text | NO | - |
| service_type_id | uuid | YES | - |
| description | text | YES | - |
| employee_id | uuid | YES | - |
| hours_estimated | numeric | YES | - |
| hours_actual | numeric | YES | - |
| hourly_rate | numeric | YES | - |
| total_cost | numeric | YES | - |
| total_price | numeric | YES | - |
| status | text | YES | 'planned'::text |
| notes | text | YES | - |
| started_at | timestamp with time zone | YES | - |
| completed_at | timestamp with time zone | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### work_order_tasks

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_id | uuid | YES | - |
| task_name | text | NO | - |
| description | text | YES | - |
| instructions | text | YES | - |
| assigned_to | uuid | YES | - |
| status | text | YES | 'pending'::text |
| estimated_duration | integer | YES | - |
| actual_duration | integer | YES | - |
| started_at | timestamp with time zone | YES | - |
| completed_at | timestamp with time zone | YES | - |
| sort_order | integer | YES | 0 |
| notes | text | YES | - |
| photos | ARRAY | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

### work_orders

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | YES | - |
| work_order_number | text | NO | - |
| customer_id | uuid | YES | - |
| customer_address_id | uuid | YES | - |
| service_category_id | uuid | YES | - |
| service_type_id | uuid | YES | - |
| status | USER-DEFINED | YES | 'draft'::work_order_status_enum |
| priority | USER-DEFINED | YES | 'normal'::work_order_priority_enum |
| title | text | NO | - |
| description | text | YES | - |
| scheduled_start | timestamp with time zone | YES | - |
| scheduled_end | timestamp with time zone | YES | - |
| actual_start | timestamp with time zone | YES | - |
| actual_end | timestamp with time zone | YES | - |
| assigned_to | uuid | YES | - |
| created_by | uuid | YES | - |
| subtotal | numeric | YES | 0.00 |
| tax_amount | numeric | YES | 0.00 |
| total_amount | numeric | YES | 0.00 |
| notes | text | YES | - |
| internal_notes | text | YES | - |
| requires_signature | boolean | YES | true |
| customer_signature_url | text | YES | - |
| technician_signature_url | text | YES | - |
| completion_photos | ARRAY | YES | - |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |
| customer_feedback | text | YES | - |
| quote_sent_at | timestamp with time zone | YES | - |
| quote_viewed_at | timestamp with time zone | YES | - |
| quote_expires_at | timestamp with time zone | YES | - |
| quote_accepted_at | timestamp with time zone | YES | - |
| quote_rejected_at | timestamp with time zone | YES | - |
| quote_rejection_reason | text | YES | - |
| quote_terms | text | YES | 'Net 30'::text |
| quote_notes | text | YES | - |
| quote_version | integer | YES | 1 |
| quote_parent_id | uuid | YES | - |
| deposit_amount | numeric | YES | 0.00 |
| deposit_percentage | numeric | YES | - |
| payment_schedule | jsonb | YES | - |
| discount_amount | numeric | YES | 0.00 |
| discount_percentage | numeric | YES | - |
| payment_terms | text | YES | 'Net 30'::text |
| estimated_duration_hours | numeric | YES | - |
| requires_site_visit | boolean | YES | false |
| urgency_level | text | YES | 'routine'::text |
| service_location_type | text | YES | 'residential'::text |
| terms_and_conditions | text | YES | - |
| warranty_info | text | YES | - |
| cancellation_policy | text | YES | - |
| special_instructions | text | YES | - |
| preferred_start_date | date | YES | - |
| estimated_completion_date | date | YES | - |
| assigned_technician_id | uuid | YES | - |
| attachment_urls | ARRAY | YES | - |
| photo_urls | ARRAY | YES | - |
| document_urls | ARRAY | YES | - |
| customer_approved_at | timestamp with time zone | YES | - |
| customer_signature_data | text | YES | - |
| customer_ip_address | inet | YES | - |
| approval_method | text | YES | - |
| estimated_duration | integer | YES | - |
| actual_duration | integer | YES | - |
| service_location_lat | numeric | YES | - |
| service_location_lng | numeric | YES | - |
| time_window_start | time without time zone | YES | - |
| time_window_end | time without time zone | YES | - |
| customer_equipment_id | uuid | YES | - |
| pricing_model | USER-DEFINED | YES | 'TIME_MATERIALS'::pricing_model_enum |
| labor_summary | jsonb | YES | - |
| flat_rate_amount | numeric | YES | - |
| unit_count | integer | YES | - |
| unit_price | numeric | YES | - |
| percentage | numeric | YES | - |
| percentage_base_amount | numeric | YES | - |
| recurring_interval | text | YES | - |
| service_address_line_1 | text | YES | - |
| service_address_line_2 | text | YES | - |
| service_city | text | YES | - |
| service_state | text | YES | - |
| service_zip_code | text | YES | - |
| tax_rate | numeric | YES | 0.00 |
| quote_number | text | YES | - |
| customer_notes | text | YES | - |

### work_settings

**Rows:** 0

| Column | Type | Nullable | Default |
|--------|------|----------|----------|
| id | uuid | NO | gen_random_uuid() |
| company_id | uuid | NO | - |
| business_hours | jsonb | YES | - |
| default_tax_rate | numeric | YES | 0.00 |
| invoice_terms | text | YES | 'NET30'::text |
| auto_invoice | boolean | YES | false |
| require_signatures | boolean | YES | false |
| cancellation_fee | numeric | YES | 0.00 |
| travel_charge_per_mile | numeric | YES | 0.00 |
| minimum_travel_charge | numeric | YES | 0.00 |
| created_at | timestamp with time zone | YES | now() |
| updated_at | timestamp with time zone | YES | now() |

## 🏷️ Enums

### alert_severity_enum

Values: {info,warning,error,critical,emergency}

### audit_action_enum

Values: {insert,update,delete,login,logout,permission_change,export,import,backup,restore}

### bid_status_enum

Values: {draft,submitted,under_review,accepted,rejected,withdrawn,expired}

### certification_status_enum

Values: {active,expired,pending_renewal,suspended,revoked}

### customer_type_enum

Values: {residential,commercial,industrial,government}

### document_type_enum

Values: {quote,invoice,receipt,contract,permit,warranty,photo,other}

### employee_status_enum

Values: {probation,active,inactive,suspended,terminated,on_leave,retired}

### escrow_status_enum

Values: {pending,funded,held,released_to_contractor,refunded_to_customer,disputed}

### expense_type_enum

Values: {labor,material,equipment,subcontractor,permit,travel,fuel,insurance,overhead,training,other}

### inventory_movement_type_enum

Values: {purchase,sale,transfer,adjustment,return,waste,theft,damage,warranty_replacement}

### invoice_status_enum

Values: {draft,sent,viewed,partially_paid,paid,overdue,disputed,written_off,cancelled}

### job_template_type_enum

Values: {installation,repair,maintenance,inspection,diagnostic,emergency,warranty,upgrade}

### marketplace_request_status_enum

Values: {draft,posted,bidding_open,bidding_closed,contractor_selected,work_in_progress,completed,cancelled,disputed}

### message_type_enum

Values: {email,sms,in_app,system,webhook}

### notification_status_enum

Values: {pending,sent,delivered,read,clicked,failed,bounced,unsubscribed}

### notification_type_enum

Values: {email,sms,in_app,push,webhook,slack,teams}

### optimization_type_enum

Values: {distance,time,cost,customer_priority,ai_hybrid}

### payment_status_enum

Values: {pending,processing,completed,partially_completed,failed,cancelled,refunded,disputed}

### payroll_run_status_enum

Values: {draft,calculating,pending_approval,approved,processing,completed,failed,cancelled}

### performance_rating_enum

Values: {excellent,good,satisfactory,needs_improvement,unsatisfactory}

### pricing_model_enum

Values: {TIME_MATERIALS,FLAT_RATE,UNIT,PERCENTAGE,RECURRING}

### rate_card_type_enum

Values: {hourly,flat_fee,per_unit,tiered,time_and_materials,value_based,subscription}

### schedule_status_enum

Values: {scheduled,confirmed,in_progress,completed,cancelled,rescheduled}

### sensor_status_enum

Values: {active,inactive,maintenance,error,calibrating}

### service_category_enum

Values: {HVAC,PLUMBING,ELECTRICAL,GENERAL_REPAIR,APPLIANCE_REPAIR,LANDSCAPING,CLEANING,PEST_CONTROL,ROOFING,FLOORING,PAINTING,CARPENTRY,OTHER}

### sla_priority_enum

Values: {critical,high,medium,low,scheduled}

### subscription_plan_enum

Values: {starter,professional,enterprise,custom}

### subscription_status_enum

Values: {trial,active,past_due,cancelled,suspended}

### tax_type_enum

Values: {vat,sales_tax,gst,hst,pst,excise,import_duty,none}

### timesheet_status_enum

Values: {draft,submitted,under_review,approved,rejected,requires_correction,paid}

### tool_status_enum

Values: {available,assigned,in_use,maintenance,repair,calibration,lost,stolen,retired}

### unit_type_enum

Values: {HOUR,FLAT_FEE,SQFT,LINEAR_FOOT,UNIT,CUBIC_YARD,GALLON}

### user_role_enum

Values: {owner,admin,manager,dispatcher,supervisor,lead_technician,technician,apprentice,helper,accountant,sales_rep,customer_service,customer_portal,vendor_portal,APP_OWNER,EMPLOYEE}

### user_status_enum

Values: {active,inactive,suspended,terminated,pending}

### vendor_type_enum

Values: {supplier,subcontractor,manufacturer,distributor,service_provider,rental_company}

### work_order_line_item_type_enum

Values: {labor,material,equipment,service,permit,disposal,travel,fee,discount,tax}

### work_order_priority_enum

Values: {low,normal,high,urgent,emergency,seasonal_peak}

### work_order_status_enum

Values: {draft,quote,approved,scheduled,parts_ordered,on_hold,in_progress,requires_approval,rework_needed,completed,invoiced,cancelled}

