// Phase 2: Quote Flow Validator
export function quoteFlowValidator(state, api, ui) {
  const quotes = state.quotes || [];
  const jobs = state.jobs || [];
  const results = [];

  quotes.forEach(q => {
    const errors = [];

    const linkedJob = jobs.find(j => j.quoteId === q.id);
    if (q.status === "APPROVED" && !linkedJob) {
      errors.push("❌ Approved quote missing linked job");
    }

    results.push({
      id: q.id,
      title: q.title || "Quote",
      pass: errors.length === 0,
      errors,
    });
  });

  return results;
}
