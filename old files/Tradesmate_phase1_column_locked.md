📋 TradesMate Pro — Phase 1 Core Schema (Locked Columns)
Auth & Identity

auth.users (Supabase managed)

id UUID PK

email TEXT UNIQUE

encrypted_password TEXT

created_at TIMESTAMPTZ

last_sign_in_at TIMESTAMPTZ

users

id UUID PK

auth_user_id UUID → auth.users(id)

company_id UUID → companies(id)

role ENUM(admin, manager, employee, contractor)

status ENUM(active, inactive, suspended)

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

profiles

id UUID PK

user_id UUID → users(id)

first_name TEXT

last_name TEXT

phone TEXT

avatar_url TEXT

preferences JSONB

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

permissions

id UUID PK

role TEXT

resource TEXT

action TEXT (read, write, delete, approve)

created_at TIMESTAMPTZ

Account / Company

companies

id UUID PK

name TEXT

industry TEXT

phone TEXT

email TEXT

website TEXT

address_line1 TEXT

address_line2 TEXT

city TEXT

state TEXT

postal_code TEXT

country TEXT

timezone TEXT

logo_url TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

company_settings

id UUID PK

company_id UUID → companies(id)

settings JSONB

created_at TIMESTAMPTZ

subscriptions / billing_plans

id UUID PK

company_id UUID → companies(id)

plan TEXT (free, pro, enterprise)

status ENUM(active, trial, cancelled, expired)

billing_cycle ENUM(monthly, annual)

renewal_date DATE

created_at TIMESTAMPTZ

CRM

customers

id UUID PK

company_id UUID → companies(id)

customer_number TEXT UNIQUE

name TEXT

type ENUM(individual, business)

phone TEXT

email TEXT

preferred_contact_method TEXT

payment_terms_days INT DEFAULT 30

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

customer_addresses

id UUID PK

customer_id UUID → customers(id)

address_type ENUM(billing, service, mailing)

address_line1 TEXT

address_line2 TEXT

city TEXT

state TEXT

postal_code TEXT

country TEXT

is_primary BOOLEAN DEFAULT false

created_at TIMESTAMPTZ

customer_contacts

id UUID PK

customer_id UUID → customers(id)

first_name TEXT

last_name TEXT

phone TEXT

email TEXT

role TEXT (decision-maker, site contact, accounting)

created_at TIMESTAMPTZ

customer_notes

id UUID PK

customer_id UUID → customers(id)

note TEXT

created_by UUID → users(id)

created_at TIMESTAMPTZ

customer_tags

id UUID PK

customer_id UUID → customers(id)

tag TEXT

created_at TIMESTAMPTZ

Work (Unified Pipeline)

work_orders

id UUID PK

company_id UUID → companies(id)

customer_id UUID → customers(id)

work_order_number TEXT UNIQUE

status ENUM(draft, quote, scheduled, in_progress, completed, invoiced, cancelled)

priority ENUM(low, normal, high, urgent)

title TEXT

description TEXT

scheduled_start TIMESTAMPTZ

scheduled_end TIMESTAMPTZ

assigned_to UUID → employees(id)

total_amount NUMERIC(12,2)

balance_due NUMERIC(12,2)

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

work_order_line_items

id UUID PK

work_order_id UUID → work_orders(id)

item_id UUID → inventory_items(id)

description TEXT

quantity NUMERIC

unit_price NUMERIC(12,2)

discount_percent NUMERIC(5,2)

tax_rate NUMERIC(5,2)

total NUMERIC(12,2)

created_at TIMESTAMPTZ

work_order_attachments

id UUID PK

work_order_id UUID → work_orders(id)

file_url TEXT

file_type TEXT

uploaded_by UUID → users(id)

created_at TIMESTAMPTZ

work_order_notes

id UUID PK

work_order_id UUID → work_orders(id)

note TEXT

created_by UUID → users(id)

created_at TIMESTAMPTZ

schedule_events

id UUID PK

work_order_id UUID → work_orders(id)

employee_id UUID → employees(id)

start_time TIMESTAMPTZ

end_time TIMESTAMPTZ

status ENUM(confirmed, cancelled, rescheduled)

created_at TIMESTAMPTZ

documents

id UUID PK

company_id UUID → companies(id)

title TEXT

file_url TEXT

document_type TEXT (contract, form, etc.)

uploaded_by UUID → users(id)

created_at TIMESTAMPTZ

Finance

invoices

id UUID PK

company_id UUID → companies(id)

work_order_id UUID → work_orders(id)

invoice_number TEXT UNIQUE

status ENUM(draft, sent, paid, overdue, void)

invoice_date DATE

due_date DATE

payment_terms_days INT DEFAULT 30

subtotal NUMERIC(12,2)

tax_total NUMERIC(12,2)

total NUMERIC(12,2)

balance_due NUMERIC(12,2)

created_at TIMESTAMPTZ

invoice_line_items

id UUID PK

invoice_id UUID → invoices(id)

description TEXT

quantity NUMERIC

unit_price NUMERIC(12,2)

discount_percent NUMERIC(5,2)

tax_rate NUMERIC(5,2)

total NUMERIC(12,2)

created_at TIMESTAMPTZ

payments

id UUID PK

company_id UUID → companies(id)

invoice_id UUID → invoices(id)

payment_number TEXT UNIQUE

amount NUMERIC(12,2)

payment_method TEXT (card, ACH, check, cash)

status ENUM(pending, completed, failed, refunded)

processed_at TIMESTAMPTZ

created_at TIMESTAMPTZ

expenses

id UUID PK

company_id UUID → companies(id)

work_order_id UUID → work_orders(id)

vendor_id UUID → vendors(id)

amount NUMERIC(12,2)

description TEXT

expense_date DATE

created_at TIMESTAMPTZ

taxes

id UUID PK

company_id UUID → companies(id)

name TEXT

rate NUMERIC(5,2)

jurisdiction TEXT

created_at TIMESTAMPTZ

Team

employees

id UUID PK

company_id UUID → companies(id)

user_id UUID → users(id)

employee_number TEXT UNIQUE

job_title TEXT

hire_date DATE

status ENUM(active, inactive)

created_at TIMESTAMPTZ

employee_timesheets

id UUID PK

employee_id UUID → employees(id)

work_order_id UUID → work_orders(id)

clock_in TIMESTAMPTZ

clock_out TIMESTAMPTZ

hours NUMERIC(5,2)

created_at TIMESTAMPTZ

payroll_runs

id UUID PK

company_id UUID → companies(id)

run_date DATE

status ENUM(draft, processed, closed)

created_at TIMESTAMPTZ

payroll_line_items

id UUID PK

payroll_run_id UUID → payroll_runs(id)

employee_id UUID → employees(id)

gross_pay NUMERIC(12,2)

deductions NUMERIC(12,2)

net_pay NUMERIC(12,2)

created_at TIMESTAMPTZ

Operations

inventory_items

id UUID PK

company_id UUID → companies(id)

name TEXT

sku TEXT UNIQUE

category TEXT

unit TEXT

cost_price NUMERIC(12,2)

sale_price NUMERIC(12,2)

reorder_point NUMERIC

reorder_quantity NUMERIC

preferred_vendor_id UUID → vendors(id)

created_at TIMESTAMPTZ

inventory_locations

id UUID PK

company_id UUID → companies(id)

name TEXT

address TEXT

created_at TIMESTAMPTZ

inventory_stock

id UUID PK

item_id UUID → inventory_items(id)

location_id UUID → inventory_locations(id)

quantity NUMERIC

created_at TIMESTAMPTZ

inventory_movements

id UUID PK

item_id UUID → inventory_items(id)

from_location_id UUID → inventory_locations(id)

to_location_id UUID → inventory_locations(id)

movement_type ENUM(purchase, sale, transfer, adjustment, return, waste)

reason TEXT

quantity NUMERIC

movement_date TIMESTAMPTZ

created_at TIMESTAMPTZ

vendors

id UUID PK

company_id UUID → companies(id)

name TEXT

phone TEXT

email TEXT

website TEXT

address_line1 TEXT

address_line2 TEXT

city TEXT

state TEXT

postal_code TEXT

country TEXT

created_at TIMESTAMPTZ

purchase_orders

id UUID PK

company_id UUID → companies(id)

vendor_id UUID → vendors(id)

po_number TEXT UNIQUE

order_date DATE

status ENUM(draft, sent, received, closed, cancelled)

total NUMERIC(12,2)

created_at TIMESTAMPTZ

purchase_order_line_items

id UUID PK

purchase_order_id UUID → purchase_orders(id)

item_id UUID → inventory_items(id)

quantity NUMERIC

unit_price NUMERIC(12,2)

total NUMERIC(12,2)

created_at TIMESTAMPTZ

tools

id UUID PK

company_id UUID → companies(id)

name TEXT

description TEXT

status ENUM(in_service, assigned, maintenance, retired)

assigned_to UUID → employees(id)

purchase_date DATE

cost NUMERIC(12,2)

created_at TIMESTAMPTZ

messages

id UUID PK

company_id UUID → companies(id)

sender_id UUID → users(id)

receiver_id UUID → users(id)

message TEXT

message_type ENUM(internal, sms, email)

status ENUM(sent, delivered, read)

created_at TIMESTAMPTZ

Service Management (Core Trade Features)

service_categories

id UUID PK

company_id UUID → companies(id)

name TEXT

description TEXT

created_at TIMESTAMPTZ

service_types

id UUID PK

company_id UUID → companies(id)

name TEXT

description TEXT

created_at TIMESTAMPTZ

Customer Portal Support

customer_portal_accounts

id UUID PK

customer_id UUID → customers(id)

auth_user_id UUID → auth.users(id)

status ENUM(active, inactive)

created_at TIMESTAMPTZ

portal_sessions

id UUID PK

customer_portal_account_id UUID → customer_portal_accounts(id)

login_time TIMESTAMPTZ

logout_time TIMESTAMPTZ

ip_address TEXT

device_info TEXT

customer_service_requests

id UUID PK

customer_id UUID → customers(id)

company_id UUID → companies(id)

service_type_id UUID → service_types(id)

description TEXT

status ENUM(new, in_progress, completed, cancelled)

priority ENUM(low, normal, high, urgent)

requested_date TIMESTAMPTZ

created_at TIMESTAMPTZ

System

audit_logs

id UUID PK

company_id UUID → companies(id)

user_id UUID → users(id)

entity_type TEXT

entity_id UUID

action ENUM(insert, update, delete, status_change)

old_data JSONB

new_data JSONB

created_at TIMESTAMPTZ

notifications

id UUID PK

company_id UUID → companies(id)

user_id UUID → users(id)

type ENUM(sms, email, in_app)

message TEXT

status ENUM(pending, sent, read)

created_at TIMESTAMPTZ

✅ This is the final locked Phase 1 Core schema with columns.
No more missing numbers, statuses, or address normalization.
It’s tenant-safe, industry-standard, and implementable in Supabase/Postgres.