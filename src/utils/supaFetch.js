// Simple Supabase REST wrapper that enforces company scoping by default
// Usage:
//   supaFetch('quotes?select=*', { method: 'GET' }, companyId)
//   supaFetch('jobs', { method: 'POST', body: { title: 'A' } }, companyId)

import { SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY } from './env.js';
import { getSupabaseClient } from './supabaseClient.js';

const SCOPE_TABLES = new Set([
  'users',
  'customers',
  // UNIFIED PIPELINE TABLES (PREFERRED)
  'work_orders', // unified master table for quotes/jobs/work orders
  'work_order_items', // unified items table
  'work_order_milestones', // milestones for milestone pricing model
  'work_order_labor', // accessed through work_orders relationship for security
  'work_order_audit', // audit trail for stage transitions
  'work_order_versions', // version history
  'work_order_messages', // messages related to work orders
  // COMPATIBILITY VIEWS (USE THESE INSTEAD OF LEGACY TABLES)
  'quotes_compat_v', // maps work_orders (stage=QUOTE) to legacy quotes interface
  'quote_items_compat_v', // maps work_order_items to legacy quote_items interface
  'quotes_v', // stage-filtered view of work_orders
  'jobs_v', // stage-filtered view of work_orders
  'work_orders_v', // stage-filtered view of work_orders
  // EMPLOYEE MANAGEMENT
  'employees', // employee management table
  // SCHEDULING & CALENDAR
  'schedule_events',
  // INTEGRATIONS & ATTACHMENTS
  'integration_tokens',
  'attachments',
  'job_photos',
  // FINANCIAL
  'payments',
  'invoices',
  'invoice_line_items', // invoice line items
  'expenses',
  'expense_categories',
  'expense_approvals',
  // VENDOR & PURCHASE ORDER MANAGEMENT
  'vendors',
  'vendor_contacts',
  'vendor_categories',
  'vendor_category_assignments',
  'vendors_status_history',
  'purchase_orders',
  'po_items',
  'po_approvals',
  'po_approval_rules',
  'po_status_history',
  // TEMPLATES & DOCUMENTS
  'document_templates', // templates for quotes/invoices/etc.
  'company_document_templates',
  'shared_document_templates',
  'items_catalog',
  'quote_templates',
  // COMMUNICATION
  'messages',
  // MARKETPLACE TABLES
  'marketplace_requests', // service requests posted by customers
  'marketplace_responses', // responses/quotes from contractors
  'marketplace_messages', // messages related to marketplace requests
  'request_tags', // tags linked to marketplace requests
  // SETTINGS (UNIFIED)
  'settings', // legacy
  'company_profiles', // new normalized table
  'business_settings', // new normalized table
  'integrations', // new normalized table
  // LEGACY TABLES REMOVED - These tables no longer exist in the database
  // If you need to access quote/job data, use:
  // - work_orders?status=in.(DRAFT,SENT,ACCEPTED) (for quotes)
  // - work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED,INVOICED) (for jobs)
  // - work_order_items (for line items)
]);

function parsePath(path) {
  // path examples: 'work_orders?status=in.(DRAFT,SENT,ACCEPTED)&select=*', 'work_order_items', etc.
  const [table, qs] = path.split('?');

  // Legacy table access prevention - these tables no longer exist
  if (table === 'quotes' || table === 'quote_items' || table === 'jobs') {
    console.error(`❌ Table "${table}" no longer exists. Use unified work_orders system instead:
    - For quotes: work_orders?status=in.(QUOTE,SENT,ACCEPTED,REJECTED)
    - For jobs: work_orders?status=in.(SCHEDULED,IN_PROGRESS,COMPLETED,CANCELLED,INVOICED)
    - For items: work_order_items`);
    throw new Error(`Legacy table "${table}" has been removed. Use work_orders system instead.`);
  }

  return { table, qs: qs || '' };
}

function ensureCompanyQuery(path, companyId) {
  const { table, qs } = parsePath(path);
  if (!SCOPE_TABLES.has(table)) return path; // do not scope non-tenant tables like 'companies'
  if (!companyId) return path; // cannot scope without company
  if (qs.includes('company_id=')) return path; // already scoped
  const sep = qs.length ? '&' : '';
  return `${table}?${qs}${sep}company_id=eq.${companyId}`;
}

function injectCompanyIntoBody(table, body, companyId) {
  if (!SCOPE_TABLES.has(table)) return body;
  if (!companyId) return body;

  try {
    if (!body) return body;
    if (typeof body === 'string') {
      const parsed = JSON.parse(body);
      if (parsed && parsed.company_id == null) parsed.company_id = companyId;
      return JSON.stringify(parsed);
    }
    if (typeof body === 'object') {
      // Array or object
      if (Array.isArray(body)) {
        return JSON.stringify(body.map((row) => ({ ...row, company_id: row.company_id ?? companyId })));
      }
      return JSON.stringify({ ...body, company_id: body.company_id ?? companyId });
    }
  } catch (e) {
    // if parse fails, return body as-is
    return body;
  }
  return body;
}

export async function supaFetch(path, options = {}, companyId = null) {
  const method = (options.method || 'GET').toUpperCase();
  const supabase = getSupabaseClient();

  // Use the authenticated user's session token
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || SUPABASE_ANON_KEY;

  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${accessToken}`,
    ...(options.headers || {}),
  };

  let finalPath = path;
  const { table } = parsePath(path);

  if (method === 'GET' || method === 'DELETE') {
    finalPath = ensureCompanyQuery(path, companyId);
  }
  // Only auto-append select=* for GET (not for DELETE)
  if (method === 'GET') {
    if (!finalPath.includes('select=') && !finalPath.startsWith('rpc/')) {
      const needsAmp = finalPath.includes('?') && !finalPath.endsWith('?');
      finalPath = `${finalPath}${needsAmp ? '&' : '?'}select=*`;
    }
  }

  let body = options.body;
  if (method === 'POST' || method === 'PATCH') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    headers['Prefer'] = headers['Prefer'] || 'return=representation';
    body = injectCompanyIntoBody(table, body, companyId);

    // Ensure body is stringified if it's still an object
    if (typeof body === 'object' && body !== null) {
      body = JSON.stringify(body);
    }
  }

  const url = `${SUPABASE_URL}/rest/v1/${finalPath}`;
  return fetch(url, { ...options, method, headers, body });
}

export { SUPABASE_URL, SUPABASE_SERVICE_KEY };

