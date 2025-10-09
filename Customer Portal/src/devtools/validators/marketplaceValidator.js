// Phase 2: Marketplace Validator
export function marketplaceValidator(state, api, ui) {
  const requests = state.marketplace?.requests || [];
  const uiTiles = ui.marketplace || [];
  const results = [];

  requests.forEach(req => {
    const errors = [];

    if (req.responses === 0 && req.status === "FULLY_STAFFED") {
      errors.push("❌ Cannot be fully staffed with 0 responses");
    }
    if (!req.title || !req.description) {
      errors.push("❌ Missing required fields (title/description)");
    }

    results.push({
      id: req.id,
      title: req.title || "Untitled Request",
      pass: errors.length === 0,
      errors,
    });
  });

  return results;
}
