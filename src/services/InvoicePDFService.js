// Invoice PDF Service - mirrors QuotePDFService but for invoices
import { supaFetch } from '../utils/supaFetch';

const InvoicePDFService = {
  async get(companyId, invoiceId) {
    // Load from invoices table
    const invRes = await supaFetch(`invoices?id=eq.${invoiceId}&select=*`, { method: 'GET' }, companyId);
    if (!invRes.ok) throw new Error('Failed to load invoice');
    const [invoice] = await invRes.json();

    // Load invoice_items (TODO: when RLS is fixed)
    const items = [];

    // Load customer data
    const customerRes = invoice.customer_id ?
      await supaFetch(`customers?id=eq.${invoice.customer_id}&select=*`, { method: 'GET' }, companyId) :
      { ok: false };
    const [customer] = customerRes.ok ? await customerRes.json() : [{}];

    return { invoice, items, customer };
  },

  async getAttachments(companyId, workOrderId) {
    try {
      const attachmentsRes = await supaFetch(`attachments?work_order_id=eq.${workOrderId}&select=*`, { method: 'GET' }, companyId);
      if (attachmentsRes.ok) {
        return await attachmentsRes.json();
      }
      return [];
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return [];
    }
  },

  exportHtml(company, invoice, items, customer = {}, workOrder = null, attachments = []) {
    const currency = company?.currency || 'USD';
    const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(n || 0));

    // Format company address
    const formatCompanyAddress = (c = {}) => {
      const s = (c.street_address || '').trim();
      const city = (c.city || '').trim();
      const state = (c.state || '').trim();
      const zip = (c.postal_code || c.zip_code || '').trim();
      const parts = [];
      if (s) parts.push(s);
      if (city) parts.push(city);
      if (state) parts.push(state);
      if (zip) parts.push(zip);
      return parts.filter(Boolean).join(', ');
    };

    const companyAddr = formatCompanyAddress(company);

    // Format customer address
    const customerAddrParts = [];
    if (customer.billing_address_line_1 || customer.street_address) customerAddrParts.push(customer.billing_address_line_1 || customer.street_address);
    if (customer.billing_address_line_2) customerAddrParts.push(customer.billing_address_line_2);
    const cityStateZip = [customer.billing_city || customer.city, customer.billing_state || customer.state, customer.billing_zip_code || customer.zip_code].filter(Boolean).join(', ');
    if (cityStateZip) customerAddrParts.push(cityStateZip);
    const customerAddr = customerAddrParts.join('\n');

    // Compute totals from invoice
    const subtotal = Number(invoice.subtotal || 0);
    const tax_amount = Number(invoice.tax_amount || 0);
    const total_amount = Number(invoice.total_amount || 0);

    // Format dates
    const issueDate = invoice.issued_at || invoice.issue_date ? new Date(invoice.issued_at || invoice.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
    const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Upon receipt';

    const logoHtml = company.company_logo_url
      ? `<img src="${company.company_logo_url}" alt="Logo" style="height:80px;object-fit:contain;max-width:300px;margin-bottom:10px" />`
      : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number || ''}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1f2937; padding: 40px; background: #fff; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #10b981; }
    .company-section { flex: 1; }
    .company-logo { margin-bottom: 15px; }
    .company-name { font-size: 28px; font-weight: 700; color: #10b981; margin-bottom: 8px; }
    .company-details { font-size: 13px; color: #6b7280; line-height: 1.8; }
    .invoice-section { text-align: right; }
    .invoice-title { font-size: 48px; font-weight: 700; color: #10b981; margin: 0; }
    .invoice-number { font-size: 16px; color: #6b7280; margin-top: 5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px; }
    .info-box { padding: 20px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #10b981; }
    .info-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .info-content { font-size: 13px; color: #1f2937; line-height: 1.8; }
    .info-content strong { color: #111827; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #10b981; color: white; padding: 12px 15px; text-align: left; font-weight: 600; font-size: 13px; }
    td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    .totals-section { margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb; }
    .totals-table { width: 100%; max-width: 400px; margin-left: auto; }
    .totals-table td { border: none; padding: 10px 15px; }
    .totals-row { font-size: 13px; color: #6b7280; }
    .totals-row td:first-child { text-align: right; }
    .totals-row td:last-child { text-align: right; color: #1f2937; }
    .total-amount-row { font-size: 18px; font-weight: 700; color: #10b981; border-top: 2px solid #10b981; padding-top: 15px !important; }
    .total-amount-row td:last-child { color: #10b981; font-size: 24px; }
    .notes-section { margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .notes-title { font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; margin-bottom: 8px; }
    .notes-content { font-size: 13px; color: #1f2937; line-height: 1.6; }
    .footer { margin-top: 50px; padding-top: 30px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
    .footer-text { margin: 5px 0; }
    @media print { body { padding: 0; } .container { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-section">
        <div class="company-logo">${logoHtml}</div>
        <div class="company-name">${company.name || company.company_name || 'Company Name'}</div>
        <div class="company-details">
          ${companyAddr ? `<div>${companyAddr}</div>` : ''}
          ${company.phone || company.phone_number ? `<div>📞 ${company.phone || company.phone_number}</div>` : ''}
          ${company.email ? `<div>📧 ${company.email}</div>` : ''}
        </div>
      </div>
      <div class="invoice-section">
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">Invoice #${invoice.invoice_number || 'N/A'}</div>
      </div>
    </div>

    <!-- Bill To & Invoice Details -->
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Bill To</div>
        <div class="info-content">
          <strong>${customer.company_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer'}</strong><br>
          ${customerAddr ? `<div style="white-space: pre-line; margin-top: 8px;">${customerAddr}</div>` : ''}
          ${customer.email ? `<div style="margin-top: 8px;">${customer.email}</div>` : ''}
          ${customer.phone ? `<div>${customer.phone}</div>` : ''}
        </div>
      </div>
      <div class="info-box">
        <div class="info-label">Invoice Details</div>
        <div class="info-content">
          <div><strong>Issue Date:</strong> ${issueDate}</div>
          <div style="margin-top: 8px;"><strong>Due Date:</strong> ${dueDate}</div>
          ${invoice.terms ? `<div style="margin-top: 8px;"><strong>Terms:</strong> ${invoice.terms}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Line Items Table -->
    ${items && items.length > 0 ? `
    <div class="section">
      <div class="section-title">Line Items</div>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right; width: 80px;">Qty</th>
            <th style="text-align: right; width: 100px;">Rate</th>
            <th style="text-align: right; width: 120px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.description || item.item_name || ''}</td>
              <td style="text-align: right;">${Number(item.quantity || item.qty || 0)}</td>
              <td style="text-align: right;">${fmt(item.unit_price || item.rate || 0)}</td>
              <td style="text-align: right;">${fmt(item.total_price || (Number(item.quantity||0)*Number(item.unit_price||0)))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Totals -->
    <div class="totals-section">
      <table class="totals-table">
        <tr class="totals-row">
          <td>Subtotal:</td>
          <td>${fmt(subtotal)}</td>
        </tr>
        <tr class="totals-row">
          <td>Tax:</td>
          <td>${fmt(tax_amount)}</td>
        </tr>
        <tr class="total-amount-row">
          <td>Total Amount:</td>
          <td>${fmt(total_amount)}</td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    ${invoice.notes ? `
    <div class="notes-section">
      <div class="notes-title">📝 Notes</div>
      <div class="notes-content">${invoice.notes}</div>
    </div>
    ` : ''}

    <!-- ✅ NEW: Signature Section -->
    ${workOrder && (workOrder.customer_signature_url || workOrder.technician_signature_url || workOrder.work_performed) ? `
    <div class="section" style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
      <div class="section-title">Signatures & Completion</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px;">
        ${workOrder.customer_signature_url ? `
        <div style="text-align: center;">
          <img src="${workOrder.customer_signature_url}" alt="Customer Signature" style="max-width: 200px; max-height: 100px; border-bottom: 2px solid #1f2937; padding-bottom: 10px; margin-bottom: 10px;" />
          <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">Customer Signature</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ` : ''}
        ${workOrder.technician_signature_url ? `
        <div style="text-align: center;">
          <img src="${workOrder.technician_signature_url}" alt="Technician Signature" style="max-width: 200px; max-height: 100px; border-bottom: 2px solid #1f2937; padding-bottom: 10px; margin-bottom: 10px;" />
          <div style="font-size: 12px; color: #6b7280; margin-top: 10px;">Technician Signature</div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 5px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        ` : ''}
      </div>

      <!-- ✅ NEW: Work Performed & Materials -->
      ${workOrder.work_performed || workOrder.materials_used ? `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        ${workOrder.work_performed ? `
        <div style="margin-bottom: 15px;">
          <div style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">Work Performed:</div>
          <div style="font-size: 11px; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${workOrder.work_performed}</div>
        </div>
        ` : ''}
        ${workOrder.materials_used ? `
        <div>
          <div style="font-size: 12px; font-weight: 600; color: #1f2937; margin-bottom: 5px;">Materials Used:</div>
          <div style="font-size: 11px; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${workOrder.materials_used}</div>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </div>
    ` : ''}

    <!-- Attachments Section -->
    ${attachments && attachments.length > 0 ? `
    <div class="section" style="margin-top: 40px; page-break-inside: avoid;">
      <h4 style="color: #1f2937; font-size: 16px; font-weight: 600; margin-bottom: 15px; border-bottom: 2px solid #10b981; padding-bottom: 8px;">📎 Attachments</h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
        ${attachments.map(file => {
          const isImage = file.file_type && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(file.file_type.toLowerCase());
          const fileName = file.file_name || 'Attachment';
          const fileSize = file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : '';

          if (isImage) {
            // For images, show thumbnail with filename below
            return `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; background: #f9fafb; text-align: center;">
                <div style="width: 100%; height: 150px; background: #fff; border-radius: 4px; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                  <div style="color: #9ca3af; font-size: 12px;">📷 ${fileName}</div>
                </div>
                <div style="font-size: 12px; color: #6b7280; word-break: break-word;">${fileName}</div>
                ${fileSize ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${fileSize}</div>` : ''}
              </div>`;
          } else {
            // For non-images, show file icon with details
            return `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #f9fafb; display: flex; align-items: center; gap: 10px;">
                <div style="font-size: 32px;">📄</div>
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 13px; color: #1f2937; font-weight: 500; word-break: break-word;">${fileName}</div>
                  ${fileSize ? `<div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${fileSize}</div>` : ''}
                </div>
              </div>`;
          }
        }).join('')}
      </div>
      <div style="margin-top: 15px; padding: 12px; background: #d1fae5; border-left: 4px solid #10b981; border-radius: 4px;">
        <p style="margin: 0; font-size: 12px; color: #065f46;">
          <strong>Note:</strong> Attached files are available for download in the digital version of this invoice.
        </p>
      </div>
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text"><strong>Thank you for your business!</strong></div>
      <div class="footer-text">Payment is due by ${dueDate}</div>
      <div class="footer-text" style="margin-top: 15px; font-size: 11px; color: #9ca3af;">Powered by TradeMate Pro</div>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
};

export default InvoicePDFService;

