🏪 Phase 3 — Marketplace Views & Materialized Views (Final Revised)
🎯 Lead Quality & Requests
🔎 active_leads_view

Why: Fixes Angi’s “junk leads” — only active, fraud-screened leads.

CREATE VIEW active_leads_view AS
SELECT r.id AS request_id,
       r.company_id,
       r.service_category,
       r.status,
       r.budget_range,
       r.urgency_level,
       r.expires_at,
       r.lead_quality_score,
       r.fraud_risk_score,
       r.customer_verification_level,
       COUNT(resp.id) AS total_responses
FROM marketplace_requests r
LEFT JOIN marketplace_responses resp ON resp.request_id = r.id
WHERE r.status = 'active'
  AND r.expires_at > CURRENT_DATE
  AND r.fraud_risk_score < 30
GROUP BY r.id;

📊 lead_quality_mv

Why: Contractors want to know why a lead is flagged.

CREATE MATERIALIZED VIEW lead_quality_mv AS
SELECT r.service_category,
       DATE_TRUNC('month', r.created_at) AS month,
       COUNT(r.id) AS total_leads,
       AVG(r.lead_quality_score) AS avg_quality,
       SUM(CASE WHEN r.fraud_risk_score >= 30 THEN 1 ELSE 0 END) AS flagged_fraud
FROM marketplace_requests r
GROUP BY r.service_category, DATE_TRUNC('month', r.created_at);

CREATE INDEX idx_lead_quality_month_category
  ON lead_quality_mv(month, service_category);

💬 Responses & Bidding
🔎 bidding_activity_view

Why: Thumbtack complaint = “spam wars.” This shows counter-offers & spamming.

CREATE VIEW bidding_activity_view AS
SELECT resp.id AS response_id,
       resp.request_id,
       resp.company_id,
       resp.bid_amount,
       resp.is_counter_offer,
       resp.created_at,
       COUNT(*) FILTER (WHERE resp.is_counter_offer = true) 
         OVER (PARTITION BY resp.request_id, resp.company_id) AS counter_offer_count
FROM marketplace_responses resp;

📊 response_fairness_mv

Why: Ensures fair win distribution, not just “deep pockets win.”

CREATE MATERIALIZED VIEW response_fairness_mv AS
SELECT r.company_id,
       COUNT(resp.id) AS total_responses,
       SUM(CASE WHEN resp.status = 'accepted' THEN 1 ELSE 0 END) AS wins,
       (SUM(CASE WHEN resp.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL / 
        NULLIF(COUNT(resp.id),0)) * 100 AS win_rate
FROM marketplace_requests r
JOIN marketplace_responses resp ON resp.request_id = r.id
GROUP BY r.company_id;

CREATE INDEX idx_response_fairness_company
  ON response_fairness_mv(company_id);

⭐ Reviews & Trust
🔎 authentic_reviews_view

Why: Angi/Thumbtack reviews are infamous for fakes. This enforces authenticity.

CREATE VIEW authentic_reviews_view AS
SELECT rev.id AS review_id,
       rev.reviewed_company_id,
       rev.reviewer_company_id,
       rev.overall_rating,
       rev.quality_rating,
       rev.timeliness_rating,
       rev.communication_rating,
       rev.value_rating,
       rev.authenticity_score,
       CASE WHEN rev.authenticity_score >= 70 THEN 'trusted'
            WHEN rev.authenticity_score BETWEEN 50 AND 69 THEN 'questionable'
            ELSE 'suspicious' END AS authenticity_status
FROM marketplace_reviews rev;

📊 review_authenticity_mv

Why: Transparency = contractors know if reviews are manipulated.

CREATE MATERIALIZED VIEW review_authenticity_mv AS
SELECT reviewed_company_id,
       DATE_TRUNC('month', review_date) AS month,
       COUNT(id) AS review_count,
       AVG(authenticity_score) AS avg_authenticity,
       SUM(CASE WHEN authenticity_score < 70 THEN 1 ELSE 0 END) AS suspicious_reviews
FROM marketplace_reviews
GROUP BY reviewed_company_id, DATE_TRUNC('month', review_date);

CREATE INDEX idx_review_authenticity_company_month
  ON review_authenticity_mv(reviewed_company_id, month);

💵 Transactions & Escrow
🔎 escrow_balances_view

Why: Fixes complaint = hidden fees & unclear payouts. Transparent escrow view.

CREATE VIEW escrow_balances_view AS
SELECT t.company_id,
       SUM(CASE WHEN t.status = 'pending_release' THEN t.amount ELSE 0 END) AS escrow_balance,
       SUM(t.commission_amount) AS total_commissions,
       SUM(CASE WHEN t.status = 'completed' THEN t.amount ELSE 0 END) AS released_amount
FROM marketplace_transactions t
GROUP BY t.company_id;

📊 transaction_summary_mv

Why: Real-time visibility into disputes, refunds, commissions.

CREATE MATERIALIZED VIEW transaction_summary_mv AS
SELECT company_id,
       DATE_TRUNC('month', transaction_date) AS month,
       COUNT(id) AS total_transactions,
       SUM(CASE WHEN status = 'disputed' THEN 1 ELSE 0 END) AS disputed_count,
       SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) AS refunded_count,
       SUM(amount) AS total_amount,
       SUM(commission_amount) AS total_commissions
FROM marketplace_transactions
GROUP BY company_id, DATE_TRUNC('month', transaction_date);

CREATE INDEX idx_transaction_summary_company_month
  ON transaction_summary_mv(company_id, month);

✅ Phase 3 Marketplace Views Summary

Leads: Fraud-checked, transparency in scoring.

Responses: Fair bidding dashboards, anti-spam protections.

Reviews: Authenticity scoring, suspicious detection.

Transactions: Escrow + commissions visible at all times.

📊 Competitive Edge:

Angi complaint: “Junk leads & hidden fees” → solved with fraud scoring + escrow transparency.

Thumbtack complaint: “Spam wars & unfair wins” → solved with fairness dashboards.

Trust gap: “Fake reviews” → solved with authenticity scoring.