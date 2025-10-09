You are a VS Code developer agent with access to this GitHub repo and Vercel project.

Repository:
https://github.com/tradesmatepro/tradesmatepro
Branch: main

Vercel Project: tradesmatepro-zczsgxdzm-jerald-smiths-projects.vercel.app
Domain: www.tradesmatepro.com

---
### 🔑 ENVIRONMENT (Beta Keys)
Add or confirm these in `.env.local` and in Vercel → Settings → Environment Variables

SUPABASE_URL=https://amgtktrwpdsigcomavlg.supabase.co
SUPABASE_ANON_KEY=<CLAUDE_HAS_THIS>
RESEND_API_KEY=re_a7hbhZUG_8hQoDfPGZsHmgDHUjmgEvt1t
RESEND_FROM=updates@tradesmatepro.com
VERCEL_PROJECT_ID=prj_zczsgxdzm
NODE_ENV=production

---
## 🎯 OBJECTIVE
Implement and deploy the **TradesMatePro Customer Quote Portal** so customers can view and approve quotes instantly without logins — using the token link system already validated as industry best practice.

---
## 🧱 REQUIRED IMPLEMENTATION

### 1. Create file `/pages/portal/quote/[id].tsx`
**Purpose:** public quote viewing + approval.

Requirements:
- Fetch quote details from Supabase (`quotes` table) using `id` from the URL.
- Display:
  - Company logo + name (dynamic)
  - Quote title, description, itemized rows, and total
  - Status badge (`PENDING`, `APPROVED`, `DECLINED`)
- Buttons:
  - ✅ Approve Quote → calls `/api/quote/approve?id=<id>`
  - ✏️ Request Changes → opens `mailto:company_email`
  - ⬇️ Download PDF → placeholder
- After approval → show “Thank you! Quote Approved” message.
- Include a subtle “🚀 Beta” banner top-right.
- Fully responsive layout with TailwindCSS.

---

### 2. Create file `/pages/api/quote/approve.ts`
**Purpose:** update status + trigger Resend email.

Logic:
```ts
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY!);

export default async function handler(req, res) {
  const { id } = req.query;
  const { data: quote } = await supabase.from("quotes").select("*").eq("id", id).single();
  if (!quote) return res.status(404).json({ error: "Quote not found" });

  await supabase.from("quotes").update({ status: "APPROVED", approved_at: new Date().toISOString() }).eq("id", id);

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: quote.company_email,
    subject: `Quote Approved – ${quote.title || quote.id}`,
    html: `<p>${quote.customer_name || "A customer"} has approved quote ${quote.title || quote.id}.</p>`
  });

  res.status(200).json({ success: true });
}
3. Test flow locally
Run:

bash
Copy code
npm run dev
Then open:

bash
Copy code
http://localhost:3000/portal/quote/test123
Confirm:

Quote loads correctly.

Approve → updates Supabase.

Resend logs email.

4. Commit & Deploy
bash
Copy code
git add pages/portal/quote pages/api/quote
git commit -m "[BETA] Add public quote approval portal"
git push origin main
Deployment will trigger automatically via Vercel GitHub integration.

Confirm live page:

bash
Copy code
https://www.tradesmatepro.com/portal/quote/[id]
5. Add Future Placeholder Comments
At end of [id].tsx, add comments:

ts
Copy code
// TODO: Integrate Twilio SMS notifications
// TODO: Integrate Stripe payment link after approval
// TODO: Integrate optional financing (Affirm API)
// TODO: Integrate file attachments via Supabase Storage
✅ DELIVERABLES
Live /portal/quote/[id] route working on production.

Resend confirmation emails functioning.

Supabase quote status updates correctly.

Beta banner visible.

Deployment verified on www.tradesmatepro.com.

🧠 Notes
Do not store keys in Git commits; reference via process.env.

This is for beta testing; production keys and secrets will be rotated.

Claude may run git commands and trigger Vercel deploy via API if needed.

🚀 Goal
Once live, TradesMatePro customers can:

Click quote links directly from emails

Approve in one step

Instantly notify company staff via Resend

This should fully match Housecall Pro’s experience but cleaner and faster.

yaml
Copy code

---

✅ **Next Step:**  
Copy-paste that entire prompt into Claude in VS Code and tell him:  
> “Run the full deployment process.”
