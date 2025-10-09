🚨 Marketplace / Customers Frontend Query Fixes
1. Work Orders

❌ Old (invalid, caused 400):

const response = await supaFetch(
  'work_orders?select=*&quote_status=in.(DRAFT,SENT,ACCEPTED,REJECTED,EXPIRED,DECLINED)&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);


✅ Correct (must use status):

const response = await supaFetch(
  'work_orders?select=*&status=in.(DRAFT,SENT,ACCEPTED,REJECTED,EXPIRED,DECLINED)&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);

2. Customer Tags

❌ Old (invalid field is_active):

const response = await supaFetch(
  'customer_tags?select=*&is_active=eq.true&order=name.asc',
  { method: 'GET' },
  user.company_id
);


✅ Correct (table only has id, company_id, customer_id, tag, created_at):

const response = await supaFetch(
  'customer_tags?select=*&order=tag.asc',
  { method: 'GET' },
  user.company_id
);

3. Customer Communications

❌ Old (wrong join syntax):

const response = await supaFetch(
  'customer_communications?select=*,users(first_name,last_name)&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);


✅ Correct (must join via FK created_by → users.id):

const response = await supaFetch(
  'customer_communications?select=*,created_by_user:users!created_by(first_name,last_name)&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);

4. Customer Service Agreements

❌ Old (if Claude tried filtering with non-existent fields, e.g. is_active):

const response = await supaFetch(
  'customer_service_agreements?select=*&is_active=eq.true&order=name.asc',
  { method: 'GET' },
  user.company_id
);


✅ Correct (table has id, company_id, customer_id, agreement_text, start_date, end_date, status, created_at, updated_at):

const response = await supaFetch(
  'customer_service_agreements?select=*&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);


⚠️ Note: 403 errors here are permissions only → must GRANT SELECT, INSERT, UPDATE, DELETE ON customer_service_agreements TO authenticated;

5. Notifications

❌ Old (invalid if using is_active, sent_at, etc.):

const response = await supaFetch(
  'notifications?select=*&is_active=eq.true&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);


✅ Correct (table has id, company_id, user_id, type, message, status, created_at, read_at):

const response = await supaFetch(
  'notifications?select=*&order=created_at.desc',
  { method: 'GET' },
  user.company_id
);


⚠️ Note: 403 errors here = permissions → must GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;

🎯 Final Summary for Claude

Do not use quote_status → use status in work_orders.

Do not use is_active → not present in customer_tags, notifications, customer_service_agreements.

Always join customer_communications via created_by → users.id.

Respect actual schema columns exactly as listed.

403 errors ≠ schema issues → require explicit GRANTs in Postgres, not frontend fixes.