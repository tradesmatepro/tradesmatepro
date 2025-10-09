Excellent point ⚡ — yes, there’s overlap right now between what you already have in your locked schema and what’s “standard.” If we just blindly add everything, we’d end up with duplicates (two places storing the same concept).

The trick is to separate concerns the way Jobber, Housecall, and ServiceTitan do — so no duplicates, just domain-specific tables.

🔎 Where You Already Have Coverage vs. Where Duplicates Would Happen

Company Identity (companies)

You already store: name, legal_name, tax_id, phone, email, website, address, time_zone, currency, default_tax_rate

schemapull

.

✅ No need for duplication here. This stays your “Business Profile.”

Business / Work Settings

Today: these values are hiding inside company_settings (with extra JSON/mocked fields).

Standard: Jobber/Titan/Housecall split them into a work_settings table (business hours, invoice terms, cancellation rules).

⚠️ Duplicate risk: if you keep them in company_settings and add work_settings.

✅ Fix = migrate those fields out of company_settings → work_settings, and lock company_settings down to core system config only.

Services & Pricing

You have: service_categories + service_types.

Missing: a pricebook/rate_cards table.

⚠️ Duplicate risk: work_order_line_items also stores rate, hours, unit. That’s transactional pricing, not a reusable pricebook.

✅ Fix = add rate_cards for reusable defaults, but keep work_order_line_items for actual jobs/invoices.

Employees & Team

You already have: employees, profiles, users, permissions.

✅ Standard already, no duplication needed.

Finance & Payments

You have: invoices, invoice_line_items, payments, taxes, documents.

Missing: per-company payment_settings (default payment method, link to invoice template).

⚠️ Duplicate risk: documents vs document_templates.

✅ Fix = keep documents for actual generated docs (customer invoices/quotes), and add document_templates for templates (branding, logos, footers).

Onboarding Progress

You have: nothing formal — just mock JSON stuffed in company_settings.

✅ Add a dedicated onboarding_progress table. No duplication risk.

🎯 Competitor Alignment (No Duplicates)

Companies = Business Profile (no change)

Work Settings = migrate from company_settings, stop duplication

Rate Cards = add Pricebook (not a duplicate of line_items)

Employees/Profiles/Users/Permissions = keep as-is

Payment Settings = add defaults table (not duplicate of payments)

Document Templates = add branding/templates (not duplicate of documents)

Onboarding Progress = new table

✅ So yes — there would be duplicates if we just added tables without pruning.
The correct approach is:

Migrate work-related settings out of company_settings → work_settings

Add missing standard tables (rate_cards, payment_settings, document_templates, onboarding_progress)

Keep existing structures (companies, employees, documents, etc.) where they already match competitors