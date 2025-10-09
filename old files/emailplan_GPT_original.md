📬 Industry Standard Email Integrations
1. One-Man Show (Solo Contractor)

Usually doesn’t want to set up a separate “transactional email service.”

Standard approach: Direct SMTP with their Gmail, Outlook, or domain email.

Pro: Free, simple, transparent.

Con: Gmail/Outlook have sending limits (100–500/day), OAuth quirks, app passwords.

2. Growing Team (5–20 employees)

Needs reliability, shared sending reputation, tracking/logging.

Standard approach: Transactional service like SendGrid, Mailgun, Postmark.

Pro: Higher daily limits, delivery monitoring, event webhooks.

Con: $15–50/month (but worth it at this stage).

3. Enterprise (20–500 employees)

Needs branding, audit logs, guaranteed deliverability.

Standard approach:

Dedicated IPs with Mailgun/SendGrid.

Or Amazon SES (cheaper but requires AWS setup).

Pro: Fully scalable.

Con: Setup complexity.

✅ Future-Proof Approach for Tradesmate

Instead of choosing one or the other, design a layered email strategy:

1. Core Layer (Always Available)

Store email mode in company_settings:

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS email_mode TEXT 
  CHECK (email_mode IN ('manual','smtp','transactional')) DEFAULT 'manual';


Modes:

manual → Just mark as sent, open PDF.

smtp → Contractor configures their own Gmail/Outlook SMTP.

transactional → We send via our integrated provider (SendGrid, Mailgun, SES).

2. Flexible Backend Adapter

One function, different drivers:

if (settings.email_mode === 'smtp') sendViaSMTP(...)
if (settings.email_mode === 'transactional') sendViaSendGrid(...)
else return "manual"

3. Upgrade Path

Start small: Solo guy uses Gmail.

Later: He hires 10 techs → just toggle to transactional and pay $10/mo for better reliability.

Enterprise: Plug into SES or dedicated Mailgun account without rewriting frontend/backend.

📊 Why This is Standard (and Better than Competitors)

Jobber/Housecall: Only do transactional (forces cost early).

HubSpot: Only transactional (SMTP not even an option).

Tradesmate: Offers both → lower friction for the solo operator, seamless upgrade for scaling.

🚀 Recommendation

We should implement:

SMTP (for free/solo)

Transactional (for scaling)

Unified frontend toggle in settings → user picks mode

This way we never rewrite the system later — we just “swap the driver” under the hood.