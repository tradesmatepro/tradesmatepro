// Phase 2: UI Snapshot Capture
export function captureUISnapshot() {
  // Example: gather minimal UI state for validation
  return {
    marketplace: Array.from(document.querySelectorAll("[data-ui='marketplace-tile']")).map(el => ({
      id: el.getAttribute("data-id"),
      title: el.innerText,
      status: el.getAttribute("data-status")
    })),
    quotes: Array.from(document.querySelectorAll("[data-ui='quote-row']")).map(el => ({
      id: el.getAttribute("data-id"),
      status: el.getAttribute("data-status")
    })),
    invoices: Array.from(document.querySelectorAll("[data-ui='invoice-row']")).map(el => ({
      id: el.getAttribute("data-id"),
      total: el.getAttribute("data-total")
    }))
  };
}
