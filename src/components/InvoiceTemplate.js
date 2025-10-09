import React from 'react';
import settingsService from '../services/SettingsService';

// Utility: currency formatting
import { formatCurrency as fmtCurrency } from '../utils/formatters';
const fmt = (n, currency = 'USD', locale = 'en-US') => fmtCurrency(n, currency, locale);

const lineTotal = (qty, rate) => Number(qty || 0) * Number(rate || 0);

function formatCompanyAddress(company = {}) {
  const s = (company.street_address || '').trim();
  const city = (company.city || '').trim();
  const state = (company.state || '').trim();
  const zip = (company.postal_code || company.zip_code || '').trim();
  const lower = s.toLowerCase();
  const parts = [];
  if (s) parts.push(s);
  if (city && !lower.includes(city.toLowerCase())) parts.push(city);
  if (state && !lower.includes(state.toLowerCase())) parts.push(state);
  if (zip && !s.includes(zip)) parts.push(zip);
  return parts.filter(Boolean).join(', ');
}

const Section = ({ title, children }) => (
  <div className="mt-6">
    <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>
    <div className="rounded border border-gray-200 bg-white">
      {children}
    </div>
  </div>
);

const Meta = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm py-1">
    <div className="text-gray-500">{label}</div>
    <div className="font-medium text-gray-900">{value}</div>
  </div>
);

// Props
// - company: from SettingsService.getCompanyProfile
// - config: from SettingsService.getInvoiceConfig
// - customer: invoice.customers
// - job: linked work_order
// - invoice: invoice record (with items array)
// Convert terms code to human-readable text
function formatInvoiceTerms(terms) {
  const termMap = {
    'DUE_ON_RECEIPT': 'Payment due upon receipt',
    'NET_7': 'Payment due within 7 days',
    'NET_15': 'Payment due within 15 days',
    'NET_30': 'Payment due within 30 days',
    'NET_45': 'Payment due within 45 days',
    'NET_60': 'Payment due within 60 days'
  };
  return termMap[terms] || (typeof terms === 'string' && /(\d{1,3})/.test(terms)
    ? `Payment due within ${terms.match(/(\d{1,3})/)[1]} days`
    : `Payment terms: ${terms || 'None'}`);
}

export default function InvoiceTemplate({ company, config, invoice, customer, job }) {
  const currency = company?.currency || 'USD';
  const rawTerms = company?.default_invoice_terms || config?.default_invoice_terms || 'NET_30';
  const termsText = formatInvoiceTerms(rawTerms);
  const items = Array.isArray(invoice?.items) ? invoice.items : [];

  // Compute totals: prefer items if present; fallback to invoice totals
  const itemsPresent = items.length > 0;
  const subtotal = items.reduce((s, it) => s + (it.line_total ? Number(it.line_total) - Number(it.tax_amount||0) : lineTotal(it.quantity, it.unit_price)), 0);
  const tax_amount = items.reduce((s, it) => s + Number(it.tax_amount || 0), 0);
  const total_amount = itemsPresent ? (subtotal + tax_amount) : Number(invoice?.total_amount || 0);

  return (
    <div className="invoice-template-content bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {company?.company_logo_url ? (
            <img
              src={company.company_logo_url}
              alt="Logo"
              className="h-40 md:h-48 object-contain max-w-full md:max-w-[560px] w-auto"
              style={{ aspectRatio: 'auto' }}
            />
          ) : (
            <div className="text-2xl font-bold">{company?.name || company?.company_name || 'Your Company'}</div>
          )}
          <div>
            <div className="text-xl font-semibold">{company?.name || company?.company_name || ''}</div>
            <div className="text-sm text-gray-600 mt-1">
              {formatCompanyAddress(company)}
            </div>
            <div className="text-sm text-gray-600">{company?.phone} {company?.email ? `• ${company.email}` : ''}</div>
          </div>
        </div>

        <div className="w-64">
          <Meta label="Invoice #" value={`#${invoice?.invoice_number || ''}`} />
          <Meta label="Date" value={invoice?.issued_at ? new Date(invoice.issued_at).toLocaleDateString() : ''} />
          <Meta label="Due Date" value={(invoice?.due_at || invoice?.due_date) ? new Date(invoice.due_at || invoice.due_date).toLocaleDateString() : ''} />
          <Meta label="Status" value={invoice?.status || 'DRAFT'} />
          <Meta label="Terms" value={termsText} />
        </div>
      </div>

      {/* Customer - Bill To Address */}
      <Section title="Bill To">
        <div className="p-4 text-sm">
          <div className="font-medium text-gray-900">{customer?.name || ''}</div>
          <div className="text-gray-600">{customer?.email}</div>
          <div className="text-gray-600">{customer?.phone}</div>
          <div className="text-gray-600 mt-1">
            {/* Use billing address if available, fallback to legacy address */}
            {customer?.billing_address_line_1 || customer?.street_address ? (
              <>
                <div>{customer?.billing_address_line_1 || customer?.street_address}</div>
                {customer?.billing_address_line_2 && <div>{customer.billing_address_line_2}</div>}
                <div>
                  {[
                    customer?.billing_city || customer?.city,
                    customer?.billing_state || customer?.state,
                    customer?.billing_zip_code || customer?.zip_code
                  ].filter(Boolean).join(', ')}
                </div>
              </>
            ) : (
              <div className="text-gray-400">No billing address on file</div>
            )}
          </div>
        </div>
      </Section>

      {/* Job Details */}
      <Section title="Job Details">
        <div className="p-4 text-sm space-y-4">
          <Meta label="Work Performed" value={job?.title || job?.job_title || 'Service Call'} />
          <Meta label="Work Location" value={
            // Try normalized service address fields first, fall back to legacy
            job?.service_address_line_1 ?
              `${job.service_address_line_1}${job.service_address_line_2 ? ', ' + job.service_address_line_2 : ''}, ${job.service_city || ''} ${job.service_state || ''} ${job.service_zip_code || ''}`.trim() :
            [job?.street_address, job?.city, job?.state, job?.zip_code].filter(Boolean).join(', ') ||
            job?.work_location || job?.job_location || 'No Service Address'
          } />
          {job?.description && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">Description of Work</div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                {job.description}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Work Description */}
      {invoice?.notes && (
        <Section title="Work Description">
          <div className="p-4 text-sm bg-blue-50 rounded-lg">
            <div className="text-gray-900">{invoice.notes}</div>
          </div>
        </Section>
      )}

      {/* Line Items */}
      <Section title="Line Items">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-xs text-gray-600">
              <tr>
                <th className="text-left px-4 py-2">Description</th>
                <th className="text-right px-4 py-2">Qty</th>
                <th className="text-right px-4 py-2">Rate</th>
                <th className="text-right px-4 py-2">Tax</th>
                <th className="text-right px-4 py-2">Line Total</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No items</td></tr>
              ) : (
                items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 text-gray-900">{it.description || it.item_name || ''}</td>
                    <td className="px-4 py-2 text-right">{it.quantity || it.qty || 0}</td>
                    <td className="px-4 py-2 text-right">{fmt(it.unit_price || it.rate, currency)}</td>
                    <td className="px-4 py-2 text-right">{fmt(it.tax_amount || 0, currency)}</td>
                    <td className="px-4 py-2 text-right">{fmt(it.line_total || lineTotal(it.quantity, it.unit_price), currency)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Totals */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          {/* Payment options */}
          {config?.enable_online_payments && (
            <div className="p-4 rounded border border-green-200 bg-green-50 text-sm">
              <div className="font-medium text-green-800">Pay Online</div>
              <div className="text-green-700">Scan the QR or click the button to pay securely.</div>
              <div className="mt-3 flex items-center gap-3">
                <a href={config.payment_portal_url || '#'} target="_blank" rel="noreferrer" className="btn-primary">Pay Now</a>
                {/* Placeholder for QR; can integrate a QR component */}
                <div className="w-16 h-16 bg-white border border-gray-200 rounded" />
              </div>
            </div>
          )}
        </div>
        <div className="md:ml-auto">
          <div className="rounded border border-gray-200 p-4 bg-white">
            <Meta label="Subtotal" value={fmt(subtotal, currency)} />
            <Meta label={`Tax`} value={fmt(tax_amount, currency)} />
            <div className="flex items-center justify-between text-base mt-2">
              <div className="font-semibold text-gray-900">Total Due</div>
              <div className="font-bold text-gray-900">{fmt(total_amount, currency)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      {(config?.payment_instructions || company?.payment_instructions) && (
        <div className="mt-6 text-sm text-gray-700">
          <div className="font-medium text-gray-900 mb-1">Payment Instructions</div>
          <div>{config?.payment_instructions || company?.payment_instructions}</div>
        </div>
      )}

      {/* Footer (Payment Terms shown in header only) */}
      {(config?.invoice_footer || company?.invoice_footer) && (
        <div className="mt-6 text-sm text-gray-600">
          <div>{config?.invoice_footer || company?.invoice_footer}</div>
        </div>
      )}
    </div>
  );
}

