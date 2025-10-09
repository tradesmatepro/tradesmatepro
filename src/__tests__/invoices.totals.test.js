import { computeInvoiceTotals, generateInvoiceNumber } from '../services/InvoicesService';

test('compute totals with tax and rounding', () => {
  const items = [ { quantity:2, unit_price:99.99 }, { quantity:1, unit_price:50 } ];
  const res = computeInvoiceTotals(items, 8.25);
  expect(res.subtotal).toBeCloseTo(249.98, 2);
  expect(res.tax_amount).toBeCloseTo(20.62, 2);
  expect(res.total).toBeCloseTo(270.60, 2);
});

test('compute totals with discount', () => {
  const items = [ { quantity:1, unit_price:100 } ];
  const res = computeInvoiceTotals(items, 10, 20);
  expect(res.subtotal).toBe(100);
  expect(res.discount).toBe(20);
  expect(res.tax_amount).toBe(8); // (100-20) * 0.10
  expect(res.total).toBe(88);
});

test('invoice number format', () => {
  const num = generateInvoiceNumber(2025);
  expect(num).toMatch(/^INV-2025-\d{4}$/);
});

test('invoice number uniqueness', () => {
  const a = generateInvoiceNumber();
  const b = generateInvoiceNumber();
  expect(a).not.toBe(b);
});

