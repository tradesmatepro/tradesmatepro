import { InvoicesService } from '../services/InvoicesService';

// Mock supaFetch
jest.mock('../utils/supaFetch', () => ({
  supaFetch: jest.fn()
}));

const { supaFetch } = require('../utils/supaFetch');

describe('Auto-invoice creation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ensureInvoiceForCompletion creates new invoice when none exists', async () => {
    // Mock no existing invoice
    supaFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    // Mock successful invoice creation
    supaFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'inv-123' }]
    });

    const invoiceId = await InvoicesService.ensureInvoiceForCompletion({
      companyId: 'comp-1',
      workOrderId: 'wo-1',
      customerId: 'cust-1'
    });

    expect(invoiceId).toBe('inv-123');
    expect(supaFetch).toHaveBeenCalledTimes(2);
  });

  test('ensureInvoiceForCompletion returns existing invoice ID', async () => {
    // Mock existing invoice
    supaFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'existing-inv-456' }]
    });

    const invoiceId = await InvoicesService.ensureInvoiceForCompletion({
      companyId: 'comp-1',
      workOrderId: 'wo-1',
      customerId: 'cust-1'
    });

    expect(invoiceId).toBe('existing-inv-456');
    expect(supaFetch).toHaveBeenCalledTimes(1); // Only lookup, no creation
  });

  test('copyWorkOrderItemsToInvoice copies items correctly', async () => {
    // Mock work order items
    supaFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { item_name: 'Labor', description: 'Installation', quantity: 2, rate: 50 },
        { item_name: 'Materials', description: 'Parts', quantity: 1, rate: 100 }
      ]
    });

    // Mock successful item insertion
    supaFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    const itemCount = await InvoicesService.copyWorkOrderItemsToInvoice('inv-123', { workOrderId: 'wo-1' }, 'comp-1');

    expect(itemCount).toBe(2);
  });
});