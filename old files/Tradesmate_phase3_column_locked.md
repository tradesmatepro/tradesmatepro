📋 TradesMate Pro — Phase 3 Marketplace Schema (Final Lockdown)
🏪 Marketplace Core

marketplace_categories
Marketplace-specific service groupings with job expectations.

id UUID PK

category_code TEXT UNIQUE (MKT-PLUMB, MKT-HVAC, etc.)

name, description TEXT

icon_url TEXT

average_response_time_hours INT DEFAULT 24

typical_job_value_min / max NUMERIC(12,2)

sort_order INT DEFAULT 0

is_active BOOLEAN DEFAULT TRUE

created_at, updated_at TIMESTAMPTZ

marketplace_requests
Job postings from companies or customers.

id UUID PK

company_id UUID → companies(id)

customer_id UUID → customers(id) NULLABLE

request_number TEXT UNIQUE (REQ-2025-001)

title, description TEXT

marketplace_category_id UUID → marketplace_categories(id)

service_type_id UUID → service_types(id)

budget_min / max NUMERIC(12,2)

budget_type ENUM(range, fixed, hourly, negotiable)

requested_start_date, requested_completion_date DATE

flexibility ENUM(rigid, somewhat_flexible, flexible, very_flexible)

service_address JSONB (with lat/lng)

travel_radius_miles INT

urgency_level ENUM(low, normal, high, emergency)

special_requirements TEXT

required_certifications TEXT[]

status ENUM(draft, open, reviewing_bids, awarded, in_progress, completed, cancelled, expired)

expires_at TIMESTAMPTZ

awarded_to_company_id UUID → companies(id)

awarded_at TIMESTAMPTZ

view_count, response_count INT DEFAULT 0

created_at, updated_at TIMESTAMPTZ

marketplace_responses
Proposals/bids submitted by contractors.

id UUID PK

request_id UUID → marketplace_requests(id)

responder_company_id UUID → companies(id)

responder_employee_id UUID → employees(id)

response_number TEXT UNIQUE (BID-2025-001)

bid_amount NUMERIC(12,2)

bid_type ENUM(fixed, hourly, time_and_materials)

hourly_rate, estimated_hours NUMERIC

proposed_start_date, estimated_completion_date DATE

proposal_summary, detailed_approach TEXT

materials_included BOOLEAN

warranty_offered TEXT

why_choose_us TEXT

similar_projects_completed INT

status ENUM(draft, submitted, shortlisted, awarded, rejected, withdrawn, expired)

expires_at TIMESTAMPTZ

submitted_at TIMESTAMPTZ

follow_up_count INT DEFAULT 0

last_follow_up_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

💬 Marketplace Communication

marketplace_conversations
Threaded conversations per request.

id UUID PK

request_id UUID → marketplace_requests(id)

conversation_number TEXT UNIQUE (CONV-2025-001)

requester_company_id, responder_company_id UUID → companies(id)

subject TEXT

status ENUM(active, archived, blocked)

last_message_at TIMESTAMPTZ

message_count INT

is_private BOOLEAN DEFAULT FALSE

created_at, updated_at TIMESTAMPTZ

marketplace_messages
Individual messages with threading and delivery tracking.

id UUID PK

conversation_id UUID → marketplace_conversations(id)

sender_company_id UUID → companies(id)

sender_user_id UUID → users(id)

message_number TEXT UNIQUE (MSG-2025-001)

subject TEXT

message_body TEXT

message_type ENUM(text, quote_update, schedule_change, file_attachment, system)

has_attachments BOOLEAN DEFAULT FALSE

status ENUM(draft, sent, delivered, read, archived)

delivered_at, read_at TIMESTAMPTZ

reply_to_message_id UUID → marketplace_messages(id)

thread_depth INT DEFAULT 0

created_at TIMESTAMPTZ

marketplace_message_attachments

id UUID PK

message_id UUID → marketplace_messages(id)

file_name, file_url, file_type TEXT

file_size INT

attachment_type ENUM(document, image, video, audio, other)

uploaded_by UUID → users(id)

created_at TIMESTAMPTZ

⭐ Reviews & Ratings

marketplace_reviews
Multi-dimensional, two-way reviews.

id UUID PK

request_id UUID → marketplace_requests(id)

reviewer_company_id, reviewee_company_id UUID → companies(id)

review_number TEXT UNIQUE (REV-2025-001)

review_type ENUM(requester_to_provider, provider_to_requester)

overall_rating INT CHECK (1–5)

quality_rating, timeliness_rating, communication_rating, value_rating INT CHECK (1–5)

title, comments, pros, cons TEXT

would_recommend BOOLEAN

project_value NUMERIC(12,2)

project_duration_days INT

status ENUM(draft, published, flagged, removed)

flagged_reason TEXT

created_at, updated_at TIMESTAMPTZ

🏢 Provider Profiles

provider_profiles
Enhanced company showcase with metrics.

id UUID PK

company_id UUID → companies(id)

profile_number TEXT UNIQUE (PP-2025-001)

business_name, tagline, description TEXT

years_in_business, employee_count INT

license_numbers TEXT[]

insurance_types TEXT[]

bonding_amount NUMERIC(12,2)

service_radius_miles INT

primary_service_areas JSONB

specialties, certifications TEXT[]

total_marketplace_jobs, completed_marketplace_jobs INT

average_rating NUMERIC(3,2)

total_reviews INT

response_rate_percent NUMERIC(5,2)

average_response_time_hours NUMERIC(8,2)

verification_status ENUM(pending, verified, rejected, suspended)

verified_at TIMESTAMPTZ

verified_by UUID → users(id)

accepts_emergency_jobs BOOLEAN DEFAULT FALSE

minimum_job_value, maximum_job_value NUMERIC(12,2)

created_at, updated_at TIMESTAMPTZ

💰 Monetization & Credits

marketplace_transactions

id UUID PK

company_id UUID → companies(id)

transaction_number TEXT UNIQUE (TXN-2025-001)

transaction_type ENUM(credit_purchase, bid_fee, commission, refund, bonus)

amount NUMERIC(12,2)

currency_code TEXT DEFAULT 'USD'

request_id UUID → marketplace_requests(id)

response_id UUID → marketplace_responses(id)

payment_id UUID → payments(id)

description, reference_number TEXT

status ENUM(pending, completed, failed, cancelled, refunded)

processed_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

credit_balances

id UUID PK

company_id UUID → companies(id) UNIQUE

current_balance, reserved_balance, available_balance NUMERIC(12,2)

total_purchased, total_spent, total_earned NUMERIC(12,2)

last_transaction_at TIMESTAMPTZ

created_at, updated_at TIMESTAMPTZ

verification_processes
Multi-step verification & compliance.

id UUID PK

company_id UUID → companies(id)

process_number TEXT UNIQUE (VP-2025-001)

verification_type ENUM(business_license, insurance, background_check, reference_check, site_visit)

status ENUM(initiated, documents_requested, under_review, approved, rejected, expired)

priority ENUM(low, normal, high, urgent)

initiated_at, documents_due_date, review_started_at, completed_at, expires_at TIMESTAMPTZ

assigned_to UUID → users(id)

reviewer_notes TEXT

verification_result ENUM(pass, fail, conditional)

conditions TEXT

score INT CHECK (0–100)

created_at, updated_at TIMESTAMPTZ

📊 Marketplace Analytics

marketplace_metrics

id UUID PK

company_id UUID → companies(id)

metric_date DATE

metric_type ENUM(daily, weekly, monthly)

requests_posted, requests_completed INT

average_request_value NUMERIC(12,2)

responses_submitted, responses_awarded INT

win_rate_percent NUMERIC(5,2)

total_revenue, total_commissions, average_job_value NUMERIC(12,2)

average_response_time_hours NUMERIC(8,2)

customer_satisfaction_rating NUMERIC(3,2)

calculated_at TIMESTAMPTZ

created_at TIMESTAMPTZ

🎯 Recap

Phase 3 now includes:

✅ Marketplace categories & templates

✅ Enhanced bidding with expirations & follow-ups

✅ Threaded conversations & attachments

✅ Multi-dimensional, two-way reviews

✅ Advanced provider profiles with performance stats

✅ Transactions, credit balances, reservations

✅ Multi-step verification

✅ Marketplace analytics

This makes your marketplace Angi/Thumbtack competitive, but fully embedded into your FSM ecosystem.