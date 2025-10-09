// Minimal receipt generator to unblock UX flows
const PaymentReceiptService = {
  openReceiptWindow(invoice, payment) {
    try {
      const w = window.open('', '_blank');
      const amount = Number(payment?.amount || 0).toFixed(2);
      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<title>Payment Receipt</title>
<style>
  body { font-family: Arial, sans-serif; color:#111; padding:24px; }
  .header{display:flex;justify-content:space-between;margin-bottom:16px;border-bottom:1px solid #eee;padding-bottom:8px}
  .title{font-size:20px;font-weight:700}
  .meta{font-size:12px;color:#666}
  table { width:100%; border-collapse: collapse; margin-top:16px; }
  td { padding:6px 0; }
  .total{font-weight:700}
  .badge{display:inline-block;padding:2px 6px;border-radius:4px;background:#e6ffed;color:#065f46;font-size:12px;margin-left:8px}
  .footer{margin-top:24px;font-size:12px;color:#555}
  .print{position:fixed;top:12px;right:12px}
</style>
</head>
<body>
  <button class="print" onclick="window.print()">Print</button>
  <div class="header">
    <div class="title">Payment Receipt <span class="badge">PAID</span></div>
    <div class="meta">${new Date(payment?.received_at || Date.now()).toLocaleString()}</div>
  </div>
  <div>
    <div>Invoice #: <strong>${invoice?.invoice_number || invoice?.id || ''}</strong></div>
    <div>Customer: <strong>${invoice?.customers?.name || ''}</strong></div>
  </div>
  <table>
    <tbody>
      <tr><td>Payment Method:</td><td>${payment?.method || 'N/A'}</td></tr>
      <tr><td>Amount:</td><td>$${amount}</td></tr>
      <tr><td>Reference:</td><td>${payment?.transaction_reference || ''}</td></tr>
    </tbody>
  </table>
  <div class="footer">Thank you for your business.</div>
</body></html>`;
      w.document.open();
      w.document.write(html);
      w.document.close();
      try { w.focus(); } catch {}
      return true;
    } catch (e) {
      console.warn('PaymentReceiptService.openReceiptWindow failed', e);
      return false;
    }
  }
};

export default PaymentReceiptService;

