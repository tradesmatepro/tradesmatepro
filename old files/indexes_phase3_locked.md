🏪 Phase 3 – Marketplace (Revised Indexes, Merged & Detailed)
🎯 Goals

Fix Angi’s “junk leads” → Multi-factor lead scoring, fraud prevention.

Fix Thumbtack’s “spam wars” → Counter-offer caps, rotation fairness.

Fix fake reviews & trust issues → AI authenticity scoring.

Add what no competitor has → Transparent analytics, contractor fairness dashboards.

📌 Marketplace Requests
-- Status + expiration fast lookups
CREATE INDEX idx_marketplace_requests_status_expires
  ON marketplace_requests(status, expires_at);

-- Customer + quality scoring
CREATE INDEX idx_marketplace_requests_customer_quality
  ON marketplace_requests(customer_id, lead_quality_score);

-- Multi-factor quality scoring (fix “junk leads”)
CREATE INDEX idx_marketplace_requests_quality_multi_factor 
  ON marketplace_requests(
      company_id,
      lead_quality_score DESC,
      customer_verification_level,
      budget_range,
      urgency_level
  )
  WHERE status = 'active' AND expires_at > CURRENT_DATE
  INCLUDE (service_category, location_accuracy, response_count);

-- Geographic service area (location intelligence)
CREATE INDEX idx_marketplace_requests_location
  ON marketplace_requests USING gist (service_area);

-- Fraud detection (behavioral + geo spoofing)
CREATE INDEX idx_marketplace_requests_fraud_detection 
  ON marketplace_requests(customer_id, fraud_risk_score DESC, created_at DESC, ip_address_hash)
  WHERE fraud_risk_score > 30
  INCLUDE (device_fingerprint, behavioral_flags, verification_attempts);

💬 Marketplace Responses & Bidding
-- Responses by request + status
CREATE INDEX idx_marketplace_responses_request_status
  ON marketplace_responses(request_id, status);

-- Expiration lookups
CREATE INDEX idx_marketplace_responses_expires
  ON marketplace_responses(expires_at);

-- Counter-offer tracking (spam prevention)
CREATE INDEX idx_marketplace_responses_company_request
  ON marketplace_responses(company_id, request_id);

-- Anti-spam prevention (cap bid floods)
CREATE INDEX idx_marketplace_responses_spam_prevention 
  ON marketplace_responses(company_id, request_id, response_count, created_at DESC)
  WHERE status = 'active'
  INCLUDE (bid_amount, response_quality_score, is_counter_offer);

⭐ Marketplace Reviews
-- Reviewer to reviewed (one review per relationship)
CREATE INDEX idx_marketplace_reviews_reviewer_reviewed
  ON marketplace_reviews(reviewer_company_id, reviewed_company_id);

-- Request-specific lookup
CREATE INDEX idx_marketplace_reviews_request
  ON marketplace_reviews(request_id);

-- Authenticity scoring (AI)
CREATE INDEX idx_marketplace_reviews_authenticity_analysis 
  ON marketplace_reviews(reviewed_company_id, authenticity_score DESC, review_date DESC, verification_level)
  WHERE authenticity_score >= 70
  INCLUDE (reviewer_company_id, review_text_hash, behavioral_flags);

-- Pattern detection (fake review clusters)
CREATE INDEX idx_review_patterns_reviewer_reviewed_timeframe 
  ON marketplace_reviews(reviewer_company_id, reviewed_company_id, DATE_TRUNC('week', review_date), review_similarity_score)
  WHERE review_similarity_score > 80;

💵 Transactions & Escrow
-- Request + status (escrow protection)
CREATE INDEX idx_marketplace_transactions_request_status
  ON marketplace_transactions(request_id, status);

-- Commission/revenue tracking
CREATE INDEX idx_marketplace_transactions_company
  ON marketplace_transactions(company_id, commission_amount);

-- Real-time revenue/fee analysis
CREATE INDEX idx_marketplace_transactions_revenue_analysis 
  ON marketplace_transactions(company_id, transaction_date DESC, transaction_type, commission_amount DESC)
  WHERE status IN ('completed','pending_release')
  INCLUDE (request_id, payment_method, processing_fee);

-- Escrow + disputes
CREATE INDEX idx_payment_disputes_priority_age_amount 
  ON payment_disputes(dispute_priority, created_at, disputed_amount DESC, resolution_status)
  WHERE resolution_status IN ('open','investigating');

🔐 Verification & Providers
-- Provider verification checks
CREATE INDEX idx_provider_profiles_company_verification
  ON provider_profiles(company_id, verification_status);

-- Service categories
CREATE INDEX idx_marketplace_categories_company_id
  ON marketplace_categories(company_id);

-- Background/insurance checks
CREATE INDEX idx_insurance_verification_company_type_status
  ON insurance_verification(company_id, insurance_type, verification_status, policy_expiry DESC)
  WHERE verification_status = 'active';

📊 Marketplace Analytics
-- Win rates
CREATE INDEX idx_marketplace_analytics_company_winrate
  ON marketplace_analytics(company_id, win_rate);

-- Lead scoring + fraud monitoring
CREATE INDEX idx_marketplace_analytics_lead_score
  ON marketplace_analytics(company_id, fraud_risk_score);

-- Contractor performance dashboards
CREATE INDEX idx_contractor_analytics_company_kpi_period
  ON contractor_analytics(company_id, kpi_type, measurement_period DESC, performance_value DESC);

-- Marketplace health
CREATE INDEX idx_marketplace_health_category_zone_score
  ON marketplace_health(service_category, geographic_zone, health_score DESC, measurement_date DESC);

✅ Phase 3 Indexes Summary (Revised & Locked)

Requests → Multi-factor scoring + fraud protection.

Responses → Spam prevention + fair distribution.

Reviews → AI authenticity + pattern detection.

Transactions → Escrow, disputes, transparent revenue.

Verification → True provider trust with insurance/background checks.

Analytics → Contractor transparency, marketplace health dashboards.

📊 Competitive Edge:

Fixes Angi’s junk leads with multi-factor scoring.

Fixes Thumbtack’s spam wars with counter-offer & rotation fairness.

Adds trust & transparency (authentic reviews, contractor analytics) no competitor provides.