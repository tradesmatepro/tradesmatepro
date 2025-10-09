// Phase 2: Invoice Validator
export function invoiceValidator(state, api, ui) {
  const invoices = state.invoices || [];
  const results = [];

  invoices.forEach(inv => {
    const errors = [];

    if (inv.total <= 0) {
      errors.push("❌ Invoice total must be > 0");
    }
    if (!inv.jobId) {
      errors.push("❌ Invoice missing job link");
    }

    results.push({
      id: inv.id,
      title: `Invoice ${inv.id}`,
      pass: errors.length === 0,
      errors,
    });
  });

  return results;
}
