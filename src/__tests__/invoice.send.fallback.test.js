import InvoiceSendingService from '../services/InvoiceSendingService';

// Mocks
jest.mock('../utils/supaFetch', () => ({
  supaFetch: jest.fn()
}));


jest.mock('../services/SettingsService', () => ({
  __esModule: true,
  default: {
    getCompanyProfile: jest.fn(async () => ({ id: 'comp-1', company_name: 'Acme Co' })),
    getBusinessSettings: jest.fn(async () => ({ name: 'Acme Co', email: 'billing@acme.test' }))
  }
}));

jest.mock('../services/InvoicePDFService', () => ({
  __esModule: true,
  default: {
    getAttachments: jest.fn(async () => []),
    exportHtml: jest.fn(() => '<html><body>Invoice</body></html>')
  }
}));

const { supaFetch } = require('../utils/supaFetch');

/**
 * This verifies the defensive fallback we added:
 * If sendInvoiceEmail receives an invoice_id by mistake, it will look up the
 * linked work_order_id and proceed without throwing.
 */
describe('InvoiceSendingService.sendInvoiceEmail fallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock global fetch for Edge Function call
    global.fetch = jest.fn(async (url, opts) => {
      if (String(url).includes('/functions/v1/send-quote-email')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: async () => JSON.stringify({ success: true, id: 'email-123' })
        };
      }
      // Default fetch for any other URL
      return { ok: true, status: 200, text: async () => '' };
    });
  });

  test('accepts invoice_id and resolves work_order_id internally', async () => {
    const companyId = 'comp-1';
    const mistakenInvoiceId = 'inv-999';

    // 1) Initial work_orders lookup returns empty (simulating wrong id)
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    // 2) invoices lookup by id returns invoice with work_order_id
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: mistakenInvoiceId, work_order_id: 'wo-123', customer_id: 'cust-1' }] });

    // 3) Refetch work_order by resolved id
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'wo-123', customer_id: 'cust-1', created_at: new Date().toISOString(), payment_terms: 'Net 30' }] });

    // 4) Fetch customer by id
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 'cust-1', first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' }] });

    // 5) Get portal token for link
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [{ portal_token: 'tok-123' }] });

    // 6) Load work_order_items (none)
    supaFetch.mockResolvedValueOnce({ ok: true, json: async () => [] });

    const result = await InvoiceSendingService.sendInvoiceEmail(companyId, mistakenInvoiceId, {
      includePDF: false, // avoid PDF generation in test
      customMessage: 'Thanks!'
    });

    expect(result.success).toBe(true);
    // Ensure Edge Function was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/functions\/v1\/send-quote-email/),
      expect.objectContaining({ method: 'POST' })
    );

    // supaFetch calls should include at least:
    //  - work_orders (empty)
    //  - invoices (to resolve work_order_id)
    //  - work_orders (resolved)
    //  - customers
    //  - work_orders(select=portal_token)
    //  - work_order_items
    // Additional calls (e.g., assigned_user join) may be made -> allow >= 6
    expect(supaFetch.mock.calls.length).toBeGreaterThanOrEqual(6);
  });
});

