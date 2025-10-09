🏪 Phase 3 — Marketplace Functions (Revised & Merged)
1. Advanced Lead Quality Intelligence

Why: Angi/Thumbtack contractors complain about paying for junk leads.
Fix: Multi-factor fraud detection, predictive quality scoring, transparent audit logs.

CREATE OR REPLACE FUNCTION score_marketplace_request_advanced(
    p_request_id UUID,
    p_scoring_model TEXT DEFAULT 'comprehensive'
)
RETURNS JSONB AS $$
-- Combines GPT’s simple scoring with Claude’s behavioral, geographic,
-- historical, and budget realism checks.
-- Produces: final_score, fraud_risk, recommendation, audit trail
...
$$ LANGUAGE plpgsql;

2. Performance-Based Fair Distribution

Why: Thumbtack users say “same contractors get all the leads.”
Fix: Weighted rotation using performance metrics, fairness quotas, and distance.

CREATE OR REPLACE FUNCTION distribute_marketplace_request_fair(
    p_request_id UUID,
    p_max_contractors INTEGER DEFAULT 5,
    p_distribution_strategy TEXT DEFAULT 'performance_weighted'
)
RETURNS JSONB AS $$
-- Builds on GPT’s round-robin by adding contractor win rate, ratings,
-- recency, and geography.
-- Ensures fair access while boosting new contractors.
...
$$ LANGUAGE plpgsql;

3. Escrow Transaction Handling

Why: Angi complaint = contractors get stiffed.
Fix: Funds held in escrow until customer confirms job completion.

CREATE OR REPLACE FUNCTION release_escrow_payment(p_transaction_id UUID)
RETURNS VOID AS $$
-- GPT baseline logic, extended with extra checks
-- Ensures funds cannot bypass escrow before customer sign-off
...
$$ LANGUAGE plpgsql;

4. Fake Review Detection

Why: Contractors distrust platforms due to fake reviews.
Fix: Multi-layer detection with fraud heuristics and AI-ready extension.

CREATE OR REPLACE FUNCTION detect_fake_reviews()
RETURNS VOID AS $$
-- GPT version: frequency + self-review detection
-- Claude enhancement: adds IP/behavioral analysis, audit logging
...
$$ LANGUAGE plpgsql;

5. Commission Calculation

Why: Complaint = hidden fees.
Fix: Transparent fee calculation with category-based adjustments.

CREATE OR REPLACE FUNCTION calculate_commission(p_transaction_id UUID)
RETURNS NUMERIC AS $$
-- GPT baseline (flat percentage)
-- Claude: category-based tiers + transparent ledger
...
$$ LANGUAGE plpgsql;

✅ Phase 3 Final Function Set
Function	Purpose	Pain Point Fixed
score_marketplace_request_advanced	Predictive lead scoring + fraud checks	Eliminates junk leads
distribute_marketplace_request_fair	Performance-weighted contractor distribution	Prevents favoritism
release_escrow_payment	Escrow + release funds	Payment security
detect_fake_reviews	Fraudulent review detection	Builds trust
calculate_commission	Transparent platform fees	No hidden costs
📊 Competitive Advantage

vs Angi/Thumbtack: Better lead quality control, fairness, transparency.

vs Jobber/ServiceTitan: They don’t offer two-sided marketplace — this is unique.

Future-Proof: Built with audit logs + AI-ready hooks for predictive improvements.